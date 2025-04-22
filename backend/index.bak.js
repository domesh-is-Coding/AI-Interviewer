import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import { readFileSync } from "fs";
import path from "path";
import { promisify } from "util";
import * as dotenv from "dotenv";
// import pdfParse from "pdf-parse";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config();

const app = express();
const port = 5000;
const upload = multer({ dest: "uploads/" });
const vectorStore = await MemoryVectorStore.fromTexts(
  [],
  [],
  new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    // title: "Document title",
  })
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use(cors());
app.use(express.json());
app.use("/audio", express.static("uploads/output"));

// Add better PDF text extraction with error handling
const extractTextFromPDF = async (pdfPath) => {
  try {
    // const data = new Uint8Array(readFileSync(pdfPath));
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({
      data,
      // Enable more PDF.js features
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

// STEP 1: Store Resume, Job Title & Description in Vector Store
app.post("/api/setup", upload.single("resume"), async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    const resumePath = req.file.path;
    // console.log(path.resolve(__dirname, resumePath);)

    // const buffer = fs.readFileSync(resumePath);
    // const pdfText = await pdfParse(buffer);
    // const buffer = fs.readFileSync(resumePath); // 🟢 this is inside the API route
    // const pdfText = await pdfParse(buffer);     // 🟢 safe

    // const resumeContent = pdfText.text;

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

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error during setup:", err);
    return res.status(500).json({ success: false });
  }
});

// STEP 2: Handle Voice Input (transcribed already) and Respond using Gemini + context
import { exec } from "child_process";
const execAsync = promisify(exec);

app.post("/api/interview", upload.single("audio"), async (req, res) => {
  const inputPath = req.file.path;
  const wavPath = `uploads/${req.file.filename}.wav`;
  const transcriptPath = `uploads/${req.file.filename}.txt`;

  try {
    // Convert audio to WAV
    await execAsync(
      `ffmpeg -y -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`
    );

    // Transcribe with Whisper CLI
    await execAsync(
      `whisper "${wavPath}" --model tiny.en --language en --fp16 False --output_format txt --output_dir uploads`
    );

    if (!fs.existsSync(transcriptPath))
      throw new Error("Transcript not found.");
    const transcript = fs.readFileSync(transcriptPath, "utf-8").trim();
    console.log("📝 Transcribed:", transcript);

    // Retrieve context from vector store
    const relevantDocs = await vectorStore.similaritySearch(transcript, 3);
    const contextText = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    // Gemini chain
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      temperature: 0.7,
      //   apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are Brian, a professional interviewer. Use the resume and job description context when crafting your response. Context:\n${contextText}`,
      ],
      ["human", transcript],
    ]);

    const parser = new StringOutputParser();

    // const chain = RunnableSequence.from([prompt, model]);
    const chain = prompt.pipe(model).pipe(parser);
    const result = await chain.invoke({});

    console.log({ result });

    // TTS (Optional)
    // const outputAudioPath = `uploads/output/${req.file.filename}_response.wav`;
    const text = result?.replace(/["$`\\']/g, ""); // Clean the text
    console.log({text}, typeof text)
    const outputAudioPath = `uploads/output/${req.file.filename}_response.wav`;
    fs.mkdirSync("uploads/output", { recursive: true });
    // await execAsync(`python tts_edge.py "${result.content.replace(/["$`\\']/g, '')}" "${outputAudioPath}"`);
    // await execAsync(`python tts_edge.py "${result.replace(/["$`\\']/g, '')}" "${outputAudioPath}"`);
    const escapedText = `"${text.replace(/"/g, '\\"')}"`; // Escape double quotes in text
    const escapedOutputPath = `"${outputAudioPath.replace(/"/g, '\\"')}"`; // Escape double quotes in file path

    // Run the Python script with the escaped arguments
    // await execAsync(`python tts_edge.py ${escapedText} ${escapedOutputPath}`);
    // await execAsync(`python tts_edge.py ${result} ${escapedOutputPath}`);
    const tempTextFile = `uploads/${req.file.filename}_temp.txt`;
    fs.writeFileSync(tempTextFile, text);

    await execAsync(`python tts_edge.py "${tempTextFile}" "${outputAudioPath}"`);
    fs.unlinkSync(tempTextFile); // Cleanup


    res.json({
      reply: result.content,
      audioUrl: `/audio/${req.file.filename}_response.wav`,
    });
  } catch (err) {
    console.error("❌ Interview Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  } finally {
    [inputPath, wavPath, transcriptPath].forEach((f) => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
