"use client";
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type * as THREE from "three";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

type BubbleLayout = "mobile" | "tablet" | "desktop";

function useBubbleViewport() {
  const [state, setState] = useState<{
    enabled: boolean;
    layout: BubbleLayout;
  }>({ enabled: false, layout: "desktop" });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 639px)");
    const tablet = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");

    const update = () =>
      setState({
        enabled: !reduced.matches,
        layout: mobile.matches ? "mobile" : tablet.matches ? "tablet" : "desktop",
      });

    update();
    reduced.addEventListener("change", update);
    mobile.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  return state;
}

function ChromeBlob({
  position,
  color,
  emissive,
  radius,
  opacity,
  metalness,
  roughness,
  clearcoat,
  clearcoatRoughness,
  emissiveIntensity,
}: {
  position: [number, number, number];
  color: string;
  emissive: string;
  radius: number;
  opacity: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  emissiveIntensity: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.1;
      mesh.current.rotation.x += delta * 0.04;
    }
  });
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[radius, 96, 96]} />
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        transparent
        opacity={opacity}
        distort={0.28}
        speed={1.2}
      />
    </mesh>
  );
}

export default function Hero3D() {
  const { enabled, layout } = useBubbleViewport();
  const { resolvedTheme } = useTheme();
  const mobile = layout === "mobile";
  const tablet = layout === "tablet";
  const isLight = resolvedTheme === "silver-light";
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        dpr={[1, mobile ? 1.1 : tablet ? 1.25 : 1.4]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight
          intensity={
            isLight
              ? mobile
                ? 2.3
                : tablet
                  ? 2.1
                  : 1.9
              : mobile
                ? 1.05
                : tablet
                  ? 0.85
                  : 0.55
          }
        />
        <directionalLight
          position={[4, 6, 5]}
          intensity={
            isLight
              ? mobile
                ? 1.5
                : tablet
                  ? 1.4
                  : 1.3
              : mobile
                ? 1.7
                : tablet
                  ? 1.4
                  : 1.1
          }
        />
        <directionalLight
          position={[-5, -2, 3]}
          intensity={
            isLight
              ? mobile
                ? 1.8
                : tablet
                  ? 1.6
                  : 1.4
              : mobile
                ? 0.7
                : tablet
                  ? 0.5
                  : 0.35
          }
          color={isLight ? "#dfe3e8" : "#9a9a9a"}
        />
        <pointLight
          position={[0, 2.5, 4]}
          intensity={isLight ? 1.6 : 0.35}
          color={isLight ? "#ffffff" : "#bfbfbf"}
        />
        <pointLight
          position={[-2.5, -2, 3]}
          intensity={isLight ? 1.1 : 0.2}
          color={isLight ? "#f4f6f8" : "#8a8a8a"}
        />
        <Suspense fallback={null}>
          <group
            position={
              mobile ? [0.35, -0.15, 0] : tablet ? [0.55, -0.2, 0] : [2.1, 0.1, 0]
            }
            scale={mobile ? 0.55 : tablet ? 0.65 : 1}
            rotation={[0.2, 0, mobile || tablet ? -0.15 : 0.1]}
          >
            <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.8}>
              <ChromeBlob
                position={[0, 0, 0]}
                color={isLight ? "#d0d5db" : "#cfcfcf"}
                emissive={isLight ? "#aab1ba" : "#2a2a2a"}
                emissiveIntensity={isLight ? 0.45 : 0.12}
                radius={1.35}
                opacity={isLight ? 0.95 : 0.9}
                metalness={isLight ? 0.24 : 0.95}
                roughness={isLight ? 0.34 : 0.22}
                clearcoat={isLight ? 1 : 0.4}
                clearcoatRoughness={isLight ? 0.22 : 0.25}
              />
            </Float>
            <Float speed={0.9} rotationIntensity={0.3} floatIntensity={0.6}>
              <ChromeBlob
                position={[1.15, -1.45, -0.6]}
                color={isLight ? "#c7ccd2" : "#8f8f8f"}
                emissive={isLight ? "#a2a9b2" : "#1a1a1a"}
                emissiveIntensity={isLight ? 0.35 : 0.1}
                radius={0.55}
                opacity={isLight ? 0.85 : 0.65}
                metalness={isLight ? 0.24 : 0.9}
                roughness={isLight ? 0.32 : 0.3}
                clearcoat={isLight ? 0.9 : 0.3}
                clearcoatRoughness={isLight ? 0.2 : 0.3}
              />
            </Float>
          </group>
          <Sparkles
            count={mobile ? 26 : tablet ? 40 : 60}
            scale={mobile ? [3.2, 2.6, 2] : tablet ? [4, 3, 2.4] : [5, 3.5, 3]}
            size={mobile ? 1 : 1.2}
            speed={0.25}
            color={isLight ? "#7b8490" : "#e5e5e5"}
            opacity={isLight ? 0.22 : 0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
