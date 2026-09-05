import { Reveal } from "@/components/ui/Reveal";
import { process } from "@/content/site";

export function Process() {
  return (
    <section id="process" className="bg-surface px-6 py-section md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-step--1 uppercase tracking-label text-accent">Process</p>
          <h2 className="text-heading">How a job runs</h2>
          <p className="measure text-step-0 text-text-muted">
            Four steps, every time. The date we give you at step four is a promise, not an
            estimate.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {process.map((step, index) => (
            <Reveal key={step.step} index={index}>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="font-mono text-step-1 tabular-nums text-accent">
                  {String(step.step).padStart(2, "0")}
                </span>
                <h3 className="text-step-0 font-semibold text-text">{step.name}</h3>
                <p className="text-step--1 text-text-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
