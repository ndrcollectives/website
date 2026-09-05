import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/auth/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { error, message, next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-extrabold">Welcome Back</h1>
      <p className="mt-2 text-center text-muted">
        Sign in to track orders and manage your collection.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-accent-red/40 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-lg border border-accent-blue/40 bg-accent-blue/10 p-3 text-sm text-accent-blue">
          {message}
        </p>
      )}

      <form action={signInWithGoogle} className="mt-6">
        <Button type="submit" variant="secondary" className="w-full">
          Continue with Google
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        OR
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithPassword} className="space-y-3">
        <input type="hidden" name="next" value={next ?? "/account"} />
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      <form action={signInWithMagicLink} className="mt-3 flex gap-2">
        <Input type="email" name="email" placeholder="Email for magic link" required />
        <Button type="submit" variant="outline">
          Send Link
        </Button>
      </form>

      <details className="mt-8 rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          New here? Create an account
        </summary>
        <form action={signUpWithPassword} className="mt-4 space-y-3">
          <Input type="text" name="full_name" placeholder="Full name" required />
          <Input type="email" name="email" placeholder="Email" required />
          <Input type="password" name="password" placeholder="Password" required minLength={6} />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </details>
    </div>
  );
}
