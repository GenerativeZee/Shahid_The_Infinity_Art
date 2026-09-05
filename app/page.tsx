import { BuildIt } from "@/components/sections/BuildIt";
import { Digital } from "@/components/sections/Digital";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { ShahidsEye } from "@/components/sections/ShahidsEye";
import { Services } from "@/components/sections/Services";
import { SiteNav } from "@/components/sections/SiteNav";
import { Wedding } from "@/components/sections/Wedding";
import { Work } from "@/components/sections/Work";
import { StudioChat } from "@/components/chat/StudioChat";
import { AmbientGlow } from "@/components/theme/AmbientGlow";
import { MaterialExplorer } from "@/components/theme/MaterialExplorer";
import { ThemeEngine } from "@/components/theme/ThemeEngine";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { materials, trust } from "@/content/site";

export default function Home() {
  return (
    <>
      <ThemeEngine />
      <AmbientGlow />
      <SiteNav />
      <main id="main" className="flex flex-col">
        {/* nocturne wraps the pinned Hero only — otherwise the 220dvh pin
            makes the zone ~2.5 viewports tall and ThemeEngine's scroll
            blend crawls. The trust strip + materials are the transition
            into the verdigris chapter. */}
        <div data-theme-zone="nocturne">
          <Hero />
        </div>

        <div data-theme-zone="verdigris">
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

          <MaterialExplorer items={materials} />

          <Work />
          <ShahidsEye />
          <Services />
        </div>

        <div data-theme-zone="ember">
          <Wedding />
        </div>

        <div data-theme-zone="verdigris">
          <Process />
          <Digital />
          <BuildIt />
        </div>

        <div data-theme-zone="signal">
          <QuoteForm />
          <Footer />
        </div>
      </main>
      <WhatsAppButton />
      <StudioChat />
    </>
  );
}
