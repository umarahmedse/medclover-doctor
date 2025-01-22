/* eslint-disable*/

import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/mongodb";
import {Case} from "@/models";

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

    // Ensure caseData is not an array, and handle the case if it's null
    const { _id, patientName, patientAge, assignedDoctor, organAffected, patientDescription,enhancedDescription ,isClosed} = caseData as any;

    return NextResponse.json({
      _id: _id.toString(),
      patientName,
      patientAge,
      assignedDoctor: assignedDoctor?.name || "Unknown",
      organAffected,
      patientDescription,
      enhancedDescription,
      isClosed
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
  prescription: string;
  doctorRemarks: string;
  isClosed: boolean;
}


export async function PUT(request: NextRequest) {
  try {
    await connectToDB();

    // Get the id from the request body
    const body = await request.json();
    const { id, diagnosis, prescription, doctorRemarks } = body;

    if (!id) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    // Perform the update and ensure it returns a single object, not an array
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        diagnosis,
        prescription,
        doctorRemarks,
        isClosed: true, // Marking as closed
      },
      { new: true, runValidators: true }
    ).lean(); // Use lean() to get a plain object instead of a Mongoose document

    // Ensure updatedCase is a single object, not an array
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