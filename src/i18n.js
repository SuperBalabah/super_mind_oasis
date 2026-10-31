// Complete Bilingual i18n Dictionary for Super Mind Oasis
// Supports English (?lang=en or toggled) and Traditional Chinese (default)

export const I18N_STORAGE_KEY = 'super_mind_oasis_lang_v1';

export function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'zh';
  }

  // Clear legacy persistent key to prevent cross-tab / root URL contamination
  try {
    localStorage.removeItem(I18N_STORAGE_KEY);
  } catch (e) {}

  // 1. URL Query parameter takes absolute priority (?lang=en -> English, ?lang=zh -> Chinese)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en') return 'en';
    if (urlLang === 'zh') return 'zh';
  } catch (e) {}

  // 2. Normal root URL visits ALWAYS default to Traditional Chinese
  // Ensures user and friend always get clean Chinese on daily app visits
  return 'zh';
}

export const TRANSLATIONS = {
  zh: {
    // Top & Bottom Controls
    btn_ambience_title: '切換光景氛圍',
    btn_music_title: '平靜背景音樂',
    btn_sound_title: '音效開關',
    btn_sync_title_connected: '雲端共鳴 · 已連線 (點擊同步或設定)',
    btn_sync_title_disconnected: '雲端共鳴 · 跨設備同步 (未連線)',
    btn_lang_title: '切換為英文 / Switch to English',
    btn_plant_title: '播種新課題',
    btn_archive_title: '年輪之書',
    btn_habit_title: '習慣夥伴',
    center_hint: '單指旋轉 · 點擊樹木傾聽思緒 · 長按寵物餵食陪伴',

    // Tree Card
    card_days_today: '今天',
    card_days_rooted: '{days} 天',
    card_stats_days_prefix: '扎根共存：',
    card_stats_nurture_prefix: '靜思關照：',
    card_times: '{count} 次',
    card_no_worry: '心中無礙，靜享當下。',
    btn_hold_nurture_label: '滋養關照',
    btn_hold_nurture_sub: '(短按純關照 · 長按記感悟)',
    btn_tree_harvest: '課題釋懷收穫',
    btn_tree_delete: '剷除此樹',
    btn_tree_delete_confirm: '確定剷除？再點確認',

    // Modal: Plant
    plant_modal_title: '播下心靈課題之樹',
    plant_modal_desc: '把心中的焦慮、困惑或想克服的課題安放在這片綠洲。時間會在背景陪伴它默默生長。',
    plant_field_title_label: '課題名稱 / 核心困擾 *',
    plant_field_title_placeholder: '例如：學會拒絕不合理的要求、轉職迷茫...',
    plant_field_worry_label: '當下的思緒與心情初衷',
    plant_field_worry_placeholder: '寫下此時此刻這件事是如何困擾你的，留給未來的自己對照...',
    plant_field_tree_label: '選擇象徵樹種（附樹形示意圖）',
    btn_plant_cancel: '暫放',
    btn_plant_submit: '安放播種',

    // Modal: Note
    note_modal_title: '刻下心靈年輪感悟',
    note_modal_desc: '長按感應到了你的深層思緒。此刻對這個難題，有了什麼新的體會或微小的進步？',
    note_field_placeholder: '寫下一句真實的心境體會...',
    btn_note_cancel: '取消',
    btn_note_submit: '銘刻年輪',

    // Modal: Harvest
    harvest_modal_title: '恭喜翻越這道人生關卡',
    harvest_modal_desc: '這棵樹已陪伴你經歷了時間的沉澱。在收穫這枚年輪前，請寫下這段歷程帶給你最珍貴的頓悟。',
    harvest_field_label: '這次課題，我學到了什麼？（解題心法）*',
    harvest_field_placeholder: '寫下以後當你再次面臨類似挑戰時，能為你指引方向的智慧語錄...',
    btn_harvest_cancel: '先等等',
    btn_harvest_submit: '凝結年輪入庫',

    // Modal: Archive
    archive_modal_title: '年輪之書 · 心靈展館',
    archive_modal_desc: '點擊任意樹木可展開完整的「生長心路歷程時間軸」，回顧每一次微小的成長。',
    archive_empty: '目前尚無樹木。點擊下方播種按鈕種下你的第一棵樹。',
    archive_status_growing: '島上生長中',
    archive_status_harvested: '已碩果圓滿',
    archive_step_growing: '持續關照生長中...',
    archive_step_planted: '播下種子與焦慮',
    archive_step_harvest: '開花結果與頓悟',
    btn_archive_close: '合上典籍',
    btn_delete_ring: '刪除',
    btn_delete_ring_confirm: '確定？',

    // Modal: Adopt Pet
    adopt_modal_title: '認養習慣守護夥伴',
    adopt_modal_desc: '挑選一隻心愛的小動物踏上小島，為你守護一項日常生活中的好習慣。小動物們在島上靜靜陪伴你，隨心餵食無壓力。',
    adopt_field_species_label: '選擇夥伴種族：',
    adopt_field_name_label: '夥伴專屬暱稱',
    adopt_field_name_placeholder_prefix: '夥伴名字（預設：{species}）',
    adopt_field_habit_label: '所守護的日常習慣',
    adopt_field_habit_placeholder_prefix: '所守護習慣（例如：{habit}）',
    btn_adopt_cancel: '先等等',
    btn_adopt_submit: '確認認養至小島',

    // Modal: Pet Detail
    pet_detail_habit_label: '守護習慣',
    pet_detail_care_prefix: '累積陪伴：',
    btn_pet_release: '放生夥伴',
    btn_pet_release_confirm: '確定放生？再點確認',
    btn_pet_detail_close: '回到小島',

    // Modal: Sync
    sync_modal_title: '雲端共鳴 · 跨設備同步',
    sync_modal_desc: '透過私有 GitHub Gist 在 iPhone 與電腦間跨設備同步心靈綠洲，資料僅留存在您的個人 GitHub，完全免費且安全隱私。',
    sync_last_never: '上次同步：尚未同步',
    sync_last_prefix: '上次同步：',
    sync_switch_title: '開啟自動背景同步',
    sync_switch_sub: '每次開啟自動拉取最新進度，島嶼變更時背景靜默上傳',
    sync_token_label: 'GitHub Personal Access Token (PAT) *',
    sync_token_link: '生成 Token (僅需 gist 權限)',
    sync_token_hint: 'Token 僅安全存放於本機瀏覽器，絕不經過任何第三方伺服器',
    sync_gist_label: 'Gist ID',
    btn_create_gist: '自動建立私有 Gist',
    sync_gist_hint: '在第二台設備（如手機）上填入相同 Token 與 Gist ID 即可雙向互通',
    btn_manual_push: '上傳至雲端',
    btn_manual_pull: '從雲端拉取',
    btn_sync_cancel: '關閉',
    btn_sync_save: '儲存設定',

    // Toasts & Alerts
    toast_switched_lang: '已切換為繁體中文',
    toast_nurtured: '已關照「{title}」',
    toast_deleted_tree: '已剷除「{title}」',
    toast_adopted_pet: '「{name}」已來到小島',
    toast_released_pet: '「{name}」已回歸山林大自然',
    toast_cared_pet: '「{name}」很高興 · 守護「{habit}」',
    toast_deleted_ring: '已刪除「{title}」年輪記錄',
    toast_sync_saved: '雲端同步設定已儲存',
    toast_sync_local_saved: '已儲存本機設定',
    toast_need_token: '請先填寫 GitHub Token',
    toast_creating_gist: '建立中...',
    toast_gist_success: '私有 Gist 建立成功，已同步',
    toast_gist_fail: '建立失敗：{msg}',
    toast_need_token_and_gist: '請填寫 Token 與 Gist ID',
    toast_push_success: '島嶼已成功推送到雲端',
    toast_push_fail: '上傳失敗：{msg}',
    toast_pull_success: '已從雲端成功拉取最新島嶼',
    toast_pull_fail: '拉取失敗：{msg}',

    // Tree Types
    tree_oak_name: '勇氣之橡',
    tree_oak_virtue: '勇氣與堅韌',
    tree_oak_desc: '深根固柢，面對外界風雨依然巍然挺立。象徵直面困難與承擔的勇氣。',
    tree_ginkgo_name: '通透之杏',
    tree_ginkgo_virtue: '智慧與轉念',
    tree_ginkgo_desc: '扇葉澄黃，隨風起舞。象徵看破執念、心境豁然開朗的通透。',
    tree_birch_name: '沈思白樺',
    tree_birch_virtue: '平靜與省察',
    tree_birch_desc: '白幹銀枝，昂首向天。象徵在混亂喧囂中回歸自我內心的寧靜。',
    tree_jacaranda_name: '釋懷藍花楹',
    tree_jacaranda_virtue: '溫柔與放下',
    tree_jacaranda_desc: '紫藍花瀑，如夢似幻。象徵與過去的不完美和解、溫柔釋放沉重的包袱。',

    // Pet Species
    pet_sheep_name: '白雲綿羊',
    pet_sheep_desc: '軟綿綿的白雲小羊，性情溫馴，喜歡在草地安靜咀嚼放空。',
    pet_sheep_habit: '每日深呼吸靜坐 5 分鐘',
    pet_fox_name: '星光靈狐',
    pet_fox_desc: '機敏而靈動的小狐狸，披著夕陽的赤橘毛色，在島上守護你的習慣。',
    pet_fox_habit: '每日睡前閱讀 15 分鐘',
    pet_shiba_name: '暖陽柴犬',
    pet_shiba_desc: '充滿元氣與陪伴感的忠誠柴犬，總是笑瞇瞇地迎接著你的每一次餵食。',
    pet_shiba_habit: '每日晨間慢跑 2 公里',
    pet_cat_name: '玄夜靈貓',
    pet_cat_desc: '優雅而深沉的黑貓，帶著一雙清澈琉璃眼，安靜依偎在帳篷與營火旁。',
    pet_cat_habit: '每日喝足 2000cc 溫水',
    pet_deer_name: '森林小鹿',
    pet_deer_desc: '踏著輕盈步伐的初生林鹿，象徵著輕柔而堅定的持續力量。',
    pet_deer_habit: '每日寫下一件感恩小事'
  },

  en: {
    // Top & Bottom Controls
    btn_ambience_title: 'Switch Lighting & Ambience',
    btn_music_title: 'Calm Background Music',
    btn_sound_title: 'Sound Effects Toggle',
    btn_sync_title_connected: 'Cloud Resonance · Connected (Tap to sync or configure)',
    btn_sync_title_disconnected: 'Cloud Resonance · Cross-Device Sync (Disconnected)',
    btn_lang_title: 'Switch to Traditional Chinese / 切換為繁體中文',
    btn_plant_title: 'Plant New Inquiry',
    btn_archive_title: 'Chronicles of Growth',
    btn_habit_title: 'Habit Companions',
    center_hint: 'One finger to rotate · Tap tree to listen · Hold pet to nurture',

    // Tree Card
    card_days_today: 'Today',
    card_days_rooted: '{days} days',
    card_stats_days_prefix: 'Rooted Together: ',
    card_stats_nurture_prefix: 'Reflections: ',
    card_times: '{count} times',
    card_no_worry: 'Clear mind, embracing stillness.',
    btn_hold_nurture_label: 'Nurture & Care',
    btn_hold_nurture_sub: '(Tap to reflect · Hold for journal)',
    btn_tree_harvest: 'Harvest & Insight',
    btn_tree_delete: 'Remove Tree',
    btn_tree_delete_confirm: 'Confirm Removal? Tap again',

    // Modal: Plant
    plant_modal_title: 'Plant a Tree of Inquiry',
    plant_modal_desc: 'Anchor your anxieties, dilemmas, or growth inquiries onto this oasis. Time will quietly nurture its growth in the background.',
    plant_field_title_label: 'Inquiry Title / Core Challenge *',
    plant_field_title_placeholder: 'e.g., Setting boundaries, career crossroad...',
    plant_field_worry_label: 'Current Thoughts & Initial Dilemma',
    plant_field_worry_placeholder: 'Note down how this currently weighs on you, for future self-reflection...',
    plant_field_tree_label: 'Select Symbolic Tree Species (with preview)',
    btn_plant_cancel: 'Later',
    btn_plant_submit: 'Plant Seed',

    // Modal: Note
    note_modal_title: 'Inscribe a Growth Reflection',
    note_modal_desc: 'Deep thoughts sensed through mindful holding. What subtle breakthrough or perspective have you reached on this dilemma?',
    note_field_placeholder: 'Write a genuine inner insight or milestone...',
    btn_note_cancel: 'Cancel',
    btn_note_submit: 'Inscribe Ring',

    // Modal: Harvest
    harvest_modal_title: 'Congratulations on Crossing this Milestone',
    harvest_modal_desc: 'This tree has accompanied you through seasons of reflection. Before harvesting this growth ring, preserve the most precious breakthrough insight from this journey.',
    harvest_field_label: 'What did this challenge teach me? (Key Insight) *',
    harvest_field_placeholder: 'Write an anchoring maxim to guide you whenever you face similar challenges in the future...',
    btn_harvest_cancel: 'Wait',
    btn_harvest_submit: 'Preserve Growth Ring',

    // Modal: Archive
    archive_modal_title: 'Chronicles of Growth · Resilience Archive',
    archive_modal_desc: 'Tap any tree to reveal its complete growth timeline and revisit each subtle milestone.',
    archive_empty: 'No trees planted yet. Tap the plant button below to plant your first seed.',
    archive_status_growing: 'Growing on Island',
    archive_status_harvested: 'Harvested & Fulfilled',
    archive_step_growing: 'Quietly growing through daily care...',
    archive_step_planted: 'Seed planted with initial dilemma',
    archive_step_harvest: 'Blossomed with breakthrough insight',
    btn_archive_close: 'Close Chronicles',
    btn_delete_ring: 'Delete',
    btn_delete_ring_confirm: 'Confirm?',

    // Modal: Adopt Pet
    adopt_modal_title: 'Adopt a Habit Guardian Companion',
    adopt_modal_desc: 'Choose an animal companion to step onto the island, quietly guarding a daily habit. Feed and care at your own pace without streak pressure.',
    adopt_field_species_label: 'Select Companion Species:',
    adopt_field_name_label: 'Companion Nickname',
    adopt_field_name_placeholder_prefix: 'Nickname (default: {species})',
    adopt_field_habit_label: 'Habit Being Guarded',
    adopt_field_habit_placeholder_prefix: 'Guarded habit (e.g., {habit})',
    btn_adopt_cancel: 'Wait',
    btn_adopt_submit: 'Adopt to Island',

    // Modal: Pet Detail
    pet_detail_habit_label: 'Guarding Habit',
    pet_detail_care_prefix: 'Accumulated Care: ',
    btn_pet_release: 'Release Companion',
    btn_pet_release_confirm: 'Confirm Release? Tap again',
    btn_pet_detail_close: 'Return to Island',

    // Modal: Sync
    sync_modal_title: 'Cloud Resonance · Cross-Device Sync',
    sync_modal_desc: 'Sync your mind oasis between iPhone and desktop via a private GitHub Gist. Zero external servers, 100% private and encrypted.',
    sync_last_never: 'Last Sync: Never',
    sync_last_prefix: 'Last Sync: ',
    sync_switch_title: 'Enable Automatic Background Sync',
    sync_switch_sub: 'Auto-pulls latest state on launch; silently uploads on island changes',
    sync_token_label: 'GitHub Personal Access Token (PAT) *',
    sync_token_link: 'Generate Token (gist scope only)',
    sync_token_hint: 'Token is stored securely in local browser only, never passing third-party servers',
    sync_gist_label: 'Gist ID',
    btn_create_gist: 'Auto-Create Private Gist',
    sync_gist_hint: 'Enter same Token & Gist ID on your second device to sync bi-directionally',
    btn_manual_push: 'Push to Cloud',
    btn_manual_pull: 'Pull from Cloud',
    btn_sync_cancel: 'Close',
    btn_sync_save: 'Save Settings',

    // Toasts & Alerts
    toast_switched_lang: 'Switched to English',
    toast_nurtured: 'Nurtured "{title}"',
    toast_deleted_tree: 'Removed "{title}"',
    toast_adopted_pet: '"{name}" has arrived at the island',
    toast_released_pet: '"{name}" has returned to the wild nature',
    toast_cared_pet: '"{name}" is joyful · Guarding "{habit}"',
    toast_deleted_ring: 'Deleted "{title}" growth ring',
    toast_sync_saved: 'Cloud sync settings saved',
    toast_sync_local_saved: 'Local settings saved',
    toast_need_token: 'Please enter GitHub Token first',
    toast_creating_gist: 'Creating...',
    toast_gist_success: 'Private Gist created & synchronized',
    toast_gist_fail: 'Creation failed: {msg}',
    toast_need_token_and_gist: 'Please provide both Token & Gist ID',
    toast_push_success: 'Island successfully pushed to cloud',
    toast_push_fail: 'Upload failed: {msg}',
    toast_pull_success: 'Latest island pulled successfully from cloud',
    toast_pull_fail: 'Pull failed: {msg}',

    // Tree Types
    tree_oak_name: 'Oak of Courage',
    tree_oak_virtue: 'Courage & Resilience',
    tree_oak_desc: 'Deep roots standing firm against storms. Symbolizes the courage to confront challenges.',
    tree_ginkgo_name: 'Ginkgo of Clarity',
    tree_ginkgo_virtue: 'Wisdom & Perspective',
    tree_ginkgo_desc: 'Golden leaves dancing in the wind. Symbolizes letting go of obsessions and finding perspective.',
    tree_birch_name: 'Birch of Stillness',
    tree_birch_virtue: 'Stillness & Reflection',
    tree_birch_desc: 'Silver bark reaching skyward. Symbolizes returning to inner stillness amidst chaos.',
    tree_jacaranda_name: 'Jacaranda of Release',
    tree_jacaranda_virtue: 'Gentleness & Letting Go',
    tree_jacaranda_desc: 'Cascades of violet-blue blossoms. Symbolizes reconciling with past imperfections and letting go.',

    // Pet Species
    pet_sheep_name: 'Cloud Sheep',
    pet_sheep_desc: 'A fluffy cloud sheep with a gentle temperament, peacefully grazing on the meadow.',
    pet_sheep_habit: '5 mins daily deep breathing meditation',
    pet_fox_name: 'Starlight Fox',
    pet_fox_desc: 'An agile little fox with sunset-orange fur, guarding your habits on the island.',
    pet_fox_habit: '15 mins bedtime reading daily',
    pet_shiba_name: 'Sunshine Shiba',
    pet_shiba_desc: 'A loyal Shiba Inu full of warmth and vitality, greeting your care with cheerful smiles.',
    pet_shiba_habit: '2 km morning run daily',
    pet_cat_name: 'Night Mystery Cat',
    pet_cat_desc: 'An elegant black cat with clear jewel eyes, quietly nestling by the tent and campfire.',
    pet_cat_habit: 'Drink 2000cc warm water daily',
    pet_deer_name: 'Forest Fawn',
    pet_deer_desc: 'A gentle forest fawn walking with graceful steps, symbolizing persistent and quiet strength.',
    pet_deer_habit: 'Write down one grateful thought daily'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = getInitialLanguage();
  }

  get lang() {
    return this.currentLang;
  }

  t(key, params = {}) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.zh;
    let text = dict[key] || TRANSLATIONS.zh[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    this.currentLang = lang;
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        if (lang === 'en') {
          url.searchParams.set('lang', 'en');
        } else {
          url.searchParams.delete('lang');
        }
        const newUrl = url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : '');
        window.history.replaceState({}, '', newUrl);
      } catch (e) {}
    }
  }

  toggleLanguage() {
    const next = this.currentLang === 'zh' ? 'en' : 'zh';
    this.setLanguage(next);
    return next;
  }

  getTreeInfo(typeKey) {
    const isEn = this.currentLang === 'en';
    switch (typeKey) {
      case 'oak':
        return {
          name: this.t('tree_oak_name'),
          virtue: this.t('tree_oak_virtue'),
          description: this.t('tree_oak_desc')
        };
      case 'ginkgo':
        return {
          name: this.t('tree_ginkgo_name'),
          virtue: this.t('tree_ginkgo_virtue'),
          description: this.t('tree_ginkgo_desc')
        };
      case 'birch':
        return {
          name: this.t('tree_birch_name'),
          virtue: this.t('tree_birch_virtue'),
          description: this.t('tree_birch_desc')
        };
      case 'jacaranda':
        return {
          name: this.t('tree_jacaranda_name'),
          virtue: this.t('tree_jacaranda_virtue'),
          description: this.t('tree_jacaranda_desc')
        };
      default:
        return { name: typeKey, virtue: '', description: '' };
    }
  }

  getPetSpeciesInfo(speciesKey) {
    switch (speciesKey) {
      case 'sheep':
        return {
          name: this.t('pet_sheep_name'),
          description: this.t('pet_sheep_desc'),
          defaultHabit: this.t('pet_sheep_habit')
        };
      case 'fox':
        return {
          name: this.t('pet_fox_name'),
          description: this.t('pet_fox_desc'),
          defaultHabit: this.t('pet_fox_habit')
        };
      case 'shiba':
        return {
          name: this.t('pet_shiba_name'),
          description: this.t('pet_shiba_desc'),
          defaultHabit: this.t('pet_shiba_habit')
        };
      case 'cat':
        return {
          name: this.t('pet_cat_name'),
          description: this.t('pet_cat_desc'),
          defaultHabit: this.t('pet_cat_habit')
        };
      case 'deer':
        return {
          name: this.t('pet_deer_name'),
          description: this.t('pet_deer_desc'),
          defaultHabit: this.t('pet_deer_habit')
        };
      default:
        return { name: speciesKey, description: '', defaultHabit: '' };
    }
  }

  getLocalizedPet(pet) {
    if (!pet) return pet;
    if (this.currentLang === 'en') {
      if (pet.id === 'pet_init_01' || pet.name === '白雲綿羊' || (pet.name && pet.name.includes('綿羊'))) {
        return {
          ...pet,
          name: 'Cloud Sheep',
          habitTitle: 'Drink 2000cc water daily'
        };
      }
      if (pet.id === 'pet_init_02' || pet.name === '小靈狐' || (pet.name && pet.name.includes('狐'))) {
        return {
          ...pet,
          name: 'Starlight Fox',
          habitTitle: '15 mins bedtime reading'
        };
      }
    }
    return pet;
  }

  getLocalizedTree(tree) {
    if (!tree) return tree;
    if (this.currentLang === 'en') {
      if (tree.id === 'seed_init_01' || tree.title === '學會給自己喘息的空間' || (tree.title && tree.title.includes('喘息'))) {
        return {
          ...tree,
          title: 'Giving Myself Space to Breathe',
          initialWorry: 'Always afraid of falling behind, packing my schedule, constantly feeling tense background noise.',
          notes: tree.notes ? tree.notes.map(n => {
            if (n.id === 'n1' || (n.text && n.text.includes('午休'))) {
              return { ...n, text: 'Today I tried doing nothing during lunch break, closed eyes to listen to the wind for 5 minutes. The tightness in my chest eased a little.' };
            }
            if (n.id === 'n2' || (n.text && n.text.includes('拒絕'))) {
              return { ...n, text: 'Declined an unnecessary social gathering, brewed hot tea. Found that the world did not collapse because I said no.' };
            }
            return n;
          }) : []
        };
      }
      if (tree.id === 'ring_init_01' || tree.title === '直面未知的焦慮' || (tree.title && tree.title.includes('未知的焦慮'))) {
        return {
          ...tree,
          title: 'Embracing the Unknown',
          initialWorry: 'Felt unexplained anxiety about future uncertainties, often suffering late-night insomnia.'
        };
      }
    }
    return tree;
  }

  getLocalizedRing(ring) {
    if (!ring) return ring;
    if (this.currentLang === 'en') {
      // Harvested initial tree (seed_init_01 / Giving Myself Space to Breathe)
      if (ring.id === 'seed_init_01' || ring.treeId === 'seed_init_01' || ring.title === '學會給自己喘息的空間' || (ring.title && ring.title.includes('喘息'))) {
        return {
          ...ring,
          title: 'Giving Myself Space to Breathe',
          initialWorry: 'Always afraid of falling behind, packing my schedule, constantly feeling tense background noise.',
          insight: ring.insight && (ring.insight.includes('執念') || ring.insight.includes('空間'))
            ? 'Pausing is not giving up; it is giving life a chance to recalibrate.'
            : (ring.insight || 'Pausing is not giving up; it is giving life a chance to recalibrate.'),
          notes: ring.notes ? ring.notes.map(n => {
            if (n.id === 'n1' || (n.text && n.text.includes('午休'))) {
              return { ...n, text: 'Today I tried doing nothing during lunch break, closed eyes to listen to the wind for 5 minutes. The tightness in my chest eased a little.' };
            }
            if (n.id === 'n2' || (n.text && n.text.includes('拒絕'))) {
              return { ...n, text: 'Declined an unnecessary social gathering, brewed hot tea. Found that the world did not collapse because I said no.' };
            }
            return n;
          }) : []
        };
      }

      // Initial ring (ring_init_01 / Embracing the Unknown)
      if (ring.id === 'ring_init_01' || ring.title === '直面未知的焦慮' || (ring.title && ring.title.includes('未知的焦慮'))) {
        return {
          ...ring,
          title: 'Embracing the Unknown',
          initialWorry: 'Felt unexplained anxiety about future uncertainties, often suffering late-night insomnia.',
          insight: 'I cannot control what happens tomorrow, but I can always control the depth of my breath. Bringing focus back to the present moment dissolves fear.',
          notes: ring.notes ? ring.notes.map(n => {
            if (n.id === 'rn1' || (n.text && n.text.includes('第一週'))) {
              return { ...n, text: 'Week 1: Still felt panicked, but started writing worries on paper to categorize. Realized 80% never happen.' };
            }
            if (n.id === 'rn2' || (n.text && n.text.includes('第二週'))) {
              return { ...n, text: 'Week 2: Learned to focus on three small tasks I can accomplish today.' };
            }
            return n;
          }) : []
        };
      }
    }
    return ring;
  }
}

export const i18n = new I18nManager();
