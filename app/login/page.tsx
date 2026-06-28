"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "../lib/api-client";
import { getErrorMessage } from "../lib/errors";
import { setAuthToken } from "../lib/site-auth-client";
import { BTN_PRIMARY, CARD, INPUT } from "../lib/ui";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = await login(password);
      setAuthToken(token);

      const from = searchParams.get("from");
      window.location.assign(from && from.startsWith("/") ? from : "/");
    } catch (err) {
      setError(getErrorMessage(err, "Incorrect password"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-background px-4">
      <div className={`${CARD} w-full max-w-sm p-6`}>
        <h1 className="text-xl font-bold text-primary">
          Grocery Cost Splitter
        </h1>
        <p className="mt-1 text-sm text-muted">
          Enter the site password to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${INPUT} w-full`}
            />
          </label>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`${BTN_PRIMARY} w-full`}
          >
            {submitting ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
