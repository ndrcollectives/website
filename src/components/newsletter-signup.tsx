"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Newsletter delivery is out of scope for this build — capture intent
    // client-side until an email provider is wired up server-side.
    setStatus("submitted");
  }

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Release Alerts
      </h4>
      <p className="mb-3 text-sm text-muted">
        Get notified for set releases and restocks.
      </p>
      {status === "submitted" ? (
        <p className="text-sm text-accent-yellow">You&apos;re on the list!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">Join</Button>
        </form>
      )}
    </div>
  );
}
