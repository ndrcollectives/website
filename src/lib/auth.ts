import { createClient } from "@/lib/supabase/server";
import { isNextControlFlowError } from "@/lib/supabase/errors";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("getCurrentProfile: auth.getUser() returned an error:", userError.message);
    }

    if (!user) {
      console.error("getCurrentProfile: no authenticated user on this request");
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        `getCurrentProfile: failed to load profile row for user ${user.id}:`,
        profileError.message,
      );
    }

    return profile as Profile | null;
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    // Treat a misconfigured/unreachable Supabase project as "signed out"
    // rather than crashing every page that checks auth state.
    console.error("Failed to resolve current profile:", error);
    return null;
  }
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
  return profile;
}
