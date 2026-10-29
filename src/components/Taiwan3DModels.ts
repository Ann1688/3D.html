import * as THREE from 'three';
import { Category } from '../types/travel';

// Shared materials cache to save draw calls and memory
const materialsCache: Record<string, THREE.Material> = {};

function getMaterial(key: string, createFn: () => THREE.Material): THREE.Material {
  if (!materialsCache[key]) {
    materialsCache[key] = createFn();
  }
  return materialsCache[key];
}

/**
 * 1. 休閒樂園 (Landmark): 彩色摩天輪 (Color Ferris wheel)
 * Low-poly group with A-frame legs, rotating wheel with colored gondolas
 */
export function createFerrisWheel(): { group: THREE.Group; update: (dt: number) => void } {
  const group = new THREE.Group();
  group.name = 'FerrisWheel';

  // Support Legs (A-frame)
  const legMat = getMaterial('legMat', () => new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.3,
  }));
  const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5);

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.35, 0.65, 0);
  leftLeg.rotation.z = 0.26;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.35, 0.65, 0);
  rightLeg.rotation.z = -0.26;
  group.add(rightLeg);

  // Cross support
  const crossGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4);
  const cross = new THREE.Mesh(crossGeo, legMat);
  cross.position.set(0, 0.4, 0);
  cross.rotation.z = Math.PI / 2;
  group.add(cross);

  // Rotating Wheel Assembly
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 1.25, 0);
  group.add(wheelGroup);

  // Hub
  const hubMat = getMaterial('hubMat', () => new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.2,
  }));
  const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  wheelGroup.add(hub);

  // Outer Rim
  const rimMat = getMaterial('rimMat', () => new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.3,
  }));
  const rimGeo = new THREE.TorusGeometry(0.65, 0.035, 6, 16);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  wheelGroup.add(rim);

  // Spokes & Colorful Gondolas
  const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4);
  const gondolaColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0x8b5cf6, 0xec4899];
  const gondolaMeshes: THREE.Mesh[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    // Spoke
    const spoke = new THREE.Mesh(spokeGeo, legMat);
    spoke.rotation.z = angle;
    wheelGroup.add(spoke);

    // Gondola
    const gondolaMat = getMaterial(`gondola_${i}`, () => new THREE.MeshStandardMaterial({
      color: gondolaColors[i],
      roughness: 0.3,
      metalness: 0.4,
    }));
    const gondolaGeo = new THREE.BoxGeometry(0.16, 0.16, 0.14);
    const gondola = new THREE.Mesh(gondolaGeo, gondolaMat);
    gondola.position.set(Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0);
    wheelGroup.add(gondola);
    gondolaMeshes.push(gondola);
  }

  // Animation function
  const update = (dt: number) => {
    wheelGroup.rotation.z += dt * 0.8;
    // Keep gondolas upright against gravity
    gondolaMeshes.forEach((g) => {
      g.rotation.z = -wheelGroup.rotation.z;
    });
  };

  group.scale.set(0.7, 0.7, 0.7);
  return { group, update };
}

/**
 * 2. 壯麗自然 (Nature): 三角錐山 (Triangular pyramidal mountain)
 * Exact requirement: Left facet light green (#34d399), right facet dark green (#047857), with rock/snow tip
 */
export function createTriangleMountain(): { group: THREE.Group; update: (dt: number) => void } {
  const group = new THREE.Group();
  group.name = 'TriangleMountain';

  // Custom BufferGeometry with distinct facet colors
  const geom = new THREE.BufferGeometry();

  // Vertices of a 4-sided pyramid:
  // Apex: (0, 1.4, 0)
  // Base 4 points: Front (-0.6, 0, 0.6), Right (0.6, 0, 0.6), Back Right (0.5, 0, -0.6), Back Left (-0.5, 0, -0.6)
  // Left face: Light green
  // Right face: Dark green
  // Back faces: mid green & forest green

  const positions = new Float32Array([
    // Face 1: Left face (Front-Left to Apex to Back-Left)
    -0.65, 0, 0.65,
    0, 1.35, 0,
    -0.55, 0, -0.65,

    // Face 2: Right face (Front-Left to Front-Right to Apex)
    -0.65, 0, 0.65,
    0.65, 0, 0.65,
    0, 1.35, 0,

    // Face 3: East face (Front-Right to Back-Right to Apex)
    0.65, 0, 0.65,
    0.55, 0, -0.65,
    0, 1.35, 0,

    // Face 4: North face (Back-Right to Back-Left to Apex)
    0.55, 0, -0.65,
    -0.55, 0, -0.65,
    0, 1.35, 0,
  ]);

  // Colors per vertex
  const colors = new Float32Array([
    // Face 1: Left facet - Bright vibrant light green
    0.28, 0.88, 0.55,
    0.35, 0.95, 0.65,
    0.22, 0.80, 0.48,

    // Face 2: Front-Right facet - Deep dark pine/forest green
    0.05, 0.45, 0.25,
    0.08, 0.52, 0.30,
    0.04, 0.38, 0.20,

    // Face 3: East facet - Rich emerald green
    0.10, 0.58, 0.35,
    0.12, 0.65, 0.40,
    0.08, 0.50, 0.30,

    // Face 4: North/Back facet - Shadow green
    0.04, 0.35, 0.20,
    0.05, 0.40, 0.22,
    0.03, 0.30, 0.16,
  ]);

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geom.computeVertexNormals();

  const mat = getMaterial('mountainFacetMat', () => new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true,
  }));

  const mountainMesh = new THREE.Mesh(geom, mat);
  group.add(mountainMesh);

  // Snow Cap Peak
  const snowMat = getMaterial('snowMat', () => new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
    metalness: 0.2,
    flatShading: true,
  }));
  const snowGeo = new THREE.ConeGeometry(0.28, 0.45, 4);
  const snowMesh = new THREE.Mesh(snowGeo, snowMat);
  snowMesh.position.set(0, 1.15, 0);
  snowMesh.rotation.y = Math.PI / 4;
  group.add(snowMesh);

  // Secondary sub-ridge
  const subGeo = new THREE.ConeGeometry(0.35, 0.7, 4);
  const subMat = getMaterial('subRidgeMat', () => new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.85,
    flatShading: true,
  }));
  const subMesh = new THREE.Mesh(subGeo, subMat);
  subMesh.position.set(0.38, 0.35, 0.25);
  subMesh.scale.set(0.9, 0.9, 0.9);
  group.add(subMesh);

  group.scale.set(0.65, 0.65, 0.65);
  return { group, update: () => {} };
}

/**
 * 3. 人文古蹟 (Culture): 美濃紙傘 (Meinong paper umbrella)
 * Exact requirement: "美濃紙傘（白底彩畫）"
 * Bamboo pole/handle, white conical paper canopy with colored flower patterns, finial tip
 */
export function createMeinongUmbrella(): { group: THREE.Group; update: (dt: number) => void } {
  const group = new THREE.Group();
  group.name = 'MeinongUmbrella';

  // Bamboo Handle / Shaft
  const bambooMat = getMaterial('bambooMat', () => new THREE.MeshStandardMaterial({
    color: 0xca8a04,
    roughness: 0.6,
    metalness: 0.2,
  }));
  const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.2, 8);
  const shaft = new THREE.Mesh(shaftGeo, bambooMat);
  shaft.position.set(0, 0.6, 0);
  group.add(shaft);

  // Decorative bamboo knob at bottom
  const knobGeo = new THREE.SphereGeometry(0.06, 8, 6);
  const knob = new THREE.Mesh(knobGeo, bambooMat);
  knob.position.set(0, 0.04, 0);
  group.add(knob);

  // Umbrella Canopy (White base with painted decorative floral texture)
  // Create procedural painted paper texture using canvas
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  // White paper ground
  ctx.fillStyle = '#fefefe';
  ctx.fillRect(0, 0, 256, 256);
  // Red & pink painted cherry blossoms and calligraphy strokes
  ctx.fillStyle = '#ef4444';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const cx = 128 + Math.cos(angle) * 70;
    const cy = 128 + Math.sin(angle) * 70;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    // Inner petal
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
  }
  // Golden border ring
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 115, 0, Math.PI * 2);
  ctx.stroke();

  const paperTex = new THREE.CanvasTexture(canvas);
  paperTex.colorSpace = THREE.SRGBColorSpace;

  const umbrellaMat = new THREE.MeshStandardMaterial({
    map: paperTex,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Conical canopy
  const canopyGeo = new THREE.ConeGeometry(0.68, 0.35, 16, 1, true);
  const canopy = new THREE.Mesh(canopyGeo, umbrellaMat);
  canopy.position.set(0, 1.05, 0);
  canopy.rotation.x = Math.PI; // Opening downwards
  group.add(canopy);

  // Top finial cap
  const capGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.14, 8);
  const capMat = getMaterial('umbrellaCapMat', () => new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.3,
  }));
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0, 1.25, 0);
  group.add(cap);

  // Slight artistic tilt for aesthetic presentation
  group.rotation.z = -0.18;
  group.rotation.x = 0.12;

  group.scale.set(0.75, 0.75, 0.75);
  return {
    group,
    update: (dt: number) => {
      // Gentle floating sway
      group.rotation.y += dt * 0.4;
    },
  };
}

/**
 * 4. 夜市美食 (Food): 黃色玉米 (Yellow corn on the cob)
 * Exact requirement: "黃色玉米"
 * Golden kernel segments, bamboo skewer stick, green husk leaves wrapping the base
 */
export function createYellowCorn(): { group: THREE.Group; update: (dt: number) => void } {
  const group = new THREE.Group();
  group.name = 'YellowCorn';

  // Bamboo skewer stick
  const stickMat = getMaterial('stickMat', () => new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.7,
  }));
  const stickGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6);
  const stick = new THREE.Mesh(stickGeo, stickMat);
  stick.position.set(0, 0.25, 0);
  group.add(stick);

  // Corn Cob Core Body (segmented golden corn kernels)
  const cornMat = getMaterial('cornMat', () => new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Golden yellow
    roughness: 0.35,
    metalness: 0.15,
  }));

  const cobBody = new THREE.Group();
  cobBody.position.set(0, 0.8, 0);
  group.add(cobBody);

  // Stacked rings of kernels for realistic low-poly corn texture
  const ringHeights = [-0.3, -0.15, 0, 0.15, 0.3, 0.42];
  const ringRadii = [0.24, 0.27, 0.28, 0.26, 0.22, 0.15];

  ringHeights.forEach((y, rIdx) => {
    const radius = ringRadii[rIdx];
    const kernelCount = 8;
    for (let k = 0; k < kernelCount; k++) {
      const angle = (k * Math.PI * 2) / kernelCount + (rIdx % 2 ? 0.35 : 0);
      const kGeo = new THREE.SphereGeometry(0.08, 5, 5);
      const kernel = new THREE.Mesh(kGeo, cornMat);
      kernel.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      kernel.scale.set(0.9, 0.8, 1.1);
      cobBody.add(kernel);
    }
  });

  // Green Husk Leaves wrapping base
  const huskMat = getMaterial('huskMat', () => new THREE.MeshStandardMaterial({
    color: 0x65a30d, // Fresh lime green
    roughness: 0.6,
    side: THREE.DoubleSide,
  }));

  for (let l = 0; l < 4; l++) {
    const angle = (l * Math.PI) / 2;
    const huskGeo = new THREE.ConeGeometry(0.18, 0.55, 4);
    const husk = new THREE.Mesh(huskGeo, huskMat);
    husk.position.set(Math.cos(angle) * 0.22, 0.58, Math.sin(angle) * 0.22);
    husk.rotation.y = angle;
    husk.rotation.z = -0.3;
    group.add(husk);
  }

  // Slight appetizing tilt
  group.rotation.z = -0.15;
  group.scale.set(0.7, 0.7, 0.7);

  return {
    group,
    update: (dt: number) => {
      group.rotation.y += dt * 0.5;
    },
  };
}

/**
 * 5. 海岸海島 (Coast): 椰子樹 (Coconut tree)
 * Exact requirement: "椰子樹"
 * Segmented curved brown trunk, cluster of radiating green palm fronds, brown coconuts
 */
export function createCoconutTree(): { group: THREE.Group; update: (dt: number) => void } {
  const group = new THREE.Group();
  group.name = 'CoconutTree';

  // Segmented curved trunk
  const trunkMat = getMaterial('trunkMat', () => new THREE.MeshStandardMaterial({
    color: 0x78350f, // Deep trunk brown
    roughness: 0.85,
    metalness: 0.1,
  }));

  const trunkSegments = 6;
  let currentY = 0.1;
  let currentX = 0;

  for (let i = 0; i < trunkSegments; i++) {
    const segHeight = 0.2;
    const rBottom = 0.11 - i * 0.01;
    const rTop = 0.10 - i * 0.01;
    const segGeo = new THREE.CylinderGeometry(rTop, rBottom, segHeight, 6);
    const seg = new THREE.Mesh(segGeo, trunkMat);
    currentX += i * 0.025; // Gentle tropical curve
    seg.position.set(currentX, currentY + segHeight / 2, 0);
    seg.rotation.z = -0.1 - i * 0.02;
    group.add(seg);
    currentY += segHeight;
  }

  // Canopy top position
  const canopyX = currentX;
  const canopyY = currentY;

  // Coconuts cluster
  const coconutMat = getMaterial('coconutMat', () => new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.7,
  }));
  const cocoGeo = new THREE.SphereGeometry(0.07, 6, 6);
  for (let c = 0; c < 3; c++) {
    const cMesh = new THREE.Mesh(cocoGeo, coconutMat);
    const cAngle = (c * Math.PI * 2) / 3;
    cMesh.position.set(canopyX + Math.cos(cAngle) * 0.09, canopyY - 0.04, Math.sin(cAngle) * 0.09);
    group.add(cMesh);
  }

  // Radiating curved green palm fronds
  const frondMat = getMaterial('frondMat', () => new THREE.MeshStandardMaterial({
    color: 0x15803d, // Lush tropical green
    roughness: 0.5,
    side: THREE.DoubleSide,
  }));

  const frondCount = 6;
  for (let f = 0; f < frondCount; f++) {
    const fAngle = (f * Math.PI * 2) / frondCount;
    const frondGroup = new THREE.Group();
    frondGroup.position.set(canopyX, canopyY, 0);
    frondGroup.rotation.y = fAngle;

    // Curved frond leaf
    const leafGeo = new THREE.ConeGeometry(0.16, 0.7, 4);
    leafGeo.rotateX(Math.PI / 2.3);
    const leaf = new THREE.Mesh(leafGeo, frondMat);
    leaf.position.set(0, 0, 0.32);
    leaf.scale.set(0.9, 0.3, 1);
    frondGroup.add(leaf);

    group.add(frondGroup);
  }

  group.scale.set(0.7, 0.7, 0.7);
  return {
    group,
    update: (dt: number) => {
      // Gentle ocean breeze sway
      group.rotation.z = Math.sin(Date.now() * 0.0018) * 0.05 - 0.05;
    },
  };
}

/**
 * Factory dispatcher to instantiate the proper 3D model for each category
 */
export function createCategoryModel(category: Category): { group: THREE.Group; update: (dt: number) => void } {
  switch (category) {
    case 'landmark':
      return createFerrisWheel();
    case 'nature':
      return createTriangleMountain();
    case 'culture':
      return createMeinongUmbrella();
    case 'food':
      return createYellowCorn();
    case 'coast':
    default:
      return createCoconutTree();
  }
}
