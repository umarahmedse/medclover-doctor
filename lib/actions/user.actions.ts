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
