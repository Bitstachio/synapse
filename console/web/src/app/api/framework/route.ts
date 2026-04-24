import { NextResponse } from "next/server";
import { mockFramework } from "@/data/mock-framework";

export async function GET() {
  return NextResponse.json(mockFramework);
}
