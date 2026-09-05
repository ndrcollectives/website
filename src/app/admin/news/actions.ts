"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncNewsArticles } from "@/lib/news-sync";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createArticle(formData: FormData) {
  const profile = await requireAdmin();
  const supabase = createAdminClient();

  const title = String(formData.get("title") ?? "");
  const isPublished = formData.get("is_published") === "on";

  const { error } = await supabase.from("news_articles").insert({
    title,
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    content: String(formData.get("content") ?? ""),
    excerpt: String(formData.get("excerpt") ?? "") || null,
    category: String(formData.get("category")),
    cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
    author_id: profile.id,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function syncNewsFromFeeds() {
  await requireAdmin();
  const supabase = createAdminClient();

  let synced = 0;
  let failures: { feedUrl: string; message: string }[] = [];
  try {
    ({ synced, failures } = await syncNewsArticles(supabase));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    redirect(`/admin/news?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");

  const params = new URLSearchParams({ synced: String(synced) });
  if (failures.length > 0) {
    params.set(
      "feedErrors",
      failures.map((f) => `${f.feedUrl}: ${f.message}`).join(" | "),
    );
  }
  redirect(`/admin/news?${params.toString()}`);
}

export async function togglePublish(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const isPublished = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("news_articles")
    .update({
      is_published: !isPublished,
      published_at: !isPublished ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("news_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
