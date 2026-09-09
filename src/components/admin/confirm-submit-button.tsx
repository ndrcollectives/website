"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  variant,
  children,
  className,
  hidden,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  variant?: "default" | "secondary" | "destructive";
  children: ReactNode;
  className?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {hidden &&
        Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <Button type="submit" variant={variant}>
        {children}
      </Button>
    </form>
  );
}
