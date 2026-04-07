import { getTranslations } from "next-intl/server";
import { Header } from "@/components/header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl text-terracotta mb-8">
          {t("title")}
        </h1>

        <div className="space-y-6">
          {/* What is Studi Aperti */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl text-charcoal mb-3">{t("whatIsTitle")}</h2>
            <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
              {t("whatIsBody")}
            </p>
          </section>

          {/* Open Studio Event */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl text-charcoal mb-3">{t("eventTitle")}</h2>
            <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
              {t("eventBody")}
            </p>
          </section>

          {/* How to Add a Listing */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl text-charcoal mb-3">
              {t("addListingTitle")}
            </h2>
            <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
              {t("addListingBody")}
            </p>
          </section>

          {/* How to Edit */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl text-charcoal mb-3">
              {t("editListingTitle")}
            </h2>
            <p className="text-sm text-charcoal leading-relaxed whitespace-pre-line">
              {t("editListingBody")}
            </p>
          </section>

        </div>
      </main>

      {/* Disclaimer footer */}
      <footer className="border-t border-cream-dark mt-12">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h3 className="text-xs font-medium text-warm-gray uppercase tracking-wide mb-3">
            {t("disclaimerTitle")}
          </h3>
          <div className="text-xs text-warm-gray/80 leading-relaxed space-y-2">
            <p>{t("disclaimerData")}</p>
            <p>{t("disclaimerEvent")}</p>
            <p className="italic">{t("disclaimerPurpose")}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
