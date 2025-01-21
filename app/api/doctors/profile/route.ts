/* eslint-disable */
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Doctor } from "@/models"; // Ensure your Doctor model is correctly imported

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

    // Find the doctor by the `id` field (Clerk's user_id stored in MongoDB)
    const doctor = await Doctor.findOne({ id }); // Query by `id`, not `_id`

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
