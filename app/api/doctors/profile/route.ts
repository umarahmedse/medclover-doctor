/* eslint-disable */
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle the conversion
import connectToDatabase from "@/lib/mongodb";
import { Doctor } from "@/models"; // Ensure your Doctor model is correctly imported

export async function GET(req: Request) {
  try {
    // Extract query parameters (id in this case)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    // Validate the MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Doctor ID format" }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();

    // Find the doctor by MongoDB _id field
    const doctor = await Doctor.findById(id); // Use findById for MongoDB ObjectId

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Return the doctor profile data
    return NextResponse.json(doctor);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 });
  }
}
