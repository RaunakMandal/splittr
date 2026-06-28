import { NextResponse } from "next/server";
import { isAuthorizedRequest } from "./site-auth";

export function jsonOk<T extends Record<string, unknown>>(
  data: T,
  status = 200
) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request) {
  if (await isAuthorizedRequest(request)) {
    return null;
  }

  return jsonError("Unauthorized", 401);
}
