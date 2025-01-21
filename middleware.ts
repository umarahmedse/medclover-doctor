/* eslint-disable */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server"; // Import NextRequest
import dbConnection from "@/lib/mongodb";
import { Doctor } from "./models";

// Create route matcher for public routes (e.g., sign-in, sign-up, webhooks)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
]);

async function getUserProfile(userId: string) {
  // Connect to MongoDB
   await dbConnection();

  // Query the users collection by Clerk's user ID
  const user = await Doctor.findOne({ clerkId: userId });

  return user;
}

export default clerkMiddleware(async (auth: any, request: NextRequest) => { // Use NextRequest type
  if (!isPublicRoute(request)) {
    await auth.protect(); // Ensure the user is authenticated

    // Ensure the user is authenticated before accessing the 'user' property
    if (!auth.user) {
      // If no authenticated user, redirect to sign-in page
      return Response.redirect(new URL("/sign-in", request.url));
    }

    // TypeScript doesn't infer `auth.user` so we assert it as `any`
    const userId = (auth.user as any).id;

    // Query MongoDB to fetch the user profile
    const userProfile = await getUserProfile(userId);

    // If profile is not completed, redirect to the profile update page
    if (userProfile && userProfile.isProfileCompleted === false) {
      return Response.redirect(new URL("/update-profile", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
