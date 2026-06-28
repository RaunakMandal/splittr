"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken } from "../lib/site-auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Incorrect password");
        return;
      }

      const data = (await response.json()) as { token?: string };
      if (!data.token) {
        setError("Something went wrong. Try again.");
        return;
      }

      setAuthToken(data.token);

      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/") ? from : "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#f8faf8] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-green-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#2d6a4f]">
          Grocery Cost Splitter
        </h1>
        <p className="mt-1 text-sm text-green-900/70">
          Enter the site password to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-green-900">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-green-950 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
            />
          </label>

          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#2d6a4f] px-4 py-2 font-medium text-white transition hover:bg-[#1b4332] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
