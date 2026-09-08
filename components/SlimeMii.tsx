"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from "three";

type SlimeMiiVariant = "ryan" | "chip";

type SlimeMiiProps = {
  speaking: boolean;
  variant: SlimeMiiVariant;
};

const PEOPLE: Record<
  SlimeMiiVariant,
  {
    label: string;
    skin: string;
    hair: string;
    jacket: string;
    shirt: string;
    tie: string;
    glasses: boolean;
  }
> = {
  ryan: {
    label: "A glossy 3D island news anchor named Ryan",
    skin: "#efb184",
    hair: "#513126",
    jacket: "#285da3",
    shirt: "#fff8e9",
    tie: "#ee443d",
    glasses: true,
  },
  chip: {
    label: "A glossy 3D RyMarket analyst named Chip",
    skin: "#e7a573",
    hair: "#b8652e",
    jacket: "#565078",
    shirt: "#e7f3ff",
    tie: "#ffd75e",
    glasses: false,
  },
};

function makeMesh(
  geometry: BufferGeometry,
  material: MeshPhysicalMaterial | MeshStandardMaterial,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
) {
  const mesh = new Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => material.dispose());
  });
}

export function SlimeMii({ speaking, variant }: SlimeMiiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speakingRef = useRef(speaking);
  const [failed, setFailed] = useState(false);
  const person = PEOPLE[variant];

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
        powerPreference: "high-performance",
      });
    } catch {
      const failureTimer = window.setTimeout(() => setFailed(true), 0);
      return () => window.clearTimeout(failureTimer);
    }

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new Scene();
    const camera = new PerspectiveCamera(27, 1, 0.1, 100);
    camera.position.set(0, 0.25, 7.1);

    const root = new Group();
    root.rotation.y = -0.05;
    scene.add(root);

    const skinMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.82,
      clearcoatRoughness: 0.22,
      color: new Color(person.skin),
      roughness: 0.34,
    });
    const hairMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      color: new Color(person.hair),
      roughness: 0.38,
    });
    const jacketMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      color: new Color(person.jacket),
      roughness: 0.36,
    });
    const shirtMaterial = new MeshStandardMaterial({
      color: new Color(person.shirt),
      roughness: 0.64,
    });
    const tieMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.5,
      color: new Color(person.tie),
      roughness: 0.4,
    });
    const featureMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.9,
      color: new Color("#172233"),
      roughness: 0.18,
    });
    const mouthMaterial = new MeshPhysicalMaterial({
      clearcoat: 0.45,
      color: new Color("#6b2633"),
      roughness: 0.3,
    });
    const eyeGlintMaterial = new MeshStandardMaterial({
      color: new Color("#ffffff"),
      emissive: new Color("#ffffff"),
      emissiveIntensity: 0.3,
    });
    const glassesMaterial = new MeshPhysicalMaterial({
      clearcoat: 1,
      color: new Color("#233446"),
      metalness: 0.2,
      roughness: 0.18,
    });

    const torso = makeMesh(
      new CapsuleGeometry(0.62, 0.64, 10, 24),
      jacketMaterial,
      [0, -1.05, -0.02],
      [1.18, 1, 0.73],
    );
    root.add(torso);

    const shirt = makeMesh(
      new SphereGeometry(0.52, 32, 20),
      shirtMaterial,
      [0, -0.78, 0.48],
      [0.7, 0.75, 0.22],
    );
    root.add(shirt);

    const tie = makeMesh(
      new BoxGeometry(0.17, 0.55, 0.12),
      tieMaterial,
      [0, -0.94, 0.66],
      [0.78, 1, 1],
    );
    tie.rotation.z = 0.02;
    root.add(tie);

    const neck = makeMesh(
      new CylinderGeometry(0.24, 0.28, 0.48, 28),
      skinMaterial,
      [0, -0.17, 0],
    );
    root.add(neck);

    const head = new Group();
    head.position.set(0, 0.62, 0);
    root.add(head);

    const face = makeMesh(
      new SphereGeometry(1.16, 64, 48),
      skinMaterial,
      [0, 0.45, 0],
      [0.94, 1.06, 0.83],
    );
    head.add(face);

    const leftEar = makeMesh(
      new SphereGeometry(0.22, 28, 18),
      skinMaterial,
      [-1.03, 0.46, -0.04],
      [0.72, 1, 0.62],
    );
    const rightEar = leftEar.clone();
    rightEar.position.x = 1.03;
    head.add(leftEar, rightEar);

    const hairCap = makeMesh(
      new SphereGeometry(1.12, 48, 28),
      hairMaterial,
      [0, 1.07, -0.16],
      [0.95, 0.51, 0.84],
    );
    hairCap.rotation.z = variant === "ryan" ? -0.06 : 0.04;
    head.add(hairCap);

    const bangs = [
      [-0.6, 0.93, 0.66, 0.5, 0.37, 0.25, -0.24],
      [-0.16, 1.05, 0.78, 0.55, 0.34, 0.22, -0.08],
      [0.34, 1.05, 0.73, 0.48, 0.3, 0.22, 0.16],
      [0.69, 0.92, 0.55, 0.32, 0.29, 0.2, 0.3],
    ] as const;
    bangs.forEach(([x, y, z, sx, sy, sz, rotation]) => {
      const bang = makeMesh(
        new SphereGeometry(0.62, 28, 18),
        hairMaterial,
        [x, y, z],
        [sx, sy, sz],
      );
      bang.rotation.z = rotation + (variant === "chip" ? 0.18 : 0);
      head.add(bang);
    });

    const eyeGeometry = new SphereGeometry(0.14, 24, 18);
    const leftEye = makeMesh(
      eyeGeometry,
      featureMaterial,
      [-0.38, 0.5, 0.92],
      [0.62, 1.15, 0.32],
    );
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.38;
    head.add(leftEye, rightEye);

    const leftGlint = makeMesh(
      new SphereGeometry(0.035, 16, 10),
      eyeGlintMaterial,
      [-0.41, 0.56, 0.98],
      [1, 1, 0.45],
    );
    const rightGlint = leftGlint.clone();
    rightGlint.position.x = 0.35;
    head.add(leftGlint, rightGlint);

    const leftBrow = makeMesh(
      new CapsuleGeometry(0.035, 0.31, 6, 12),
      hairMaterial,
      [-0.38, 0.79, 0.9],
    );
    leftBrow.rotation.z = Math.PI / 2 - 0.12;
    const rightBrow = leftBrow.clone();
    rightBrow.position.x = 0.38;
    rightBrow.rotation.z = Math.PI / 2 + 0.12;
    head.add(leftBrow, rightBrow);

    const nose = makeMesh(
      new SphereGeometry(0.11, 24, 18),
      skinMaterial,
      [0, 0.25, 1.01],
      [0.82, 1.08, 0.68],
    );
    head.add(nose);

    const mouth = makeMesh(
      new SphereGeometry(0.2, 28, 18),
      mouthMaterial,
      [0, -0.06, 0.96],
      [1.2, 0.24, 0.32],
    );
    head.add(mouth);

    if (person.glasses) {
      const ringGeometry = new TorusGeometry(0.3, 0.032, 10, 48);
      const leftRing = makeMesh(
        ringGeometry,
        glassesMaterial,
        [-0.39, 0.51, 1.035],
      );
      const rightRing = leftRing.clone();
      rightRing.position.x = 0.39;
      const bridge = makeMesh(
        new CylinderGeometry(0.026, 0.026, 0.2, 12),
        glassesMaterial,
        [0, 0.51, 1.035],
      );
      bridge.rotation.z = Math.PI / 2;
      head.add(leftRing, rightRing, bridge);
    }

    const leftHand = makeMesh(
      new SphereGeometry(0.21, 28, 18),
      skinMaterial,
      [-0.88, -0.78, 0.34],
      [1, 0.88, 0.78],
    );
    leftHand.rotation.z = -0.2;
    const rightHand = leftHand.clone();
    rightHand.position.x = 0.88;
    rightHand.rotation.z = 0.2;
    root.add(leftHand, rightHand);

    const shadow = makeMesh(
      new CircleGeometry(1.25, 48),
      new MeshStandardMaterial({
        color: new Color("#22415b"),
        opacity: 0.2,
        transparent: true,
      }),
      [0, -1.8, -0.15],
      [1.2, 0.35, 1],
    );
    root.add(shadow);

    const hemisphere = new HemisphereLight("#f8fcff", "#4b7892", 2.25);
    const ambient = new AmbientLight("#ffffff", 0.8);
    const key = new DirectionalLight("#fff4df", 4.7);
    key.position.set(-3.2, 5.4, 5.5);
    key.castShadow = true;
    const rim = new PointLight("#70dcff", 18, 12);
    rim.position.set(3.8, 2.6, 2.2);
    scene.add(hemisphere, ambient, key, rim);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    let visible = !document.hidden;
    const startedAt = performance.now();

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (now: number) => {
      if (!visible) return;

      const elapsed = (now - startedAt) / 1000;
      const talking = speakingRef.current;
      const bob = reducedMotion ? 0 : Math.sin(elapsed * 2.1) * 0.035;
      const talk = talking && !reducedMotion ? Math.sin(elapsed * 11) : 0;
      const blinkPhase = elapsed % 4.8;
      const blink =
        !reducedMotion && blinkPhase > 4.47
          ? Math.max(0.06, Math.abs(blinkPhase - 4.63) * 7)
          : 1;

      root.position.y = bob;
      root.rotation.y = -0.05 + Math.sin(elapsed * 0.7) * 0.025;
      head.rotation.z = Math.sin(elapsed * 0.85) * 0.012;
      head.rotation.y = Math.sin(elapsed * 0.52) * 0.045;
      torso.scale.y = 1 + talk * 0.008;
      mouth.scale.y = talking ? 0.3 + Math.abs(talk) * 0.58 : 0.24;
      leftEye.scale.y = 1.15 * blink;
      rightEye.scale.y = 1.15 * blink;
      leftGlint.visible = blink > 0.3;
      rightGlint.visible = blink > 0.3;
      leftHand.rotation.z = -0.2 + (talking ? talk * 0.045 : 0);
      rightHand.rotation.z = 0.2 - (talking ? talk * 0.045 : 0);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    frame = window.requestAnimationFrame(render);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      disposeObject(root);
      renderer.dispose();
    };
  }, [person, variant]);

  if (failed) {
    return (
      <div aria-label={person.label} className="slimeMiiFallback" role="img">
        <i />
        <span />
        <b />
      </div>
    );
  }

  return (
    <canvas
      aria-label={person.label}
      className="slimeMiiCanvas"
      ref={canvasRef}
      role="img"
    />
  );
}
