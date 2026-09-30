// V3.2 Main Application Controller for Super Mind Oasis
import { Scene3D } from './scene3d.js';
import { Storage, TREE_TYPES, PET_SPECIES } from './storage.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.scene = null;
    this.selectedTree = null;
    this.selectedTreeType = 'oak';
    this.selectedPetSpecies = 'sheep';
    this.settings = Storage.getSettings();

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
      btnExportBackup: document.getElementById('btn-export-backup'),
      inputImportBackup: document.getElementById('input-import-backup'),

      // Multi-Pet Habit Modal
      modalHabit: document.getElementById('modal-habit'),
      btnHabitClose: document.getElementById('btn-habit-close'),
      petsListContainer: document.getElementById('pets-list-container'),
      petSpeciesPicker: document.getElementById('pet-species-picker'),
      formAdoptPet: document.getElementById('form-adopt-pet'),
      adoptPetName: document.getElementById('adopt-pet-name'),
      adoptPetHabit: document.getElementById('adopt-pet-habit')
    };

    this.init();
  }

  init() {
    this.registerPWA();
    this.init3DScene();
    this.renderTreePicker();
    this.renderPetSpeciesPicker();
    this.setupEventListeners();
    this.applySettings();

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
      sound.startBreezeLoop();
      sound.startCampfireAudio();
      if (this.settings.musicEnabled) {
        sound.startAmbientMusic();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

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
      sound.setMuted(!this.settings.soundEnabled);
      this.dom.btnSound.classList.toggle('muted', !this.settings.soundEnabled);
    });

    this.dom.cardClose.addEventListener('click', () => this.closeTreeCard());
    this.setupHoldToNurtureInteraction();

    // Harvest Modal
    this.dom.btnTreeHarvest.addEventListener('click', () => {
      this.dom.harvestInsight.value = '';
      this.openModal(this.dom.modalHarvest);
    });

    this.dom.btnHarvestCancel.addEventListener('click', () => this.closeModal(this.dom.modalHarvest));

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
        setTimeout(() => this.openArchiveModal(), 600);
      }
    });

    // Note Modal
    this.dom.btnNoteCancel.addEventListener('click', () => this.closeModal(this.dom.modalNote));

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
      }
    });

    // Plant Modal
    this.dom.btnPlantOpen.addEventListener('click', () => {
      this.dom.plantTitle.value = '';
      this.dom.plantWorry.value = '';
      this.openModal(this.dom.modalPlant);
    });

    this.dom.btnPlantCancel.addEventListener('click', () => this.closeModal(this.dom.modalPlant));

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
      }
    });

    // Archive Modal
    this.dom.btnArchiveOpen.addEventListener('click', () => this.openArchiveModal());
    this.dom.btnArchiveClose.addEventListener('click', () => this.closeModal(this.dom.modalArchive));

    // Backup & Restore
    this.dom.btnExportBackup.addEventListener('click', () => {
      const json = Storage.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mind_oasis_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    this.dom.inputImportBackup.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = Storage.importData(event.target.result);
        if (success) {
          alert('備份還原成功！小島已同步更新。');
          this.scene.updateTrees(Storage.getTrees());
          this.scene.updatePets(Storage.getPets());
          this.openArchiveModal();
        } else {
          alert('備份格式不正確，請確認檔案內容。');
        }
      };
      reader.readAsText(file);
    });

    // Multi-Pet Modal
    this.dom.btnHabitOpen.addEventListener('click', () => this.openHabitModal());
    this.dom.btnHabitClose.addEventListener('click', () => this.closeModal(this.dom.modalHabit));

    this.dom.formAdoptPet.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.dom.adoptPetName.value;
      const habit = this.dom.adoptPetHabit.value;
      Storage.addPet(this.selectedPetSpecies, name, habit);
      sound.playPetChirp();
      this.dom.adoptPetName.value = '';
      this.dom.adoptPetHabit.value = '';
      this.scene.updatePets(Storage.getPets());
      this.renderPetsList();
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
    sound.setMuted(!this.settings.soundEnabled);
    this.dom.btnSound.classList.toggle('muted', !this.settings.soundEnabled);
    this.dom.btnMusic.classList.toggle('muted', !this.settings.musicEnabled);
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

  renderPetsList() {
    const pets = Storage.getPets();
    const container = this.dom.petsListContainer;
    container.innerHTML = '';

    if (pets.length === 0) {
      container.innerHTML = '<div style="font-size:0.8rem; color:#8ea0b0; padding:10px 0;">島上目前沒有寵物，請在下方認養你的第一個習慣夥伴。</div>';
      return;
    }

    pets.forEach(pet => {
      const sp = PET_SPECIES[pet.species] || PET_SPECIES.sheep;
      const card = document.createElement('div');
      card.className = 'pet-card-item';
      card.innerHTML = `
        <div class="pet-card-left">
          <div class="pet-card-title">${pet.name} · ${sp.name}</div>
          <div class="pet-card-habit">守護習慣：${pet.habitTitle}</div>
          <div style="font-size:0.7rem; color:rgba(255,255,255,0.4); margin-top:2px;">可在島上長按小動物直接餵食陪伴</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="pet-card-streak" title="累計陪伴次數">${pet.careCount || 1} 次陪伴</div>
          <button class="btn-ghost" style="padding:6px 12px; font-size:0.75rem;">
            餵食陪伴
          </button>
        </div>
      `;

      const feedBtn = card.querySelector('button');
      feedBtn.addEventListener('click', () => {
        Storage.nurturePet(pet.id);
        sound.playFeedingNibble();
        const petMesh = this.scene.petInstances.find(p => p.userData.petId === pet.id);
        if (petMesh) this.scene.feedPet(petMesh);
        this.showToast(`✨ 陪伴【${pet.name}】完成「${pet.habitTitle}」`);
        this.renderPetsList();
      });

      container.appendChild(card);
    });
  }

  // Pet in-world short-tap greeting (Gentle curious head raise, zero annoying banners!)
  onPetTapped(petData) {
    sound.playPetChirp();
  }

  // Pet in-world long-press feeding (Direct in-game fulfillment)
  onPetFed(petData) {
    Storage.nurturePet(petData.id);
    sound.playFeedingNibble();
    try {
      if ('vibrate' in navigator) navigator.vibrate([30, 45, 30]);
    } catch (e) {}
    this.showToast(`✨ 已溫暖陪伴【${petData.name}】· 守護「${petData.habitTitle}」`);
    this.renderPetsList();
  }

  openHabitModal() {
    this.renderPetsList();
    this.openModal(this.dom.modalHabit);
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
            <div class="tree-card-arrow">❯</div>
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

        container.appendChild(card);
      });
    }

    this.openModal(this.dom.modalArchive);
  }

  openModal(modalEl) {
    modalEl.classList.add('active');
  }

  closeModal(modalEl) {
    modalEl.classList.remove('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
