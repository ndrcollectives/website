// Next.js signals internal control flow (bailing a route to dynamic
// rendering, redirect(), notFound()) by throwing errors with a recognizable
// `digest`. Anything wrapping Supabase calls in a try/catch must rethrow
// these untouched, or it silently breaks that control flow instead of
// just swallowing real Supabase failures.
export function isNextControlFlowError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" ||
      digest === "NEXT_NOT_FOUND" ||
      digest.startsWith("NEXT_REDIRECT"))
  );
}
