import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Doctor } from "@/models"; // Make sure your Doctor model is correctly imported

export async function GET(req: Request) {
  try {
    // Extract query parameters (id in this case)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();

    // Find the doctor by user_id (Clerk's user_id stored in MongoDB)
    const doctor = await Doctor.findById({ id });

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
