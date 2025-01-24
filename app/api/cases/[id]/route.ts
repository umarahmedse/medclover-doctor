/* eslint-disable*/

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import {Case} from "@/models";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 512,
  responseMimeType: "text/plain",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await connectToDB();

    if (!id) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    const caseData = await Case.findById(id)
      .populate("assignedDoctor", "name")
      .lean();

    if (!caseData) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    const {
      _id,
      patientName,
      patientAge,
      assignedDoctor,
      organAffected,
      patientDescription,
      enhancedDescription,
      isClosed,
      doctorRemarks,
      diagnosis,
      perscription,
    } = caseData as any;

    return NextResponse.json({
      _id: _id.toString(),
      patientName,
      patientAge,
      assignedDoctor: assignedDoctor?.name || "Unknown",
      organAffected,
      patientDescription,
      enhancedDescription,
      isClosed,
      doctorRemarks: doctorRemarks || "",
      diagnosis: diagnosis || "",
      perscription: perscription || "",
    });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json({ message: "Failed to fetch case" }, { status: 500 });
  }
}



// Define the interface for Case
interface ICase {
  _id: string;
  diagnosis: string;
  perscription: string;
  doctorRemarks: string;
  isClosed: boolean;
  selectedItems : string
}


export async function PUT(request: NextRequest) {
  try {
    await connectToDB();
    const body = await request.json();
    const { id, diagnosis, prescription, doctorRemarks, selectedItems } = body;

    if (!id) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    // Enhance the details using Gemini AI
    const chatSession = model.startChat({ generationConfig, history: [] });
    const prompt = `Enhance the following medical case details to be concise, to the point, and at most 2 paragraphs. Ensure the doctor remarks are particularly well-structured and relevant to the selected items: \n\nDiagnosis: ${diagnosis}\nPrescription: ${prescription}\nDoctor Remarks: ${doctorRemarks}\nSelected Items: ${selectedItems} - THE OUTPUT MUST BE JSON, ONLY JSON WITHOUT ANY EXPLANATIONS, STRICTLY JSON WITH KEY VALUES OF THE THINGS PASSED - WHERE THERE ARE BRACKETS, IT MEANS YOU NEED TO ADD DATA THERE IN STRING FORMAT ONLY LIKE IF I SAY (ADD MEDICATIONS HEREYOU MUST REMOVE THIS () AREA AND INCLUDE A STRING OF MEDICATIONS THERE  BUT YOU HAVE TO FILL THE STRING, DO NOT I REPEAT DO NOT RETURN JSON DATA OF MEDICENSES, MAKE IT LIKE SENTENCE EVEN IF NOT ASKED, THE PRESCRIPTION MUST CONTAIN MEDICENES THAT ARE SAFE AND NO REQUIRE STRICT CHECK AND BALANCE `;
    // console.log("Prompt: " + prompt)
    const result = await chatSession.sendMessage(prompt);
    let enhancedText = result.response.text().trim();
    // console.log(enhancedText);

    // Ensure response does not contain unwanted formatting
    enhancedText = enhancedText.replace(/^```json\n?|```$/g, "");

    let enhancedData;
    try {
      enhancedData = JSON.parse(enhancedText);
    } catch (error) {
      console.error("Error parsing AI-enhanced response:", error);
      enhancedData = { diagnosis, prescription, doctorRemarks }; // Fallback to original values
    }

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        diagnosis: enhancedData.diagnosis || diagnosis,
        perscription: enhancedData.prescription || prescription,
        doctorRemarks: enhancedData.doctorRemarks || doctorRemarks,
        isClosed: true,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCase || Array.isArray(updatedCase)) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Case updated successfully",
      case: {
        _id: updatedCase._id,
        diagnosis: updatedCase.diagnosis,
        prescription: updatedCase.prescription,
        doctorRemarks: updatedCase.doctorRemarks,
        isClosed: updatedCase.isClosed,
      },
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ message: "Failed to update case" }, { status: 500 });
  }
}
