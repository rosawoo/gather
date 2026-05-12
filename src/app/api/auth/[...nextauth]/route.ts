import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

async function withAuthErrorLogging(
  name: "GET" | "POST",
  req: NextRequest,
  run: (r: NextRequest) => Promise<Response>,
): Promise<Response> {
  try {
    return await run(req);
  } catch (err) {
    console.error(`[gather/api/auth] ${name} failed`, err);
    throw err;
  }
}

export async function GET(req: NextRequest) {
  return withAuthErrorLogging("GET", req, handlers.GET);
}

export async function POST(req: NextRequest) {
  return withAuthErrorLogging("POST", req, handlers.POST);
}
