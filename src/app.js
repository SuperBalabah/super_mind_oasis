// V2 Main Application Controller for Super Mind Oasis
import { Scene3D } from './scene3d.js';
import { Storage, TREE_TYPES } from './storage.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.scene = null;
    this.selectedTree = null;
    this.selectedTreeType = 'oak';
    this.settings = Storage.getSettings();
    this.habit = Storage.getHabit();

    // Long press nurture state
    this.holdTimer = null;
    this.holdProgress = 0;
    this.holdStartTime = 0;
    this.isHolding = false;

    // DOM Elements
    this.dom = {
      canvasContainer: document.getElementById('canvas-container'),
      btnAmbience: document.getElementById('btn-ambience'),
      ambienceIcon: document.getElementById('ambience-icon'),
      btnMusic: document.getElementById('btn-music'),
      musicIcon: document.getElementById('music-icon'),
      btnSound: document.getElementById('btn-sound'),
      soundIcon: document.getElementById('sound-icon'),
      hint: document.getElementById('center-hint'),

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

      modalHabit: document.getElementById('modal-habit'),
      btnHabitClose: document.getElementById('btn-habit-close'),
      habitNameDisplay: document.getElementById('habit-name-display'),
      habitStreakCount: document.getElementById('habit-streak-count'),
      formHabitEdit: document.getElementById('form-habit-edit'),
      habitInput: document.getElementById('habit-input'),
      btnHabitCheckin: document.getElementById('btn-habit-checkin')
    };

    this.init();
  }

  init() {
    this.registerPWA();
    this.init3DScene();
    this.renderTreePicker();
    this.setupEventListeners();
    this.applySettings();
    this.updateHabitUI();

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
      () => this.onPetTapped(),
      () => sound.playWaterDrop()
    );

    const trees = Storage.getTrees();
    this.scene.updateTrees(trees);
  }

  setupEventListeners() {
    // Audio unlock on first gesture
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

    // Ambience Switcher
    const ambiences = ['sunset', 'night', 'rain', 'day'];
    const icons = { sunset: '🌅', night: '🌙', rain: '🌧️', day: '☀️' };
    this.dom.btnAmbience.addEventListener('click', () => {
      sound.ensureContext();
      const currentIdx = ambiences.indexOf(this.settings.ambienceMode || 'sunset');
      const nextMode = ambiences[(currentIdx + 1) % ambiences.length];
      this.settings.ambienceMode = nextMode;
      Storage.saveSettings(this.settings);
      this.applyAmbience(nextMode);
    });

    // Peaceful Music Toggle
    this.dom.btnMusic.addEventListener('click', () => {
      sound.ensureContext();
      this.settings.musicEnabled = !this.settings.musicEnabled;
      Storage.saveSettings(this.settings);
      sound.setMusicEnabled(this.settings.musicEnabled);
      this.dom.musicIcon.textContent = this.settings.musicEnabled ? '🎵' : '🔇';
    });

    // Sound FX Toggle
    this.dom.btnSound.addEventListener('click', () => {
      sound.ensureContext();
      this.settings.soundEnabled = !this.settings.soundEnabled;
      Storage.saveSettings(this.settings);
      sound.setMuted(!this.settings.soundEnabled);
      this.dom.soundIcon.textContent = this.settings.soundEnabled ? '🔔' : '🔕';
    });

    // Close Tree Card
    this.dom.cardClose.addEventListener('click', () => this.closeTreeCard());

    // --- USER REQUESTED INNOVATION: TAP = PURE NURTURE, HOLD = JOURNAL NOTE ---
    this.setupHoldToNurtureInteraction();

    // Harvest Modal Trigger
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

    // Habit Pet Modal
    this.dom.btnHabitOpen.addEventListener('click', () => this.openHabitModal());
    this.dom.btnHabitClose.addEventListener('click', () => this.closeModal(this.dom.modalHabit));

    this.dom.formHabitEdit.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = this.dom.habitInput.value;
      if (newName.trim()) {
        this.habit.name = newName.trim();
        Storage.saveHabit(this.habit);
        this.updateHabitUI();
        sound.playPetChirp();
      }
    });

    this.dom.btnHabitCheckin.addEventListener('click', () => {
      const res = Storage.checkinHabit();
      this.habit = Storage.getHabit();
      this.updateHabitUI();
      sound.playPetChirp();
      if (this.scene) this.scene.triggerPetJump();
      this.dom.btnHabitCheckin.textContent = '🎉 今日已陪伴打卡！';
      this.dom.btnHabitCheckin.style.opacity = '0.7';
    });
  }

  // --- TAP VS HOLD GESTURE ENGINE ---
  setupHoldToNurtureInteraction() {
    const btn = this.dom.btnHoldNurture;
    const fill = this.dom.holdProgressFill;
    const HOLD_DURATION = 480; // 480ms threshold for note recording

    const startHold = (e) => {
      if (!this.selectedTree) return;
      this.isHolding = true;
      this.holdStartTime = Date.now();
      fill.style.transition = 'width 0.48s cubic-bezier(0.2, 0.8, 0.2, 1)';
      fill.style.width = '100%';

      this.holdTimer = setTimeout(() => {
        // LONG PRESS DETECTED!
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

    const endHold = (e) => {
      if (!this.isHolding) return;
      const elapsed = Date.now() - this.holdStartTime;
      this.isHolding = false;
      clearTimeout(this.holdTimer);

      fill.style.transition = 'width 0.15s ease';
      fill.style.width = '0%';

      // SHORT TAP DETECTED (Pure Nurture)!
      if (elapsed < HOLD_DURATION) {
        if (this.selectedTree) {
          const updated = Storage.nurtureTree(this.selectedTree.id, null);
          sound.playSingingBowl(340);
          sound.playWaterDrop();
          if (updated) {
            this.selectedTree = updated;
            this.updateTreeCardContent(updated);
            this.scene.updateTrees(Storage.getTrees());
          }
          // Visual feedback pulse
          btn.style.transform = 'scale(0.96)';
          setTimeout(() => btn.style.transform = '', 180);
        }
      }
    };

    btn.addEventListener('pointerdown', startHold);
    window.addEventListener('pointerup', endHold);
    window.addEventListener('pointercancel', endHold);
  }

  applySettings() {
    this.applyAmbience(this.settings.ambienceMode || 'sunset');
    sound.setMuted(!this.settings.soundEnabled);
    this.dom.soundIcon.textContent = this.settings.soundEnabled ? '🔔' : '🔕';
    this.dom.musicIcon.textContent = this.settings.musicEnabled ? '🎵' : '🔇';
  }

  applyAmbience(mode) {
    const icons = { sunset: '🌅', night: '🌙', rain: '🌧️', day: '☀️' };
    this.dom.ambienceIcon.textContent = icons[mode] || '🌅';
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
        <div class="type-item-name">${type.name}</div>
        <div class="type-item-virtue">${type.virtue}</div>
        <div class="type-item-desc">${type.description}</div>
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

  onPetTapped() {
    sound.playPetChirp();
    if (this.scene) this.scene.triggerPetJump();
    setTimeout(() => this.openHabitModal(), 400);
  }

  updateHabitUI() {
    this.dom.habitNameDisplay.textContent = this.habit.name;
    this.dom.habitStreakCount.textContent = `${this.habit.streak || 0} 天`;
    this.dom.habitInput.value = this.habit.name;
  }

  openHabitModal() {
    this.updateHabitUI();
    const today = new Date().toDateString();
    if (this.habit.lastCheckinDate === today) {
      this.dom.btnHabitCheckin.textContent = '🎉 今日已陪伴打卡！';
      this.dom.btnHabitCheckin.style.opacity = '0.7';
    } else {
      this.dom.btnHabitCheckin.textContent = '🐾 今日習慣打卡！';
      this.dom.btnHabitCheckin.style.opacity = '1.0';
    }
    this.openModal(this.dom.modalHabit);
  }

  // --- VISUAL TREE GALLERY & MIND JOURNEY TIMELINE ---
  openArchiveModal() {
    const rings = Storage.getRings();
    const activeTrees = Storage.getTrees();
    const container = this.dom.ringsContainer;
    container.innerHTML = '';

    // Merge active and harvested trees into visual gallery
    const allItems = [
      ...activeTrees.map(t => ({ ...t, isActive: true })),
      ...rings.map(r => ({ ...r, isActive: false }))
    ];

    if (allItems.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:#7e8e9e; font-size:0.85rem;">目前尚未有任何課題。點擊下方「播種」種下你的第一棵樹。</div>';
    } else {
      allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'archive-tree-card';
        const typeInfo = TREE_TYPES[item.treeType] || TREE_TYPES.oak;

        // Visual icon based on status and growth
        const now = Date.now();
        const days = item.daysElapsed || Math.max(1, Math.round((now - item.plantedAt) / (1000 * 60 * 60 * 24)));
        let icon = '🌱';
        if (!item.isActive) icon = '🌟';
        else if (days >= 7) icon = '🌳';
        else if (days >= 3) icon = '🌿';

        const plantedDateStr = new Date(item.plantedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
        const harvestDateStr = item.harvestedAt ? new Date(item.harvestedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' }) : null;

        // Build journey notes timeline HTML
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
            <div class="tree-visual-icon">${icon}</div>
            <div class="tree-card-info">
              <div class="tree-card-name">${item.title}</div>
              <div class="tree-card-sub">${typeInfo.name} · ${item.isActive ? '島上生長中' : '已釋懷圓滿'} · 歷時 ${days} 天</div>
            </div>
            <div class="tree-card-arrow">❯</div>
          </div>

          <div class="journey-timeline-drawer">
            <!-- Starting Worry -->
            <div class="timeline-step">
              <div class="timeline-step-title">${plantedDateStr} · 播下種子與困擾</div>
              <div class="timeline-step-content">${item.initialWorry || '無記載具體困擾，純粹立下的心靈課題。'}</div>
            </div>

            <!-- Notes Journey -->
            ${notesTimelineHTML}

            <!-- Harvest Insight if completed -->
            ${!item.isActive ? `
              <div class="timeline-step">
                <div class="timeline-step-title" style="color:var(--accent-gold);">${harvestDateStr} · 破局頓悟</div>
                <div class="timeline-step-content" style="color:#fff1c4; font-weight:500;">“ ${item.insight} ”</div>
              </div>
            ` : ''}
          </div>
        `;

        // Click to expand / collapse full journey
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
