import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import { readFileSync } from "fs";
import path from "path";
import { promisify } from "util";
import * as dotenv from "dotenv";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config();

const app = express();
const port = 5000;
const upload = multer({ dest: "uploads/" });

// Initialize vector store
const vectorStore = await MemoryVectorStore.fromTexts(
  [],
  [],
  new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  })
);

// Chat History Manager Class
class ChatHistoryManager {
  constructor() {
    this.history = [];
    this.maxHistoryLength = 10; // Keep last 10 exchanges
  }

  addHumanMessage(content) {
    this.history.push(new HumanMessage(content));
    this._trimHistory();
  }

  addAIMessage(content) {
    this.history.push(new AIMessage(content));
    this._trimHistory();
  }

  getHistory() {
    return [...this.history];
  }

  clear() {
    this.history = [];
  }

  _trimHistory() {
    if (this.history.length > this.maxHistoryLength) {
      const toRemove = this.history.length - this.maxHistoryLength;
      this.history.splice(0, toRemove);
    }
  }
}

const chatHistory = new ChatHistoryManager();

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use(cors());
app.use(express.json());
app.use("/audio", express.static("uploads/output"));

// Extract text from PDF using PDF.js
const extractTextFromPDF = async (pdfPath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: path.join(__dirname, "../node_modules/pdfjs-dist/cmaps") + "/",
      cMapPacked: true,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      try {
        const page = await pdfDocument.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        fullText += strings.join(" ") + "\n";
      } catch (pageErr) {
        console.error(`Error processing page ${i}:`, pageErr);
        continue;
      }
    }

    return fullText;
  } catch (err) {
    console.error("PDF processing error:", err);
    throw new Error("Failed to process PDF");
  }
};

// Setup endpoint
app.post("/api/setup", upload.single("resume"), async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    const resumePath = req.file.path;

    const resumeContent = await extractTextFromPDF(resumePath);
    console.log("resume text: ", resumeContent);

    const fullContext = `
        Job Title: ${jobTitle}
        Job Description: ${jobDescription}
        Resume: ${resumeContent}
    `;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([fullContext]);
    await vectorStore.addDocuments(docs);
    console.log("✅ Context embedded and stored in vector DB.");

    // Clear previous conversation history when setting up new interview
    chatHistory.clear();

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error during setup:", err);
    return res.status(500).json({ success: false });
  }
});

// Interview endpoint
import { exec } from "child_process";
const execAsync = promisify(exec);

app.post("/api/interview", upload.single("audio"), async (req, res) => {
  const inputPath = req.file.path;
  const wavPath = `uploads/${req.file.filename}.wav`;
  const transcriptPath = `uploads/${req.file.filename}.txt`;

  try {
    // Convert uploaded audio to WAV format
    await execAsync(
      `ffmpeg -y -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`
    );

    // Transcribe audio using Whisper CLI
    await execAsync(
      `whisper "${wavPath}" --model tiny.en --language en --fp16 False --output_format txt --output_dir uploads`
    );

    if (!fs.existsSync(transcriptPath)) throw new Error("Transcript not found.");

    const transcript = fs.readFileSync(transcriptPath, "utf-8").trim();
    console.log("📝 Transcribed:", transcript);

    // Retrieve relevant context from vector store
    const relevantDocs = await vectorStore.similaritySearch(transcript, 3);
    const contextText = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    // Prepare Gemini model chain with history
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are Neerja, a professional and experienced job interviewer conducting a mock interview for a specific role. Your tone is conversational, encouraging, and insightful.
      
      Always respond as if you're in a real-time, spoken conversation — avoid sounding like you're writing an essay. Focus only on the job interview, and ignore unrelated or general questions (like technical definitions or trivia).
      
      You have access to the following context to guide your questions and evaluate the candidate:
      - Job Title and Description
      - Candidate's Resume
      
      Use this context to:
      - Ask relevant behavioral, situational, and technical questions.
      - Follow up based on the candidate’s previous answers.
      - Avoid repeating yourself or giving unrelated information.
      
      Never explain concepts like a teacher or give definitions unless the candidate explicitly asks for clarification.
      
      If a candidate asks something outside the interview scope, politely steer the conversation back on track.
      
      Context:\n${contextText}`
      ]
      ,
      ...chatHistory.getHistory(),
      ["human", transcript],
    ]);

    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      chat_history: chatHistory.getHistory()
    });

    console.log("🤖 Assistant Response:", result);

    // Update history with both user and assistant messages
    chatHistory.addHumanMessage(transcript);
    chatHistory.addAIMessage(result);

    // Prepare text for TTS
    const text = result?.replace(/["$`\\]/g, "");
    console.log({ text }, typeof text);

    const outputAudioPath = `uploads/output/${req.file.filename}_response.wav`;
    fs.mkdirSync("uploads/output", { recursive: true });

    // Write cleaned text to temp file for TTS
    const tempTextFile = `uploads/${req.file.filename}_temp.txt`;
    fs.writeFileSync(tempTextFile, text);

    // Call Python TTS script
    await execAsync(`python tts_edge.py "${tempTextFile}" "${outputAudioPath}"`);
    fs.unlinkSync(tempTextFile); // Remove temp file
    
    // Respond with both text and generated audio URL
    return res.json({
      reply: result,
      audioUrl: `/audio/${req.file.filename}_response.wav`,
    });
  } catch (err) {
    console.error("❌ Interview Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  } finally {
    // Clean up temp files
    [inputPath, wavPath, transcriptPath].forEach((f) => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
});

// Clear history endpoint
app.post("/api/clear-history", (req, res) => {
  chatHistory.clear();
  res.json({ success: true, message: "Conversation history cleared" });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});