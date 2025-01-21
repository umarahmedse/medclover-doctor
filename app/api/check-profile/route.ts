/* eslint-disable */
import { NextResponse } from 'next/server';
import dbConnection from '@/lib/mongodb'; // Your existing db connection logic
import { Doctor } from '@/models';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId'); // Get the userId from query params

  if (!userId) {
    return NextResponse.json({ redirectToProfile: false });
  }

  try {
    // Connect to MongoDB
     await dbConnection();
    const user = await Doctor.findOne({ clerkUserId: userId });

    // Check if the profile is completed or not
    if (user && user.isProfileCompleted === false) {
      return NextResponse.json({ redirectToProfile: true });
    }

    return NextResponse.json({ redirectToProfile: false });
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
