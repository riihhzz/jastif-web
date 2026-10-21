import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface LogoModel {
  group: THREE.Group;
  /** Kubus oranye (dianimasikan terpisah agar terlihat melayang). */
  cube: THREE.Mesh;
  cubeBaseY: number;
}

/**
 * Logo Jastif.id dalam bentuk 3D: huruf "J" dari balok biru + kubus oranye melayang.
 * Dibuat prosedural sehingga tidak perlu file model.
 */
export function createLogoModel(): LogoModel {
  const blue = new THREE.MeshPhysicalMaterial({
    color: 0x0b66f0,
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  });
  const orange = new THREE.MeshPhysicalMaterial({
    color: 0xff7a1a,
    emissive: 0xff5a00,
    emissiveIntensity: 0.15,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });

  const group = new THREE.Group();
  const r = 0.06;

  // Kaki "J" (horizontal) dan tiang (vertikal) berbagi sudut di sisi kanan
  const foot = new THREE.Mesh(new RoundedBoxGeometry(2.6, 1, 1, 4, r), blue);
  foot.position.set(0, 0.5, 0);
  const pillar = new THREE.Mesh(new RoundedBoxGeometry(1, 3.2, 1, 4, r), blue);
  pillar.position.set(0.8, 1.6, 0);

  const cubeBaseY = 3.2 + 0.32 + 0.43;
  const cube = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.86, 0.86, 4, r), orange);
  cube.position.set(0.8, cubeBaseY, 0);

  group.add(foot, pillar, cube);

  // Pusatkan model di titik origin
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.children.forEach((child) => child.position.sub(center));

  return { group, cube, cubeBaseY: cubeBaseY - center.y };
}
