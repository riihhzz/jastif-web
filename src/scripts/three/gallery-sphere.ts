import * as THREE from 'three';
import { createStage } from './stage';
import { asset } from '@/scripts/utils/motion';

export interface GallerySphere {
  /** Progress scroll section 0–1: bola tumbuh, berputar, lalu mendekat ke kamera. */
  setProgress: (p: number) => void;
}

const BG = 0x04102a;
const PALETTES = [
  ['#4aa8ff', '#0656c4', '#ffffff'],
  ['#ff9640', '#f05f05', '#ffffff'],
  ['#0a2552', '#061633', '#ff9640'],
  ['#eef6ff', '#bcdcff', '#0b1630'],
  ['#ffb36b', '#ff7a1a', '#0b1630'],
  ['#2b95ff', '#0a2552', '#ffb36b'],
];

/** Tile placeholder bergaya brand (dipakai selama foto asli belum diisi di data/gallery.ts). */
function placeholderTexture(label: string, i: number): THREE.CanvasTexture {
  const [from, to, ink] = PALETTES[i % PALETTES.length]!;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext('2d')!;

  const g = ctx.createLinearGradient(0, 0, 512, 320);
  g.addColorStop(0, from!);
  g.addColorStop(1, to!);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 320);

  // Kubus isometrik sederhana sebagai "produk"
  const cx = 390;
  const cy = 170;
  const s = 62;
  const faces: [string, number[][]][] = [
    [
      'rgba(255,255,255,0.55)',
      [
        [cx, cy - s],
        [cx + s, cy - s / 2],
        [cx, cy],
        [cx - s, cy - s / 2],
      ],
    ],
    [
      'rgba(255,255,255,0.28)',
      [
        [cx - s, cy - s / 2],
        [cx, cy],
        [cx, cy + s],
        [cx - s, cy + s / 2],
      ],
    ],
    [
      'rgba(0,0,0,0.18)',
      [
        [cx + s, cy - s / 2],
        [cx, cy],
        [cx, cy + s],
        [cx + s, cy + s / 2],
      ],
    ],
  ];
  faces.forEach(([fill, pts]) => {
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x!, y!) : ctx.moveTo(x!, y!)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  });

  ctx.fillStyle = ink!;
  ctx.globalAlpha = 0.75;
  ctx.font = '700 22px "Montserrat Variable", sans-serif';
  ctx.fillText('Jastif.id', 34, 52);
  ctx.globalAlpha = 1;
  ctx.font = '64px Anton, Impact, sans-serif';
  ctx.fillText(label.toUpperCase(), 34, 270, 300);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Bola galeri: tile foto disusun merata di permukaan bola (spiral Fibonacci),
 * menghadap keluar, dengan kabut sehingga sisi belakang bola meredup.
 */
export async function createGallerySphere(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): Promise<GallerySphere> {
  const images: string[] = JSON.parse(canvas.dataset.images ?? '[]');
  const labels: string[] = JSON.parse(canvas.dataset.labels ?? '[]');

  const stage = createStage(canvas, 35);
  const { scene, camera, renderer } = stage;
  scene.fog = new THREE.Fog(BG, 11, 19);
  camera.position.set(0, 0, 15);

  // ---------- Tekstur ----------
  await document.fonts?.load('64px Anton').catch(() => undefined);
  let textures: THREE.Texture[];
  if (images.length) {
    const loader = new THREE.TextureLoader();
    textures = images.map((src) => {
      const tex = loader.load(asset(src));
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    });
  } else {
    textures = labels.map((label, i) => placeholderTexture(label, i));
  }
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  textures.forEach((t) => (t.anisotropy = Math.min(8, maxAniso)));
  const materials = textures.map(
    (map) => new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false }),
  );

  // ---------- Tile di permukaan bola ----------
  const sphere = new THREE.Group();
  scene.add(sphere);
  const count = window.innerWidth < 640 ? 70 : 120;
  const radius = 4.3;
  const geo = new THREE.PlaneGeometry(1, 0.625);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - ((i + 0.5) / count) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const pos = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(
      radius,
    );
    const mesh = new THREE.Mesh(geo, materials[i % materials.length]);
    mesh.position.copy(pos);
    mesh.lookAt(pos.clone().multiplyScalar(2));
    // Tile mengecil di dekat kutub agar tidak bertumpuk
    mesh.scale.setScalar(0.62 + r * 0.38);
    sphere.add(mesh);
  }

  // ---------- Interaksi: seret untuk memutar ----------
  let spin = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  const pointer = new THREE.Vector2();
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
  });
  window.addEventListener('pointerup', () => (dragging = false));
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
      if (!dragging) return;
      velocity = (e.clientX - lastX) * 0.004;
      lastX = e.clientX;
    },
    { passive: true },
  );

  let progress = 0;
  const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

  stage.onFrame((dt) => {
    // Putaran otomatis + sisa dorongan dari seretan
    spin += velocity + (reducedMotion ? 0 : dt * 0.12);
    velocity *= 0.92;

    const grow = smooth(0.02, 0.4, progress);
    const near = smooth(0.45, 1, progress);
    const scale = THREE.MathUtils.lerp(0.35, 1, grow);
    sphere.scale.setScalar(THREE.MathUtils.damp(sphere.scale.x, scale, 6, dt));

    const targetY = spin + progress * Math.PI * 1.4;
    const targetX = THREE.MathUtils.lerp(0.35, -0.15, progress) + pointer.y * 0.12;
    sphere.rotation.y = THREE.MathUtils.damp(sphere.rotation.y, targetY, 6, dt);
    sphere.rotation.x = THREE.MathUtils.damp(sphere.rotation.x, targetX, 4, dt);

    // Layar potret (HP) butuh kamera lebih jauh agar lebar bola tetap muat
    const fit = Math.max(1, 1.1 / camera.aspect);
    const camZ = THREE.MathUtils.lerp(15, 10.8, near) * fit;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, 5, dt);
    // Kabut mengikuti jarak kamera: sisi depan jelas, sisi belakang bola meredup
    const fog = scene.fog as THREE.Fog;
    fog.near = camera.position.z - radius * 0.6;
    fog.far = camera.position.z + radius * 1.5;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.6, 3, dt);
    camera.lookAt(0, 0, 0);
  });

  return { setProgress: (p) => (progress = p) };
}
