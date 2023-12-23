import { connectToDB } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";

connectToDB()

export async function GET(request) {

  return NextResponse.json({ "Hello World": 1234 });
}