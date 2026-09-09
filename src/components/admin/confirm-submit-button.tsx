"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  variant,
  children,
  className,
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
  variant?: "default" | "secondary" | "destructive";
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <Button type="submit" variant={variant}>
        {children}
      </Button>
    </form>
  );
}
