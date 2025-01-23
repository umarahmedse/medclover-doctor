import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Case } from "@/models";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    await dbConnect(); // Ensure DB connection

    const { searchParams } = new URL(req.url); // Parse the query parameters from the URL
    const userId = searchParams.get("userId"); // Extract userId from the query string

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the current month and year
    const currentMonth = new Date().getMonth(); // 0-based month, 0 = January, 1 = February, etc.
    const currentYear = new Date().getFullYear();

    // Calculate the start and end of the current month in UTC
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1)); // Start of the month in UTC
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)); // End of the month in UTC

    // Log the start and end of the current month for debugging
    console.log('Start of Month (UTC):', startOfMonth);
    console.log('End of Month (UTC):', endOfMonth);

    // Log the userId to confirm it's being passed correctly
    console.log('User ID (assignedDoctor):', userId);

    // Fetch cases for the assignedDoctor field and within the date range
    const casesCount = await Case.countDocuments({
      assignedDoctor: new ObjectId(userId), // Query by assignedDoctor (ObjectId)
      createdAt: {
        $gte: startOfMonth, // Start of the month
        $lt: endOfMonth, // End of the month
      },
    });

    // Log the count of cases for debugging
    console.log('Case Count:', casesCount);

    return NextResponse.json({ count: casesCount, month: currentMonth + 1 });

  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
