"use client";

import { useEffect, useRef } from "react";

type RevealProps = {
  children: React.ReactNode;
  /** Position among siblings, used for the 60ms stagger. */
  index?: number;
  className?: string;
};

/**
 * The one reveal pattern for the whole site (spec §10.2): 12px rise + opacity,
 * 400ms ease-out, staggered 60ms per sibling, fired once at 20% in view.
 * Never replays on scroll back — the observer disconnects after triggering.
 *
 * Visibility is toggled by mutating the DOM node directly rather than via
 * React state, since this is a one-time, non-reactive change driven by an
 * external system (viewport intersection) — not something that should
 * cascade a re-render.
 */
export function Reveal({ children, index = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => node.classList.add("opacity-100", "translate-y-0");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(node);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`translate-y-3 opacity-0 transition duration-[400ms] ease-out ${className}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {children}
    </div>
  );
}
