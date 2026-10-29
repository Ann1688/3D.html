import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Spot, LightingMode, Category, Region, StampRecord } from '../types/travel';
import { createCategoryModel } from './Taiwan3DModels';

interface TaiwanMap3DProps {
  spots: Spot[];
  selectedSpot: Spot | null;
  onSelectSpot: (spot: Spot) => void;
  lightingMode: LightingMode;
  viewMode: '3d' | '2d';
  selectedRegion: Region;
  selectedCategory: Category | 'all';
  stampedRecords: Record<string, StampRecord>;
  panDirection: 'north' | 'south' | null;
  zoomAction: 'in' | 'out' | null;
  resetTrigger: number;
}

export const TaiwanMap3D: React.FC<TaiwanMap3DProps> = ({
  spots,
  onSelectSpot,
  lightingMode,
  viewMode,
  selectedRegion,
  selectedCategory,
  stampedRecords,
  panDirection,
  zoomAction,
  resetTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // References to keep Three.js state persistent and free from re-instantiation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animatorsRef = useRef<Array<(dt: number) => void>>([]);

  // Target camera state for smooth 2D / 3D transition
  const cameraTargetPos = useRef(new THREE.Vector3(0, 18, 15));
  const controlsTargetLook = useRef(new THREE.Vector3(0, 0, 0));

  // Category Color Map for ground badges
  const categoryColors: Record<Category, number> = {
    landmark: 0x38bdf8, // Sky blue
    nature: 0x10b981,   // Emerald green
    culture: 0xf43f5e,  // Rose / crimson
    food: 0xf59e0b,     // Amber gold
    coast: 0x06b6d4,    // Cyan ocean
  };

  // Build Procedural Taiwan 3D Terrain
  const buildTaiwanTerrain = (scene: THREE.Scene) => {
    const terrainGroup = new THREE.Group();
    terrainGroup.name = 'TaiwanTerrainGroup';

    // 1. Taiwan Main Island Shape (Accurate geographic low-poly contour)
    const mainIslandShape = new THREE.Shape();
    // North tip (Fugui Cape / Keelung)
    mainIslandShape.moveTo(0.5, -10.4);
    mainIslandShape.bezierCurveTo(1.4, -10.2, 2.0, -9.8, 2.3, -9.3); // Keelung / Sandiaojiao
    mainIslandShape.bezierCurveTo(2.1, -8.5, 1.8, -7.8, 1.9, -6.8); // Yilan coast
    mainIslandShape.bezierCurveTo(2.3, -5.5, 2.4, -4.0, 2.3, -2.5); // Taroko / Hualien
    mainIslandShape.bezierCurveTo(2.4, -0.5, 2.2, 1.8, 1.8, 3.8);   // Taitung coast
    mainIslandShape.bezierCurveTo(1.4, 5.8, 0.8, 7.8, 0.2, 9.2);    // Dawu / Manzhou
    mainIslandShape.bezierCurveTo(-0.3, 10.0, -0.6, 9.8, -0.8, 9.0); // Kenting / Eluanbi south cape
    mainIslandShape.bezierCurveTo(-1.4, 7.5, -1.8, 5.5, -2.2, 4.2); // Fangliao / Kaohsiung
    mainIslandShape.bezierCurveTo(-2.8, 3.0, -3.0, 1.5, -2.9, 0.2); // Tainan / Beimen
    mainIslandShape.bezierCurveTo(-2.8, -1.2, -2.6, -2.8, -2.2, -4.2); // Changhua / Taichung coast
    mainIslandShape.bezierCurveTo(-1.9, -5.8, -1.5, -7.2, -1.1, -8.2); // Miaoli / Hsinchu
    mainIslandShape.bezierCurveTo(-0.8, -9.2, -0.4, -10.0, 0.5, -10.4); // Taoyuan to North tip

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.15,
      bevelOffset: 0,
      bevelSegments: 3,
    };

    const islandGeo = new THREE.ExtrudeGeometry(mainIslandShape, extrudeSettings);
    islandGeo.rotateX(Math.PI / 2); // Lay flat on XZ plane
    islandGeo.translate(0, 0.2, 0);

    // Procedural terrain vertex coloring: Lush green plains at coast, rocky green/brown elevations
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Formosa emerald green
      roughness: 0.65,
      metalness: 0.1,
      flatShading: true,
    });

    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandMesh.receiveShadow = true;
    islandMesh.castShadow = true;
    terrainGroup.add(islandMesh);

    // 2. Central Mountain Range Relief (中央山脈、雪山山脈、玉山群峰)
    // Procedural low-poly mountain peaks running along the longitudinal spine
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Dark mountain forest
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });

    const peakMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Snow-capped Yushan / Hehuanshan peak
      roughness: 0.5,
      metalness: 0.2,
      flatShading: true,
    });

    // Mountain spine points: [x, z, height, radius]
    const mountainRidges: [number, number, number, number][] = [
      [0.6, -7.5, 0.9, 0.8],  // Syue Mountain range north
      [0.4, -5.5, 1.2, 0.9],  // Nanhu Dashan / Central Range North
      [0.2, -3.5, 1.5, 1.0],  // Hehuanshan / Taroko peaks
      [0.0, -1.5, 1.6, 1.1],  // Qilai / Central Range Core
      [-0.1, 0.5, 1.8, 1.1],  // Yushan (Jade Mountain - 3,952m) highest peak
      [-0.2, 2.5, 1.4, 0.95], // Alishan range & South Central Range
      [0.1, 4.5, 1.2, 0.9],   // Beidawushan (Dawushan)
      [0.0, 6.5, 0.8, 0.7],   // Southern tail
    ];

    mountainRidges.forEach(([mx, mz, my, mr], idx) => {
      // Mountain base cone
      const mGeo = new THREE.ConeGeometry(mr, my, 5);
      const mMesh = new THREE.Mesh(mGeo, mountainMat);
      mMesh.position.set(mx, 0.45 + my / 2, mz);
      mMesh.rotation.y = (idx * Math.PI) / 4;
      mMesh.castShadow = true;
      mMesh.receiveShadow = true;
      terrainGroup.add(mMesh);

      // Snow cap on top 3 highest peaks
      if (my >= 1.4) {
        const capGeo = new THREE.ConeGeometry(mr * 0.32, my * 0.32, 5);
        const capMesh = new THREE.Mesh(capGeo, peakMat);
        capMesh.position.set(mx, 0.45 + my * 0.85, mz);
        capMesh.rotation.y = (idx * Math.PI) / 4;
        terrainGroup.add(capMesh);
      }
    });

    // 3. Outlying Islands (Penghu, Kinmen, Matsu, Green Island, Orchid Island, Xiaoliuqiu)
    const islandDefs = [
      { name: 'Penghu', x: -6.4, z: 0.2, rx: 0.7, rz: 0.9, h: 0.25 },
      { name: 'Kinmen', x: -8.6, z: -3.5, rx: 0.6, rz: 0.4, h: 0.3 },
      { name: 'Matsu', x: -5.5, z: -9.0, rx: 0.5, rz: 0.5, h: 0.35 },
      { name: 'GreenIsland', x: 4.8, z: 4.2, rx: 0.4, rz: 0.4, h: 0.3 },
      { name: 'OrchidIsland', x: 5.5, z: 7.2, rx: 0.5, rz: 0.6, h: 0.4 },
      { name: 'Xiaoliuqiu', x: -3.2, z: 6.8, rx: 0.3, rz: 0.3, h: 0.25 },
    ];

    islandDefs.forEach((isl) => {
      const islGeo = new THREE.CylinderGeometry(isl.rx, isl.rx * 1.1, isl.h, 6);
      const islMesh = new THREE.Mesh(islGeo, islandMat);
      islMesh.position.set(isl.x, 0.35, isl.z);
      islMesh.scale.set(1, 1, isl.rz / isl.rx);
      islMesh.receiveShadow = true;
      islMesh.castShadow = true;
      terrainGroup.add(islMesh);
    });

    // 4. Stylized Ocean Base Plane & Soft Grid Waves
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Tropical blue
      roughness: 0.2,
      metalness: 0.4,
    });
    const oceanGeo = new THREE.CylinderGeometry(15, 15.5, 0.4, 32);
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, 0, 0);
    oceanMesh.receiveShadow = true;
    terrainGroup.add(oceanMesh);

    // Oceanic border ring with decorative latitude/longitude ring
    const ringGeo = new THREE.TorusGeometry(15.2, 0.12, 8, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const borderRing = new THREE.Mesh(ringGeo, ringMat);
    borderRing.rotation.x = Math.PI / 2;
    borderRing.position.set(0, 0.2, 0);
    terrainGroup.add(borderRing);

    scene.add(terrainGroup);
    terrainGroupRef.current = terrainGroup;
  };

  // Build Dynamic Lighting Rig
  const setupLighting = (scene: THREE.Scene) => {
    const lightsGroup = new THREE.Group();
    lightsGroup.name = 'LightsGroup';

    // Key Directional Light (Sun/Moon)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    keyLight.position.set(12, 22, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    keyLight.shadow.bias = -0.0005;
    lightsGroup.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-12, 10, -10);
    lightsGroup.add(fillLight);

    // Ambient / Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x14532d, 0.8);
    lightsGroup.add(hemiLight);

    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;
  };

  // Apply Lighting Mode (Day / Sunset / Night)
  const applyLightingMode = useCallback((mode: LightingMode) => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    const lights = lightsGroupRef.current;
    const keyLight = lights.children[0] as THREE.DirectionalLight;
    const fillLight = lights.children[1] as THREE.DirectionalLight;
    const hemiLight = lights.children[2] as THREE.HemisphereLight;

    if (mode === 'day') {
      sceneRef.current.background = new THREE.Color(0x0284c7); // Vibrant azure blue
      sceneRef.current.fog = new THREE.Fog(0x0284c7, 25, 60);
      keyLight.color.setHex(0xfffaed);
      keyLight.intensity = 1.5;
      keyLight.position.set(12, 24, 14);
      fillLight.color.setHex(0x93c5fd);
      fillLight.intensity = 0.6;
      hemiLight.color.setHex(0xe0f2fe);
      hemiLight.groundColor.setHex(0x14532d);
      hemiLight.intensity = 0.8;
    } else if (mode === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x7c2d12); // Warm copper dusk
      sceneRef.current.fog = new THREE.Fog(0x7c2d12, 22, 55);
      keyLight.color.setHex(0xfb923c); // Warm amber gold
      keyLight.intensity = 1.9;
      keyLight.position.set(18, 12, 10);
      fillLight.color.setHex(0xf43f5e);
      fillLight.intensity = 0.7;
      hemiLight.color.setHex(0xfde047);
      hemiLight.groundColor.setHex(0x451a03);
      hemiLight.intensity = 0.7;
    } else {
      // Night mode
      sceneRef.current.background = new THREE.Color(0x030712); // Deep midnight
      sceneRef.current.fog = new THREE.Fog(0x030712, 20, 50);
      keyLight.color.setHex(0x60a5fa); // Moonlight
      keyLight.intensity = 0.65;
      keyLight.position.set(8, 20, 10);
      fillLight.color.setHex(0x312e81);
      fillLight.intensity = 0.4;
      hemiLight.color.setHex(0x1e1b4b);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.45;
    }
  }, []);

  // Update Markers when spots, filters, or stamped records change
  const updateMarkers = useCallback(() => {
    if (!sceneRef.current) return;

    // Clean up old markers
    if (markersGroupRef.current) {
      sceneRef.current.remove(markersGroupRef.current);
    }
    animatorsRef.current = [];

    const markersGroup = new THREE.Group();
    markersGroup.name = 'MarkersGroup';

    // Filter spots
    const activeSpots = spots.filter((s) => {
      const matchRegion = selectedRegion === 'all' || s.region === selectedRegion;
      const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return matchRegion && matchCategory;
    });

    activeSpots.forEach((spot) => {
      const isStamped = !!stampedRecords[spot.id];
      const spotGroup = new THREE.Group();
      spotGroup.position.set(spot.x, 0.65, spot.z);
      spotGroup.userData = { spot };

      // 1. Procedural 3D Category Model (Ferris Wheel, Mountain, Paper Umbrella, Yellow Corn, Coconut Tree)
      const { group: modelGroup, update } = createCategoryModel(spot.category);
      modelGroup.position.set(0, 0.12, 0);
      spotGroup.add(modelGroup);
      animatorsRef.current.push(update);

      // 2. Base Pedestal Ring with Category Color & Glow
      const catColor = categoryColors[spot.category];
      const baseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.1, 12);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isStamped ? 0xef4444 : catColor, // Vermilion if stamped, category color if not
        roughness: 0.3,
        metalness: isStamped ? 0.7 : 0.2,
        emissive: isStamped ? 0x991b1b : 0x000000,
        emissiveIntensity: isStamped ? 0.4 : 0,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(0, 0.05, 0);
      baseMesh.receiveShadow = true;
      spotGroup.add(baseMesh);

      // 3. Status Pin / Stamp Beacon Badge above model
      if (isStamped) {
        // Stamped commemorative vermilion seal ring hovering on top
        const stampBadgeGeo = new THREE.TorusGeometry(0.22, 0.04, 6, 16);
        const stampBadgeMat = new THREE.MeshStandardMaterial({
          color: 0xef4444, // vermilion cinnabar
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xef4444,
          emissiveIntensity: 0.5,
        });
        const stampBadge = new THREE.Mesh(stampBadgeGeo, stampBadgeMat);
        stampBadge.position.set(0, 1.45, 0);
        stampBadge.rotation.x = Math.PI / 2;
        spotGroup.add(stampBadge);

        // Center checkmark gem
        const gemGeo = new THREE.OctahedronGeometry(0.1, 0);
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15, // Golden star
          metalness: 0.9,
          roughness: 0.1,
          emissive: 0xeab308,
          emissiveIntensity: 0.6,
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.set(0, 1.45, 0);
        spotGroup.add(gem);
      } else {
        // Floating diamond indicator
        const beaconGeo = new THREE.OctahedronGeometry(0.12, 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: catColor,
          metalness: 0.5,
          roughness: 0.2,
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, 1.35, 0);
        spotGroup.add(beacon);

        // Float animation
        const initialY = 1.35;
        const seed = Math.random() * 10;
        animatorsRef.current.push(() => {
          beacon.position.y = initialY + Math.sin(Date.now() * 0.003 + seed) * 0.06;
          beacon.rotation.y += 0.02;
        });
      }

      // Invisible Raycasting Cylinder Hitbox for effortless mobile and desktop clicks
      const hitGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0, 0.8, 0);
      hitMesh.userData = { spot };
      spotGroup.add(hitMesh);

      markersGroup.add(spotGroup);
    });

    sceneRef.current.add(markersGroup);
    markersGroupRef.current = markersGroup;
  }, [spots, selectedRegion, selectedCategory, stampedRecords, categoryColors]);

  // Main Three.js Scene Setup (Mount Once)
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Detect software WebGL to adapt pixel ratio
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.copy(cameraTargetPos.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15; // Don't go below ground
    controls.minDistance = 6;
    controls.maxDistance = 38;
    controls.target.copy(controlsTargetLook.current);
    controlsRef.current = controls;

    // 5. Build Terrain and Lights
    buildTaiwanTerrain(scene);
    setupLighting(scene);
    applyLightingMode(lightingMode);

    // 6. Raycaster
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x: e.clientX, y: e.clientY });

      if (!markersGroupRef.current) return;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);

      let foundSpot: Spot | null = null;
      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== markersGroupRef.current) {
          if (cur.userData && cur.userData.spot) {
            foundSpot = cur.userData.spot;
            break;
          }
          cur = cur.parent;
        }
        if (foundSpot) break;
      }
      setHoveredSpot(foundSpot);
      container.style.cursor = foundSpot ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!markersGroupRef.current) return;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== markersGroupRef.current) {
          if (cur.userData && cur.userData.spot) {
            onSelectSpot(cur.userData.spot);
            return;
          }
          cur = cur.parent;
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Render Loop
    let animationFrameId = 0;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera position damping towards target (for 2D/3D switches)
      camera.position.lerp(cameraTargetPos.current, 0.06);
      controls.target.lerp(controlsTargetLook.current, 0.06);
      controls.update();

      // Run procedural 3D model animators (ferris wheel spin, umbrella sway, etc.)
      animatorsRef.current.forEach((fn) => fn(dt));

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, [onSelectSpot, applyLightingMode, lightingMode]);

  // Handle 2D vs 3D View Mode Transition
  useEffect(() => {
    if (viewMode === '2d') {
      // 2D Overhead Top-Down Bird's-Eye View
      cameraTargetPos.current.set(0, 24, 0.01);
      controlsTargetLook.current.set(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.enableRotate = false; // Restrict rotation in pure 2D mode for map stability
      }
    } else {
      // 3D Perspective Tilted View
      cameraTargetPos.current.set(0, 18, 15);
      controlsTargetLook.current.set(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.enableRotate = true;
      }
    }
  }, [viewMode]);

  // Handle Map Pan (Up / Down arrows - North / South)
  useEffect(() => {
    if (!panDirection || !cameraRef.current || !controlsRef.current) return;
    const offsetZ = panDirection === 'north' ? -3.5 : 3.5;
    controlsTargetLook.current.z = Math.max(-8, Math.min(8, controlsTargetLook.current.z + offsetZ));
    cameraTargetPos.current.z = Math.max(-8 + 12, Math.min(8 + 15, cameraTargetPos.current.z + offsetZ));
  }, [panDirection]);

  // Handle Map Zoom (In / Out)
  useEffect(() => {
    if (!zoomAction || !cameraRef.current || !controlsRef.current) return;
    const factor = zoomAction === 'in' ? 0.8 : 1.25;
    cameraTargetPos.current.multiplyScalar(factor);
    // Clamp distance
    const dist = cameraTargetPos.current.length();
    if (dist < 7) cameraTargetPos.current.setLength(7);
    if (dist > 35) cameraTargetPos.current.setLength(35);
  }, [zoomAction]);

  // Handle Reset / Center View
  useEffect(() => {
    if (resetTrigger === 0) return;
    controlsTargetLook.current.set(0, 0, 0);
    if (viewMode === '2d') {
      cameraTargetPos.current.set(0, 24, 0.01);
    } else {
      cameraTargetPos.current.set(0, 18, 15);
    }
  }, [resetTrigger, viewMode]);

  // Sync Lighting Mode Updates
  useEffect(() => {
    applyLightingMode(lightingMode);
  }, [lightingMode, applyLightingMode]);

  // Sync Markers when filters or stamped status updates
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* Floating Hover Tooltip */}
      {hoveredSpot && (
        <div
          className="fixed pointer-events-none z-30 transition-transform duration-75 px-3 py-2 bg-slate-900/90 text-white rounded-xl shadow-xl backdrop-blur-md border border-slate-700/80 text-xs flex flex-col gap-1 -translate-x-1/2 -translate-y-full mb-4"
          style={{ left: mousePos.x, top: mousePos.y - 12 }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-amber-300">{hoveredSpot.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
              {hoveredSpot.id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span>{hoveredSpot.county}</span>
            <span>•</span>
            <span className="text-emerald-400">{hoveredSpot.categoryName}</span>
            {stampedRecords[hoveredSpot.id] && (
              <span className="text-red-400 font-semibold flex items-center gap-0.5">
                ★ 已收集
              </span>
            )}
          </div>
          <span className="text-slate-400 text-[11px] mt-0.5">點擊查看詳情與蓋章 ➜</span>
        </div>
      )}
    </div>
  );
};
