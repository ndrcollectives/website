import type { LegalDoc } from "@/lib/legal-content";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">{doc.title}</h1>
      <p className="mt-2 text-xs uppercase tracking-wide text-accent-yellow">
        {doc.lastUpdated}
      </p>
      <p className="mt-4 text-muted">{doc.intro}</p>

      <div className="mt-8 space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-lg font-semibold">{section.heading}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="text-sm text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
