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
    const initialFov = aspect < 1.0 ? Math.min(68, 42 + (1.0 - aspect) * 26) : 40;
    this.camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 100);
    if (aspect < 1.0) {
      this.zoom = 8.8;
      this.targetZoom = 8.8;
      this.targetRotationX = 0.32;
    }
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

    const coneHeight = 1.65;
    const baseGeom = new THREE.ConeGeometry(radius * 0.94, coneHeight, 18, 5);
    baseGeom.rotateX(Math.PI);
    const basePos = baseGeom.attributes.position;
    for (let i = 0; i < basePos.count; i++) {
      const y = basePos.getY(i);
      if (y < 0) {
        const jitter = (Math.sin(i * 3.1) + Math.cos(i * 2.3)) * 0.14;
        basePos.setX(i, basePos.getX(i) + jitter);
        basePos.setZ(i, basePos.getZ(i) + jitter);
      }
    }
    baseGeom.computeVertexNormals();

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x443a37, roughness: 0.92, flatShading: true });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -0.92;
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

  // --- PROCEDURAL PET CREATION WITH DETAILED FACES & EXPRESSIVE FEATURES ---
  createPetMesh(petData, initialIndex = 0) {
    const petGroup = new THREE.Group();
    petGroup.name = petData.id;
    petGroup.userData = { petId: petData.id, petData };

    const species = petData.species || 'sheep';

    if (species === 'sheep') {
      const woolMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ec, roughness: 0.95, flatShading: true });
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xd8c8a4, roughness: 0.8, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.9 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x161312 });
      const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const noseMat = new THREE.MeshStandardMaterial({ color: 0xcc9999, roughness: 0.6 });
      const blushMat = new THREE.MeshBasicMaterial({ color: 0xf4b5b8, transparent: true, opacity: 0.75, side: THREE.DoubleSide });

      // Cloud-like woolly body
      const woolBody = new THREE.Group();
      [
        { x: 0, y: 0.16, z: 0, r: 0.16 },
        { x: 0.09, y: 0.18, z: 0.05, r: 0.13 },
        { x: -0.09, y: 0.18, z: -0.05, r: 0.13 },
        { x: 0.06, y: 0.14, z: -0.08, r: 0.12 },
        { x: -0.06, y: 0.14, z: 0.08, r: 0.12 },
        { x: 0, y: 0.22, z: 0, r: 0.11 }
      ].forEach(w => {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(w.r, 1), woolMat);
        m.position.set(w.x, w.y, w.z);
        m.castShadow = true;
        woolBody.add(m);
      });
      petGroup.add(woolBody);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.22, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), faceMat);
      head.castShadow = true;
      headGroup.add(head);

      // Fluffy Forehead Wool Bangs (萌萌劉海)
      const woolTuft = new THREE.Mesh(new THREE.DodecahedronGeometry(0.062, 1), woolMat);
      woolTuft.position.set(-0.01, 0.075, 0);
      headGroup.add(woolTuft);

      // Cute Bead Eyes with White Catchlights
      for (let i = 0; i < 2; i++) {
        const eyeZ = i === 0 ? 0.062 : -0.062;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), eyeMat);
        eye.position.set(0.065, 0.015, eyeZ);
        headGroup.add(eye);

        const gleam = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 4, 4), gleamMat);
        gleam.position.set(0.076, 0.022, eyeZ + (i === 0 ? 0.004 : -0.004));
        headGroup.add(gleam);
      }

      // Cute Soft-Pink Nose
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 5), noseMat);
      nose.scale.set(1.2, 0.8, 1);
      nose.position.set(0.092, -0.015, 0);
      headGroup.add(nose);

      // Rosy Blush Cheeks
      for (let i = 0; i < 2; i++) {
        const blush = new THREE.Mesh(new THREE.CircleGeometry(0.02, 6), blushMat);
        blush.rotation.y = i === 0 ? Math.PI / 3 : -Math.PI / 3;
        blush.position.set(0.045, -0.02, i === 0 ? 0.082 : -0.082);
        headGroup.add(blush);
      }

      // Droopy Soft Ears with Pinkish Inner Ear
      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 4), faceMat);
        ear.position.set(-0.02, -0.01, i === 0 ? 0.095 : -0.095);
        ear.rotation.x = i === 0 ? 1.2 : -1.2;
        headGroup.add(ear);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.22;

      // Woolly Tail Puff
      const tailPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055, 1), woolMat);
      tailPuff.position.set(-0.16, 0.17, 0);
      petGroup.add(tailPuff);
      petGroup.userData.tail = tailPuff;

      // 4 Legs with cute dark hooves
      const legGeom = new THREE.CylinderGeometry(0.022, 0.024, 0.11);
      [{ x: 0.08, z: 0.07 }, { x: 0.08, z: -0.07 }, { x: -0.08, z: 0.07 }, { x: -0.08, z: -0.07 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, darkMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'fox') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xd9753b, roughness: 0.8, flatShading: true });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfcfaf4, roughness: 0.8, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.9 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1f1610 });
      const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Slender Body
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.22, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.14;
      body.castShadow = true;
      petGroup.add(body);

      // White Chest Bib
      const bib = new THREE.Mesh(new THREE.SphereGeometry(0.09, 5, 5), whiteMat);
      bib.position.set(0.07, 0.14, 0);
      bib.scale.set(0.9, 1.1, 0.9);
      petGroup.add(bib);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.16, 0.24, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), furMat);
      headGroup.add(head);

      // Tapered White Snout & Black Nose Pearl
      const snout = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 4), whiteMat);
      snout.rotation.z = -Math.PI / 2;
      snout.position.set(0.1, -0.02, 0);
      headGroup.add(snout);

      const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 5), darkMat);
      noseTip.position.set(0.145, -0.02, 0);
      headGroup.add(noseTip);

      // Expressive Almond Eyes with Celestial Highlights
      for (let i = 0; i < 2; i++) {
        const eyeZ = i === 0 ? 0.052 : -0.052;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeMat);
        eye.scale.set(1.3, 0.8, 0.8);
        eye.rotation.y = i === 0 ? 0.2 : -0.2;
        eye.position.set(0.065, 0.025, eyeZ);
        headGroup.add(eye);

        const gleam = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 4, 4), gleamMat);
        gleam.position.set(0.076, 0.032, eyeZ + (i === 0 ? 0.004 : -0.004));
        headGroup.add(gleam);
      }

      // Fluffy White Cheek Tufts
      for (let i = 0; i < 2; i++) {
        const cheek = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), whiteMat);
        cheek.rotation.z = Math.PI / 3;
        cheek.rotation.x = i === 0 ? 0.8 : -0.8;
        cheek.position.set(0.03, -0.03, i === 0 ? 0.085 : -0.085);
        headGroup.add(cheek);
      }

      // Two-Tone Triangular Fox Ears with Dark Tips
      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.085, 4), darkMat);
        ear.position.set(0, 0.1, i === 0 ? 0.055 : -0.055);
        ear.rotation.x = i === 0 ? 0.25 : -0.25;
        headGroup.add(ear);

        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 4), whiteMat);
        innerEar.position.set(0.01, 0.09, i === 0 ? 0.055 : -0.055);
        innerEar.rotation.x = i === 0 ? 0.25 : -0.25;
        headGroup.add(innerEar);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.24;

      // Bushy Tail with Snowy White Tip
      const tailGroup = new THREE.Group();
      tailGroup.position.set(-0.15, 0.19, 0);

      const tailBase = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.18, 5), furMat);
      tailBase.rotation.z = -1.2;
      tailGroup.add(tailBase);

      const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 5), whiteMat);
      tailTip.rotation.z = -1.2;
      tailTip.position.set(-0.12, 0.05, 0);
      tailGroup.add(tailTip);

      petGroup.add(tailGroup);
      petGroup.userData.tail = tailGroup;

      // 4 Legs with Dark Socks
      const legGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.11);
      [{ x: 0.09, z: 0.07 }, { x: 0.09, z: -0.07 }, { x: -0.09, z: 0.07 }, { x: -0.09, z: -0.07 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, darkMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'shiba') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xd69940, roughness: 0.8, flatShading: true });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.8, flatShading: true });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x161311, roughness: 0.4 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x181412 });
      const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Chubby Body
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.22, 6, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.15;
      body.castShadow = true;
      petGroup.add(body);

      // White Chest Bib
      const bib = new THREE.Mesh(new THREE.SphereGeometry(0.095, 5, 5), whiteMat);
      bib.position.set(0.08, 0.14, 0);
      petGroup.add(bib);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.25, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), furMat);
      headGroup.add(head);

      // Iconic White Eyebrow "Tan" Dots (麻糬眉毛)
      for (let i = 0; i < 2; i++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 5), whiteMat);
        dot.position.set(0.065, 0.06, i === 0 ? 0.045 : -0.045);
        headGroup.add(dot);
      }

      // Warm Shiny Eyes
      for (let i = 0; i < 2; i++) {
        const eyeZ = i === 0 ? 0.05 : -0.05;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.017, 6, 6), eyeMat);
        eye.position.set(0.068, 0.02, eyeZ);
        headGroup.add(eye);

        const gleam = new THREE.Mesh(new THREE.SphereGeometry(0.005, 4, 4), gleamMat);
        gleam.position.set(0.078, 0.026, eyeZ + (i === 0 ? 0.003 : -0.003));
        headGroup.add(gleam);
      }

      // Chubby White Cheeks & Snout
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), whiteMat);
      snout.position.set(0.08, -0.02, 0);
      headGroup.add(snout);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 5), darkMat);
      nose.position.set(0.12, -0.012, 0);
      headGroup.add(nose);

      // Perky Ears with Cream Center
      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.075, 4), furMat);
        ear.position.set(0, 0.1, i === 0 ? 0.055 : -0.055);
        ear.rotation.x = i === 0 ? 0.2 : -0.2;
        headGroup.add(ear);

        const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.05, 4), whiteMat);
        earIn.position.set(0.008, 0.09, i === 0 ? 0.055 : -0.055);
        earIn.rotation.x = i === 0 ? 0.2 : -0.2;
        headGroup.add(earIn);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.25;

      // Curled Donut Tail
      const tail = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.028, 5, 10, Math.PI * 1.4), furMat);
      tail.position.set(-0.16, 0.24, 0);
      tail.rotation.y = Math.PI / 2;
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      // 4 Legs with White Paws
      const legGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.12);
      [{ x: 0.09, z: 0.08 }, { x: 0.09, z: -0.08 }, { x: -0.09, z: 0.08 }, { x: -0.09, z: -0.08 }].forEach(lo => {
        const leg = new THREE.Mesh(legGeom, whiteMat);
        leg.position.set(lo.x, 0.06, lo.z);
        petGroup.add(leg);
      });

    } else if (species === 'cat') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0x202024, roughness: 0.7, flatShading: true });
      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        emissive: 0x059669,
        emissiveIntensity: 0.75,
        roughness: 0.2
      });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
      const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf5a5b5, roughness: 0.5 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfcfaf4, roughness: 0.8 });

      // Sleek Cat Body
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.13;
      body.castShadow = true;
      petGroup.add(body);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.16, 0.22, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), furMat);
      headGroup.add(head);

      // Luminescent Jade Almond Eyes with Slit Pupil
      for (let i = 0; i < 2; i++) {
        const eyeZ = i === 0 ? 0.048 : -0.048;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.019, 6, 6), eyeMat);
        eye.scale.set(1.2, 0.85, 0.8);
        eye.position.set(0.065, 0.015, eyeZ);
        headGroup.add(eye);

        const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.024, 4), pupilMat);
        pupil.position.set(0.076, 0.015, eyeZ);
        headGroup.add(pupil);
      }

      // Tiny Pink Nose
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014, 5, 5), pinkMat);
      nose.position.set(0.09, -0.012, 0);
      headGroup.add(nose);

      // Pointed Ears with Pink Inner Ear Flaps
      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.075, 4), furMat);
        ear.position.set(0, 0.09, i === 0 ? 0.05 : -0.05);
        headGroup.add(ear);

        const inner = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.05, 4), pinkMat);
        inner.position.set(0.008, 0.085, i === 0 ? 0.05 : -0.05);
        headGroup.add(inner);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.22;

      // Elegant S-Curved Tail
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.28), furMat);
      tail.position.set(-0.16, 0.24, 0);
      tail.rotation.z = -0.7;
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      // 4 Sleek Paws with White Sock Tips on Front
      const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.11);
      [{ x: 0.08, z: 0.06 }, { x: 0.08, z: -0.06 }, { x: -0.08, z: 0.06 }, { x: -0.08, z: -0.06 }].forEach((lo, idx) => {
        const leg = new THREE.Mesh(legGeom, idx < 2 ? whiteMat : furMat);
        leg.position.set(lo.x, 0.055, lo.z);
        petGroup.add(leg);
      });

    } else {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xa66a3d, roughness: 0.85, flatShading: true });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfcf9ee, roughness: 0.8 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.4 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x14100c });
      const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const antlerMat = new THREE.MeshStandardMaterial({ color: 0xd8cbb8, roughness: 0.75 });

      // Slender Deer Body
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.24, 5, 6), furMat);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.19;
      body.castShadow = true;
      petGroup.add(body);

      // Dappled White Spots on Flank
      [-0.04, 0.02, -0.02, 0.04].forEach((sx, idx) => {
        const spot = new THREE.Mesh(new THREE.CircleGeometry(0.015, 6), whiteMat);
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(sx, 0.285, idx % 2 === 0 ? 0.06 : -0.06);
        petGroup.add(spot);
      });

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.set(0.18, 0.32, 0);

      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), furMat);
      headGroup.add(head);

      // Big Gentle Doe Eyes with Double Catchlights
      for (let i = 0; i < 2; i++) {
        const eyeZ = i === 0 ? 0.055 : -0.055;
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
        eye.position.set(0.06, 0.02, eyeZ);
        headGroup.add(eye);

        const gleam1 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 4, 4), gleamMat);
        gleam1.position.set(0.072, 0.028, eyeZ + (i === 0 ? 0.003 : -0.003));
        headGroup.add(gleam1);
      }

      // Pale Muzzle with Black Nose
      const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.042, 5, 5), whiteMat);
      muzzle.position.set(0.08, -0.02, 0);
      headGroup.add(muzzle);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 5), darkMat);
      nose.position.set(0.116, -0.016, 0);
      headGroup.add(nose);

      // Slender Alert Ears
      for (let i = 0; i < 2; i++) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), furMat);
        ear.position.set(-0.02, 0.07, i === 0 ? 0.075 : -0.075);
        ear.rotation.x = i === 0 ? 0.8 : -0.8;
        headGroup.add(ear);
      }

      // Delicate Branching Antlers
      for (let i = 0; i < 2; i++) {
        const antlerZ = i === 0 ? 0.045 : -0.045;
        const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13), antlerMat);
        antler.position.set(-0.02, 0.1, antlerZ);
        antler.rotation.z = -0.2;
        antler.rotation.x = i === 0 ? 0.3 : -0.3;
        headGroup.add(antler);

        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06), antlerMat);
        branch.position.set(0.01, 0.12, antlerZ + (i === 0 ? 0.02 : -0.02));
        branch.rotation.z = 0.5;
        headGroup.add(branch);
      }
      petGroup.add(headGroup);
      petGroup.userData.headGroup = headGroup;
      petGroup.userData.baseHeadY = 0.32;

      // Fawn Tail with White Underside
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 4), whiteMat);
      tail.position.set(-0.16, 0.22, 0);
      tail.rotation.z = -0.9;
      petGroup.add(tail);
      petGroup.userData.tail = tail;

      // Graceful Slender Legs
      const legGeom = new THREE.CylinderGeometry(0.017, 0.015, 0.19);
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

    // Cute low-poly feeding dish (wooden bowl + food) - NO ugly ground ring!
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

    const initialPos = this.getSafePetSpawnPoint(initialIndex);
    const initialGroundY = this.getGroundHeight(initialPos.x, initialPos.z);

    petGroup.position.set(initialPos.x, initialGroundY, initialPos.z);
    petGroup.userData.aiState = {
      x: initialPos.x,
      z: initialPos.z,
      targetX: initialPos.x,
      targetZ: initialPos.z,
      rotation: Math.random() * Math.PI * 2,
      state: 'idle', // 'idle' | 'walking' | 'sitting' | 'focused' | 'eating' | 'jumping'
      timer: 2.0 + initialIndex * 1.2,
      eatTimer: 0,
      jumpProgress: 0,
      speed: 0.28 + (initialIndex % 3) * 0.04
    };

    return petGroup;
  }

  // --- PROCEDURAL GROUND HEIGHT (FOLLOWS ISLAND SURFACE WAVE DEFORMATION) ---
  getGroundHeight(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    const radius = 3.8;
    const wave = Math.sin(x * 1.4) * Math.cos(z * 1.4) * 0.16 - (dist / radius) * 0.14;
    return 0.28 + wave;
  }

  // --- COMPREHENSIVE OBSTACLE DETECTOR (POND, CAMPFIRE, TENT, ROCKS, ALL TREES) ---
  getStaticObstacles() {
    const obstacles = [
      // Zen Pond (water mesh + surrounding banks)
      { name: 'pond', x: -0.4, z: -0.9, radius: 1.45 },
      // Cozy tent & support poles
      { name: 'tent', x: -2.0, z: 1.25, radius: 0.95 },
      // Campfire & burning wood logs & hot stones
      { name: 'campfire', x: -1.25, z: 0.7, radius: 0.65 },
      // Landscape decorative boulders
      { name: 'rock1', x: -2.3, z: -0.3, radius: 0.5 },
      { name: 'rock2', x: -1.9, z: -1.1, radius: 0.45 },
      { name: 'rock3', x: 2.1, z: 1.4, radius: 0.55 },
      { name: 'rock4', x: 2.5, z: -0.7, radius: 0.5 }
    ];

    // Dynamic Tree Obstacles (all active trees currently planted on the island)
    if (this.treeMeshes && this.treeMeshes.length > 0) {
      this.treeMeshes.forEach(tree => {
        if (tree && tree.position) {
          obstacles.push({
            name: 'tree_' + (tree.userData?.treeId || 't'),
            x: tree.position.x,
            z: tree.position.z,
            radius: 0.65
          });
        }
      });
    }

    return obstacles;
  }

  // Check if candidate point is collision-free and respects island boundaries
  isPositionSafe(x, z, myPetIdx, requiredClearance = 0.38) {
    const islandDist = Math.sqrt(x * x + z * z);
    if (islandDist > 2.25) return false;

    const obstacles = this.getStaticObstacles();
    for (const obs of obstacles) {
      const dx = x - obs.x;
      const dz = z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < (obs.radius + requiredClearance)) {
        return false;
      }
    }

    if (this.petInstances) {
      for (let i = 0; i < this.petInstances.length; i++) {
        if (i === myPetIdx) continue;
        const otherState = this.petInstances[i].userData?.aiState;
        if (!otherState) continue;

        const dxCur = x - otherState.x;
        const dzCur = z - otherState.z;
        if (Math.sqrt(dxCur * dxCur + dzCur * dzCur) < 0.65) return false;

        const dxTar = x - otherState.targetX;
        const dzTar = z - otherState.targetZ;
        if (Math.sqrt(dxTar * dxTar + dzTar * dzTar) < 0.65) return false;
      }
    }

    return true;
  }

  // Physical collision resolution: repels away from obstacles, other pets, and edge void
  resolvePositionCollision(currX, currZ, myPetIdx) {
    let x = currX;
    let z = currZ;
    const MAX_RADIUS = 2.35; // Strict meadow perimeter (never slope into void)

    // 1. Resolve against all static obstacles (Pond, Campfire, Tent, Rocks, Trees)
    const obstacles = this.getStaticObstacles();
    for (const obs of obstacles) {
      const dx = x - obs.x;
      const dz = z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = obs.radius + 0.32;
      if (dist < minDist) {
        if (dist > 0.001) {
          const push = minDist - dist;
          x += (dx / dist) * push;
          z += (dz / dist) * push;
        } else {
          x += 0.35;
          z += 0.35;
        }
      }
    }

    // 2. Resolve against other pets (mutual repulsion, anti-clipping)
    if (this.petInstances && this.petInstances.length > 1) {
      this.petInstances.forEach((otherMesh, oIdx) => {
        if (oIdx === myPetIdx) return;
        const otherState = otherMesh.userData?.aiState;
        if (!otherState) return;

        const dx = x - otherState.x;
        const dz = z - otherState.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minPetDist = 0.65; // Healthy personal space between pets
        if (dist < minPetDist) {
          if (dist > 0.001) {
            const overlap = minPetDist - dist;
            const pushFactor = 0.55;
            x += (dx / dist) * (overlap * pushFactor);
            z += (dz / dist) * (overlap * pushFactor);
            if (otherState.state !== 'eating' && otherState.state !== 'eating_hold') {
              otherState.x -= (dx / dist) * (overlap * (1 - pushFactor));
              otherState.z -= (dz / dist) * (overlap * (1 - pushFactor));
            }
          } else {
            x += (oIdx % 2 === 0 ? 0.32 : -0.32);
            z += (oIdx % 2 === 0 ? 0.32 : -0.32);
          }
        }
      });
    }

    // 3. Keep strictly inside safe island boundary (NEVER float out into void)
    const islandDist = Math.sqrt(x * x + z * z);
    if (islandDist > MAX_RADIUS) {
      x = (x / islandDist) * MAX_RADIUS;
      z = (z / islandDist) * MAX_RADIUS;
    }

    return { x, z };
  }

  // Generates unique, obstacle-free wander targets across the open meadow
  pickSafeWanderTarget(myPetIdx) {
    const candidateZones = [
      { x: 0.5, z: 0.4 },
      { x: 1.3, z: 0.6 },
      { x: -0.1, z: 1.3 },
      { x: 0.8, z: 1.4 },
      { x: 1.4, z: 1.2 },
      { x: 0.9, z: -0.2 },
      { x: 0.3, z: 0.8 },
      { x: -0.5, z: 1.5 },
      { x: 1.6, z: 0.2 },
      { x: 0.1, z: 0.3 }
    ];

    const shuffled = [...candidateZones].sort(() => Math.random() - 0.5);

    for (const base of shuffled) {
      const candX = base.x + (Math.random() - 0.5) * 0.4;
      const candZ = base.z + (Math.random() - 0.5) * 0.4;
      if (this.isPositionSafe(candX, candZ, myPetIdx, 0.35)) {
        return { x: candX, z: candZ };
      }
    }

    for (let attempts = 0; attempts < 16; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 1.5;
      const candX = Math.cos(angle) * r;
      const candZ = Math.sin(angle) * r;
      if (this.isPositionSafe(candX, candZ, myPetIdx, 0.35)) {
        return { x: candX, z: candZ };
      }
    }

    return this.resolvePositionCollision(0.5 + myPetIdx * 0.2, 0.5, myPetIdx);
  }

  getSafePetSpawnPoint(petIndex) {
    const defaultSlots = [
      { x: 0.6, z: 0.4 },
      { x: 1.3, z: 0.7 },
      { x: 0.1, z: 1.3 },
      { x: -0.4, z: 1.4 },
      { x: 1.0, z: -0.1 },
      { x: 0.8, z: 1.2 },
      { x: 1.5, z: 0.3 },
      { x: 0.2, z: 0.6 }
    ];
    const base = defaultSlots[petIndex % defaultSlots.length];
    return this.resolvePositionCollision(base.x, base.z, petIndex);
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

    // Instant separation pass for all newly spawned pets so they never overlap
    for (let p = 0; p < 4; p++) {
      this.petInstances.forEach((mesh, idx) => {
        const s = mesh.userData.aiState;
        if (s) {
          const res = this.resolvePositionCollision(s.x, s.z, idx);
          s.x = res.x;
          s.z = res.z;
          mesh.position.x = s.x;
          mesh.position.z = s.z;
          mesh.position.y = this.getGroundHeight(s.x, s.z);
        }
      });
    }
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
    s.eatTimer = 3.2; // Extended peaceful eating time

    if (petMesh.userData.feedDish) {
      petMesh.userData.feedDish.visible = true;
    }

    // Spawn 6 floating heart particles above the pet with soft pastel colors
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
      this.floatingHearts.push({ mesh: hMesh, life: 2.5 });
    }
  }

  completePetFeed(petMesh) {
    const s = petMesh.userData.aiState;
    const petData = petMesh.userData.petData;

    // After 1300ms hold, pet continues happily finishing the meal from the bowl for 2.4s, then gentle happy nod
    if (s) {
      s.state = 'eating';
      s.eatTimer = 2.4;
    }

    if (petMesh.userData.feedDish) {
      petMesh.userData.feedDish.visible = true;
    }

    // Spawn floating heart particles & sparkles
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
      this.floatingHearts.push({ mesh: hMesh, life: 2.5 });
    }

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

    const skyColors = {
      day: '#7fb8db',
      sunset: '#281924',
      night: '#0e131a',
      rain: '#151b22'
    };
    const skyHex = skyColors[mode] || '#0e1419';
    if (typeof document !== 'undefined') {
      if (document.body) document.body.style.backgroundColor = skyHex;
      if (document.documentElement) document.documentElement.style.backgroundColor = skyHex;
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', skyHex);
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

          if (this.onPetHoldStart) this.onPetHoldStart(petData);

          // Long-press timer (1300ms for a peaceful, deliberate feeding interaction)
          const FEED_HOLD_TIME = 1300;
          this.petHoldTimer = setTimeout(() => {
            if (this.isPetHolding && this.activePetPressed === hitObj) {
              this.isPetHolding = false;
              this.completePetFeed(hitObj);
            }
          }, FEED_HOLD_TIME);
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

      // Direct touch rotation: horizontal follows finger, vertical follows natural tilt
      this.targetRotationY -= deltaX * 0.007;
      this.targetRotationX = Math.max(0.12, Math.min(0.85, this.targetRotationX + deltaY * 0.005));
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

        // If it was a short tap (< 450ms)
        if (elapsed < 450 && this.dragDistance < 12 && this.isPetHolding) {
          this.isPetHolding = false;
          // Hide dish immediately
          if (petObj.userData.feedDish) petObj.userData.feedDish.visible = false;

          // Gentle curious head raise (抬個頭看著你) - peaceful and subtle!
          if (petObj.userData.aiState) {
            petObj.userData.aiState.state = 'looking_up';
            petObj.userData.aiState.lookTimer = 2.0;
          }
          if (this.onPetTap) this.onPetTap(petObj.userData.petData);
          return;
        }

        // If released midway between tap and full feed (450ms ~ 1300ms)
        if (this.isPetHolding) {
          this.isPetHolding = false;
          if (petObj.userData.feedDish) petObj.userData.feedDish.visible = false;
          if (petObj.userData.headGroup) {
            petObj.userData.headGroup.position.y = petObj.userData.baseHeadY || 0.22;
            petObj.userData.headGroup.rotation.z = 0;
            petObj.userData.headGroup.rotation.x = 0;
          }
          if (petObj.userData.aiState) {
            petObj.userData.aiState.state = 'idle';
            petObj.userData.aiState.timer = 2.0;
          }
          return;
        }

        this.isPetHolding = false;
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
        } else {
          // Clicked outside trees on blank island / scene: deselect
          this.highlightTree(null);
          if (this.onBlankTap) this.onBlankTap();
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
        const factor = (dist - this.initialPinchDistance) * 0.018;
        this.targetZoom = Math.max(3.8, Math.min(19.0, this.targetZoom - factor));
        this.initialPinchDistance = dist;
      }
    }, { passive: true });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetZoom = Math.max(3.8, Math.min(19.0, this.targetZoom + e.deltaY * 0.006));
    }, { passive: false });
  }

  updateCameraPosition() {
    const r = this.zoom;
    const y = r * Math.sin(this.currentRotationX);
    const horizontalR = r * Math.cos(this.currentRotationX);
    const x = horizontalR * Math.sin(this.currentRotationY);
    const z = horizontalR * Math.cos(this.currentRotationY);
    this.camera.position.set(x, y + 0.45, z);
    this.camera.lookAt(0, 0.52, 0);
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
      const groundY = this.getGroundHeight(s.x, s.z);
      petMesh.position.y = groundY;
      petMesh.position.x = s.x;
      petMesh.position.z = s.z;

      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY - 0.07 + Math.sin(time * 14) * 0.025;
        petMesh.userData.headGroup.rotation.z = -0.32 + Math.sin(time * 14) * 0.08;
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 16) * 0.55;
      }
      return;
    }

    // Eating / Feeding animation state
    if (s.state === 'eating') {
      s.eatTimer -= delta;
      const groundY = this.getGroundHeight(s.x, s.z);
      petMesh.position.y = groundY;
      petMesh.position.x = s.x;
      petMesh.position.z = s.z;

      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY - 0.07 + Math.sin(time * 12) * 0.025;
        petMesh.userData.headGroup.rotation.z = -0.32 + Math.sin(time * 12) * 0.08;
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 14) * 0.5;
      }
      if (s.eatTimer <= 0) {
        if (petMesh.userData.feedDish) petMesh.userData.feedDish.visible = false;
        s.state = 'happy_nod';
        s.happyTimer = 1.8;
      }
      return;
    }

    // Gentle looking up affectionately (短按：抬個頭看著你，溫和優雅)
    if (s.state === 'looking_up') {
      s.lookTimer -= delta;
      const groundY = this.getGroundHeight(s.x, s.z);
      petMesh.position.y = groundY;
      petMesh.position.x = s.x;
      petMesh.position.z = s.z;

      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY + 0.035;
        petMesh.userData.headGroup.rotation.z = 0.26; // gentle tilt up
        petMesh.userData.headGroup.rotation.x = -0.12; // curious head tilt
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 8) * 0.28; // calm gentle tail wag
      }

      if (s.lookTimer <= 0) {
        if (petMesh.userData.headGroup) {
          petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
          petMesh.userData.headGroup.rotation.z = 0;
          petMesh.userData.headGroup.rotation.x = 0;
        }
        s.state = 'idle';
        s.timer = 2.5;
      }
      return;
    }

    // Happy contented nod after feeding completes (溫柔點頭感謝，不再誇張跳高空)
    if (s.state === 'happy_nod') {
      s.happyTimer -= delta;
      const groundY = this.getGroundHeight(s.x, s.z);
      petMesh.position.y = groundY + Math.max(0, Math.sin(time * 10) * 0.035);
      petMesh.position.x = s.x;
      petMesh.position.z = s.z;

      if (petMesh.userData.headGroup) {
        const baseY = petMesh.userData.baseHeadY || 0.22;
        petMesh.userData.headGroup.position.y = baseY + Math.sin(time * 8) * 0.035;
        petMesh.userData.headGroup.rotation.z = Math.sin(time * 8) * 0.12;
      }
      if (petMesh.userData.tail) {
        petMesh.userData.tail.rotation.y = Math.sin(time * 12) * 0.45;
      }

      if (s.happyTimer <= 0) {
        if (petMesh.userData.headGroup) {
          petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
          petMesh.userData.headGroup.rotation.z = 0;
          petMesh.userData.headGroup.rotation.x = 0;
        }
        petMesh.position.y = this.getGroundHeight(s.x, s.z);
        s.state = 'idle';
        s.timer = 2.5;
      }
      return;
    }

    // Ensure head is upright during regular wandering
    if (petMesh.userData.headGroup && petMesh.userData.headGroup.rotation.z !== 0) {
      petMesh.userData.headGroup.position.y = petMesh.userData.baseHeadY || 0.22;
      petMesh.userData.headGroup.rotation.z = 0;
      petMesh.userData.headGroup.rotation.x = 0;
    }

    s.timer -= delta;
    if (s.timer <= 0) {
      if (s.state === 'idle' || s.state === 'sitting') {
        const target = this.pickSafeWanderTarget(idx);
        s.targetX = target.x;
        s.targetZ = target.z;
        s.state = 'walking';
        s.timer = 4.8;
      } else {
        s.state = Math.random() > 0.4 ? 'sitting' : 'idle';
        s.timer = 3.0 + Math.random() * 3.5;
      }
    }

    if (s.state === 'walking') {
      const dx = s.targetX - s.x;
      const dz = s.targetZ - s.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.05) {
        const speed = s.speed * delta;
        const nextX = s.x + (dx / dist) * speed;
        const nextZ = s.z + (dz / dist) * speed;

        // Continuous real-time collision resolution against obstacles, trees, other pets, and edge void
        const resolved = this.resolvePositionCollision(nextX, nextZ, idx);
        const actualDx = resolved.x - s.x;
        const actualDz = resolved.z - s.z;
        if (Math.abs(actualDx) > 0.0001 || Math.abs(actualDz) > 0.0001) {
          s.rotation = Math.atan2(actualDx, actualDz);
        }
        s.x = resolved.x;
        s.z = resolved.z;

        const groundY = this.getGroundHeight(s.x, s.z);
        petMesh.position.y = groundY + Math.abs(Math.sin(time * 10 + idx)) * 0.03;
      } else {
        s.state = 'idle';
        s.timer = 2.5 + Math.random() * 2.0;
        petMesh.position.y = this.getGroundHeight(s.x, s.z);
      }
    } else {
      // Idle or sitting: gently enforce personal space and boundary constraints
      const resolved = this.resolvePositionCollision(s.x, s.z, idx);
      s.x = resolved.x;
      s.z = resolved.z;
      petMesh.position.y = this.getGroundHeight(s.x, s.z);
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
    const aspect = width / height;
    this.camera.aspect = aspect;

    // Responsive FOV for portrait mobile: dynamically widen FOV so the whole island is visible!
    if (aspect < 1.0) {
      this.camera.fov = Math.min(68, 42 + (1.0 - aspect) * 26);
    } else {
      this.camera.fov = 40;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
