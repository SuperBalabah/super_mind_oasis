// V3.2 Main Application Controller for Super Mind Oasis
import { Scene3D } from './scene3d.js';
import { Storage, TREE_TYPES, PET_SPECIES, GistSync } from './storage.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.scene = null;
    this.selectedTree = null;
    this.selectedTreeType = 'oak';
    this.selectedPetSpecies = 'sheep';
    this.settings = Storage.getSettings();
    this.syncConfig = Storage.getSyncConfig();
    this.syncDebounceTimer = null;
    this.isSyncing = false;

    // Long press nurture state on tree card
    this.holdTimer = null;
    this.holdStartTime = 0;
    this.isHolding = false;

    // DOM Elements
    this.dom = {
      canvasContainer: document.getElementById('canvas-container'),
      btnAmbience: document.getElementById('btn-ambience'),
      btnMusic: document.getElementById('btn-music'),
      btnSound: document.getElementById('btn-sound'),
      btnSync: document.getElementById('btn-sync'),
      hint: document.getElementById('center-hint'),
      toast: document.getElementById('floating-toast'),

      // Navigation
      btnPlantOpen: document.getElementById('btn-plant-open'),
      btnArchiveOpen: document.getElementById('btn-archive-open'),
      btnHabitOpen: document.getElementById('btn-habit-open'),

      // Tree Floating Card
      treeCard: document.getElementById('tree-card'),
      cardClose: document.getElementById('card-close'),
      cardTreeType: document.getElementById('card-tree-type'),
      cardTreeTitle: document.getElementById('card-tree-title'),
      cardTreeDays: document.getElementById('card-tree-days'),
      cardTreeNurture: document.getElementById('card-tree-nurture'),
      cardTreeWorry: document.getElementById('card-tree-worry'),
      btnHoldNurture: document.getElementById('btn-hold-nurture'),
      holdProgressFill: document.getElementById('hold-progress-fill'),
      btnTreeHarvest: document.getElementById('btn-tree-harvest'),
      btnTreeDelete: document.getElementById('btn-tree-delete'),

      // Modals
      modalPlant: document.getElementById('modal-plant'),
      formPlant: document.getElementById('form-plant'),
      btnPlantCancel: document.getElementById('btn-plant-cancel'),
      plantTitle: document.getElementById('plant-title'),
      plantWorry: document.getElementById('plant-worry'),
      treePickerContainer: document.getElementById('tree-picker-container'),

      modalNote: document.getElementById('modal-note'),
      formNote: document.getElementById('form-note'),
      btnNoteCancel: document.getElementById('btn-note-cancel'),
      noteText: document.getElementById('note-text'),

      modalHarvest: document.getElementById('modal-harvest'),
      formHarvest: document.getElementById('form-harvest'),
      btnHarvestCancel: document.getElementById('btn-harvest-cancel'),
      harvestInsight: document.getElementById('harvest-insight'),

      modalArchive: document.getElementById('modal-archive'),
      btnArchiveClose: document.getElementById('btn-archive-close'),
      ringsContainer: document.getElementById('rings-container'),

      // Cloud Sync Modal
      modalSync: document.getElementById('modal-sync'),
      btnSyncCancel: document.getElementById('btn-sync-cancel'),
      formSyncSettings: document.getElementById('form-sync-settings'),
      syncLastTimeText: document.getElementById('sync-last-time-text'),
      syncAutoToggle: document.getElementById('sync-auto-toggle'),
      syncTokenInput: document.getElementById('sync-token-input'),
      syncGistIdInput: document.getElementById('sync-gist-id-input'),
      btnCreateGist: document.getElementById('btn-create-gist'),
      btnManualPush: document.getElementById('btn-manual-push'),
      btnManualPull: document.getElementById('btn-manual-pull'),

      // Top-Right Grayscale Pet Widget
      topPetsWidget: document.getElementById('top-pets-widget'),

      // Adopt Modal (Bottom nav pet icon)
      modalAdopt: document.getElementById('modal-adopt'),
      btnAdoptCancel: document.getElementById('btn-adopt-cancel'),
      petSpeciesPicker: document.getElementById('pet-species-picker'),
      formAdoptPet: document.getElementById('form-adopt-pet'),
      adoptPetName: document.getElementById('adopt-pet-name'),
      adoptPetHabit: document.getElementById('adopt-pet-habit'),

      // Pet Detail & Release Modal (Top-right pill click)
      modalPetDetail: document.getElementById('modal-pet-detail'),
      petDetailAvatar: document.getElementById('pet-detail-avatar'),
      petDetailName: document.getElementById('pet-detail-name'),
      petDetailSpecies: document.getElementById('pet-detail-species'),
      petDetailHabit: document.getElementById('pet-detail-habit'),
      petDetailCare: document.getElementById('pet-detail-care'),
      btnPetReleaseAction: document.getElementById('btn-pet-release-action'),
      btnPetDetailClose: document.getElementById('btn-pet-detail-close')
    };

    this.init();
  }

  init() {
    this.registerPWA();
    this.init3DScene();
    this.renderTreePicker();
    this.renderPetSpeciesPicker();
    this.renderTopPetsWidget();
    this.setupEventListeners();
    this.applySettings();
    this.updateSyncButtonStatus();
    this.checkRemoteSyncOnLaunch();

    // Optimistic audio launch attempt on page load
    sound.tryOptimisticAutoStart(this.settings.musicEnabled);

    setTimeout(() => {
      if (this.dom.hint) this.dom.hint.style.opacity = '0';
    }, 6000);
  }

  registerPWA() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }

  init3DScene() {
    this.scene = new Scene3D(
      this.dom.canvasContainer,
      (treeData) => this.onTreeSelected(treeData),
      (petData) => this.onPetTapped(petData),
      (petData) => this.onPetFed(petData),
      () => sound.playWaterDrop()
    );

    this.scene.onPetHoldStart = (petData) => {
      sound.playFeedingNibble();
    };

    this.scene.onBlankTap = () => {
      if (this.selectedTree) {
        this.closeTreeCard();
        sound.playWaterDrop();
      }
    };

    this.scene.updateTrees(Storage.getTrees());
    this.scene.updatePets(Storage.getPets());
  }

  showToast(msg, duration = 2400) {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = msg;
    this.dom.toast.classList.add('active');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      if (this.dom.toast) this.dom.toast.classList.remove('active');
    }, duration);
  }

  setupEventListeners() {
    const unlockAudio = () => {
      sound.ensureContext();
      if (this.settings.musicEnabled) {
        sound.startAmbientMusic();
      }
      window.removeEventListener('pointerdown', unlockAudio, { capture: true });
      window.removeEventListener('touchstart', unlockAudio, { capture: true });
      window.removeEventListener('click', unlockAudio, { capture: true });
    };
    window.addEventListener('pointerdown', unlockAudio, { capture: true });
    window.addEventListener('touchstart', unlockAudio, { capture: true });
    window.addEventListener('click', unlockAudio, { capture: true });

    // Suppress system contextmenu / callout on long press (except form fields)
    window.addEventListener('contextmenu', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }, { passive: false });

    // Dynamic Viewport Sync on resize and orientationchange
    window.addEventListener('resize', () => {
      if (this.scene) this.scene.onResize();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (this.scene) this.scene.onResize();
      }, 120);
    });

    // Ambience
    const ambiences = ['sunset', 'night', 'rain', 'day'];
    this.dom.btnAmbience.addEventListener('click', () => {
      sound.ensureContext();
      const currentIdx = ambiences.indexOf(this.settings.ambienceMode || 'sunset');
      const nextMode = ambiences[(currentIdx + 1) % ambiences.length];
      this.settings.ambienceMode = nextMode;
      Storage.saveSettings(this.settings);
      this.applyAmbience(nextMode);
    });

    // Music
    this.dom.btnMusic.addEventListener('click', () => {
      sound.ensureContext();
      this.settings.musicEnabled = !this.settings.musicEnabled;
      Storage.saveSettings(this.settings);
      sound.setMusicEnabled(this.settings.musicEnabled);
      this.dom.btnMusic.classList.toggle('muted', !this.settings.musicEnabled);
    });

    // Sound FX
    this.dom.btnSound.addEventListener('click', () => {
      sound.ensureContext();
      this.settings.soundEnabled = !this.settings.soundEnabled;
      Storage.saveSettings(this.settings);
      sound.setSoundFxEnabled(this.settings.soundEnabled);
      this.dom.btnSound.classList.toggle('muted', !this.settings.soundEnabled);
    });

    this.dom.cardClose.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeTreeCard();
    });
    this.setupHoldToNurtureInteraction();

    // Harvest Modal
    this.dom.btnTreeHarvest.addEventListener('click', () => {
      sound.playPetChirp();
      this.dom.harvestInsight.value = '';
      this.openModal(this.dom.modalHarvest);
    });

    // Delete / Chop Down Tree (Inline Two-Step Confirmation - Zero Blocking, No Audio Interruption)
    if (this.dom.btnTreeDelete) {
      let treeDeleteTimer = null;
      this.dom.btnTreeDelete.addEventListener('click', () => {
        sound.ensureContext();
        if (!this.selectedTree) return;
        const tree = this.selectedTree;
        const btn = this.dom.btnTreeDelete;

        if (btn.dataset.confirming === 'true') {
          clearTimeout(treeDeleteTimer);
          btn.dataset.confirming = 'false';
          btn.textContent = '剷除此樹';
          btn.style.color = '';
          btn.style.borderColor = '';

          Storage.deleteTree(tree.id);
          this.closeTreeCard();
          this.selectedTree = null;
          this.scene.updateTrees(Storage.getTrees());
          sound.playWaterDrop();
          sound.ensureContext();
          this.showToast(`已剷除【${tree.title}】`);
          this.scheduleCloudPush();
        } else {
          btn.dataset.confirming = 'true';
          btn.textContent = '確定剷除？再次點擊確認';
          btn.style.color = '#ff8080';
          btn.style.borderColor = 'rgba(255, 128, 128, 0.5)';
          sound.playWaterDrop();

          clearTimeout(treeDeleteTimer);
          treeDeleteTimer = setTimeout(() => {
            if (btn) {
              btn.dataset.confirming = 'false';
              btn.textContent = '剷除此樹';
              btn.style.color = '';
              btn.style.borderColor = '';
            }
          }, 3500);
        }
      });
    }

    this.dom.btnHarvestCancel.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeModal(this.dom.modalHarvest);
    });

    this.dom.formHarvest.addEventListener('submit', (e) => {
      e.preventDefault();
      const insight = this.dom.harvestInsight.value;
      if (insight.trim() && this.selectedTree) {
        Storage.harvestTree(this.selectedTree.id, insight);
        sound.playInsightChime();
        this.closeModal(this.dom.modalHarvest);
        this.closeTreeCard();
        this.selectedTree = null;
        this.scene.updateTrees(Storage.getTrees());
        this.scheduleCloudPush();
        setTimeout(() => this.openArchiveModal(), 600);
      }
    });

    // Note Modal
    this.dom.btnNoteCancel.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeModal(this.dom.modalNote);
    });

    this.dom.formNote.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.dom.noteText.value;
      if (text.trim() && this.selectedTree) {
        const updated = Storage.nurtureTree(this.selectedTree.id, text);
        sound.playWaterDrop();
        this.closeModal(this.dom.modalNote);
        if (updated) {
          this.selectedTree = updated;
          this.updateTreeCardContent(updated);
          this.scene.updateTrees(Storage.getTrees());
        }
        this.scheduleCloudPush();
      }
    });

    // Plant Modal
    this.dom.btnPlantOpen.addEventListener('click', () => {
      sound.playPetChirp();
      this.dom.plantTitle.value = '';
      this.dom.plantWorry.value = '';
      this.openModal(this.dom.modalPlant);
    });

    this.dom.btnPlantCancel.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeModal(this.dom.modalPlant);
    });

    this.dom.formPlant.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.dom.plantTitle.value;
      const initialWorry = this.dom.plantWorry.value;
      if (title.trim()) {
        const newTree = Storage.addTree({
          title,
          initialWorry,
          treeType: this.selectedTreeType
        });
        sound.playSingingBowl(320);
        this.closeModal(this.dom.modalPlant);
        this.scene.updateTrees(Storage.getTrees());
        this.onTreeSelected(newTree);
        this.scheduleCloudPush();
      }
    });

    // Archive Modal
    this.dom.btnArchiveOpen.addEventListener('click', () => {
      sound.playPetChirp();
      this.openArchiveModal();
    });
    this.dom.btnArchiveClose.addEventListener('click', () => {
      sound.playPageTurn();
      this.closeModal(this.dom.modalArchive);
    });

    // Cloud Sync Modal Listeners
    if (this.dom.btnSync) {
      this.dom.btnSync.addEventListener('click', () => {
        sound.playPetChirp();
        this.openSyncModal();
      });
    }
    if (this.dom.btnSyncCancel) {
      this.dom.btnSyncCancel.addEventListener('click', () => {
        sound.playWaterDrop();
        this.closeModal(this.dom.modalSync);
      });
    }
    if (this.dom.formSyncSettings) {
      this.dom.formSyncSettings.addEventListener('submit', (e) => this.onSaveSyncSettings(e));
    }
    if (this.dom.btnCreateGist) {
      this.dom.btnCreateGist.addEventListener('click', () => this.onCreateGist());
    }
    if (this.dom.btnManualPush) {
      this.dom.btnManualPush.addEventListener('click', () => this.onManualPush());
    }
    if (this.dom.btnManualPull) {
      this.dom.btnManualPull.addEventListener('click', () => this.onManualPull());
    }

    // Pet Modal Listeners
    this.dom.btnHabitOpen.addEventListener('click', () => {
      sound.playPetChirp();
      this.openAdoptModal();
    });
    this.dom.btnAdoptCancel.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeModal(this.dom.modalAdopt);
    });

    this.dom.formAdoptPet.addEventListener('submit', (e) => {
      e.preventDefault();
      const species = this.selectedPetSpecies;
      const name = this.dom.adoptPetName.value;
      const habit = this.dom.adoptPetHabit.value;
      const newPet = Storage.addPet(species, name, habit);
      sound.playPetChirp();
      this.closeModal(this.dom.modalAdopt);
      this.scene.updatePets(Storage.getPets());
      this.renderTopPetsWidget();
      this.showToast(`歡迎【${newPet.name}】來到心靈綠洲`);
      this.scheduleCloudPush();
    });

    this.dom.btnPetDetailClose.addEventListener('click', () => {
      sound.playWaterDrop();
      this.closeModal(this.dom.modalPetDetail);
    });
    this.dom.btnPetReleaseAction.addEventListener('click', () => this.releaseCurrentPet());

    // Universal backdrop click: clicking outside the dialog on the blank area closes the modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay);
          sound.playWaterDrop();
        }
      });
    });

    // Keyboard ESC to dismiss active modal or tree card
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
          this.closeModal(activeModal);
          sound.playWaterDrop();
        } else if (this.selectedTree) {
          this.closeTreeCard();
          sound.playWaterDrop();
        }
      }
    });
  }

  setupHoldToNurtureInteraction() {
    const btn = this.dom.btnHoldNurture;
    const fill = this.dom.holdProgressFill;
    const HOLD_DURATION = 480;

    const startHold = () => {
      if (!this.selectedTree) return;
      this.isHolding = true;
      this.holdStartTime = Date.now();
      fill.style.transition = 'width 0.48s cubic-bezier(0.2, 0.8, 0.2, 1)';
      fill.style.width = '100%';

      this.holdTimer = setTimeout(() => {
        if (this.isHolding) {
          this.isHolding = false;
          fill.style.transition = 'none';
          fill.style.width = '0%';
          sound.playInsightChime();
          this.dom.noteText.value = '';
          this.openModal(this.dom.modalNote);
        }
      }, HOLD_DURATION);
    };

    const endHold = () => {
      if (!this.isHolding) return;
      const elapsed = Date.now() - this.holdStartTime;
      this.isHolding = false;
      clearTimeout(this.holdTimer);

      fill.style.transition = 'width 0.15s ease';
      fill.style.width = '0%';

      if (elapsed < HOLD_DURATION && this.selectedTree) {
        const updated = Storage.nurtureTree(this.selectedTree.id, null);
        sound.playSingingBowl(340);
        sound.playWaterDrop();
        if (updated) {
          this.selectedTree = updated;
          this.updateTreeCardContent(updated);
          this.scene.updateTrees(Storage.getTrees());
        }
        this.scheduleCloudPush();
        btn.style.transform = 'scale(0.96)';
        setTimeout(() => btn.style.transform = '', 180);
      }
    };

    btn.addEventListener('pointerdown', startHold);
    window.addEventListener('pointerup', endHold);
    window.addEventListener('pointercancel', endHold);
  }

  applySettings() {
    this.applyAmbience(this.settings.ambienceMode || 'sunset');
    sound.setSoundFxEnabled(this.settings.soundEnabled !== false);
    this.dom.btnSound.classList.toggle('muted', this.settings.soundEnabled === false);
    sound.setMusicEnabled(this.settings.musicEnabled !== false);
    this.dom.btnMusic.classList.toggle('muted', this.settings.musicEnabled === false);
  }

  applyAmbience(mode) {
    this.scene.setAmbience(mode);
    sound.toggleRain(mode === 'rain');
  }

  renderTreePicker() {
    const container = this.dom.treePickerContainer;
    container.innerHTML = '';

    Object.values(TREE_TYPES).forEach(type => {
      const item = document.createElement('div');
      item.className = `tree-type-item ${type.id === this.selectedTreeType ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="tree-preview-svg">${type.svgIcon}</div>
        <div class="tree-type-text-wrap">
          <div class="type-item-name">${type.name}</div>
          <div class="type-item-virtue">${type.virtue}</div>
          <div class="type-item-desc">${type.description}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        container.querySelectorAll('.tree-type-item').forEach(c => c.classList.remove('selected'));
        item.classList.add('selected');
        this.selectedTreeType = type.id;
        sound.playWaterDrop();
      });
      container.appendChild(item);
    });
  }

  onTreeSelected(treeData) {
    this.selectedTree = treeData;
    this.updateTreeCardContent(treeData);
    this.dom.treeCard.classList.add('active');
    sound.playSingingBowl(320);
  }

  updateTreeCardContent(tree) {
    const typeInfo = TREE_TYPES[tree.treeType] || TREE_TYPES.oak;
    const now = Date.now();
    const days = Math.max(0, Math.floor((now - tree.plantedAt) / (1000 * 60 * 60 * 24)));

    this.dom.cardTreeType.textContent = `${typeInfo.name} · ${typeInfo.virtue}`;
    this.dom.cardTreeTitle.textContent = tree.title;
    this.dom.cardTreeDays.textContent = `${days === 0 ? '今天' : days + ' 天'}`;
    this.dom.cardTreeNurture.textContent = `${tree.nurtureCount || 0} 次`;
    this.dom.cardTreeWorry.textContent = tree.initialWorry || '無記載具體困擾，靜心播下的課題。';
  }

  closeTreeCard() {
    this.dom.treeCard.classList.remove('active');
    this.selectedTree = null;
    this.scene.highlightTree(null);
  }

  // --- MULTI-PET MANAGEMENT ---
  renderPetSpeciesPicker() {
    const container = this.dom.petSpeciesPicker;
    container.innerHTML = '';

    Object.values(PET_SPECIES).forEach(sp => {
      const opt = document.createElement('div');
      opt.className = `pet-species-option ${sp.id === this.selectedPetSpecies ? 'selected' : ''}`;
      opt.textContent = sp.name;
      opt.addEventListener('click', () => {
        container.querySelectorAll('.pet-species-option').forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedPetSpecies = sp.id;
        this.dom.adoptPetName.placeholder = `夥伴名字（預設：${sp.name}）`;
        this.dom.adoptPetHabit.placeholder = `所守護的習慣（例如：${sp.defaultHabit}）`;
        sound.playPetChirp();
      });
      container.appendChild(opt);
    });
  }

  // --- TOP-RIGHT GRAYSCALE PET WIDGET & DETAILS ---
  renderTopPetsWidget() {
    const pets = Storage.getPets();
    const container = this.dom.topPetsWidget;
    if (!container) return;
    container.innerHTML = '';

    pets.forEach(pet => {
      const sp = PET_SPECIES[pet.species] || PET_SPECIES.sheep;
      const pill = document.createElement('div');
      pill.className = 'top-pet-pill';
      pill.title = `點擊查看【${pet.name}】詳情或放生`;
      pill.innerHTML = `
        <div class="top-pet-avatar">${sp.svgAvatar || ''}</div>
        <span class="top-pet-name">${pet.name}</span>
      `;
      pill.addEventListener('click', () => {
        sound.playPetChirp();
        this.openPetDetailModal(pet);
      });
      container.appendChild(pill);
    });
  }

  openAdoptModal() {
    this.renderPetSpeciesPicker();
    this.dom.adoptPetName.value = '';
    this.dom.adoptPetHabit.value = '';
    const sp = PET_SPECIES[this.selectedPetSpecies] || PET_SPECIES.sheep;
    this.dom.adoptPetName.placeholder = `夥伴名字（預設：${sp.name}）`;
    this.dom.adoptPetHabit.placeholder = `所守護的習慣（例如：${sp.defaultHabit}）`;
    this.openModal(this.dom.modalAdopt);
  }

  openPetDetailModal(pet) {
    this.currentInspectingPet = pet;
    const sp = PET_SPECIES[pet.species] || PET_SPECIES.sheep;
    this.dom.petDetailAvatar.innerHTML = sp.svgAvatar || '';
    this.dom.petDetailName.textContent = pet.name;
    this.dom.petDetailSpecies.textContent = sp.name;
    this.dom.petDetailHabit.textContent = pet.habitTitle;
    this.dom.petDetailCare.textContent = `${pet.careCount || 1} 次`;

    // Reset release button confirmation state
    if (this.dom.btnPetReleaseAction) {
      this.dom.btnPetReleaseAction.dataset.confirming = 'false';
      this.dom.btnPetReleaseAction.textContent = '放生此夥伴';
      this.dom.btnPetReleaseAction.style.color = '';
      this.dom.btnPetReleaseAction.style.borderColor = '';
    }

    this.openModal(this.dom.modalPetDetail);
  }

  releaseCurrentPet() {
    sound.ensureContext();
    if (!this.currentInspectingPet) return;
    const pet = this.currentInspectingPet;
    const btn = this.dom.btnPetReleaseAction;

    if (btn && btn.dataset.confirming === 'true') {
      clearTimeout(this.petReleaseTimer);
      btn.dataset.confirming = 'false';
      btn.textContent = '放生此夥伴';
      btn.style.color = '';
      btn.style.borderColor = '';

      Storage.deletePet(pet.id);
      this.scene.updatePets(Storage.getPets());
      this.renderTopPetsWidget();
      this.closeModal(this.dom.modalPetDetail);
      sound.playWaterDrop();
      sound.ensureContext();
      this.showToast(`【${pet.name}】已回歸山林大自然`);
      this.currentInspectingPet = null;
      this.scheduleCloudPush();
    } else if (btn) {
      btn.dataset.confirming = 'true';
      btn.textContent = '確定放生？再次點擊確認';
      btn.style.color = '#ff8080';
      btn.style.borderColor = 'rgba(255, 128, 128, 0.5)';
      sound.playWaterDrop();

      clearTimeout(this.petReleaseTimer);
      this.petReleaseTimer = setTimeout(() => {
        if (btn) {
          btn.dataset.confirming = 'false';
          btn.textContent = '放生此夥伴';
          btn.style.color = '';
          btn.style.borderColor = '';
        }
      }, 3500);
    }
  }

  // Pet in-world short-tap greeting (Gentle curious head raise, species voice)
  onPetTapped(petData) {
    if (petData && petData.species) {
      sound.playPetVoice(petData.species);
    } else {
      sound.playPetChirp();
    }
  }

  // Pet in-world long-press feeding (Direct in-game fulfillment)
  onPetFed(petData) {
    Storage.nurturePet(petData.id);
    sound.playFeedingNibble();
    try {
      if ('vibrate' in navigator) navigator.vibrate([30, 45, 30]);
    } catch (e) {}
    this.showToast(`已陪伴【${petData.name}】· 守護「${petData.habitTitle}」`);
    this.renderTopPetsWidget();
    this.scheduleCloudPush();
  }

  // --- VISUAL TREE GALLERY IN ARCHIVE (MATCHING EXACT TREE ART) ---
  openArchiveModal() {
    const rings = Storage.getRings();
    const activeTrees = Storage.getTrees();
    const container = this.dom.ringsContainer;
    container.innerHTML = '';

    const allItems = [
      ...activeTrees.map(t => ({ ...t, isActive: true })),
      ...rings.map(r => ({ ...r, isActive: false }))
    ];

    if (allItems.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:#7e8e9e; font-size:0.85rem;">目前尚未有任何課題。點擊下方播種按鈕種下你的第一棵樹。</div>';
    } else {
      allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'archive-tree-card';
        const typeInfo = TREE_TYPES[item.treeType] || TREE_TYPES.oak;

        const now = Date.now();
        const days = item.daysElapsed || Math.max(1, Math.round((now - item.plantedAt) / (1000 * 60 * 60 * 24)));
        const plantedDateStr = new Date(item.plantedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
        const harvestDateStr = item.harvestedAt ? new Date(item.harvestedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' }) : null;

        let notesTimelineHTML = '';
        if (item.notes && item.notes.length > 0) {
          notesTimelineHTML = item.notes.map(n => {
            const dateStr = new Date(n.timestamp).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
            return `
              <div class="timeline-step">
                <div class="timeline-step-title">${dateStr} · 沿途感悟</div>
                <div class="timeline-step-content">${n.text}</div>
              </div>
            `;
          }).join('');
        } else {
          notesTimelineHTML = `
            <div class="timeline-step">
              <div class="timeline-step-title">生長沉澱中</div>
              <div class="timeline-step-content" style="font-style:italic; color:#8ea0b0;">在歲月中靜默吸納養分...</div>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="tree-card-top-row">
            <div class="tree-visual-illustration">${typeInfo.svgIcon}</div>
            <div class="tree-card-info">
              <div class="tree-card-name">${item.title}</div>
              <div class="tree-card-sub">${typeInfo.name} · ${item.isActive ? '島上生長中' : '已釋懷圓滿'} · 歷時 ${days} 天</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${!item.isActive ? `
                <button type="button" class="btn-ghost-danger btn-delete-ring" data-id="${item.id}" style="padding:4px 8px; font-size:0.7rem;" title="刪除此年輪記錄">刪除</button>
              ` : ''}
              <div class="tree-card-arrow">❯</div>
            </div>
          </div>

          <div class="journey-timeline-drawer">
            <div class="timeline-step">
              <div class="timeline-step-title">${plantedDateStr} · 播下種子與困擾</div>
              <div class="timeline-step-content">${item.initialWorry || '無記載具體困擾，純粹立下的心靈課題。'}</div>
            </div>

            ${notesTimelineHTML}

            ${!item.isActive ? `
              <div class="timeline-step">
                <div class="timeline-step-title" style="color:var(--accent-gold);">${harvestDateStr} · 破局頓悟</div>
                <div class="timeline-step-content" style="color:#fff1c4; font-weight:500;">“ ${item.insight} ”</div>
              </div>
            ` : ''}
          </div>
        `;

        card.addEventListener('click', () => {
          card.classList.toggle('expanded');
          sound.playWaterDrop();
        });

        const deleteRingBtn = card.querySelector('.btn-delete-ring');
        if (deleteRingBtn) {
          let ringDeleteTimer = null;
          deleteRingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sound.ensureContext();

            if (deleteRingBtn.dataset.confirming === 'true') {
              clearTimeout(ringDeleteTimer);
              Storage.deleteRing(item.id);
              sound.playWaterDrop();
              sound.ensureContext();
              this.openArchiveModal();
              this.showToast(`已刪除【${item.title}】年輪記錄`);
              this.scheduleCloudPush();
            } else {
              deleteRingBtn.dataset.confirming = 'true';
              deleteRingBtn.textContent = '確定？';
              deleteRingBtn.style.color = '#ff7070';
              deleteRingBtn.style.borderColor = 'rgba(255, 112, 112, 0.5)';
              sound.playWaterDrop();

              clearTimeout(ringDeleteTimer);
              ringDeleteTimer = setTimeout(() => {
                if (deleteRingBtn) {
                  deleteRingBtn.dataset.confirming = 'false';
                  deleteRingBtn.textContent = '刪除';
                  deleteRingBtn.style.color = '';
                  deleteRingBtn.style.borderColor = '';
                }
              }, 3500);
            }
          });
        }

        container.appendChild(card);
      });
    }

    this.openModal(this.dom.modalArchive);
  }

  // --- CLOUD SYNC (GITHUB GIST) ---
  updateSyncButtonStatus() {
    if (!this.dom.btnSync) return;
    const isConfigured = Boolean(this.syncConfig.enabled && this.syncConfig.token && this.syncConfig.gistId);
    this.dom.btnSync.classList.toggle('connected', isConfigured);
    this.dom.btnSync.title = isConfigured ? '雲端共鳴 · 已連線 (點擊同步或設定)' : '雲端共鳴 · 跨設備同步 (未連線)';
  }

  setSyncingVisual(isSyncing) {
    if (this.dom.btnSync) {
      this.dom.btnSync.classList.toggle('syncing', isSyncing);
    }
    if (this.dom.btnManualPush) this.dom.btnManualPush.disabled = isSyncing;
    if (this.dom.btnManualPull) this.dom.btnManualPull.disabled = isSyncing;
  }

  updateSyncTimeDisplay() {
    if (!this.dom.syncLastTimeText) return;
    if (!this.syncConfig.lastSyncTime) {
      this.dom.syncLastTimeText.textContent = '上次同步：尚未同步';
      return;
    }
    const d = new Date(this.syncConfig.lastSyncTime);
    const dateStr = d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    this.dom.syncLastTimeText.textContent = `上次同步：${dateStr} ${timeStr}`;
  }

  openSyncModal() {
    this.dom.syncAutoToggle.checked = Boolean(this.syncConfig.autoSync !== false);
    this.dom.syncTokenInput.value = this.syncConfig.token || '';
    this.dom.syncGistIdInput.value = this.syncConfig.gistId || '';
    this.updateSyncTimeDisplay();
    this.openModal(this.dom.modalSync);
  }

  async onSaveSyncSettings(e) {
    e.preventDefault();
    const token = this.dom.syncTokenInput.value.trim();
    const gistId = this.dom.syncGistIdInput.value.trim();
    const autoSync = this.dom.syncAutoToggle.checked;

    this.syncConfig.token = token;
    this.syncConfig.gistId = gistId;
    this.syncConfig.autoSync = autoSync;
    this.syncConfig.enabled = Boolean(token && gistId);

    Storage.saveSyncConfig(this.syncConfig);
    this.updateSyncButtonStatus();
    this.closeModal(this.dom.modalSync);
    sound.playWaterDrop();
    this.showToast(this.syncConfig.enabled ? '雲端同步設定已保存' : '已保存本地設定');

    if (this.syncConfig.enabled && this.syncConfig.autoSync) {
      this.scheduleCloudPush();
    }
  }

  async onCreateGist() {
    const token = this.dom.syncTokenInput.value.trim();
    if (!token) {
      this.showToast('請先填寫上方 GitHub Token');
      this.dom.syncTokenInput.focus();
      return;
    }

    const btn = this.dom.btnCreateGist;
    btn.textContent = '建立中...';
    btn.disabled = true;

    try {
      const payload = Storage.exportAllDataPayload();
      const gistId = await GistSync.createGist(token, payload);
      this.dom.syncGistIdInput.value = gistId;
      this.syncConfig.token = token;
      this.syncConfig.gistId = gistId;
      this.syncConfig.enabled = true;
      this.syncConfig.autoSync = this.dom.syncAutoToggle.checked;
      this.syncConfig.lastSyncTime = Date.now();
      Storage.saveSyncConfig(this.syncConfig);

      this.updateSyncTimeDisplay();
      this.updateSyncButtonStatus();
      sound.playInsightChime();
      this.showToast('私有 Gist 建立成功，已完成首次同步');
    } catch (err) {
      this.showToast(`建立失敗：${err.message}`);
    } finally {
      btn.textContent = '自動建立私有 Gist';
      btn.disabled = false;
    }
  }

  async onManualPush() {
    const token = this.dom.syncTokenInput.value.trim();
    const gistId = this.dom.syncGistIdInput.value.trim();
    if (!token || !gistId) {
      this.showToast('請先填寫 Token 與 Gist ID');
      return;
    }
    this.syncConfig.token = token;
    this.syncConfig.gistId = gistId;
    this.syncConfig.enabled = true;
    Storage.saveSyncConfig(this.syncConfig);

    await this.performCloudPush(false);
  }

  async onManualPull() {
    const token = this.dom.syncTokenInput.value.trim();
    const gistId = this.dom.syncGistIdInput.value.trim();
    if (!token || !gistId) {
      this.showToast('請先填寫 Token 與 Gist ID');
      return;
    }
    this.syncConfig.token = token;
    this.syncConfig.gistId = gistId;
    this.syncConfig.enabled = true;
    Storage.saveSyncConfig(this.syncConfig);

    await this.performCloudPull(false);
  }

  scheduleCloudPush() {
    if (!this.syncConfig.enabled || !this.syncConfig.autoSync) return;
    if (!this.syncConfig.token || !this.syncConfig.gistId) return;

    clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.performCloudPush(true);
    }, 1500);
  }

  async performCloudPush(silent = false) {
    if (this.isSyncing) return;
    if (!this.syncConfig.token || !this.syncConfig.gistId) return;

    this.isSyncing = true;
    this.setSyncingVisual(true);

    try {
      const payload = Storage.exportAllDataPayload();
      await GistSync.pushToGist(this.syncConfig.token, this.syncConfig.gistId, payload);
      this.syncConfig.lastSyncTime = Date.now();
      Storage.saveSyncConfig(this.syncConfig);
      this.updateSyncTimeDisplay();
      this.updateSyncButtonStatus();

      if (!silent) {
        sound.playInsightChime();
        this.showToast('心靈島已成功推送至雲端');
      }
    } catch (err) {
      console.error('Cloud Push Error:', err);
      if (!silent) {
        this.showToast(`上傳失敗: ${err.message}`);
      }
    } finally {
      this.isSyncing = false;
      this.setSyncingVisual(false);
    }
  }

  async performCloudPull(silent = false) {
    if (this.isSyncing) return;
    if (!this.syncConfig.token || !this.syncConfig.gistId) return;

    this.isSyncing = true;
    this.setSyncingVisual(true);

    try {
      const { payload, updatedAt } = await GistSync.pullFromGist(this.syncConfig.token, this.syncConfig.gistId);
      if (payload) {
        const success = Storage.applySyncedData(payload);
        if (success) {
          this.syncConfig.lastSyncTime = Date.now();
          Storage.saveSyncConfig(this.syncConfig);
          this.updateSyncTimeDisplay();
          this.updateSyncButtonStatus();

          this.scene.updateTrees(Storage.getTrees());
          this.scene.updatePets(Storage.getPets());
          this.renderTopPetsWidget();

          if (!silent) {
            sound.playInsightChime();
            this.showToast('已從雲端成功拉取最新島嶼資料');
          }
        }
      }
    } catch (err) {
      console.error('Cloud Pull Error:', err);
      if (!silent) {
        this.showToast(`拉取失敗: ${err.message}`);
      }
    } finally {
      this.isSyncing = false;
      this.setSyncingVisual(false);
    }
  }

  async checkRemoteSyncOnLaunch() {
    if (!this.syncConfig.enabled || !this.syncConfig.autoSync) return;
    if (!this.syncConfig.token || !this.syncConfig.gistId) return;

    try {
      await this.performCloudPull(true);
    } catch (e) {
      console.log('Background launch sync skipped:', e.message);
    }
  }

  openModal(modalEl) {
    modalEl.classList.add('active');
    // Lock document background and meta theme-color to deep modal backdrop (#0a1016)
    if (document.body) document.body.style.backgroundColor = '#0a1016';
    if (document.documentElement) document.documentElement.style.backgroundColor = '#0a1016';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#0a1016');
  }

  closeModal(modalEl) {
    modalEl.classList.remove('active');
    const anyModalActive = document.querySelector('.modal-overlay.active');
    if (!anyModalActive) {
      const skyHex = this.scene ? this.scene.currentSkyHex || '#0e1419' : '#0e1419';
      if (document.body) document.body.style.backgroundColor = skyHex;
      if (document.documentElement) document.documentElement.style.backgroundColor = skyHex;
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', skyHex);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
