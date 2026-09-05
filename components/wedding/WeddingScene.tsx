"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAccentColor } from "@/lib/theme";

const PAPER_COLOR = "#f2e8d8";
const GOLD_COLOR = "#c9a35a";
const COVER_IMAGE_URL = "/media/wedding/hero-flatlay.jpg";

/**
 * The wedding card fold — a deliberately different, warm mood (§9) from
 * the hero's cool dark palette. Two hinged panels: a static base and a
 * cover that rotates from closed (folded flat against the base) to open
 * as the section scrolls into view. Same three.js engine as the hero, but
 * a genuinely tiny model — no environment map, no post-processing.
 */
export function WeddingScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  const coverRef = useRef<THREE.Group>(null);
  const accent = useMemo(() => getAccentColor(), []);
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(COVER_IMAGE_URL, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      // Center-crop like CSS `object-fit: cover` — the source photo is 4:3
      // landscape but the cover panel below is a 1.5x2 (3:4) portrait plane,
      // so mapping UVs 1:1 would stretch it.
      const planeAspect = 1.5 / 2;
      const imageAspect = texture.image.width / texture.image.height;
      if (imageAspect > planeAspect) {
        const repeatX = planeAspect / imageAspect;
        texture.repeat.set(repeatX, 1);
        texture.offset.set((1 - repeatX) / 2, 0);
      } else {
        const repeatY = imageAspect / planeAspect;
        texture.repeat.set(1, repeatY);
        texture.offset.set(0, (1 - repeatY) / 2);
      }
      if (cancelled) {
        texture.dispose();
      } else {
        setCoverTexture(texture);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => coverTexture?.dispose();
  }, [coverTexture]);

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

      {/* Cover panel, hinged at x=0. Front face (facing the viewer while
          closed) carries the sample card artwork; the back face — revealed
          once the cover swings open — stays plain paper, like the blank
          inside of a real card. */}
      <group ref={coverRef} position={[0, 0, 0.01]}>
        <mesh position={[0.75, 0, 0.001]}>
          <planeGeometry args={[1.5, 2]} />
          {coverTexture ? (
            <meshStandardMaterial map={coverTexture} roughness={0.6} />
          ) : (
            <meshStandardMaterial color={PAPER_COLOR} roughness={0.7} />
          )}
        </mesh>
        <mesh position={[0.75, 0, -0.001]}>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color={PAPER_COLOR} roughness={0.7} side={THREE.BackSide} />
        </mesh>
        {/* Gold foil edge */}
        <mesh position={[1.49, 0, 0.002]}>
          <planeGeometry args={[0.03, 2]} />
          <meshStandardMaterial
            color={GOLD_COLOR}
            metalness={0.6}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}
