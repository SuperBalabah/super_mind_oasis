// Enhanced Storage manager for Super Mind Oasis
const STORAGE_KEY_TREES = 'super_mind_oasis_trees_v2';
const STORAGE_KEY_RINGS = 'super_mind_oasis_rings_v2';
const STORAGE_KEY_SETTINGS = 'super_mind_oasis_settings_v2';
const STORAGE_KEY_HABIT = 'super_mind_oasis_habit_v2';

export const TREE_TYPES = {
  oak: {
    id: 'oak',
    name: '勇氣之橡',
    virtue: '勇氣與堅韌',
    description: '深根固柢，面對外界風雨依然巍然挺立。象徵直面困難與承擔的勇氣。',
    foliageColor: '#3c8252',
    autumnColor: '#b86d29',
    trunkColor: '#6d4c38',
    glowColor: '#7dd395'
  },
  ginkgo: {
    id: 'ginkgo',
    name: '通透之杏',
    virtue: '智慧與轉念',
    description: '扇葉澄黃，隨風起舞。象徵看破執念、心境豁然開朗的通透。',
    foliageColor: '#e5b839',
    autumnColor: '#f7d046',
    trunkColor: '#735742',
    glowColor: '#f5d547'
  },
  birch: {
    id: 'birch',
    name: '沈思白樺',
    virtue: '平靜與省察',
    description: '白幹銀枝，昂首向天。象徵在混亂喧囂中回歸自我內心的寧靜。',
    foliageColor: '#5fa874',
    autumnColor: '#c5b85a',
    trunkColor: '#d6d1c4',
    glowColor: '#a4d9ba'
  },
  jacaranda: {
    id: 'jacaranda',
    name: '釋懷藍花楹',
    virtue: '溫柔與放下',
    description: '紫藍花瀑，如夢似幻。象徵與過去的不完美和解、溫柔釋放沉重的包袱。',
    foliageColor: '#8460b5',
    autumnColor: '#a685d4',
    trunkColor: '#5c483a',
    glowColor: '#caa6f7'
  }
};

const DEFAULT_INITIAL_TREE = {
  id: 'seed_init_01',
  title: '學會給自己喘息的空間',
  initialWorry: '總是害怕落後他人，習慣把行程填滿，內心經常處於緊繃的背景噪音中。',
  treeType: 'birch',
  plantedAt: Date.now() - 1000 * 60 * 60 * 24 * 4.2,
  status: 'growing',
  nurtureCount: 3,
  lastNurturedAt: Date.now() - 1000 * 60 * 60 * 8,
  position: { x: 0.1, z: 0.9 },
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

const DEFAULT_HABIT = {
  name: '每日睡前閱讀 15 分鐘',
  petName: '小靈狐 (Kitsune)',
  streak: 3,
  lastCheckinDate: new Date(Date.now() - 86400000).toDateString()
};

export const Storage = {
  getTrees() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_TREES);
      if (!data) {
        const initial = [DEFAULT_INITIAL_TREE];
        localStorage.setItem(STORAGE_KEY_TREES, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [DEFAULT_INITIAL_TREE];
    }
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
      position: treeData.position || this.findFreeSpot(trees),
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
      if (!data) {
        const initial = [DEFAULT_INITIAL_RING];
        localStorage.setItem(STORAGE_KEY_RINGS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch (e) {
      return [DEFAULT_INITIAL_RING];
    }
  },

  saveRings(rings) {
    try {
      localStorage.setItem(STORAGE_KEY_RINGS, JSON.stringify(rings));
    } catch (e) {}
  },

  // --- HABIT SYSTEM ---
  getHabit() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HABIT);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_HABIT, JSON.stringify(DEFAULT_HABIT));
        return DEFAULT_HABIT;
      }
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_HABIT;
    }
  },

  saveHabit(habit) {
    try {
      localStorage.setItem(STORAGE_KEY_HABIT, JSON.stringify(habit));
    } catch (e) {}
  },

  checkinHabit() {
    const habit = this.getHabit();
    const today = new Date().toDateString();
    let alreadyCheckedToday = habit.lastCheckinDate === today;

    if (!alreadyCheckedToday) {
      habit.streak = (habit.streak || 0) + 1;
      habit.lastCheckinDate = today;
      this.saveHabit(habit);
      return { success: true, streak: habit.streak, firstTimeToday: true };
    }
    return { success: true, streak: habit.streak, firstTimeToday: false };
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) {
        return { soundEnabled: true, musicEnabled: true, ambienceMode: 'sunset' };
      }
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
    const candidateSpots = [
      { x: -1.7, z: 0.3 },
      { x: 1.6, z: -0.5 },
      { x: -0.5, z: -1.5 },
      { x: 1.2, z: 1.3 },
      { x: -1.3, z: 1.2 },
      { x: 0.7, z: -1.4 },
      { x: -0.1, z: 1.7 },
      { x: 2.0, z: 0.5 }
    ];

    for (const spot of candidateSpots) {
      const occupied = existingTrees.some(t => {
        if (!t.position) return false;
        const dx = t.position.x - spot.x;
        const dz = t.position.z - spot.z;
        return Math.sqrt(dx * dx + dz * dz) < 0.85;
      });
      if (!occupied) return spot;
    }
    const angle = Math.random() * Math.PI * 2;
    const dist = 1.0 + Math.random() * 1.0;
    return { x: Math.cos(angle) * dist, z: Math.sin(angle) * dist };
  }
};
