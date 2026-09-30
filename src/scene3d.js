// Enhanced 3D Scene Pipeline for Super Mind Oasis
// Direct 3D Pet Interaction: Tap to Greet, Hold to Feed & Nurture Habits
import * as THREE from 'three';
import { TREE_TYPES } from './storage.js';

export class Scene3D {
  constructor(canvasContainer, onTreeSelect, onPetTap, onPetFeed, onWaterTap) {
    this.container = canvasContainer;
    this.onTreeSelect = onTreeSelect;
    this.onPetTap = onPetTap;
    this.onPetFeed = onPetFeed;
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
    this.petsGroup = null;
    this.heartsGroup = null;

    // Lights
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;
    this.fireLight = null;

    // Meshes & Lists
    this.fireMesh = null;
    this.fireEmbers = null;
    this.waterMesh = null;
    this.waterRipples = [];
    this.petInstances = [];
    this.floatingHearts = [];

    // Pointer & Hold interaction on pets
    this.activePetPressed = null;
    this.petHoldTimer = null;
    this.petHoldStartTime = 0;
    this.isPetHolding = false;

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

    this.islandGroup = new THREE.Group();
    this.treesGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.rainGroup = new THREE.Group();
    this.campfireGroup = new THREE.Group();
    this.petsGroup = new THREE.Group();
    this.heartsGroup = new THREE.Group();

    this.islandGroup.add(this.treesGroup);
    this.islandGroup.add(this.campfireGroup);
    this.islandGroup.add(this.petsGroup);
    this.islandGroup.add(this.heartsGroup);

    this.scene.add(this.islandGroup);
    this.scene.add(this.particlesGroup);
    this.scene.add(this.rainGroup);

    this.setupLighting();
    this.buildFloatingIsland();
    this.buildZenPond();
    this.buildCozyTent();
    this.buildCampfire();
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

    this.fireLight = new THREE.PointLight(0xff7722, 1.8, 4.5);
    this.fireLight.position.set(-1.25, 0.65, 0.7);
    this.fireLight.castShadow = true;
    this.islandGroup.add(this.fireLight);
  }

  buildFloatingIsland() {
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

    const topMat = new THREE.MeshStandardMaterial({ color: 0x3d7048, roughness: 0.85, flatShading: true });
    const topMesh = new THREE.Mesh(geom, topMat);
    topMesh.receiveShadow = true;
    topMesh.castShadow = true;
    this.islandGroup.add(topMesh);

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

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x312927, roughness: 0.95, flatShading: true });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -1.75;
    baseMesh.receiveShadow = true;
    this.islandGroup.add(baseMesh);

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x6e6863, roughness: 0.8, flatShading: true });
    const rocks = [
      { x: -2.3, z: -0.3, s: 0.36 },
      { x: -1.9, z: -1.1, s: 0.26 },
      { x: 2.1, z: 1.4, s: 0.38 },
      { x: 2.5, z: -0.7, s: 0.32 }
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
    this.waterMesh.position.set(-0.4, 0.28, -0.9);
    this.waterMesh.receiveShadow = true;
    this.islandGroup.add(this.waterMesh);

    const padMat = new THREE.MeshStandardMaterial({ color: 0x3b854e, roughness: 0.6, side: THREE.DoubleSide });
    const padLocs = [
      { x: -0.65, z: -0.75, s: 0.18, r: 0.4 },
      { x: -0.2, z: -1.1, s: 0.22, r: 1.2 },
      { x: -0.75, z: -1.15, s: 0.15, r: 2.1 }
    ];
    padLocs.forEach(pl => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(pl.s, 14), padMat);
      pad.rotateX(-Math.PI / 2);
      pad.rotateZ(pl.r);
      pad.position.set(pl.x, 0.29, pl.z);
      this.islandGroup.add(pad);
    });

    const deckMat = new THREE.MeshStandardMaterial({ color: 0x6e4a30, roughness: 0.75, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.18), deckMat);
      plank.position.set(0.6, 0.3, -0.9 + (i - 1) * 0.22);
      plank.castShadow = true;
      this.islandGroup.add(plank);
    }
  }

  buildCozyTent() {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(-2.0, 0.28, 1.25);
    tentGroup.rotation.y = 0.55;

    const tentGeom = new THREE.CylinderGeometry(0.01, 0.75, 1.05, 4, 1, false, Math.PI / 4);
    tentGeom.rotateY(Math.PI / 4);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0xeae3d2, roughness: 0.8, flatShading: true });
    const tentMesh = new THREE.Mesh(tentGeom, tentMat);
    tentMesh.position.y = 0.52;
    tentMesh.scale.set(1.1, 1, 0.9);
    tentMesh.castShadow = true;
    tentMesh.receiveShadow = true;
    tentGroup.add(tentMesh);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 0.9 });
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.25), poleMat);
    pole1.position.set(0, 0.52, 0.42);
    pole1.rotation.x = -0.3;
    tentGroup.add(pole1);

    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.25), poleMat);
    pole2.position.set(0, 0.52, -0.42);
    pole2.rotation.x = 0.3;
    tentGroup.add(pole2);

    this.islandGroup.add(tentGroup);
  }

  buildCampfire() {
    this.campfireGroup.position.set(-1.25, 0.28, 0.7);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85, flatShading: true });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const sMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), stoneMat);
      sMesh.position.set(Math.cos(angle) * 0.26, 0.05, Math.sin(angle) * 0.26);
      sMesh.rotation.set(Math.random(), Math.random(), Math.random());
      sMesh.castShadow = true;
      this.campfireGroup.add(sMesh);
    }

    const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3628, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35), logMat);
      log.rotation.z = 0.65;
      log.rotation.y = (i / 3) * Math.PI;
      log.position.y = 0.05;
      this.campfireGroup.add(log);
    }

    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xffaa22,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      flatShading: true
    });
    this.fireMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), flameMat);
    this.fireMesh.position.y = 0.2;
    this.campfireGroup.add(this.fireMesh);

    const count = 16;
    const emberGeom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 1] = Math.random() * 0.55 + 0.15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
    }
    emberGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.fireEmbers = new THREE.Points(emberGeom, new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    }));
    this.campfireGroup.add(this.fireEmbers);
  }

  // --- PROCEDURAL PET CREATION WITH INTERACTIVE FEEDING DISH ---
  createPetMesh(petData, initialIndex = 0) {
    const petGroup = new THREE.Group();
    petGroup.name = petData.id;
    petGroup.userData = { petId: petData.id, petData };

    const species = petData.species || 'sheep';

    if (species === 'sheep') {
      const woolMat = new THREE.MeshStandardMaterial({ color: 0xf6f3eb, roughness: 0.95, flatShading: true });
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xd9cca8, roughness: 0.8, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.9 });

      const woolBody = new THREE.Group();
      [
        { x: 0, y: 0.16, z: 0, r: 0.16 },
        { x: 0.09, y: 0.18, z: 0.05, r: 0.13 },
        { x: -0.09, y: 0.18, z: -0.05, r: 0.13 },
        { x: 0.06, y: 0.14, z: -0.08, r: 0.12 },
        { x: -0.06, y: 0.14, z: 0.08, r: 0.12 }
      ].forEach(w => {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(w.r, 1), woolMat);
        m.position.set(w.x, w.y, w.z);
        m.castShadow = true;
        woolBody.add(m);
      });
      petGroup.add(woolBody);

      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.22, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), faceMat);
      head.castShadow = true;
      headGroup.add(head);

      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 4), faceMat);
        ear.position.set(-0.02, -0.01, i === 0 ? 0.09 : -0.09);
        ear.rotation.x = i === 0 ? 1.2 : -1.2;
        headGroup.add(ear);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.22;

      const legGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.11);
      [{ x: 0.08, z: 0.07 }, { x: 0.08, z: -0.07 }, { x: -0.08, z: 0.07 }, { x: -0.08, z: -0.07 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, darkMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'fox') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xd9753b, roughness: 0.8, flatShading: true });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc, roughness: 0.8, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b221c, roughness: 0.9 });

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.2, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.14;
      body.castShadow = true;
      petGroup.add(body);

      const headGroup = new THREE.Group();
      headGroup.position.set(0.16, 0.24, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), furMat);
      headGroup.add(head);

      const snout = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.08, 4), whiteMat);
      snout.rotation.z = -Math.PI / 2;
      snout.position.set(0.1, -0.02, 0);
      headGroup.add(snout);

      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.085, 4), darkMat);
        ear.position.set(0, 0.1, i === 0 ? 0.055 : -0.055);
        ear.rotation.x = i === 0 ? 0.25 : -0.25;
        headGroup.add(ear);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.24;

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.24, 5), whiteMat);
      tail.rotation.z = -1.2;
      tail.position.set(-0.15, 0.19, 0);
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      const legGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.11);
      [{ x: 0.09, z: 0.07 }, { x: 0.09, z: -0.07 }, { x: -0.09, z: 0.07 }, { x: -0.09, z: -0.07 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, darkMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'shiba') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xd49b42, roughness: 0.8, flatShading: true });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.8, flatShading: true });

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.15;
      body.castShadow = true;
      petGroup.add(body);

      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.25, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), furMat);
      headGroup.add(head);

      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), whiteMat);
      snout.position.set(0.08, -0.02, 0);
      headGroup.add(snout);

      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.25;

      const tail = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.028, 5, 10, Math.PI * 1.4), furMat);
      tail.position.set(-0.16, 0.24, 0);
      tail.rotation.y = Math.PI / 2;
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      const legGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.12);
      [{ x: 0.09, z: 0.08 }, { x: 0.09, z: -0.08 }, { x: -0.09, z: 0.08 }, { x: -0.09, z: -0.08 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, whiteMat);
        leg.position.set(lo.x, 0.06, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'cat') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0x242426, roughness: 0.7, flatShading: true });
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x76e3c0, emissive: 0x32a884, emissiveIntensity: 0.6 });

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.13;
      body.castShadow = true;
      petGroup.add(body);

      const headGroup = new THREE.Group();
      headGroup.position.set(0.16, 0.22, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), furMat);
      headGroup.add(head);

      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), furMat);
        ear.position.set(0, 0.09, i === 0 ? 0.05 : -0.05);
        headGroup.add(ear);

        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 4), eyeMat);
        eye.position.set(0.07, 0.01, i === 0 ? 0.04 : -0.04);
        headGroup.add(eye);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.22;

      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.26), furMat);
      tail.position.set(-0.16, 0.24, 0);
      tail.rotation.z = -0.7;
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.11);
      [{ x: 0.08, z: 0.06 }, { x: 0.08, z: -0.06 }, { x: -0.08, z: 0.06 }, { x: -0.08, z: -0.06 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, furMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xaa6e40, roughness: 0.85, flatShading: true });
      const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd6c2a8, roughness: 0.8 });

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.24, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.19;
      body.castShadow = true;
      petGroup.add(body);

      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.32, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), furMat);
      headGroup.add(head);

      for (let i = 0; i < 2; i++) {
        const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12), antlerMat);
        antler.position.set(-0.02, 0.1, i === 0 ? 0.05 : -0.05);
        antler.rotation.z = -0.2;
        antler.rotation.x = i === 0 ? 0.3 : -0.3;
        headGroup.add(antler);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.32;

      const legGeom = new THREE.CylinderGeometry(0.018, 0.015, 0.19);
      [{ x: 0.09, z: 0.07 }, { x: 0.09, z: -0.07 }, { x: -0.09, z: 0.07 }, { x: -0.09, z: -0.07 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, furMat);
        leg.position.set(lo.x, 0.095, lo.z);
        petGroup.add(leg);
      });
    }

    // Touch collision hit sphere for 100% reliable mobile touch
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitSphere.position.set(0.08, 0.2, 0);
    petGroup.add(hitSphere);

    // Glowing ground aura ring during holding/feeding
    const auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.24, 0.34, 28),
      new THREE.MeshBasicMaterial({
        color: 0xffd285,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    auraRing.rotateX(-Math.PI / 2);
    auraRing.position.set(0.1, 0.015, 0);
    petGroup.add(auraRing);
    petGroup.userData.feedAura = auraRing;

    // Cute low-poly feeding dish (wooden bowl + food)
    const dishGroup = new THREE.Group();
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x6e4a30, roughness: 0.8 });
    const foodMat = new THREE.MeshStandardMaterial({ color: 0xffbb44, roughness: 0.5, emissive: 0xff9900, emissiveIntensity: 0.2 });
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.04, 8), dishMat);
    const food = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), foodMat);
    food.position.y = 0.02;
    dishGroup.add(dish);
    dishGroup.add(food);
    dishGroup.position.set(0.29, 0.02, 0);
    dishGroup.visible = false;
    petGroup.add(dishGroup);
    petGroup.userData.feedDish = dishGroup;

    // Initial position
    const waypoints = [
      { x: -0.6, z: 0.2 },
      { x: 0.5, z: -0.1 },
      { x: -0.2, z: 1.1 },
      { x: 1.1, z: 0.8 },
      { x: -1.3, z: 0.1 },
      { x: 0.8, z: -0.8 }
    ];
    const initialPos = waypoints[initialIndex % waypoints.length];

    petGroup.position.set(initialPos.x, 0.28, initialPos.z);
    petGroup.userData.aiState = {
      x: initialPos.x,
      z: initialPos.z,
      targetX: initialPos.x,
      targetZ: initialPos.z,
      rotation: 0,
      state: 'idle', // 'idle' | 'walking' | 'sitting' | 'focused' | 'eating' | 'jumping'
      timer: 2.0 + initialIndex * 1.2,
      eatTimer: 0,
      jumpProgress: 0,
      speed: 0.3 + (initialIndex % 3) * 0.05
    };

    return petGroup;
  }

  updatePets(petsData) {
    while (this.petsGroup.children.length > 0) {
      this.petsGroup.remove(this.petsGroup.children[0]);
    }
    this.petInstances = [];

    petsData.forEach((petData, idx) => {
      const mesh = this.createPetMesh(petData, idx);
      this.petsGroup.add(mesh);
      this.petInstances.push(mesh);
    });
  }

  // --- PROCEDURAL MIND TREES ---
  createTreeMesh(treeData) {
    const group = new THREE.Group();
    group.name = treeData.id;
    group.userData = { treeId: treeData.id, treeData };

    const typeInfo = TREE_TYPES[treeData.treeType] || TREE_TYPES.oak;
    const now = Date.now();
    const ageDays = (now - treeData.plantedAt) / (1000 * 60 * 60 * 24);
    const nurtureBoost = (treeData.nurtureCount || 0) * 0.45;
    const effectiveAge = ageDays + nurtureBoost;

    let stage = 0;
    if (effectiveAge >= 7) stage = 3;
    else if (effectiveAge >= 3.5) stage = 2;
    else if (effectiveAge >= 1) stage = 1;

    const trunkMat = new THREE.MeshStandardMaterial({ color: typeInfo.trunkColor, roughness: 0.9, flatShading: true });
    const foliageMat = new THREE.MeshStandardMaterial({ color: typeInfo.foliageColor, roughness: 0.7, flatShading: true });
    const goldenFruitMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.7, roughness: 0.3 });

    if (stage === 0) {
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
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.85, 7), trunkMat);
      trunk.position.y = 0.42;
      trunk.castShadow = true;
      group.add(trunk);

      [{ y: 0.8, s: 0.32 }, { y: 1.05, s: 0.25 }].forEach(f => {
        const cloud = new THREE.Mesh(new THREE.DodecahedronGeometry(f.s, 1), foliageMat);
        cloud.position.y = f.y;
        cloud.castShadow = true;
        group.add(cloud);
      });
    } else if (stage === 2) {
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
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 1.6, 9), trunkMat);
      trunk.position.y = 0.8;
      trunk.castShadow = true;
      group.add(trunk);

      const crown = [
        { x: 0, y: 1.6, z: 0, r: 0.72 },
        { x: -0.45, y: 1.35, z: 0.25, r: 0.56 },
        { x: 0.48, y: 1.4, z: -0.2, r: 0.54 },
        { x: 0, y: 2.1, z: 0, r: 0.48 }
      ];
      crown.forEach((n, idx) => {
        const f = new THREE.Mesh(new THREE.IcosahedronGeometry(n.r, 1), foliageMat);
        f.position.set(n.x, n.y, n.z);
        f.castShadow = true;
        f.userData = { isFoliage: true, phase: idx };
        group.add(f);

        const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), goldenFruitMat);
        fruit.position.set(n.x + Math.sin(idx * 2) * 0.4, n.y - 0.2, n.z + Math.cos(idx * 2) * 0.4);
        group.add(fruit);
      });
    }

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.48, 24), new THREE.MeshBasicMaterial({
      color: typeInfo.glowColor,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    }));
    ring.rotateX(-Math.PI / 2);
    ring.position.y = 0.28;
    ring.name = 'selectionAura';
    group.add(ring);

    const posX = treeData.position ? treeData.position.x : 0.25;
    const posZ = treeData.position ? treeData.position.z : 0.95;
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
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 24), new THREE.MeshBasicMaterial({
      color: 0x99eef5,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    }));
    ripple.rotateX(-Math.PI / 2);
    ripple.position.set(x, 0.29, z);
    this.islandGroup.add(ripple);
    this.waterRipples.push({ mesh: ripple, scale: 1, opacity: 0.9 });
  }

  // --- FLOATING HEARTS & FEEDING REACTION ---
  feedPet(petMesh) {
    const s = petMesh.userData.aiState;
    if (!s) return;

    s.state = 'eating';
    s.eatTimer = 2.4;

    if (petMesh.userData.feedDish) {
      petMesh.userData.feedDish.visible = true;
    }
    if (petMesh.userData.feedAura) {
      petMesh.userData.feedAura.material.opacity = 0;
    }

    // Spawn 6 floating heart particles above the pet with nice rose colors
    for (let i = 0; i < 6; i++) {
      const heartMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff8fa3 : 0xffd285,
        side: THREE.DoubleSide
      });
      const hMesh = new THREE.Mesh(new THREE.CircleGeometry(0.065, 8), heartMat);
      hMesh.position.set(
        petMesh.position.x + (Math.random() - 0.5) * 0.35,
        petMesh.position.y + 0.35 + i * 0.1,
        petMesh.position.z + (Math.random() - 0.5) * 0.35
      );
      this.heartsGroup.add(hMesh);
      this.floatingHearts.push({ mesh: hMesh, life: 1.8 });
    }
  }

  completePetFeed(petMesh) {
    const s = petMesh.userData.aiState;
    const petData = petMesh.userData.petData;

    if (s) {
      s.state = 'jumping';
      s.jumpProgress = 0;
    }

    if (petMesh.userData.feedAura) {
      petMesh.userData.feedAura.material.opacity = 0;
    }

    if (petMesh.userData.headGroup) {
      petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
      petMesh.userData.headGroup.rotation.z = 0;
    }

    // Spawn rich floating heart particles & sparkles
    for (let i = 0; i < 6; i++) {
      const heartMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff8fa3 : 0xffd285,
        side: THREE.DoubleSide
      });
      const hMesh = new THREE.Mesh(new THREE.CircleGeometry(0.065, 8), heartMat);
      hMesh.position.set(
        petMesh.position.x + (Math.random() - 0.5) * 0.35,
        petMesh.position.y + 0.35 + i * 0.1,
        petMesh.position.z + (Math.random() - 0.5) * 0.35
      );
      this.heartsGroup.add(hMesh);
      this.floatingHearts.push({ mesh: hMesh, life: 1.8 });
    }

    // Keep dish visible for 1.4s then hide
    setTimeout(() => {
      if (petMesh.userData.feedDish && s.state !== 'eating_hold') {
        petMesh.userData.feedDish.visible = false;
      }
    }, 1400);

    if (this.onPetFeed) {
      this.onPetFeed(petData);
    }
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
      this.renderer.setClearColor(0x281924, 1);
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
      this.fireLight.intensity = 2.4;
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

  // --- INTERACTION & GESTURE SYSTEM (IN-WORLD PET TAP & HOLD) ---
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

      // Check if pet was clicked on pointer down to immediately freeze & feed!
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);

      const petHits = raycaster.intersectObjects(this.petsGroup.children, true);
      if (petHits.length > 0) {
        let hitObj = petHits[0].object;
        while (hitObj.parent && hitObj.parent !== this.petsGroup) {
          hitObj = hitObj.parent;
        }
        if (hitObj.userData && hitObj.userData.petId) {
          this.activePetPressed = hitObj;
          this.petHoldStartTime = Date.now();
          this.isPetHolding = true;

          const petData = hitObj.userData.petData;

          // FREEZE & EATING POSE IMMEDIATELY:
          if (hitObj.userData.aiState) {
            hitObj.userData.aiState.state = 'eating_hold';
          }
          if (hitObj.userData.feedDish) {
            hitObj.userData.feedDish.visible = true;
          }
          if (hitObj.userData.feedAura) {
            hitObj.userData.feedAura.material.opacity = 0.85;
          }

          if (this.onPetHoldStart) this.onPetHoldStart(petData);

          // Long-press timer (480ms)
          this.petHoldTimer = setTimeout(() => {
            if (this.isPetHolding && this.activePetPressed === hitObj) {
              this.isPetHolding = false;
              this.completePetFeed(hitObj);
            }
          }, 480);
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      this.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      if (this.dragDistance > 12) {
        // Dragging camera cancels pet hold
        if (this.isPetHolding) {
          this.isPetHolding = false;
          clearTimeout(this.petHoldTimer);
          if (this.activePetPressed) {
            if (this.activePetPressed.userData.feedDish) {
              this.activePetPressed.userData.feedDish.visible = false;
            }
            if (this.activePetPressed.userData.feedAura) {
              this.activePetPressed.userData.feedAura.material.opacity = 0;
            }
            if (this.activePetPressed.userData.headGroup) {
              this.activePetPressed.userData.headGroup.position.y = this.activePetPressed.userData.baseHeadY || 0.22;
              this.activePetPressed.userData.headGroup.rotation.z = 0;
            }
            if (this.activePetPressed.userData.aiState) {
              this.activePetPressed.userData.aiState.state = 'idle';
              this.activePetPressed.userData.aiState.timer = 2.0;
            }
            this.activePetPressed = null;
          }
        }
      }

      this.targetRotationY += deltaX * 0.007;
      this.targetRotationX = Math.max(0.12, Math.min(0.82, this.targetRotationX + deltaY * 0.005));
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Handle Pet Pointer Up
      if (this.activePetPressed) {
        clearTimeout(this.petHoldTimer);
        const elapsed = Date.now() - this.petHoldStartTime;
        const petObj = this.activePetPressed;
        this.activePetPressed = null;

        // If it was a short tap (< 480ms)
        if (elapsed < 480 && this.dragDistance < 12 && this.isPetHolding) {
          this.isPetHolding = false;
          // Hide dish & aura immediately
          if (petObj.userData.feedDish) petObj.userData.feedDish.visible = false;
          if (petObj.userData.feedAura) petObj.userData.feedAura.material.opacity = 0;

          // Head resets
          if (petObj.userData.headGroup) {
            petObj.userData.headGroup.position.y = petObj.userData.baseHeadY || 0.22;
            petObj.userData.headGroup.rotation.z = 0;
          }

          // Play greeting bounce
          if (petObj.userData.aiState) {
            petObj.userData.aiState.state = 'jumping';
            petObj.userData.aiState.jumpProgress = 0;
          }
          if (this.onPetTap) this.onPetTap(petObj.userData.petData);
          return;
        }

        this.isPetHolding = false;
        if (petObj.userData.feedAura) petObj.userData.feedAura.material.opacity = 0;
        return;
      }

      // Check Tree or Pond clicks
      if (this.dragDistance < 10) {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

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

    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.08;
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.08;
    this.zoom += (this.targetZoom - this.zoom) * 0.08;
    this.updateCameraPosition();

    this.islandGroup.position.y = Math.sin(time * 0.8) * 0.06;

    if (this.fireMesh) {
      const flicker = Math.sin(time * 14) * 0.08 + Math.cos(time * 22) * 0.06;
      this.fireMesh.scale.set(1 + flicker * 0.5, 1 + flicker, 1 + flicker * 0.5);
      if (this.fireLight) {
        this.fireLight.intensity = (this.currentAmbience === 'night' ? 2.4 : 1.8) + Math.sin(time * 18) * 0.35;
      }
    }

    if (this.fireEmbers) {
      const pos = this.fireEmbers.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let ey = pos.getY(i) + delta * 0.45;
        if (ey > 0.8) ey = 0.15;
        pos.setY(i, ey);
      }
      pos.needsUpdate = true;
    }

    // Update floating heart particles
    for (let i = this.floatingHearts.length - 1; i >= 0; i--) {
      const h = this.floatingHearts[i];
      h.life -= delta;
      h.mesh.position.y += delta * 0.4;
      h.mesh.scale.setScalar(Math.max(0, h.life));
      if (h.life <= 0) {
        this.heartsGroup.remove(h.mesh);
        this.floatingHearts.splice(i, 1);
      }
    }

    // Update all roaming pets
    this.petInstances.forEach((petMesh, idx) => {
      this.updateSinglePet(petMesh, delta, time, idx);
    });

    this.treesGroup.children.forEach(treeGroup => {
      treeGroup.children.forEach(child => {
        if (child.userData && child.userData.isFoliage) {
          const phase = child.userData.phase || 0;
          child.rotation.z = Math.sin(time * 1.5 + phase) * 0.035;
          child.rotation.x = Math.cos(time * 1.2 + phase) * 0.025;
        }
      });
    });

    if (this.particlesMesh) {
      const pos = this.particlesMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let py = pos.getY(i) + delta * 0.15;
        if (py > 4.8) py = 0.2;
        pos.setY(i, py);
      }
      pos.needsUpdate = true;
    }

    if (this.rainGroup.visible && this.rainMesh) {
      const rPos = this.rainMesh.geometry.attributes.position;
      for (let i = 0; i < rPos.count; i++) {
        let ry = rPos.getY(i) - delta * 9.5;
        if (ry < 0) {
          ry = 8.0;
          if (Math.random() < 0.04) {
            this.triggerWaterRipple(-0.4 + (Math.random() - 0.5) * 1.2, -0.9 + (Math.random() - 0.5) * 1.2);
          }
        }
        rPos.setY(i, ry);
      }
      rPos.needsUpdate = true;
    }

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

  updateSinglePet(petMesh, delta, time, idx) {
    const s = petMesh.userData.aiState;
    if (!s) return;

    // Direct in-world holding feeding state
    if (s.state === 'eating_hold') {
      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY - 0.07 + Math.sin(time * 14) * 0.025;
        petMesh.userData.headGroup.rotation.z = -0.32 + Math.sin(time * 14) * 0.08;
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 16) * 0.55;
      }
      if (petMesh.userData.feedAura) {
        petMesh.userData.feedAura.rotation.z += delta * 4;
        petMesh.userData.feedAura.material.opacity = Math.min(0.9, petMesh.userData.feedAura.material.opacity + delta * 3);
        const pulse = 1.0 + Math.sin(time * 10) * 0.08;
        petMesh.userData.feedAura.scale.set(pulse, pulse, pulse);
      }
      return;
    }

    // Eating / Feeding animation state
    if (s.state === 'eating') {
      s.eatTimer -= delta;
      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY - 0.07 + Math.sin(time * 12) * 0.025;
        petMesh.userData.headGroup.rotation.z = -0.32 + Math.sin(time * 12) * 0.08;
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 14) * 0.5; // excited tail wag!
      }
      if (s.eatTimer <= 0) {
        if (petMesh.userData.feedDish) petMesh.userData.feedDish.visible = false;
        if (petMesh.userData.headGroup) {
          petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
          petMesh.userData.headGroup.rotation.z = 0;
        }
        s.state = 'jumping';
        s.jumpProgress = 0;
      }
      return;
    }

    // Jumping animation state
    if (s.state === 'jumping') {
      s.jumpProgress += delta * 3.8;
      const jumpHeight = Math.sin(s.jumpProgress * Math.PI) * 0.38;
      petMesh.position.y = 0.28 + Math.max(0, jumpHeight);
      petMesh.rotation.y += delta * 7;
      if (petMesh.userData.headGroup) {
        petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.rotation.z = 0;
      }
      if (s.jumpProgress >= 1) {
        s.state = 'idle';
        s.timer = 2.5;
        petMesh.position.y = 0.28;
      }
      return;
    }

    // Ensure head is upright during regular wandering
    if (petMesh.userData.headGroup && petMesh.userData.headGroup.rotation.z !== 0) {
      petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
      petMesh.userData.headGroup.rotation.z = 0;
    }

    s.timer -= delta;
    if (s.timer <= 0) {
      if (s.state === 'idle' || s.state === 'sitting') {
        const waypoints = [
          { x: -0.6, z: 0.2 },
          { x: 0.5, z: -0.1 },
          { x: -0.2, z: 1.1 },
          { x: 1.1, z: 0.8 },
          { x: -1.3, z: 0.1 },
          { x: 0.8, z: -0.8 },
          { x: -0.1, z: -0.3 }
        ];
        const next = waypoints[(Math.floor(Math.random() * waypoints.length) + idx) % waypoints.length];
        s.targetX = next.x;
        s.targetZ = next.z;
        s.state = 'walking';
        s.timer = 4.5;
      } else {
        s.state = Math.random() > 0.4 ? 'sitting' : 'idle';
        s.timer = 3.0 + Math.random() * 4.0;
      }
    }

    if (s.state === 'walking') {
      const dx = s.targetX - s.x;
      const dz = s.targetZ - s.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.05) {
        const speed = s.speed * delta;
        s.x += (dx / dist) * speed;
        s.z += (dz / dist) * speed;
        s.rotation = Math.atan2(dx, dz);
        petMesh.position.y = 0.28 + Math.abs(Math.sin(time * 10 + idx)) * 0.03;
      } else {
        s.state = 'idle';
        s.timer = 2.5;
        petMesh.position.y = 0.28;
      }
    }

    if (petMesh.userData.tail) {
      petMesh.userData.tail.rotation.y = Math.sin(time * 6 + idx) * 0.35;
    }

    petMesh.position.x = s.x;
    petMesh.position.z = s.z;
    petMesh.rotation.y = s.rotation;
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
