/* eslint-disable */
"use server";
import dbConnection from "../mongodb";
import {Doctor} from "@/models";

export async function createUser(user: any) {
  try {
    await dbConnection();
    return await Doctor.create(user);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
export async function updateUser(clerkId: string, updatedData: any) {
  try {
    await dbConnection();

    const updatedUser = await Doctor.findOneAndUpdate(
      { clerkId },
      updatedData,
      { new: true, runValidators: false }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user.");
  }
}