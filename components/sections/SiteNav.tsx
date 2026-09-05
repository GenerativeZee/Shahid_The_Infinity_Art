"use client";

import { useEffect, useRef, useState } from "react";
import { siteNav } from "@/content/site";

/**
 * Exhibition wayfinding (∞ 11.2) — a thin, fixed, edge-to-edge frame, not
 * a container/pill. Transparent over the Hero; it gains a faint dark
 * surface + hairline once the Hero has scrolled away (one
 * IntersectionObserver, not a scroll listener). It also quietly recedes
 * during the Hero transformation, reading `--reveal` (inherited from
 * <body>, written synchronously by HeroMark) purely in CSS — no second
 * scroll system, no React state per frame.
 *
 * Active section is a small gold registration mark, resolved by a second
 * IntersectionObserver over the real section anchors. Mobile collapses to
 * a "Menu" control opening a plain full-screen list (dialog, Escape,
 * focus return).
 */
export function SiteNav() {
  const [pastHero, setPastHero] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    // "-88% 0px 0px 0px" — the Hero counts as "left" once its bottom edge
    // reaches the top ~12% of the viewport, i.e. roughly when the pin
    // releases, not 220dvh later when the whole tall section clears.
    const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), {
      rootMargin: "-88% 0px 0px 0px",
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const els = siteNav.links
      .map((l) => document.getElementById(l.section))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    closeBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuBtnRef.current?.focus();
  }

  return (
    <>
      <nav aria-label="Primary" data-past-hero={pastHero ? "" : undefined} className="site-nav">
        <div className="site-nav__inner">
          <a href={siteNav.brand.href} className="site-nav__brand">
            <span aria-hidden="true" className="site-nav__mark" />
            <span>{siteNav.brand.label}</span>
          </a>

          <div className="site-nav__links">
            {siteNav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={activeId === l.section ? "true" : undefined}
                data-accent={l.accent ? "" : undefined}
                className="site-nav__link"
              >
                {l.label}
              </a>
            ))}
            <a href={siteNav.action.href} className="site-nav__action">
              {siteNav.action.label}
            </a>
          </div>

          <button
            ref={menuBtnRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            onClick={() => setMenuOpen(true)}
            className="site-nav__menu-btn"
          >
            Menu
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="site-nav-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="site-nav__overlay"
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeMenu}
            className="site-nav__close"
          >
            Close
          </button>
          <nav aria-label="Sections" className="site-nav__menu-list">
            {siteNav.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={activeId === l.section ? "true" : undefined}
                data-accent={l.accent ? "" : undefined}
                onClick={closeMenu}
                className="site-nav__menu-link"
              >
                {l.label}
              </a>
            ))}
            <a href={siteNav.action.href} onClick={closeMenu} className="site-nav__menu-action">
              {siteNav.action.label}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
