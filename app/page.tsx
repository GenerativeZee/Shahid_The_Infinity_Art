import { Digital } from "@/components/sections/Digital";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Services } from "@/components/sections/Services";
import { Wedding } from "@/components/sections/Wedding";
import { Work } from "@/components/sections/Work";
import { Marquee } from "@/components/ui/Marquee";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { materials, trust } from "@/content/site";

export default function Home() {
  return (
    <>
      <main id="main" className="flex flex-col">
        <Hero />

        <section className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border bg-surface px-6 py-8 md:px-12">
          {trust.map((t) => (
            <div key={t.label} className="flex items-baseline gap-2">
              <span className="font-mono text-step-2 tabular-nums text-accent">{t.value}</span>
              <span className="font-mono text-step--1 uppercase tracking-label text-text-muted">
                {t.label}
              </span>
            </div>
          ))}
        </section>

        <Marquee items={materials} />

        <Work />
        <Services />
        <Wedding />
        <Process />
        <Digital />
        <QuoteForm />
        <Footer />
      </main>
      <WhatsAppButton />
    </>
  );
}
