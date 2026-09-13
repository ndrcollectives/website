"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

// A plain <Button type="submit"> inside a server-action <form> gives zero
// feedback while the action runs — for a slow one (e.g. news sync
// scraping several external sites), that looks indistinguishable from
// the click not having worked at all. useFormStatus only sees the
// nearest parent <form>, so this has to be its own client component
// rendered inside the form, not a prop on the (server) page itself.
export function SubmitButton({
  children,
  pendingLabel = "Working...",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
