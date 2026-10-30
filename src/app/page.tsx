"use client";

import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

export default function Home() {
  const t = useT();
  return (
    <div className="relative min-h-screen overflow-hidden text-[#1a1a1a]">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#1f3a1f]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-32 h-96 w-96 rounded-full bg-[#2d5a27]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#c9d6c9]/40 blur-3xl" />

      <main className="relative mx-auto max-w-6xl px-6">
        <section className="py-24 text-center sm:py-32">
          <p className="mb-5 inline-block rounded-full border border-[#1f3a1f]/30 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1f3a1f] shadow-sm backdrop-blur">
            {t("landing.badge")}
          </p>
          <h1 className="mx-auto max-w-4xl text-6xl font-black leading-[1.02] tracking-tight sm:text-8xl">
            {t("landing.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5a5a5a]">
            {t("landing.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/create"
              className="group rounded-full bg-[#1f3a1f] px-8 py-4 text-base font-semibold text-[#f5f0e6] shadow-xl shadow-[#1f3a1f]/25 transition hover:bg-[#2d5a27] hover:shadow-2xl"
            >
              {t("landing.cta.primary")}{" "}
              <span className="inline-block transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/p/demo-portfolio"
              className="rounded-full border border-[#1f3a1f]/30 bg-white/70 px-8 py-4 text-base font-semibold text-[#1f3a1f] backdrop-blur transition hover:border-[#1f3a1f] hover:bg-white"
            >
              {t("landing.cta.secondary")}
            </Link>
          </div>
        </section>

        <section className="grid gap-6 py-10 sm:grid-cols-3">
          {[
            { title: t("landing.feature.form.title"), body: t("landing.feature.form.body"), icon: "📝" },
            { title: t("landing.feature.hosted.title"), body: t("landing.feature.hosted.body"), icon: "🚀" },
            { title: t("landing.feature.edit.title"), body: t("landing.feature.edit.body"), icon: "✏️" },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-[#1f3a1f]/15 bg-white/70 p-7 backdrop-blur transition hover:-translate-y-1 hover:border-[#1f3a1f]/40 hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">{item.icon}</div>
              <h3 className="text-lg font-bold text-[#1f3a1f]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a5a5a]">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="py-12 text-center">
          <div className="mx-auto max-w-xl rounded-2xl border border-[#1f3a1f]/15 bg-white/70 p-6 text-sm text-[#5a5a5a] backdrop-blur">
            {t("landing.demo.note").replace("{key}", "demo-key-123")}
          </div>
        </section>
      </main>
    </div>
  );
}
