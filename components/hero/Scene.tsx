"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, PerspectiveCamera } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { useHeroStore } from "@/lib/store";
import { createHeroBeatState, createHeroTimeline } from "@/lib/heroTimeline";
import { createShadowTexture } from "./shadowTexture";
import { getAccentColor } from "@/lib/theme";

const BASE_BOARD_THICKNESS = 0.02;
const BASE_LETTER_DEPTH = 0.14;
const EXTRA_BOARDS = 8;

/** Invalidates the demand-mode render loop whenever heroProgress actually changes. */
function InvalidateOnProgress() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    return useHeroStore.subscribe((state, prev) => {
      if (state.heroProgress !== prev.heroProgress) invalidate();
    });
  }, [invalidate]);

  return null;
}

export function Scene({ tier }: { tier: "A" | "B" }) {
  const beatState = useMemo(() => createHeroBeatState(), []);
  const timeline = useMemo(() => createHeroTimeline(beatState), [beatState]);
  const shadowTexture = useMemo(() => (tier === "B" ? createShadowTexture() : null), [tier]);
  const accent = useMemo(() => getAccentColor(), []);

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const boardGroupRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Mesh>(null);
  const ringARef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const letterMatA = useRef<THREE.MeshPhysicalMaterial>(null);
  const letterMatB = useRef<THREE.MeshStandardMaterial>(null);
  const wallMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const extraBoardsRef = useRef<THREE.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloomRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sceneFromThree = useThree((s) => s.scene);

  useEffect(() => {
    sceneRef.current = sceneFromThree;
  }, [sceneFromThree]);

  useEffect(() => {
    // GSAP timelines and manually-created textures aren't JSX-declared, so
    // R3F won't dispose them on unmount for us (§15) — everything else
    // here (geometries/materials created via JSX) is disposed by R3F.
    return () => {
      timeline.kill();
      shadowTexture?.dispose();
    };
  }, [timeline, shadowTexture]);

  useFrame(() => {
    const progress = useHeroStore.getState().heroProgress;
    timeline.progress(progress);

    if (cameraRef.current) {
      cameraRef.current.position.set(beatState.cameraX, beatState.cameraY, beatState.cameraZ);
      cameraRef.current.lookAt(0, 0, 0);
    }

    if (boardGroupRef.current) {
      boardGroupRef.current.rotation.y = beatState.boardRotY;
    }
    if (boardRef.current) {
      boardRef.current.scale.z = Math.max(beatState.boardThickness, 0.001) / BASE_BOARD_THICKNESS;
    }

    const depthScale = Math.max(beatState.letterDepth, 0.001) / BASE_LETTER_DEPTH;
    if (ringARef.current) ringARef.current.scale.z = depthScale;
    if (ringBRef.current) ringBRef.current.scale.z = depthScale;

    const letterMat = tier === "A" ? letterMatA.current : letterMatB.current;
    if (letterMat) letterMat.emissiveIntensity = beatState.ledIntensity;

    if (wallMatRef.current) wallMatRef.current.opacity = beatState.wallOpacity;

    if (sceneRef.current) sceneRef.current.environmentIntensity = beatState.envIntensity;

    if (bloomRef.current) bloomRef.current.intensity = beatState.bloomIntensity;

    if (extraBoardsRef.current) {
      extraBoardsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        const stagger = i * 0.02;
        const span = 1 - stagger || 1;
        material.opacity = Math.min(1, Math.max(0, (beatState.pullBackReveal - stagger) / span));
      });
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 6]} fov={45} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <Environment preset="night" resolution={tier === "A" ? 1024 : 256} />
      <InvalidateOnProgress />

      <group ref={boardGroupRef}>
        {/* Board — face material front/back, ACP edge material on the sides (§7) */}
        <mesh ref={boardRef}>
          <boxGeometry args={[2.4, 1.4, 0.02]} />
          <meshStandardMaterial attach="material-0" color="#8a929a" roughness={0.35} metalness={0.6} />
          <meshStandardMaterial attach="material-1" color="#8a929a" roughness={0.35} metalness={0.6} />
          <meshStandardMaterial attach="material-2" color="#8a929a" roughness={0.35} metalness={0.6} />
          <meshStandardMaterial attach="material-3" color="#8a929a" roughness={0.35} metalness={0.6} />
          <meshStandardMaterial attach="material-4" color="#101820" roughness={0.55} />
          <meshStandardMaterial attach="material-5" color="#101820" roughness={0.55} />
        </mesh>

        {/* Letters — placeholder infinity mark (two rings). Swap for
            ExtrudeGeometry from the real logo SVG once it exists (§7). */}
        <mesh ref={ringARef} position={[-0.35, 0, 0.05]}>
          <torusGeometry args={[0.35, 0.1, 16, 48]} />
          {tier === "A" ? (
            <meshPhysicalMaterial
              ref={letterMatA}
              color="#e8fbff"
              transmission={0.35}
              ior={1.49}
              clearcoat={1}
              roughness={0.1}
              emissive={accent}
              emissiveIntensity={0}
            />
          ) : (
            <meshStandardMaterial
              ref={letterMatB}
              color="#e8fbff"
              roughness={0.3}
              emissive={accent}
              emissiveIntensity={0}
            />
          )}
        </mesh>
        <mesh ref={ringBRef} position={[0.35, 0, 0.05]}>
          <torusGeometry args={[0.35, 0.1, 16, 48]} />
          {tier === "A" ? (
            <meshPhysicalMaterial
              color="#e8fbff"
              transmission={0.35}
              ior={1.49}
              clearcoat={1}
              roughness={0.1}
              emissive={accent}
              emissiveIntensity={0}
            />
          ) : (
            <meshStandardMaterial color="#e8fbff" roughness={0.3} emissive={accent} emissiveIntensity={0} />
          )}
        </mesh>
      </group>

      {/* Wall */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial ref={wallMatRef} color="#1b2329" roughness={0.9} transparent opacity={0} />
      </mesh>

      {/* Ground / contact shadow */}
      {tier === "A" ? (
        <ContactShadows position={[0, -0.9, 0]} opacity={0.6} blur={2} far={2} />
      ) : shadowTexture ? (
        <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial map={shadowTexture} transparent opacity={0.6} />
        </mesh>
      ) : null}

      {/* Beat 5 — pull-back reveal grid, staggered 0.02 apart */}
      <group ref={extraBoardsRef} position={[0, 0, -1]}>
        {Array.from({ length: EXTRA_BOARDS }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          return (
            <mesh key={i} position={[(col - 1.5) * 1.4, (row - 0.5) * 1.2, -2 - row * 0.3]}>
              <planeGeometry args={[1.1, 0.8]} />
              <meshStandardMaterial color="#141b20" roughness={0.6} transparent opacity={0} />
            </mesh>
          );
        })}
      </group>

      {tier === "A" ? (
        <EffectComposer>
          <Bloom ref={bloomRef} mipmapBlur luminanceThreshold={0.6} intensity={0} />
        </EffectComposer>
      ) : null}
    </>
  );
}
