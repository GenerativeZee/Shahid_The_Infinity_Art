"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { WeddingScene } from "./WeddingScene";
import { useCardProgress } from "./useCardProgress";

export function WeddingCanvas({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const progressRef = useCardProgress(sectionRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const [intersecting, setIntersecting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const active = intersecting && !hidden;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);

    function onVisibility() {
      setHidden(document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="aspect-[4/3] w-full">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 40 }}
      >
        <WeddingScene progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
