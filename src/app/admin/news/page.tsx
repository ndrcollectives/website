import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createArticle, deleteArticle, togglePublish } from "./actions";

export default async function AdminNewsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">News & Content CMS</h1>

      <form
        action={createArticle}
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4"
      >
        <Input name="title" placeholder="Article title" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select name="category" required defaultValue="Set Release">
            <option value="Set Release">Set Release</option>
            <option value="Market News">Market News</option>
            <option value="Card Spoilers">Card Spoilers</option>
            <option value="Tournament">Tournament</option>
          </Select>
          <Input name="cover_image_url" placeholder="Cover image URL" />
        </div>
        <Input name="excerpt" placeholder="Short excerpt" />
        <textarea
          name="content"
          placeholder="Full article content (Markdown supported)"
          required
          rows={8}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" /> Publish immediately
        </label>
        <Button type="submit">Save Article</Button>
      </form>

      <div className="mt-8 space-y-3">
        {articles?.map((article) => (
          <div
            key={article.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{article.title}</p>
                <Badge variant={article.is_published ? "yellow" : "default"}>
                  {article.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-sm text-muted">{article.category}</p>
            </div>
            <div className="flex gap-2">
              <form action={togglePublish}>
                <input type="hidden" name="id" value={article.id} />
                <input
                  type="hidden"
                  name="is_published"
                  value={String(article.is_published)}
                />
                <Button size="sm" variant="secondary" type="submit">
                  {article.is_published ? "Unpublish" : "Publish"}
                </Button>
              </form>
              <form action={deleteArticle}>
                <input type="hidden" name="id" value={article.id} />
                <Button size="sm" variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
