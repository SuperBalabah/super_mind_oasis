// Non-anxiety, Organic Habit Care Storage for Super Mind Oasis
const STORAGE_KEY_TREES = 'super_mind_oasis_trees_v3';
const STORAGE_KEY_RINGS = 'super_mind_oasis_rings_v3';
const STORAGE_KEY_SETTINGS = 'super_mind_oasis_settings_v3';
const STORAGE_KEY_PETS = 'super_mind_oasis_pets_v3';

export const TREE_TYPES = {
  oak: {
    id: 'oak',
    name: '勇氣之橡',
    virtue: '勇氣與堅韌',
    description: '深根固柢，面對外界風雨依然巍然挺立。象徵直面困難與承擔的勇氣。',
    foliageColor: '#3c8252',
    autumnColor: '#b86d29',
    trunkColor: '#6d4c38',
    glowColor: '#7dd395',
    svgIcon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none"><path d="M19 36V24M21 36V24" stroke="#6d4c38" stroke-width="3" stroke-linecap="round"/><path d="M20 7C14 7 11 11 11 16C8 17 7 21 9 24C11 27 16 27 20 27C24 27 29 27 31 24C33 21 32 17 29 16C29 11 26 7 20 7Z" fill="#3c8252" stroke="#4da066" stroke-width="1.5"/></svg>`
  },
  ginkgo: {
    id: 'ginkgo',
    name: '通透之杏',
    virtue: '智慧與轉念',
    description: '扇葉澄黃，隨風起舞。象徵看破執念、心境豁然開朗的通透。',
    foliageColor: '#e5b839',
    autumnColor: '#f7d046',
    trunkColor: '#735742',
    glowColor: '#f5d547',
    svgIcon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none"><path d="M19 36V23M21 36V23" stroke="#735742" stroke-width="2.5" stroke-linecap="round"/><path d="M20 8C13 8 9 13 10 18C10 23 15 25 20 25C25 25 30 23 30 18C31 13 27 8 20 8Z" fill="#e5b839" stroke="#fce368" stroke-width="1.5"/><path d="M14 14C17 11 23 11 26 14" stroke="#d6a728" stroke-width="1.2" stroke-linecap="round"/></svg>`
  },
  birch: {
    id: 'birch',
    name: '沈思白樺',
    virtue: '平靜與省察',
    description: '白幹銀枝，昂首向天。象徵在混亂喧囂中回歸自我內心的寧靜。',
    foliageColor: '#5fa874',
    autumnColor: '#c5b85a',
    trunkColor: '#d6d1c4',
    glowColor: '#a4d9ba',
    svgIcon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none"><path d="M19.5 36V18M20.5 36V18" stroke="#d6d1c4" stroke-width="2.5" stroke-linecap="round"/><path d="M18.5 28H21.5M18.5 22H21.5" stroke="#5a524a" stroke-width="1.2"/><path d="M20 6C15 6 13 11 13 16C13 21 16 23 20 23C24 23 27 21 27 16C27 11 25 6 20 6Z" fill="#5fa874" stroke="#79bf8c" stroke-width="1.5"/></svg>`
  },
  jacaranda: {
    id: 'jacaranda',
    name: '釋懷藍花楹',
    virtue: '溫柔與放下',
    description: '紫藍花瀑，如夢似幻。象徵與過去的不完美和解、溫柔釋放沉重的包袱。',
    foliageColor: '#8460b5',
    autumnColor: '#a685d4',
    trunkColor: '#5c483a',
    glowColor: '#caa6f7',
    svgIcon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none"><path d="M19 36V22M21 36V22" stroke="#5c483a" stroke-width="2.5" stroke-linecap="round"/><path d="M20 7C14 7 10 12 11 17C8 20 10 25 15 25C17 26 23 26 25 25C30 25 32 20 29 17C30 12 26 7 20 7Z" fill="#8460b5" stroke="#a481d4" stroke-width="1.5"/><circle cx="16" cy="15" r="1.5" fill="#f0dcfc"/><circle cx="24" cy="18" r="1.5" fill="#f0dcfc"/><circle cx="20" cy="12" r="1.5" fill="#f0dcfc"/></svg>`
  }
};

export const PET_SPECIES = {
  sheep: {
    id: 'sheep',
    name: '雲朵綿羊',
    description: '軟綿綿的白雲小羊，性情溫馴，喜歡在草地安靜咀嚼放空。',
    defaultHabit: '每日深呼吸靜坐 5 分鐘',
    svgAvatar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="7.5" fill="#f0ede6"/><circle cx="9" cy="11.5" r="1" fill="#222"/><circle cx="15" cy="11.5" r="1" fill="#222"/><path d="M11 14.5c.5.5 1.5.5 2 0" stroke="#ff9999" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="5.5" cy="11" rx="2" ry="1.5" fill="#e8dfd5"/><ellipse cx="18.5" cy="11" rx="2" ry="1.5" fill="#e8dfd5"/></svg>`
  },
  fox: {
    id: 'fox',
    name: '星光靈狐',
    description: '機敏而靈動的小狐狸，披著夕陽的赤橘毛色，在島上守護你的習慣。',
    defaultHabit: '每日睡前閱讀 15 分鐘',
    svgAvatar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 18L6 8h12l-6 10z" fill="#d96628"/><path d="M6 8L3.5 3.5 8 6.5 6 8zM18 8l2.5-4.5L16 6.5 18 8z" fill="#b84d16"/><polygon points="12,18 9,13 15,13" fill="#ffffff"/><circle cx="9.5" cy="10" r="1" fill="#222"/><circle cx="14.5" cy="10" r="1" fill="#222"/><circle cx="12" cy="17" r="1" fill="#111"/></svg>`
  },
  shiba: {
    id: 'shiba',
    name: '暖陽柴犬',
    description: '充滿元氣與陪伴感的忠誠柴犬，總是笑瞇瞇地迎接著你的每一次餵食。',
    defaultHabit: '每日晨間慢跑 2 公里',
    svgAvatar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="7.5" fill="#c48a42"/><path d="M6 7L4 3l4.5 2.5L6 7zM18 7l2-4-4.5 2.5L18 7z" fill="#a46e2e"/><path d="M8 12c1.5 2.5 6.5 2.5 8 0-1 4-7 4-8 0z" fill="#ffffff"/><circle cx="9" cy="8.5" r="0.8" fill="#ffffff"/><circle cx="15" cy="8.5" r="0.8" fill="#ffffff"/><circle cx="9.5" cy="11" r="1" fill="#222"/><circle cx="14.5" cy="11" r="1" fill="#222"/><ellipse cx="12" cy="13.5" rx="1.2" ry="0.8" fill="#222"/></svg>`
  },
  cat: {
    id: 'cat',
    name: '玄夜靈貓',
    description: '優雅而深沉的黑貓，帶著一雙清澈琉璃眼，安靜依偎在帳篷與營火旁。',
    defaultHabit: '每日喝足 2000cc 溫水',
    svgAvatar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="13" r="7" fill="#22272e"/><polygon points="6,9 4,3 9,6" fill="#22272e"/><polygon points="18,9 20,3 15,6" fill="#22272e"/><polygon points="5.5,5.5 5,4 7,5" fill="#ffb3ba"/><polygon points="18.5,5.5 19,4 17,5" fill="#ffb3ba"/><ellipse cx="9" cy="12" rx="1.2" ry="1.6" fill="#5ce69e"/><ellipse cx="15" cy="12" rx="1.2" ry="1.6" fill="#5ce69e"/><line x1="9" y1="10.8" x2="9" y2="13.2" stroke="#111" stroke-width="0.8"/><line x1="15" y1="10.8" x2="15" y2="13.2" stroke="#111" stroke-width="0.8"/><circle cx="12" cy="14.5" r="0.6" fill="#ffb3ba"/></svg>`
  },
  deer: {
    id: 'deer',
    name: '森林小鹿',
    description: '踏著輕盈步伐的初生林鹿，象徵著輕柔而堅定的持續力量。',
    defaultHabit: '每日寫下一件感恩小事',
    svgAvatar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="13" r="6.8" fill="#9e6938"/><path d="M6 7l-2-3 3 1.5M18 7l2-3-3 1.5" stroke="#68421d" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="9" cy="12" rx="1.2" ry="1.5" fill="#222"/><ellipse cx="15" cy="12" rx="1.2" ry="1.5" fill="#222"/><circle cx="9.3" cy="11.5" r="0.4" fill="#fff"/><circle cx="15.3" cy="11.5" r="0.4" fill="#fff"/><ellipse cx="12" cy="15.5" rx="2" ry="1.2" fill="#e6d5c3"/><ellipse cx="12" cy="15" rx="0.8" ry="0.5" fill="#222"/></svg>`
  }
};

const SAFE_TREE_SPOTS = [
  { x: 0.25, z: 0.95 },
  { x: 1.55, z: 0.65 },
  { x: 1.75, z: -0.65 },
  { x: 0.85, z: -1.65 },
  { x: -0.25, z: 1.95 },
  { x: 1.35, z: 1.85 },
  { x: 2.25, z: 0.15 },
  { x: -1.75, z: -1.65 }
];

const DEFAULT_INITIAL_TREE = {
  id: 'seed_init_01',
  title: '學會給自己喘息的空間',
  initialWorry: '總是害怕落後他人，習慣把行程填滿，內心經常處於緊繃的背景噪音中。',
  treeType: 'birch',
  plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 4.2,
  status: 'growing',
  nurtureCount: 3,
  lastNurturedAt: Date.now() - 1000 * 60 * 60 * 8,
  position: SAFE_TREE_SPOTS[0],
  notes: [
    {
      id: 'n1',
      timestamp: Date.now() - 1000 * 60 * 60 * 72,
      text: '今天試著在午休時什麼都不做，閉目聽風聲五分鐘，胸口的緊繃感放鬆了一點點。'
    },
    {
      id: 'n2',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      text: '拒絕了一場不必要的社交聚會，給自己泡了杯熱茶，發現世界並沒有因為我說不而崩塌。'
    }
  ]
};

const DEFAULT_INITIAL_RING = {
  id: 'ring_init_01',
  title: '直面未知的焦慮',
  treeType: 'oak',
  plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 32,
  harvestedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  daysElapsed: 30,
  nurtureCount: 8,
  initialWorry: '對於未來的不確定性感到莫名的惶恐，常常深夜失眠。',
  insight: '我無法掌控明天會發生什麼，但我永遠能掌控當下呼吸的深度與面對難題的姿態。把注意力收回眼前的每一步，恐懼自然失去力量。',
  ringColor: '#3c8252',
  notes: [
    {
      id: 'rn1',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 25,
      text: '第一週：心裡還是很慌，但開始把擔憂寫在紙上分類，發現八成的事情都不會發生。'
    },
    {
      id: 'rn2',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
      text: '第二週：學會了專注在今天能完成的三件微小任務上。'
    }
  ]
};

// No rigid streaks! Pure accumulation of love and habit practice
const DEFAULT_INITIAL_PETS = [
  {
    id: 'pet_init_01',
    species: 'sheep',
    name: '白雲綿羊',
    habitTitle: '每日深呼吸靜坐 5 分鐘',
    careCount: 5,
    lastNurturedAt: Date.now() - 3600000
  },
  {
    id: 'pet_init_02',
    species: 'fox',
    name: '小靈狐',
    habitTitle: '每日睡前閱讀 15 分鐘',
    careCount: 8,
    lastNurturedAt: Date.now() - 7200000
  }
];

export const Storage = {
  getTrees() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TREES);
      if (data === null) {
        const initial = [DEFAULT_INITIAL_TREE];
        this.saveTrees(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  deleteTree(treeId) {
    let trees = this.getTrees();
    trees = trees.filter(t => t.id !== treeId);
    this.saveTrees(trees);
    return trees;
  },

  saveTrees(trees) {
    try {
      localStorage.setItem(STORAGE_KEY_TREES, JSON.stringify(trees));
    } catch (e) {}
  },

  addTree(treeData) {
    const trees = this.getTrees();
    const newTree = {
      id: 'tree_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: treeData.title.trim(),
      initialWorry: treeData.initialWorry ? treeData.initialWorry.trim() : '',
      treeType: treeData.treeType || 'oak',
      plantedAt: Date.now(),
      status: 'growing',
      nurtureCount: 0,
      lastNurturedAt: Date.now(),
      position: this.findFreeSpot(trees),
      notes: []
    };
    trees.push(newTree);
    this.saveTrees(trees);
    return newTree;
  },

  nurtureTree(treeId, noteText = null) {
    const trees = this.getTrees();
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
      tree.nurtureCount = (tree.nurtureCount || 0) + 1;
      tree.lastNurturedAt = Date.now();
      if (!tree.notes) tree.notes = [];

      if (noteText && noteText.trim()) {
        tree.notes.push({
          id: 'note_' + Date.now(),
          timestamp: Date.now(),
          text: noteText.trim()
        });
      }
      this.saveTrees(trees);
      return tree;
    }
    return null;
  },

  harvestTree(treeId, insightText) {
    const trees = this.getTrees();
    const treeIdx = trees.findIndex(t => t.id === treeId);
    if (treeIdx === -1) return null;

    const tree = trees[treeIdx];
    const now = Date.now();
    const daysElapsed = Math.max(1, Math.round((now - tree.plantedAt) / (1000 * 60 * 60 * 24)));
    const typeInfo = TREE_TYPES[tree.treeType] || TREE_TYPES.oak;

    const ring = {
      id: 'ring_' + Date.now(),
      treeId: tree.id,
      title: tree.title,
      treeType: tree.treeType,
      plantedAt: tree.plantedAt,
      harvestedAt: now,
      daysElapsed,
      nurtureCount: tree.nurtureCount || 0,
      initialWorry: tree.initialWorry,
      insight: insightText.trim(),
      notes: tree.notes || [],
      ringColor: typeInfo.foliageColor
    };

    trees.splice(treeIdx, 1);
    this.saveTrees(trees);

    const rings = this.getRings();
    rings.unshift(ring);
    this.saveRings(rings);

    return ring;
  },

  getRings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_RINGS);
      if (data === null) {
        const initial = [DEFAULT_INITIAL_RING];
        this.saveRings(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  deleteRing(ringId) {
    let rings = this.getRings();
    rings = rings.filter(r => r.id !== ringId);
    this.saveRings(rings);
    return rings;
  },

  saveRings(rings) {
    try {
      localStorage.setItem(STORAGE_KEY_RINGS, JSON.stringify(rings));
    } catch (e) {}
  },

  // --- ORGANIC ZERO-PRESSURE HABIT CARE ---
  getPets() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PETS);
      if (data === null) {
        this.savePets(DEFAULT_INITIAL_PETS);
        return DEFAULT_INITIAL_PETS;
      }
      const list = JSON.parse(data);
      let migrated = false;
      list.forEach(p => {
        if (p.careCount === undefined) {
          p.careCount = p.streak || 1;
          migrated = true;
        }
        if ('streak' in p) {
          delete p.streak;
          migrated = true;
        }
        if ('lastCheckinDate' in p) {
          delete p.lastCheckinDate;
          migrated = true;
        }
      });
      if (migrated) this.savePets(list);
      return list;
    } catch (e) {
      return DEFAULT_INITIAL_PETS;
    }
  },

  savePets(pets) {
    try {
      localStorage.setItem(STORAGE_KEY_PETS, JSON.stringify(pets));
    } catch (e) {}
  },

  addPet(species, name, habitTitle) {
    const pets = this.getPets();
    const sp = PET_SPECIES[species] || PET_SPECIES.sheep;
    const newPet = {
      id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      species,
      name: (name && name.trim()) || sp.name,
      habitTitle: (habitTitle && habitTitle.trim()) || sp.defaultHabit,
      careCount: 1,
      lastNurturedAt: Date.now()
    };
    pets.push(newPet);
    this.savePets(pets);
    return newPet;
  },

  nurturePet(petId) {
    const pets = this.getPets();
    const pet = pets.find(p => p.id === petId);
    if (!pet) return null;

    pet.careCount = (pet.careCount || 0) + 1;
    pet.lastNurturedAt = Date.now();
    this.savePets(pets);
    return pet;
  },

  updatePetHabit(petId, newName, newHabit) {
    const pets = this.getPets();
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      if (newName) pet.name = newName.trim();
      if (newHabit) pet.habitTitle = newHabit.trim();
      this.savePets(pets);
      return pet;
    }
    return null;
  },

  deletePet(petId) {
    let pets = this.getPets();
    pets = pets.filter(p => p.id !== petId);
    this.savePets(pets);
    return pets;
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) return { soundEnabled: true, musicEnabled: true, ambienceMode: 'sunset' };
      return JSON.parse(data);
    } catch (e) {
      return { soundEnabled: true, musicEnabled: true, ambienceMode: 'sunset' };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  },

  findFreeSpot(existingTrees) {
    const allCandidateSpots = [
      ...SAFE_TREE_SPOTS,
      { x: 0.55, z: 2.15 },
      { x: -0.85, z: 2.10 },
      { x: 2.15, z: 1.05 },
      { x: 1.85, z: -1.35 },
      { x: -1.05, z: -1.95 },
      { x: 0.15, z: -2.15 }
    ];

    for (const spot of allCandidateSpots) {
      const occupied = existingTrees.some(t => {
        if (!t.position) return false;
        const dx = t.position.x - spot.x;
        const dz = t.position.z - spot.z;
        return Math.sqrt(dx * dx + dz * dz) < 0.82;
      });
      if (!occupied) return spot;
    }

    // Jittered fallback in safe east grove away from pond, campfire & tent
    const angle = 0.2 * Math.PI + Math.random() * 0.45 * Math.PI;
    const dist = 1.4 + Math.random() * 0.6;
    return { x: Math.cos(angle) * dist + 0.5, z: Math.sin(angle) * dist + 0.4 };
  },

  exportAllData() {
    const payload = {
      version: 3,
      exportedAt: new Date().toISOString(),
      trees: this.getTrees(),
      rings: this.getRings(),
      pets: this.getPets(),
      settings: this.getSettings()
    };
    return JSON.stringify(payload, null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.trees) this.saveTrees(data.trees);
      if (data.rings) this.saveRings(data.rings);
      if (data.pets) this.savePets(data.pets);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      return false;
    }
  },

  clearAllToBlank() {
    this.saveTrees([]);
    this.savePets([]);
    this.saveRings([]);
  }
};
