import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Dipanggil tiap frame selama kanvas terlihat. */
  onFrame: (fn: (dt: number, elapsed: number) => void) => void;
  dispose: () => void;
}

/**
 * Setup dasar Three.js: renderer transparan, pencahayaan studio (environment map),
 * resize otomatis, dan render loop yang berhenti saat kanvas di luar layar.
 */
export function createStage(
  canvas: HTMLCanvasElement,
  fov = 30,
  /** Untuk kanvas fixed (selalu "terlihat"): render hanya saat fungsi ini bernilai true. */
  isActive: () => boolean = () => true,
): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 8, 6);
  const rim = new THREE.DirectionalLight(0xff9640, 2.2);
  rim.position.set(-6, 3, -4);
  scene.add(key, rim, new THREE.AmbientLight(0x9fd0ff, 0.4));

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const callbacks: ((dt: number, elapsed: number) => void)[] = [];
  const timer = new THREE.Timer();
  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry!.isIntersecting));
  io.observe(canvas);

  renderer.setAnimationLoop((time) => {
    timer.update(time);
    if (!visible || !isActive()) return;
    const dt = Math.min(timer.getDelta(), 0.05);
    callbacks.forEach((fn) => fn(dt, timer.getElapsed()));
    renderer.render(scene, camera);
  });

  return {
    renderer,
    scene,
    camera,
    onFrame: (fn) => callbacks.push(fn),
    dispose: () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
    },
  };
}

/** Bayangan lembut di bawah objek (tanpa shadow map, ringan untuk mobile). */
export function createContactShadow(size = 6, opacity = 0.35): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(6,22,51,${opacity})`);
  g.addColorStop(1, 'rgba(6,22,51,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
