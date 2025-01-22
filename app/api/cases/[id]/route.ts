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

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Wait for params to resolve before accessing
  const { id } = await context.params;  // Ensure params is awaited

  try {
    await connectToDB();

    if (!id) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { diagnosis, prescription, doctorRemarks, isClosed } = body;

    // Ensure Case.findByIdAndUpdate() returns a single object, not an array
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        diagnosis,
        prescription,
        doctorRemarks,
        isClosed: true, // Marking as closed
      },
      { new: true, runValidators: true }
    ).lean();

    // Type assertion: we expect updatedCase to be ICase or null
    if (!updatedCase) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    // Explicitly cast updatedCase to ICase to match the type
    const caseData: ICase = updatedCase as any;

    return NextResponse.json({
      message: "Case updated successfully",
      case: {
        _id: caseData._id.toString(),
        diagnosis: caseData.diagnosis,
        prescription: caseData.prescription,
        doctorRemarks: caseData.doctorRemarks,
        isClosed: caseData.isClosed,
      },
    });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ message: "Failed to update case" }, { status: 500 });
  }
}
