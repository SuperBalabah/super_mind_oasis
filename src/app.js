// V3.3 Main Application Controller for Super Mind Oasis (i18n Bilingual Enabled)
import { Scene3D } from './scene3d.js';
import { Storage, TREE_TYPES, PET_SPECIES, GistSync } from './storage.js';
import { sound } from './audio.js';
import { i18n } from './i18n.js';

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
      btnLang: document.getElementById('btn-lang'),
      langIndicator: document.getElementById('lang-indicator'),
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
      labelHoldNurture: document.getElementById('label-hold-nurture'),
      labelHoldSub: document.getElementById('label-hold-sub'),
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
    this.applyLanguage();
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

  applyLanguage() {
    const lang = i18n.lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-TW';

    // 1. Language Toggle Button Badge & Title
    if (this.dom.langIndicator) {
      this.dom.langIndicator.textContent = lang === 'en' ? 'EN' : '中';
    }
    if (this.dom.btnLang) {
      this.dom.btnLang.title = i18n.t('btn_lang_title');
    }

    // 2. Top Controls & Hint
    if (this.dom.btnAmbience) this.dom.btnAmbience.title = i18n.t('btn_ambience_title');
    if (this.dom.btnMusic) this.dom.btnMusic.title = i18n.t('btn_music_title');
    if (this.dom.btnSound) this.dom.btnSound.title = i18n.t('btn_sound_title');
    this.updateSyncButtonStatus();
    if (this.dom.hint) this.dom.hint.textContent = i18n.t('center_hint');

    // 3. Bottom Navigation
    if (this.dom.btnPlantOpen) this.dom.btnPlantOpen.title = i18n.t('btn_plant_title');
    if (this.dom.btnArchiveOpen) this.dom.btnArchiveOpen.title = i18n.t('btn_archive_title');
    if (this.dom.btnHabitOpen) this.dom.btnHabitOpen.title = i18n.t('btn_habit_title');

    // 4. Tree Inspection Card Action Labels
    const daysLabel = document.getElementById('card-tree-days-label');
    if (daysLabel) daysLabel.textContent = i18n.t('card_stats_days_prefix');
    const nurtureLabel = document.getElementById('card-tree-nurture-label');
    if (nurtureLabel) nurtureLabel.textContent = i18n.t('card_stats_nurture_prefix');
    if (this.dom.labelHoldNurture) this.dom.labelHoldNurture.textContent = i18n.t('btn_hold_nurture_label');
    if (this.dom.labelHoldSub) this.dom.labelHoldSub.textContent = i18n.t('btn_hold_nurture_sub');
    if (this.dom.btnTreeHarvest) this.dom.btnTreeHarvest.textContent = i18n.t('btn_tree_harvest');
    if (this.dom.btnTreeDelete && this.dom.btnTreeDelete.dataset.confirming !== 'true') {
      this.dom.btnTreeDelete.textContent = i18n.t('btn_tree_delete');
    }

    // 5. Modal Static Elements
    // Modal Plant
    if (this.dom.modalPlant) {
      const title = this.dom.modalPlant.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('plant_modal_title');
      const desc = this.dom.modalPlant.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('plant_modal_desc');
      const labels = this.dom.modalPlant.querySelectorAll('.field-label');
      if (labels[0]) labels[0].textContent = i18n.t('plant_field_title_label');
      if (labels[1]) labels[1].textContent = i18n.t('plant_field_worry_label');
      if (labels[2]) labels[2].textContent = i18n.t('plant_field_tree_label');
      if (this.dom.plantTitle) this.dom.plantTitle.placeholder = i18n.t('plant_field_title_placeholder');
      if (this.dom.plantWorry) this.dom.plantWorry.placeholder = i18n.t('plant_field_worry_placeholder');
      if (this.dom.btnPlantCancel) this.dom.btnPlantCancel.textContent = i18n.t('btn_plant_cancel');
      const submitBtn = this.dom.modalPlant.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = i18n.t('btn_plant_submit');
    }

    // Modal Note
    if (this.dom.modalNote) {
      const title = this.dom.modalNote.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('note_modal_title');
      const desc = this.dom.modalNote.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('note_modal_desc');
      if (this.dom.noteText) this.dom.noteText.placeholder = i18n.t('note_field_placeholder');
      if (this.dom.btnNoteCancel) this.dom.btnNoteCancel.textContent = i18n.t('btn_note_cancel');
      const submitBtn = this.dom.modalNote.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = i18n.t('btn_note_submit');
    }

    // Modal Harvest
    if (this.dom.modalHarvest) {
      const title = this.dom.modalHarvest.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('harvest_modal_title');
      const desc = this.dom.modalHarvest.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('harvest_modal_desc');
      const label = this.dom.modalHarvest.querySelector('.field-label');
      if (label) label.textContent = i18n.t('harvest_field_label');
      if (this.dom.harvestInsight) this.dom.harvestInsight.placeholder = i18n.t('harvest_field_placeholder');
      if (this.dom.btnHarvestCancel) this.dom.btnHarvestCancel.textContent = i18n.t('btn_harvest_cancel');
      const submitBtn = this.dom.modalHarvest.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = i18n.t('btn_harvest_submit');
    }

    // Modal Archive
    if (this.dom.modalArchive) {
      const title = this.dom.modalArchive.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('archive_modal_title');
      const desc = this.dom.modalArchive.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('archive_modal_desc');
      if (this.dom.btnArchiveClose) this.dom.btnArchiveClose.textContent = i18n.t('btn_archive_close');
    }

    // Modal Adopt Pet
    if (this.dom.modalAdopt) {
      const title = this.dom.modalAdopt.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('adopt_modal_title');
      const desc = this.dom.modalAdopt.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('adopt_modal_desc');
      const labels = this.dom.modalAdopt.querySelectorAll('.field-label');
      if (labels[0]) labels[0].textContent = i18n.t('adopt_field_species_label');
      if (labels[1]) labels[1].textContent = i18n.t('adopt_field_name_label');
      if (labels[2]) labels[2].textContent = i18n.t('adopt_field_habit_label');
      if (this.dom.btnAdoptCancel) this.dom.btnAdoptCancel.textContent = i18n.t('btn_adopt_cancel');
      const submitBtn = this.dom.modalAdopt.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = i18n.t('btn_adopt_submit');
    }

    // Modal Pet Detail
    if (this.dom.modalPetDetail) {
      const habitHdr = this.dom.modalPetDetail.querySelector('#pet-detail-habit-label');
      if (habitHdr) habitHdr.textContent = i18n.t('pet_detail_habit_label');
      const careHdr = this.dom.modalPetDetail.querySelector('#pet-detail-care-label');
      if (careHdr) careHdr.textContent = i18n.t('pet_detail_care_prefix');
      if (this.dom.btnPetReleaseAction && this.dom.btnPetReleaseAction.dataset.confirming !== 'true') {
        this.dom.btnPetReleaseAction.textContent = i18n.t('btn_pet_release');
      }
      if (this.dom.btnPetDetailClose) this.dom.btnPetDetailClose.textContent = i18n.t('btn_pet_detail_close');
    }

    // Modal Sync
    if (this.dom.modalSync) {
      const title = this.dom.modalSync.querySelector('.modal-header-title');
      if (title) title.textContent = i18n.t('sync_modal_title');
      const desc = this.dom.modalSync.querySelector('.modal-header-desc');
      if (desc) desc.textContent = i18n.t('sync_modal_desc');
      const switchTitle = this.dom.modalSync.querySelector('.sync-switch-title');
      if (switchTitle) switchTitle.textContent = i18n.t('sync_switch_title');
      const switchSub = this.dom.modalSync.querySelector('.sync-switch-sub');
      if (switchSub) switchSub.textContent = i18n.t('sync_switch_sub');
      const syncLabels = this.dom.modalSync.querySelectorAll('.field-label');
      if (syncLabels[0]) syncLabels[0].textContent = i18n.t('sync_token_label');
      if (syncLabels[1]) syncLabels[1].textContent = i18n.t('sync_gist_label');
      const tokenLink = this.dom.modalSync.querySelector('.sync-help-link');
      if (tokenLink) tokenLink.textContent = i18n.t('sync_token_link');
      const hints = this.dom.modalSync.querySelectorAll('.field-hint-text');
      if (hints[0]) hints[0].textContent = i18n.t('sync_token_hint');
      if (hints[1]) hints[1].textContent = i18n.t('sync_gist_hint');
      if (this.dom.btnCreateGist) this.dom.btnCreateGist.textContent = i18n.t('btn_create_gist');
      if (this.dom.btnManualPush) {
        const span = this.dom.btnManualPush.querySelector('span');
        if (span) span.textContent = i18n.t('btn_manual_push');
      }
      if (this.dom.btnManualPull) {
        const span = this.dom.btnManualPull.querySelector('span');
        if (span) span.textContent = i18n.t('btn_manual_pull');
      }
      if (this.dom.btnSyncCancel) this.dom.btnSyncCancel.textContent = i18n.t('btn_sync_cancel');
      const saveBtn = this.dom.formSyncSettings ? this.dom.formSyncSettings.querySelector('button[type="submit"]') : null;
      if (saveBtn) saveBtn.textContent = i18n.t('btn_sync_save');
      this.updateSyncTimeDisplay();
    }

    // 6. Refresh Dynamic Lists
    this.renderTreePicker();
    this.renderPetSpeciesPicker();
    this.renderTopPetsWidget();
    if (this.selectedTree) {
      this.updateTreeCardContent(this.selectedTree);
    }
    if (this.currentInspectingPet && this.dom.modalPetDetail && this.dom.modalPetDetail.classList.contains('active')) {
      this.openPetDetailModal(this.currentInspectingPet);
    }
    if (this.dom.modalArchive && this.dom.modalArchive.classList.contains('active')) {
      this.renderRings();
    }
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

    // Language Toggle
    if (this.dom.btnLang) {
      this.dom.btnLang.addEventListener('click', () => {
        sound.ensureContext();
        sound.playWaterDrop();
        i18n.toggleLanguage();
        this.applyLanguage();
        this.showToast(i18n.t('toast_switched_lang'));
      });
    }

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
          btn.textContent = i18n.t('btn_tree_delete');
          btn.style.color = '';
          btn.style.borderColor = '';

          Storage.deleteTree(tree.id);
          this.closeTreeCard();
          this.selectedTree = null;
          this.scene.updateTrees(Storage.getTrees());
          sound.playWaterDrop();
          sound.ensureContext();
          this.showToast(i18n.t('toast_deleted_tree', { title: tree.title }));
          this.scheduleCloudPush();
        } else {
          btn.dataset.confirming = 'true';
          btn.textContent = i18n.t('btn_tree_delete_confirm');
          btn.style.color = '#ff8080';
          btn.style.borderColor = 'rgba(255, 128, 128, 0.5)';
          sound.playWaterDrop();

          clearTimeout(treeDeleteTimer);
          treeDeleteTimer = setTimeout(() => {
            if (btn) {
              btn.dataset.confirming = 'false';
              btn.textContent = i18n.t('btn_tree_delete');
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
      this.showToast(i18n.t('toast_adopted_pet', { name: newPet.name }));
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
      const info = i18n.getTreeInfo(type.id);
      const item = document.createElement('div');
      item.className = `tree-type-item ${type.id === this.selectedTreeType ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="tree-preview-svg">${type.svgIcon}</div>
        <div class="tree-type-text-wrap">
          <div class="type-item-name">${info.name}</div>
          <div class="type-item-virtue">${info.virtue}</div>
          <div class="type-item-desc">${info.description}</div>
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

  updateTreeCardContent(rawTree) {
    const tree = i18n.getLocalizedTree(rawTree);
    const typeInfo = i18n.getTreeInfo(tree.treeType);
    const now = Date.now();
    const days = Math.max(0, Math.floor((now - tree.plantedAt) / (1000 * 60 * 60 * 24)));

    this.dom.cardTreeType.textContent = `${typeInfo.name} · ${typeInfo.virtue}`;
    this.dom.cardTreeTitle.textContent = tree.title;
    this.dom.cardTreeDays.textContent = days === 0 ? i18n.t('card_days_today') : i18n.t('card_days_rooted', { days });
    this.dom.cardTreeNurture.textContent = i18n.t('card_times', { count: tree.nurtureCount || 0 });
    this.dom.cardTreeWorry.textContent = tree.initialWorry || i18n.t('card_no_worry');
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
      const info = i18n.getPetSpeciesInfo(sp.id);
      const opt = document.createElement('div');
      opt.className = `pet-species-option ${sp.id === this.selectedPetSpecies ? 'selected' : ''}`;
      opt.textContent = info.name;
      opt.addEventListener('click', () => {
        container.querySelectorAll('.pet-species-option').forEach(c => c.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedPetSpecies = sp.id;
        this.dom.adoptPetName.placeholder = i18n.t('adopt_field_name_placeholder_prefix', { species: info.name });
        this.dom.adoptPetHabit.placeholder = i18n.t('adopt_field_habit_placeholder_prefix', { habit: info.defaultHabit });
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

    pets.forEach(rawPet => {
      const pet = i18n.getLocalizedPet(rawPet);
      const sp = PET_SPECIES[pet.species] || PET_SPECIES.sheep;
      const pill = document.createElement('div');
      pill.className = 'top-pet-pill';
      pill.title = i18n.lang === 'en' ? `View [${pet.name}] details or release` : `點擊查看【${pet.name}】詳情或放生`;
      pill.innerHTML = `
        <div class="top-pet-avatar">${sp.svgAvatar || ''}</div>
        <span class="top-pet-name">${pet.name}</span>
      `;
      pill.addEventListener('click', () => {
        sound.playPetChirp();
        this.openPetDetailModal(rawPet);
      });
      container.appendChild(pill);
    });
  }

  openAdoptModal() {
    this.renderPetSpeciesPicker();
    this.dom.adoptPetName.value = '';
    this.dom.adoptPetHabit.value = '';
    const info = i18n.getPetSpeciesInfo(this.selectedPetSpecies);
    this.dom.adoptPetName.placeholder = i18n.t('adopt_field_name_placeholder_prefix', { species: info.name });
    this.dom.adoptPetHabit.placeholder = i18n.t('adopt_field_habit_placeholder_prefix', { habit: info.defaultHabit });
    this.openModal(this.dom.modalAdopt);
  }

  openPetDetailModal(rawPet) {
    this.currentInspectingPet = rawPet;
    const pet = i18n.getLocalizedPet(rawPet);
    const sp = PET_SPECIES[pet.species] || PET_SPECIES.sheep;
    const info = i18n.getPetSpeciesInfo(pet.species);
    this.dom.petDetailAvatar.innerHTML = sp.svgAvatar || '';
    this.dom.petDetailName.textContent = pet.name;
    this.dom.petDetailSpecies.textContent = info.name;
    this.dom.petDetailHabit.textContent = pet.habitTitle;
    this.dom.petDetailCare.textContent = i18n.t('card_times', { count: pet.careCount || 1 });

    // Reset release button confirmation state
    if (this.dom.btnPetReleaseAction) {
      this.dom.btnPetReleaseAction.dataset.confirming = 'false';
      this.dom.btnPetReleaseAction.textContent = i18n.t('btn_pet_release');
      this.dom.btnPetReleaseAction.style.color = '';
      this.dom.btnPetReleaseAction.style.borderColor = '';
    }

    this.openModal(this.dom.modalPetDetail);
  }

  releaseCurrentPet() {
    sound.ensureContext();
    if (!this.currentInspectingPet) return;
    const rawPet = this.currentInspectingPet;
    const pet = i18n.getLocalizedPet(rawPet);
    const btn = this.dom.btnPetReleaseAction;

    if (btn && btn.dataset.confirming === 'true') {
      clearTimeout(this.petReleaseTimer);
      btn.dataset.confirming = 'false';
      btn.textContent = i18n.t('btn_pet_release');
      btn.style.color = '';
      btn.style.borderColor = '';

      Storage.deletePet(rawPet.id);
      this.scene.updatePets(Storage.getPets());
      this.renderTopPetsWidget();
      this.closeModal(this.dom.modalPetDetail);
      sound.playWaterDrop();
      sound.ensureContext();
      this.showToast(i18n.t('toast_released_pet', { name: pet.name }));
      this.currentInspectingPet = null;
      this.scheduleCloudPush();
    } else if (btn) {
      btn.dataset.confirming = 'true';
      btn.textContent = i18n.t('btn_pet_release_confirm');
      btn.style.color = '#ff8080';
      btn.style.borderColor = 'rgba(255, 128, 128, 0.5)';
      sound.playWaterDrop();

      clearTimeout(this.petReleaseTimer);
      this.petReleaseTimer = setTimeout(() => {
        if (btn) {
          btn.dataset.confirming = 'false';
          btn.textContent = i18n.t('btn_pet_release');
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
  onPetFed(rawPet) {
    Storage.nurturePet(rawPet.id);
    const pet = i18n.getLocalizedPet(rawPet);
    sound.playFeedingNibble();
    try {
      if ('vibrate' in navigator) navigator.vibrate([30, 45, 30]);
    } catch (e) {}
    this.showToast(i18n.t('toast_cared_pet', { name: pet.name, habit: pet.habitTitle }));
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
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#7e8e9e; font-size:0.85rem;">${i18n.t('archive_empty')}</div>`;
    } else {
      allItems.forEach(rawItem => {
        const item = rawItem.isActive ? i18n.getLocalizedTree(rawItem) : i18n.getLocalizedRing(rawItem);
        const card = document.createElement('div');
        card.className = 'archive-tree-card';
        const typeInfo = i18n.getTreeInfo(item.treeType);
        const locale = i18n.lang === 'en' ? 'en-US' : 'zh-TW';

        const now = Date.now();
        const days = item.daysElapsed || Math.max(1, Math.round((now - item.plantedAt) / (1000 * 60 * 60 * 24)));
        const plantedDateStr = new Date(item.plantedAt).toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
        const harvestDateStr = item.harvestedAt ? new Date(item.harvestedAt).toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' }) : null;

        let notesTimelineHTML = '';
        if (item.notes && item.notes.length > 0) {
          notesTimelineHTML = item.notes.map(n => {
            const dateStr = new Date(n.timestamp).toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
            return `
              <div class="timeline-step">
                <div class="timeline-step-title">${dateStr} · ${i18n.lang === 'en' ? 'Reflection' : '沿途感悟'}</div>
                <div class="timeline-step-content">${n.text}</div>
              </div>
            `;
          }).join('');
        } else {
          notesTimelineHTML = `
            <div class="timeline-step">
              <div class="timeline-step-title">${i18n.lang === 'en' ? 'Quiet Growth' : '生長沉澱中'}</div>
              <div class="timeline-step-content" style="font-style:italic; color:#8ea0b0;">${i18n.t('archive_step_growing')}</div>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="tree-card-top-row">
            <div class="tree-visual-illustration">${(TREE_TYPES[item.treeType] || TREE_TYPES.oak).svgIcon}</div>
            <div class="tree-card-info">
              <div class="tree-card-name">${item.title}</div>
              <div class="tree-card-sub">${typeInfo.name} · ${item.isActive ? i18n.t('archive_status_growing') : i18n.t('archive_status_harvested')} · ${i18n.t('card_days_rooted', { days })}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${!item.isActive ? `
                <button type="button" class="btn-ghost-danger btn-delete-ring" data-id="${rawItem.id}" style="padding:4px 8px; font-size:0.7rem;" title="${i18n.t('btn_delete_ring')}">${i18n.t('btn_delete_ring')}</button>
              ` : ''}
              <div class="tree-card-arrow">❯</div>
            </div>
          </div>

          <div class="journey-timeline-drawer">
            <div class="timeline-step">
              <div class="timeline-step-title">${plantedDateStr} · ${i18n.t('archive_step_planted')}</div>
              <div class="timeline-step-content">${item.initialWorry || i18n.t('card_no_worry')}</div>
            </div>

            ${notesTimelineHTML}

            ${!item.isActive ? `
              <div class="timeline-step">
                <div class="timeline-step-title" style="color:var(--accent-gold);">${harvestDateStr} · ${i18n.t('archive_step_harvest')}</div>
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
              Storage.deleteRing(rawItem.id);
              sound.playWaterDrop();
              sound.ensureContext();
              this.openArchiveModal();
              this.showToast(i18n.t('toast_deleted_ring', { title: item.title }));
              this.scheduleCloudPush();
            } else {
              deleteRingBtn.dataset.confirming = 'true';
              deleteRingBtn.textContent = i18n.t('btn_delete_ring_confirm');
              deleteRingBtn.style.color = '#ff7070';
              deleteRingBtn.style.borderColor = 'rgba(255, 112, 112, 0.5)';
              sound.playWaterDrop();

              clearTimeout(ringDeleteTimer);
              ringDeleteTimer = setTimeout(() => {
                if (deleteRingBtn) {
                  deleteRingBtn.dataset.confirming = 'false';
                  deleteRingBtn.textContent = i18n.t('btn_delete_ring');
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
    this.dom.btnSync.title = isConfigured ? i18n.t('btn_sync_title_connected') : i18n.t('btn_sync_title_disconnected');
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
      this.dom.syncLastTimeText.textContent = i18n.t('sync_last_never');
      return;
    }
    const d = new Date(this.syncConfig.lastSyncTime);
    const locale = i18n.lang === 'en' ? 'en-US' : 'zh-TW';
    const dateStr = d.toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
    const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    this.dom.syncLastTimeText.textContent = `${i18n.t('sync_last_prefix')}${dateStr} ${timeStr}`;
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
    this.showToast(this.syncConfig.enabled ? i18n.t('toast_sync_saved') : i18n.t('toast_sync_local_saved'));

    if (this.syncConfig.enabled && this.syncConfig.autoSync) {
      this.scheduleCloudPush();
    }
  }

  async onCreateGist() {
    const token = this.dom.syncTokenInput.value.trim();
    if (!token) {
      this.showToast(i18n.t('toast_need_token'));
      this.dom.syncTokenInput.focus();
      return;
    }

    const btn = this.dom.btnCreateGist;
    btn.textContent = i18n.t('toast_creating_gist');
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
      this.showToast(i18n.t('toast_gist_success'));
    } catch (err) {
      this.showToast(i18n.t('toast_gist_fail', { msg: err.message }));
    } finally {
      btn.textContent = i18n.t('btn_create_gist');
      btn.disabled = false;
    }
  }

  async onManualPush() {
    const token = this.dom.syncTokenInput.value.trim();
    const gistId = this.dom.syncGistIdInput.value.trim();
    if (!token || !gistId) {
      this.showToast(i18n.t('toast_need_token_and_gist'));
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
      this.showToast(i18n.t('toast_need_token_and_gist'));
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
        this.showToast(i18n.t('toast_push_success'));
      }
    } catch (err) {
      console.error('Cloud Push Error:', err);
      if (!silent) {
        this.showToast(i18n.t('toast_push_fail', { msg: err.message }));
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
            this.showToast(i18n.t('toast_pull_success'));
          }
        }
      }
    } catch (err) {
      console.error('Cloud Pull Error:', err);
      if (!silent) {
        this.showToast(i18n.t('toast_pull_fail', { msg: err.message }));
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
