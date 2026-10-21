import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createContactShadow, createStage } from './stage';
import { createLogoModel } from './logo-model';
import { asset } from '@/scripts/utils/motion';

/** Cek apakah file .glb benar-benar ada (GitHub Pages mengembalikan HTML 404 bila tidak). */
async function modelExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok && !res.headers.get('content-type')?.includes('text/html');
  } catch {
    return false;
  }
}

/** Skala & pusatkan model hasil export Blender agar selalu pas di dalam viewer. */
function normalize(object: THREE.Object3D, size = 4.2): void {
  const box = new THREE.Box3().setFromObject(object);
  const dim = box.getSize(new THREE.Vector3());
  object.scale.multiplyScalar(size / Math.max(dim.x, dim.y, dim.z));
  const centered = new THREE.Box3().setFromObject(object);
  object.position.sub(centered.getCenter(new THREE.Vector3()));
}

export interface ProductViewer {
  /** Progress scroll section 0–1: model berputar seperti turntable. */
  setProgress: (p: number) => void;
}

/**
 * Viewer 3D interaktif (orbit + zoom). Memuat public/<data-model> jika ada,
 * jika tidak menampilkan logo 3D Jastif.id. Selain diseret, model berputar mengikuti scroll.
 */
export async function createProductViewer(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): Promise<ProductViewer> {
  const stage = createStage(canvas, 32);
  const { scene, camera, renderer } = stage;
  camera.position.set(8.5, 5, 11);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 18;
  // OrbitControls memblokir semua gesture sentuh; izinkan scroll vertikal halaman di HP
  renderer.domElement.style.touchAction = 'pan-y';

  // Model ditaruh di "turntable" yang diputar oleh progress scroll
  const turntable = new THREE.Group();
  scene.add(turntable);
  let progress = 0;
  stage.onFrame((dt) => {
    const target = -0.6 + progress * Math.PI * 2;
    turntable.rotation.y = THREE.MathUtils.damp(turntable.rotation.y, target, 4, dt);
  });
  // Biarkan halaman tetap bisa discroll dengan wheel; zoom hanya saat Ctrl/pinch
  controls.enableZoom = false;
  canvas.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      controls.enableZoom = true;
      queueMicrotask(() => (controls.enableZoom = false));
    },
    { passive: false },
  );
  canvas.addEventListener('touchstart', (e) => (controls.enableZoom = e.touches.length > 1), {
    passive: true,
  });

  const shadow = createContactShadow(6, 0.4);
  shadow.position.y = -2.4;
  scene.add(shadow);

  const url = asset(canvas.dataset.model ?? '');
  let loaded: THREE.Object3D | null = null;
  if (canvas.dataset.model && (await modelExists(url))) {
    try {
      loaded = (await new GLTFLoader().loadAsync(url)).scene;
      normalize(loaded);
    } catch (err) {
      console.warn('[viewer] Gagal memuat model, memakai logo.', err);
    }
  }

  if (loaded) {
    turntable.add(loaded);
  } else {
    const { group, cube, cubeBaseY } = createLogoModel();
    turntable.add(group);
    if (!reducedMotion) {
      stage.onFrame((_, t) => {
        cube.position.y = cubeBaseY + 0.1 + Math.sin(t * 1.6) * 0.12;
      });
    }
  }

  stage.onFrame(() => controls.update());
  return { setProgress: (p) => (progress = p) };
}
