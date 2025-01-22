/* eslint-disable*/

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Doctor } from "@/models"; // Assuming you have the Doctor model properly set up

export async function PUT(req: Request) {
  try {
    const { id, email, name, phone, specialization, experienceYears } = await req.json();

    // Validate that either the doctor ID or email is provided
    if (!id && !email) {
      return NextResponse.json({ error: "Doctor ID or Email is required" }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();

    // If the email is provided, find the doctor by email, else by ID
    const updatedDoctor = email
      ? await Doctor.findOneAndUpdate(
          { email },
          { name, phone, specialization, experienceYears, isProfileCompleted: true },
          { new: true }
        )
      : await Doctor.findByIdAndUpdate(
          id,
          { name, phone, specialization, experienceYears, isProfileCompleted: true },
          { new: true }
        );

    // If no doctor is found
    if (!updatedDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Return the updated doctor data as a response
    return NextResponse.json({
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return NextResponse.json({ error: "Error updating profile" }, { status: 500 });
  }
}
