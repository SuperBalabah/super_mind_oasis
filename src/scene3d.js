// Enhanced 3D Scene Pipeline for Super Mind Oasis
// Rich Aesthetic Diorama: Floating Island, Campfire, Cozy Tent, Habit Pet & Multi-Stage Mind Trees
import * as THREE from 'three';
import { TREE_TYPES } from './storage.js';

export class Scene3D {
  constructor(canvasContainer, onTreeSelect, onPetTap, onWaterTap) {
    this.container = canvasContainer;
    this.onTreeSelect = onTreeSelect;
    this.onPetTap = onPetTap;
    this.onWaterTap = onWaterTap;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groups
    this.islandGroup = null;
    this.treesGroup = null;
    this.particlesGroup = null;
    this.rainGroup = null;
    this.campfireGroup = null;
    this.petGroup = null;

    // Lights
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
    this.fireLight = null;

    // Animated meshes
    this.fireMesh = null;
    this.fireEmbers = null;
    this.waterMesh = null;
    this.waterRipples = [];
    this.petMesh = null;

    // Pet AI patrol state
    this.petState = {
      x: -1.2,
      z: -0.2,
      targetX: -1.2,
      targetZ: -0.2,
      rotation: 0,
      state: 'idle', // 'idle' | 'walking' | 'sitting' | 'jumping'
      timer: 2.0,
      jumpProgress: 0
    };

    // Camera orbit controls
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotationY = 0.5;
    this.targetRotationX = 0.38;
    this.currentRotationY = 0.5;
    this.currentRotationX = 0.38;
    this.zoom = 7.8;
    this.targetZoom = 7.8;
    this.dragDistance = 0;

    this.treeMeshes = [];
    this.selectedTreeId = null;
    this.clock = new THREE.Clock();
    this.currentAmbience = 'sunset';

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Island hierarchy
    this.islandGroup = new THREE.Group();
    this.treesGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.rainGroup = new THREE.Group();
    this.campfireGroup = new THREE.Group();
    this.petGroup = new THREE.Group();

    this.islandGroup.add(this.treesGroup);
    this.islandGroup.add(this.campfireGroup);
    this.islandGroup.add(this.petGroup);

    this.scene.add(this.islandGroup);
    this.scene.add(this.particlesGroup);
    this.scene.add(this.rainGroup);

    this.setupLighting();
    this.buildFloatingIsland();
    this.buildZenPond();
    this.buildCozyTent();
    this.buildCampfire();
    this.buildHabitPet();
    this.buildFloatingParticles();
    this.buildRainParticles();
    this.setAmbience('sunset');

    this.setupInteraction();
    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x223344, 0.65);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.dirLight.position.set(6, 10, 5);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // Warm flickering campfire point light
    this.fireLight = new THREE.PointLight(0xff7722, 1.8, 4.5);
    this.fireLight.position.set(-1.0, 0.6, 0.8);
    this.fireLight.castShadow = true;
    this.islandGroup.add(this.fireLight);
  }

  buildFloatingIsland() {
    // Rich undulating grass terrain
    const radius = 3.8;
    const geom = new THREE.CylinderGeometry(radius, radius * 0.94, 0.55, 36, 4);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      if (y > 0) {
        const wave = Math.sin(x * 1.4) * Math.cos(z * 1.4) * 0.16 - (dist / radius) * 0.14;
        pos.setY(i, y + wave);
      }
    }
    geom.computeVertexNormals();

    const topMat = new THREE.MeshStandardMaterial({
      color: 0x42754d,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });
    const topMesh = new THREE.Mesh(geom, topMat);
    topMesh.receiveShadow = true;
    topMesh.castShadow = true;
    this.islandGroup.add(topMesh);

    // Deep craggy rock underbelly
    const baseGeom = new THREE.ConeGeometry(radius * 0.94, 3.2, 18, 5);
    baseGeom.rotateX(Math.PI);
    const basePos = baseGeom.attributes.position;
    for (let i = 0; i < basePos.count; i++) {
      const y = basePos.getY(i);
      if (y < 0) {
        const jitter = (Math.sin(i * 3.1) + Math.cos(i * 2.3)) * 0.16;
        basePos.setX(i, basePos.getX(i) + jitter);
        basePos.setZ(i, basePos.getZ(i) + jitter);
      }
    }
    baseGeom.computeVertexNormals();

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x332b29,
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -1.75;
    baseMesh.receiveShadow = true;
    this.islandGroup.add(baseMesh);

    // Decorative boulders & cliff fragments
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e6863, roughness: 0.8, flatShading: true });
    const rocks = [
      { x: -2.2, z: -0.6, s: 0.38 },
      { x: -1.7, z: -1.4, s: 0.28 },
      { x: 1.8, z: 1.3, s: 0.42 },
      { x: 2.4, z: -0.9, s: 0.35 }
    ];
    rocks.forEach(loc => {
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(loc.s, 1), rockMat);
      r.position.set(loc.x, 0.26, loc.z);
      r.rotation.set(Math.random(), Math.random(), Math.random());
      r.castShadow = true;
      r.receiveShadow = true;
      this.islandGroup.add(r);
    });
  }

  buildZenPond() {
    // Shimmering reflecting water pond
    const pondGeom = new THREE.CircleGeometry(1.2, 28);
    pondGeom.rotateX(-Math.PI / 2);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x2b7a8c,
      roughness: 0.12,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88
    });
    this.waterMesh = new THREE.Mesh(pondGeom, pondMat);
    this.waterMesh.position.set(-0.35, 0.28, -0.65);
    this.waterMesh.receiveShadow = true;
    this.islandGroup.add(this.waterMesh);

    // Water lily pads on pond
    const padMat = new THREE.MeshStandardMaterial({ color: 0x3b854e, roughness: 0.6, side: THREE.DoubleSide });
    const padLocs = [
      { x: -0.6, z: -0.5, s: 0.18, r: 0.4 },
      { x: -0.15, z: -0.85, s: 0.22, r: 1.2 },
      { x: -0.7, z: -0.9, s: 0.15, r: 2.1 }
    ];
    padLocs.forEach(pl => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(pl.s, 14), padMat);
      pad.rotateX(-Math.PI / 2);
      pad.rotateZ(pl.r);
      pad.position.set(pl.x, 0.29, pl.z);
      this.islandGroup.add(pad);
    });

    // Wooden deck border
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x6e4a30, roughness: 0.75, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.18), deckMat);
      plank.position.set(0.65, 0.3, -0.65 + (i - 1) * 0.22);
      plank.castShadow = true;
      this.islandGroup.add(plank);
    }
  }

  buildCozyTent() {
    // Cozy Scandinavian A-Frame Canvas Tent
    const tentGroup = new THREE.Group();
    tentGroup.position.set(-1.8, 0.28, 0.7);
    tentGroup.rotation.y = 0.45;

    // Canvas fabric (Prism / Wedge)
    const tentGeom = new THREE.CylinderGeometry(0.01, 0.8, 1.1, 4, 1, false, Math.PI / 4);
    tentGeom.rotateY(Math.PI / 4);
    const tentMat = new THREE.MeshStandardMaterial({
      color: 0xebe3d5, // Warm canvas cream
      roughness: 0.8,
      flatShading: true
    });
    const tentMesh = new THREE.Mesh(tentGeom, tentMat);
    tentMesh.position.y = 0.55;
    tentMesh.scale.set(1.1, 1, 0.9);
    tentMesh.castShadow = true;
    tentMesh.receiveShadow = true;
    tentGroup.add(tentMesh);

    // Wooden ridge & frame poles
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 });
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3), poleMat);
    pole1.position.set(0, 0.55, 0.45);
    pole1.rotation.x = -0.3;
    tentGroup.add(pole1);

    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3), poleMat);
    pole2.position.set(0, 0.55, -0.45);
    pole2.rotation.x = 0.3;
    tentGroup.add(pole2);

    this.islandGroup.add(tentGroup);
  }

  buildCampfire() {
    this.campfireGroup.position.set(-0.95, 0.28, 0.85);

    // Stone ring around fire
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85, flatShading: true });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const sMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), stoneMat);
      sMesh.position.set(Math.cos(angle) * 0.28, 0.06, Math.sin(angle) * 0.28);
      sMesh.rotation.set(Math.random(), Math.random(), Math.random());
      sMesh.castShadow = true;
      this.campfireGroup.add(sMesh);
    }

    // Crossed birch firewood logs
    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3628, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.38), logMat);
      log.rotation.z = 0.65;
      log.rotation.y = (i / 3) * Math.PI;
      log.position.y = 0.06;
      this.campfireGroup.add(log);
    }

    // Low-poly animated flame crystals
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xffaa22,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      flatShading: true
    });
    this.fireMesh = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.38, 5), flameMat);
    this.fireMesh.position.y = 0.22;
    this.campfireGroup.add(this.fireMesh);

    // Floating flame ember sparks
    const count = 18;
    const emberGeom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 1] = Math.random() * 0.6 + 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
    }
    emberGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.fireEmbers = new THREE.Points(emberGeom, new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    }));
    this.campfireGroup.add(this.fireEmbers);
  }

  buildHabitPet() {
    // Low-poly Spirit Companion Fox / Shiba
    const pet = new THREE.Group();
    pet.name = 'habitPet';
    pet.userData = { isPet: true };

    const furMat = new THREE.MeshStandardMaterial({ color: 0xd9753b, roughness: 0.8, flatShading: true }); // Warm terracotta orange
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.8, flatShading: true }); // Belly/tail cream
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b221c, roughness: 0.9 }); // Nose/ears tip

    // Body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 8), furMat);
    body.rotation.z = Math.PI / 2;
    body.position.y = 0.15;
    body.castShadow = true;
    pet.add(body);

    // White chest belly patch
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), whiteMat);
    belly.scale.set(0.7, 0.7, 0.9);
    belly.position.set(0.08, 0.13, 0);
    pet.add(belly);

    // Head
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), furMat);
    head.position.set(0.18, 0.25, 0);
    head.castShadow = true;
    pet.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 4), whiteMat);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(0.28, 0.23, 0);
    pet.add(snout);

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), darkMat);
    nose.position.set(0.33, 0.23, 0);
    pet.add(nose);

    // Ears
    for (let i = 0; i < 2; i++) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 4), darkMat);
      ear.position.set(0.18, 0.36, i === 0 ? 0.06 : -0.06);
      ear.rotation.x = i === 0 ? 0.25 : -0.25;
      pet.add(ear);
    }

    // Bushy Tail
    this.petTail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 5), whiteMat);
    this.petTail.rotation.z = -1.2;
    this.petTail.position.set(-0.16, 0.2, 0);
    pet.add(this.petTail);

    // 4 Little Legs
    const legGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.12);
    const legOffsets = [
      { x: 0.1, z: 0.08 },
      { x: 0.1, z: -0.08 },
      { x: -0.1, z: 0.08 },
      { x: -0.1, z: -0.08 }
    ];
    legOffsets.forEach(lo => {
      const leg = new THREE.Mesh(legGeom, darkMat);
      leg.position.set(lo.x, 0.06, lo.z);
      pet.add(leg);
    });

    pet.position.set(this.petState.x, 0.28, this.petState.z);
    this.petMesh = pet;
    this.petGroup.add(pet);
  }

  buildFloatingParticles() {
    const count = 50;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 4.5 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particlesMesh = new THREE.Points(geom, new THREE.PointsMaterial({
      color: 0xfff0aa,
      size: 0.11,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    }));
    this.particlesGroup.add(this.particlesMesh);
  }

  buildRainParticles() {
    const rainCount = 180;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainMesh = new THREE.Points(geom, new THREE.PointsMaterial({
      color: 0x9bc2d9,
      size: 0.08,
      transparent: true,
      opacity: 0.6
    }));
    this.rainGroup.add(this.rainMesh);
    this.rainGroup.visible = false;
  }

  // --- MULTI-STAGE PROCEDURAL MIND TREES ---
  createTreeMesh(treeData) {
    const group = new THREE.Group();
    group.name = treeData.id;
    group.userData = { treeId: treeData.id, treeData };

    const typeInfo = TREE_TYPES[treeData.treeType] || TREE_TYPES.oak;
    const now = Date.now();
    const ageDays = (now - treeData.plantedAt) / (1000 * 60 * 60 * 24);
    const nurtureBoost = (treeData.nurtureCount || 0) * 0.45;
    const effectiveAge = ageDays + nurtureBoost;

    // 4 Defined Stages
    // 0: Sprout (< 1 day)
    // 1: Young Sapling (1 - 3.5 days)
    // 2: Lush Tree (3.5 - 7 days)
    // 3: Ancient Illuminated Tree (7+ days)
    let stage = 0;
    if (effectiveAge >= 7) stage = 3;
    else if (effectiveAge >= 3.5) stage = 2;
    else if (effectiveAge >= 1) stage = 1;

    const trunkMat = new THREE.MeshStandardMaterial({
      color: typeInfo.trunkColor,
      roughness: 0.9,
      flatShading: true
    });
    const foliageMat = new THREE.MeshStandardMaterial({
      color: typeInfo.foliageColor,
      roughness: 0.7,
      flatShading: true
    });
    const goldenFruitMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.7,
      roughness: 0.3
    });

    if (stage === 0) {
      // 0. SPROUT (小嫩芽)
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.32, 6), trunkMat);
      stem.position.y = 0.16;
      stem.castShadow = true;
      group.add(stem);

      for (let i = 0; i < 2; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 5, 5), foliageMat);
        leaf.scale.set(1.4, 0.3, 0.8);
        leaf.position.set(i === 0 ? 0.07 : -0.07, 0.32, 0);
        leaf.rotation.z = i === 0 ? 0.35 : -0.35;
        leaf.castShadow = true;
        group.add(leaf);
      }
    } else if (stage === 1) {
      // 1. SAPLING (幼苗小樹)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.85, 7), trunkMat);
      trunk.position.y = 0.42;
      trunk.castShadow = true;
      group.add(trunk);

      const fNodes = [{ y: 0.8, s: 0.32 }, { y: 1.05, s: 0.25 }];
      fNodes.forEach(f => {
        const cloud = new THREE.Mesh(new THREE.DodecahedronGeometry(f.s, 1), foliageMat);
        cloud.position.y = f.y;
        cloud.castShadow = true;
        group.add(cloud);
      });
    } else if (stage === 2) {
      // 2. LUSH TREE (繁茂大樹)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.22, 1.3, 8), trunkMat);
      trunk.position.y = 0.65;
      trunk.castShadow = true;
      group.add(trunk);

      const crown = [
        { x: 0, y: 1.35, z: 0, r: 0.58 },
        { x: -0.32, y: 1.15, z: 0.18, r: 0.46 },
        { x: 0.35, y: 1.2, z: -0.15, r: 0.44 },
        { x: 0, y: 1.7, z: 0, r: 0.38 }
      ];
      crown.forEach((n, idx) => {
        const f = new THREE.Mesh(new THREE.IcosahedronGeometry(n.r, 1), foliageMat);
        f.position.set(n.x, n.y, n.z);
        f.castShadow = true;
        f.userData = { isFoliage: true, phase: idx };
        group.add(f);
      });
    } else {
      // 3. ANCIENT ILLUMINATED TREE (遠古碩果巨木)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 1.6, 9), trunkMat);
      trunk.position.y = 0.8;
      trunk.castShadow = true;
      group.add(trunk);

      const crown = [
        { x: 0, y: 1.6, z: 0, r: 0.72 },
        { x: -0.45, y: 1.35, z: 0.25, r: 0.56 },
        { x: 0.48, y: 1.4, z: -0.2, r: 0.54 },
        { x: 0, y: 2.1, z: 0, r: 0.48 },
        { x: 0.2, y: 1.5, z: 0.4, r: 0.42 }
      ];
      crown.forEach((n, idx) => {
        const f = new THREE.Mesh(new THREE.IcosahedronGeometry(n.r, 1), foliageMat);
        f.position.set(n.x, n.y, n.z);
        f.castShadow = true;
        f.userData = { isFoliage: true, phase: idx };
        group.add(f);

        // Radiant Golden Wisdom Fruits
        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldenFruitMat);
        fruit.position.set(n.x + Math.sin(idx * 2) * 0.4, n.y - 0.2, n.z + Math.cos(idx * 2) * 0.4);
        group.add(fruit);
      });
    }

    // Selection Aura Ring
    const ringGeom = new THREE.RingGeometry(0.35, 0.48, 24);
    ringGeom.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({
      color: typeInfo.glowColor,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    }));
    ring.position.y = 0.28;
    ring.name = 'selectionAura';
    group.add(ring);

    const posX = treeData.position ? treeData.position.x : 0;
    const posZ = treeData.position ? treeData.position.z : 0;
    group.position.set(posX, 0.26, posZ);

    return group;
  }

  updateTrees(treesData) {
    while (this.treesGroup.children.length > 0) {
      this.treesGroup.remove(this.treesGroup.children[0]);
    }
    this.treeMeshes = [];

    treesData.forEach(treeData => {
      const meshGroup = this.createTreeMesh(treeData);
      this.treesGroup.add(meshGroup);
      this.treeMeshes.push(meshGroup);
    });

    if (this.selectedTreeId) {
      this.highlightTree(this.selectedTreeId);
    }
  }

  highlightTree(treeId) {
    this.selectedTreeId = treeId;
    this.treeMeshes.forEach(mesh => {
      const aura = mesh.getObjectByName('selectionAura');
      if (aura) aura.material.opacity = (mesh.userData.treeId === treeId) ? 0.85 : 0.0;
    });
  }

  triggerWaterRipple(x, z) {
    const rippleGeom = new THREE.RingGeometry(0.08, 0.12, 24);
    rippleGeom.rotateX(-Math.PI / 2);
    const ripple = new THREE.Mesh(rippleGeom, new THREE.MeshBasicMaterial({
      color: 0x99eef5,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    }));
    ripple.position.set(x, 0.29, z);
    this.islandGroup.add(ripple);

    this.waterRipples.push({ mesh: ripple, scale: 1, opacity: 0.9 });
  }

  // Trigger happy heart jump on pet
  triggerPetJump() {
    this.petState.state = 'jumping';
    this.petState.jumpProgress = 0;
  }

  setAmbience(mode) {
    this.currentAmbience = mode;

    if (mode === 'day') {
      this.renderer.setClearColor(0x7fb8db, 1);
      this.scene.fog = new THREE.FogExp2(0x7fb8db, 0.035);
      this.dirLight.color.setHex(0xfffaea);
      this.dirLight.intensity = 1.5;
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.intensity = 0.7;
      this.ambientLight.intensity = 0.45;
      this.rainGroup.visible = false;
      this.fireLight.intensity = 0.8;
    } else if (mode === 'sunset') {
      this.renderer.setClearColor(0x281924, 1); // Rich twilight amber & plum
      this.scene.fog = new THREE.FogExp2(0x281924, 0.04);
      this.dirLight.color.setHex(0xffaa5e);
      this.dirLight.intensity = 1.6;
      this.hemiLight.color.setHex(0xffc599);
      this.hemiLight.intensity = 0.8;
      this.ambientLight.intensity = 0.45;
      this.rainGroup.visible = false;
      this.fireLight.intensity = 2.0;
    } else if (mode === 'night') {
      this.renderer.setClearColor(0x0e131a, 1);
      this.scene.fog = new THREE.FogExp2(0x0e131a, 0.042);
      this.dirLight.color.setHex(0x7399c2);
      this.dirLight.intensity = 0.65;
      this.hemiLight.color.setHex(0x354963);
      this.hemiLight.intensity = 0.4;
      this.ambientLight.intensity = 0.25;
      this.rainGroup.visible = false;
      this.fireLight.intensity = 2.4; // Fire shines brightly in night
    } else if (mode === 'rain') {
      this.renderer.setClearColor(0x192128, 1);
      this.scene.fog = new THREE.FogExp2(0x192128, 0.048);
      this.dirLight.color.setHex(0x8faec7);
      this.dirLight.intensity = 0.8;
      this.hemiLight.color.setHex(0x4a657c);
      this.hemiLight.intensity = 0.5;
      this.ambientLight.intensity = 0.35;
      this.rainGroup.visible = true;
      this.fireLight.intensity = 1.8;
    }
  }

  setupInteraction() {
    const el = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getTouchDist = (e) => {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    el.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.dragDistance = 0;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      this.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      this.targetRotationY += deltaX * 0.007;
      this.targetRotationX = Math.max(0.12, Math.min(0.82, this.targetRotationX + deltaY * 0.005));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      if (this.dragDistance < 10) {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);

        // 1. Check Pet Tap
        if (this.petMesh) {
          const petHits = raycaster.intersectObjects(this.petMesh.children, true);
          if (petHits.length > 0) {
            this.triggerPetJump();
            if (this.onPetTap) this.onPetTap();
            return;
          }
        }

        // 2. Check Tree Intersections
        const treeHits = raycaster.intersectObjects(this.treesGroup.children, true);
        if (treeHits.length > 0) {
          let hitObj = treeHits[0].object;
          while (hitObj.parent && hitObj.parent !== this.treesGroup) {
            hitObj = hitObj.parent;
          }
          if (hitObj.userData && hitObj.userData.treeId) {
            this.highlightTree(hitObj.userData.treeId);
            if (this.onTreeSelect) this.onTreeSelect(hitObj.userData.treeData);
            return;
          }
        }

        // 3. Check Water Pond
        if (this.waterMesh) {
          const waterHits = raycaster.intersectObject(this.waterMesh);
          if (waterHits.length > 0) {
            const hitPoint = waterHits[0].point;
            this.triggerWaterRipple(hitPoint.x, hitPoint.z);
            if (this.onWaterTap) this.onWaterTap();
          }
        }
      }
    });

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) this.initialPinchDistance = getTouchDist(e);
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dist = getTouchDist(e);
        const factor = (dist - this.initialPinchDistance) * 0.015;
        this.targetZoom = Math.max(4.5, Math.min(10.5, this.targetZoom - factor));
        this.initialPinchDistance = dist;
      }
    }, { passive: true });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetZoom = Math.max(4.5, Math.min(10.5, this.targetZoom + e.deltaY * 0.005));
    }, { passive: false });
  }

  updateCameraPosition() {
    const r = this.zoom;
    const y = r * Math.sin(this.currentRotationX);
    const horizontalR = r * Math.cos(this.currentRotationX);
    const x = horizontalR * Math.sin(this.currentRotationY);
    const z = horizontalR * Math.cos(this.currentRotationY);
    this.camera.position.set(x, y + 0.35, z);
    this.camera.lookAt(0, 0.45, 0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth camera damping
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;
    this.zoom += (this.targetZoom - this.zoom) * 0.08;
    this.updateCameraPosition();

    // Gentle Island Floating Bob
    this.islandGroup.position.y = Math.sin(time * 0.8) * 0.06;

    // Campfire Flame Flicker Animation
    if (this.fireMesh) {
      const flicker = Math.sin(time * 14) * 0.08 + Math.cos(time * 22) * 0.06;
      this.fireMesh.scale.set(1 + flicker * 0.5, 1 + flicker, 1 + flicker * 0.5);
      if (this.fireLight) {
        this.fireLight.intensity = (this.currentAmbience === 'night' ? 2.4 : 1.8) + Math.sin(time * 18) * 0.35;
      }
    }

    // Flame Embers Rise
    if (this.fireEmbers) {
      const pos = this.fireEmbers.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let ey = pos.getY(i) + delta * 0.45;
        if (ey > 0.8) ey = 0.15;
        pos.setY(i, ey);
      }
      pos.needsUpdate = true;
    }

    // Pet AI Patrol & Animation
    if (this.petMesh) {
      this.updatePet(delta, time);
    }

    // Tree Foliage Wind Sway
    this.treesGroup.children.forEach(treeGroup => {
      treeGroup.children.forEach(child => {
        if (child.userData && child.userData.isFoliage) {
          const phase = child.userData.phase || 0;
          child.rotation.z = Math.sin(time * 1.5 + phase) * 0.035;
          child.rotation.x = Math.cos(time * 1.2 + phase) * 0.025;
        }
      });
    });

    // Floating Particles
    if (this.particlesMesh) {
      const pos = this.particlesMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) + delta * 0.15;
        if (py > 4.8) py = 0.2;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
    }

    // Rain
    if (this.rainGroup.visible && this.rainMesh) {
      const rPos = this.rainMesh.geometry.attributes.position;
      for (let i = 0; i < rPos.count; i++) {
        let ry = rPos.getY(i) - delta * 9.5;
        if (ry < 0) {
          ry = 8.0;
          if (Math.random() < 0.04) {
            this.triggerWaterRipple(-0.35 + (Math.random() - 0.5) * 1.2, -0.65 + (Math.random() - 0.5) * 1.2);
          }
        }
        rPos.setY(i, ry);
      }
      rPos.needsUpdate = true;
    }

    // Water Ripples Fade
    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const rip = this.waterRipples[i];
      rip.scale += delta * 1.8;
      rip.opacity -= delta * 1.4;
      rip.mesh.scale.set(rip.scale, rip.scale, 1);
      rip.mesh.material.opacity = Math.max(0, rip.opacity);
      if (rip.opacity <= 0) {
        this.islandGroup.remove(rip.mesh);
        this.waterRipples.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  updatePet(delta, time) {
    const s = this.petState;

    if (s.state === 'jumping') {
      s.jumpProgress += delta * 4;
      const jumpHeight = Math.sin(s.jumpProgress * Math.PI) * 0.35;
      this.petMesh.position.y = 0.28 + Math.max(0, jumpHeight);
      this.petMesh.rotation.y += delta * 8; // happy spin
      if (s.jumpProgress >= 1) {
        s.state = 'idle';
        s.timer = 2.0;
        this.petMesh.position.y = 0.28;
      }
      return;
    }

    s.timer -= delta;
    if (s.timer <= 0) {
      // Pick next state
      if (s.state === 'idle' || s.state === 'sitting') {
        // Pick new random waypoint near grass/tent/campfire
        const waypoints = [
          { x: -1.2, z: 0.3 },
          { x: -0.5, z: 0.8 },
          { x: 0.3, z: -0.2 },
          { x: -1.6, z: 0.2 },
          { x: 0.1, z: 1.1 }
        ];
        const next = waypoints[Math.floor(Math.random() * waypoints.length)];
        s.targetX = next.x;
        s.targetZ = next.z;
        s.state = 'walking';
        s.timer = 4.0;
      } else {
        s.state = Math.random() > 0.4 ? 'sitting' : 'idle';
        s.timer = 3.0 + Math.random() * 4.0;
      }
    }

    // Walking movement
    if (s.state === 'walking') {
      const dx = s.targetX - s.x;
      const dz = s.targetZ - s.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.05) {
        const speed = 0.35 * delta;
        s.x += (dx / dist) * speed;
        s.z += (dz / dist) * speed;
        s.rotation = Math.atan2(dx, dz);
        // Little trotting bob
        this.petMesh.position.y = 0.28 + Math.abs(Math.sin(time * 10)) * 0.03;
      } else {
        s.state = 'idle';
        s.timer = 2.5;
        this.petMesh.position.y = 0.28;
      }
    }

    // Tail swishing
    if (this.petTail) {
      this.petTail.rotation.y = Math.sin(time * 6) * 0.35;
    }

    this.petMesh.position.x = s.x;
    this.petMesh.position.z = s.z;
    this.petMesh.rotation.y = s.rotation;
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
