"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAccentColor } from "@/lib/theme";

const PAPER_COLOR = "#f2e8d8";

/**
 * The wedding card fold — a deliberately different, warm mood from the
 * hero's cool dark palette. Two hinged panels: a static base and a cover
 * that rotates from closed (folded flat against the base) to open as the
 * section scrolls into view. Same three.js engine as the hero, but a
 * genuinely tiny model — no environment map, no post-processing.
 *
 * Plain paper on both faces, no artwork — SPEC.md §11.2 rules out stock
 * photography standing in for this shop's work, and no real card
 * photography exists yet, so this stays a plain procedural placeholder
 * (same reasoning as the hero's placeholder infinity-ring logo) rather
 * than being textured with a stand-in photo.
 */
export function WeddingScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const coverRef = useRef<THREE.Group>(null);
  const accent = useMemo(() => getAccentColor(), []);

  useFrame(() => {
    if (coverRef.current) {
      const progress = progressRef.current;
      // Closed (folded flat on top, rotation ~180°) -> open (flat, rotation 0).
      coverRef.current.rotation.y = THREE.MathUtils.degToRad(180 * (1 - progress));
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1} color="#fff4e0" />

      {/* Base panel */}
      <mesh position={[0.75, 0, -0.01]}>
        <planeGeometry args={[1.5, 2]} />
        <meshStandardMaterial color={PAPER_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[0.75, 0, -0.011]}>
        <planeGeometry args={[1.42, 1.92]} />
        <meshStandardMaterial color={accent} roughness={0.9} opacity={0.15} transparent />
      </mesh>

      {/* Cover panel, hinged at x=0 */}
      <group ref={coverRef} position={[0, 0, 0.01]}>
        <mesh position={[0.75, 0, 0]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color={PAPER_COLOR} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Foil edge — the site's one accent colour, not a separate gold
            constant (SPEC.md §16: changing the accent is a one-line edit,
            including here). */}
        <mesh position={[1.49, 0, 0.002]}>
          <planeGeometry args={[0.03, 2]} />
          <meshStandardMaterial
            color={accent}
            metalness={0.6}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}
