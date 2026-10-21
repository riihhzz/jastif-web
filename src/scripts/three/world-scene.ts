import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createStage } from './stage';
import { createLogoModel } from './logo-model';

export interface WorldScene {
  /** 0 = hero di posisi awal, 1 = hero sudah habis discroll. */
  setHeroProgress: (p: number) => void;
  /** 0 = manifesto mulai masuk layar, 1 = manifesto sudah keluar layar. */
  setManifestoProgress: (p: number) => void;
  dispose: () => void;
}

interface Shard {
  mesh: THREE.Mesh;
  offset: number;
  depth: number;
  spin: THREE.Vector3;
}

const SHARD_COUNT = 16;

/**
 * Satu kanvas 3D fixed di belakang halaman, dengan dua "chapter":
 * 1. Hero    — logo J berdiri di panggung [data-hero-stage], berputar mengikuti scroll & kursor.
 * 2. Manifesto — kubus-kubus kaca mengalir dari kanan ke kiri membentuk gelombang di belakang teks.
 * Model di-posisikan dalam koordinat layar sehingga selalu sejajar dengan layout HTML.
 */
export function createWorldScene(
  canvas: HTMLCanvasElement,
  heroStage: HTMLElement,
  chapters: HTMLElement[],
  reducedMotion: boolean,
): WorldScene {
  // Render hanya saat salah satu chapter terlihat (section lain menutupi kanvas)
  const isActive = () =>
    chapters.some((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    });

  const stage = createStage(canvas, 30, isActive);
  const { scene, camera } = stage;
  const DIST = 18;
  camera.position.set(0, 0, DIST);

  // Ukuran setengah layar dalam satuan dunia pada bidang z = 0
  const half = () => {
    const h = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * DIST;
    return { w: h * camera.aspect, h };
  };
  const toWorld = (px: number, py: number) => {
    const { w, h } = half();
    return new THREE.Vector2(
      (px / window.innerWidth) * 2 * w - w,
      h - (py / window.innerHeight) * 2 * h,
    );
  };

  // ---------- Chapter 1: logo ----------
  const { group: logo, cube, cubeBaseY } = createLogoModel();
  const yaw = new THREE.Group();
  yaw.add(logo);
  const pitch = new THREE.Group();
  pitch.add(yaw);
  pitch.rotation.x = 0.45;
  pitch.scale.setScalar(0.001);
  scene.add(pitch);

  // ---------- Chapter 2: kubus mengalir ----------
  const geo = new RoundedBoxGeometry(1, 1, 1, 3, 0.08);
  const materials = [
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.08,
      clearcoat: 1,
    }),
    new THREE.MeshPhysicalMaterial({ color: 0x0b66f0, roughness: 0.3, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: 0xffe2c9, roughness: 0.2, clearcoat: 1 }),
  ];
  const shards: Shard[] = Array.from({ length: SHARD_COUNT }, (_, i) => {
    const mesh = new THREE.Mesh(geo, materials[i % 3 === 1 ? 1 : i % 4 === 0 ? 2 : 0]);
    mesh.visible = false;
    scene.add(mesh);
    return {
      mesh,
      offset: i / (SHARD_COUNT - 1),
      depth: (Math.sin(i * 12.9898) * 0.5 + 0.5) * 6 - 3,
      spin: new THREE.Vector3(Math.sin(i * 3.1), Math.cos(i * 1.7), Math.sin(i * 0.7)),
    };
  });

  let heroP = 0;
  let manifestoP = 0;
  const pointer = new THREE.Vector2();
  const onPointer = (e: PointerEvent) =>
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  stage.onFrame((dt, t) => {
    // --- Logo mengikuti panggung hero ---
    const rect = heroStage.getBoundingClientRect();
    const center = toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const worldPerPx = (half().h * 2) / window.innerHeight;
    const targetScale = (Math.min(rect.width, rect.height) * 0.62 * worldPerPx) / 4.6;

    pitch.position.set(center.x, center.y, 0);
    pitch.scale.setScalar(THREE.MathUtils.damp(pitch.scale.x, targetScale, 4, dt));

    const idle = reducedMotion ? 0 : Math.sin(t * 0.5) * 0.12;
    const targetYaw = -0.35 + heroP * Math.PI * 0.9 + pointer.x * 0.35 + idle;
    yaw.rotation.y = THREE.MathUtils.damp(yaw.rotation.y, targetYaw, 5, dt);
    pitch.rotation.x = THREE.MathUtils.damp(pitch.rotation.x, 0.45 + pointer.y * 0.12, 5, dt);

    cube.position.y = cubeBaseY + 0.12 + heroP * 1.2;
    if (!reducedMotion) {
      cube.position.y += Math.sin(t * 1.6) * 0.12;
      cube.rotation.y = t * 0.6;
    }

    // --- Kubus mengalir sepanjang gelombang dari kanan ke kiri ---
    const { w, h } = half();
    const show = manifestoP > 0 && manifestoP < 1;
    shards.forEach((s) => {
      s.mesh.visible = show;
      if (!show) return;
      // u: 1.3 (di luar layar kanan) → -0.3 (di luar layar kiri)
      const u = 1.35 - manifestoP * 2.1 + s.offset * 0.9;
      const x = (u * 2 - 1) * w * 1.1;
      const y = -h * 0.55 + Math.sin(u * Math.PI * 1.6 + s.offset * 2) * h * 0.22;
      s.mesh.position.set(x, y, s.depth);
      const size = 0.9 + Math.sin(s.offset * 9) * 0.35;
      s.mesh.scale.setScalar(size * Math.min(1, w / 6));
      s.mesh.rotation.set(
        s.spin.x * u * 4 + t * 0.1 * s.spin.y,
        s.spin.y * u * 4,
        s.spin.z * u * 2,
      );
    });
  });

  canvas.classList.remove('opacity-0');

  return {
    setHeroProgress: (p) => (heroP = p),
    setManifestoProgress: (p) => (manifestoP = p),
    dispose: () => {
      window.removeEventListener('pointermove', onPointer);
      stage.dispose();
    },
  };
}
