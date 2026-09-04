import { whatsappHref } from "@/content/site";

/**
 * Persistent, bottom-right, pre-filled — reachable from every scroll
 * position. Per §9: this out-converts a contact form several times over in
 * this market and must never be omitted.
 */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-step--1 uppercase tracking-label text-ground shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105"
      aria-label="Chat with us on WhatsApp"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-current"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.26-8.25 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.84c0 4.55-3.7 8.23-8.25 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.24-.86.85-.86 2.06 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.14-1.19-.06-.1-.23-.16-.48-.28Z" />
      </svg>
      WhatsApp
    </a>
  );
}
