// src/app/api/resume-setup/route.ts
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse"; 
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function saveToVectorDB(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    // await vectorStore.addDocuments(docs);
    console.log("✅ Context embedded and stored in vector DB.");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const data = await pdfParse(buffer);

    // Save extracted text to vector DB (stubbed function)
    await saveToVectorDB(data.text);

    console.log(data)
    return NextResponse.json({
      success: true,
      text: data.text,
      meta: {
        numPages: data.numpages,
        info: data.info,
      },
    });
  } catch (err: any) {
    console.error("PDF Parse Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
