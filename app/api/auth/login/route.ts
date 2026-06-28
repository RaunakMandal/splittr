import { NextResponse } from "next/server";
import { createAuthToken, verifyPassword } from "../../../lib/site-auth";
import { getErrorMessage } from "../../../lib/errors";

export async function POST(request: Request) {
  let password = "";

  try {
    const body = (await request.json()) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  try {
    const token = await createAuthToken();
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Authentication is not configured") },
      { status: 500 }
    );
  }
}
