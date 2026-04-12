// localStorage 数据持久化工具

export interface CardRecord {
  date: string;
  cardIndex: number;
  completed: boolean;
}

export interface MeditationRecord {
  date: string;
  duration: number;
  feeling: string;
  completed: boolean;
}

export interface PlantData {
  [key: string]: number;
}

// 获取今天的日期字符串
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// 获取最近7天的日期数组
export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

// ============ 态度卡记录 ============

const CARD_RECORDS_KEY = 'mindful_forest_card_records';

export function getCardRecords(): CardRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CARD_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCardRecord(record: CardRecord): void {
  if (typeof window === 'undefined') return;
  const records = getCardRecords();
  const existingIndex = records.findIndex(r => r.date === record.date);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(CARD_RECORDS_KEY, JSON.stringify(records));
}

// ============ 冥想记录 ============

const MEDITATION_RECORDS_KEY = 'mindful_forest_meditation_records';

export function getMeditationRecords(): MeditationRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MEDITATION_RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMeditationRecord(record: MeditationRecord): void {
  if (typeof window === 'undefined') return;
  const records = getMeditationRecords();
  records.push(record);
  localStorage.setItem(MEDITATION_RECORDS_KEY, JSON.stringify(records));
}

// ============ 植物正念值 ============

const PLANT_VALUES_KEY = 'mindful_forest_plant_values';

export function getPlantValues(): PlantData {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(PLANT_VALUES_KEY);
  return data ? JSON.parse(data) : {};
}

export function savePlantValues(values: PlantData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLANT_VALUES_KEY, JSON.stringify(values));
}

export function incrementPlantValue(plantName: string, amount: number = 1): void {
  const values = getPlantValues();
  values[plantName] = (values[plantName] || 0) + amount;
  savePlantValues(values);
}

export function incrementAllPlants(amount: number = 1): void {
  const plants = getAllPlantNames();
  const values = getPlantValues();
  plants.forEach(plant => {
    values[plant] = (values[plant] || 0) + amount;
  });
  savePlantValues(values);
}

// ============ 统计数据 ============

export function getTodayStats(): {
  cardCount: number;
  meditationCount: number;
} {
  const today = getToday();
  const cardRecords = getCardRecords();
  const meditationRecords = getMeditationRecords();

  return {
    cardCount: cardRecords.filter(r => r.date === today && r.completed).length,
    meditationCount: meditationRecords.filter(r => r.date === today && r.completed).length,
  };
}

export function getTotalMindfulValue(): number {
  const values = getPlantValues();
  return Object.values(values).reduce((sum, val) => sum + val, 0);
}

export function getRecentRecords(limit: number = 5): Array<{
  type: 'card' | 'meditation';
  date: string;
  content: string;
  plant?: string;
}> {
  const cardRecords = getCardRecords().filter(r => r.completed);
  const meditationRecords = getMeditationRecords().filter(r => r.completed);

  const allRecords = [
    ...cardRecords.map(r => ({
      type: 'card' as const,
      date: r.date,
      content: getAllPlantNames()[r.cardIndex] || '态度卡',
      plant: ATTITUDES[r.cardIndex]?.plantEmoji,
    })),
    ...meditationRecords.map(r => ({
      type: 'meditation' as const,
      date: r.date,
      content: `${r.duration}分钟`,
      plant: '🧘',
    }))
  ];

  return allRecords
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CARD_RECORDS_KEY);
  localStorage.removeItem(MEDITATION_RECORDS_KEY);
  localStorage.removeItem(PLANT_VALUES_KEY);
}

// ============ 态度卡数据 ============

export interface MindfulnessAttitude {
  name: string;
  meaning: string;
  action: string;
  plant: string;
  plantEmoji: string;
  gradient: string;
  lightColor: string;
}

export const ATTITUDES: MindfulnessAttitude[] = [
  {
    name: '不评判',
    meaning: '对当下的一切保持客观，不急于下结论',
    action: '今天，当你发现自己在评判时，温柔地注意到它，然后轻轻放下',
    plant: '蒲公英',
    plantEmoji: '🌼',
    gradient: 'from-amber-100 to-yellow-100',
    lightColor: 'bg-amber-50',
  },
  {
    name: '耐心',
    meaning: '理解一切都需要时间，允许事物按自己的节奏展开',
    action: '今天，做任何事都多给自己一点时间，不着急',
    plant: '竹子',
    plantEmoji: '🎋',
    gradient: 'from-green-100 to-emerald-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '初学者之心',
    meaning: '像第一次看到世界一样，保持好奇和开放',
    action: '今天，用新鲜的眼光看待一件熟悉的事物',
    plant: '樱花',
    plantEmoji: '🌸',
    gradient: 'from-pink-100 to-rose-100',
    lightColor: 'bg-pink-50',
  },
  {
    name: '信任',
    meaning: '相信自己和他人的内在智慧，建立信任感',
    action: '今天，相信自己的直觉，做一个小决定',
    plant: '银杏',
    plantEmoji: '🍃',
    gradient: 'from-teal-100 to-cyan-100',
    lightColor: 'bg-teal-50',
  },
  {
    name: '不强求',
    meaning: '接受事物本来的样子，不过度执着',
    action: '今天，对无法改变的事说一句"没关系"',
    plant: '薰衣草',
    plantEmoji: '💜',
    gradient: 'from-violet-100 to-purple-100',
    lightColor: 'bg-violet-50',
  },
  {
    name: '接纳',
    meaning: '开放地接受当下的真实，不抗拒',
    action: '今天，承认自己的感受，不批评它',
    plant: '莲花',
    plantEmoji: '🪷',
    gradient: 'from-rose-100 to-pink-100',
    lightColor: 'bg-rose-50',
  },
  {
    name: '放下',
    meaning: '释放不必要的负担，让一切自然流动',
    action: '今天，放下一个小小的担忧或执念',
    plant: '柳树',
    plantEmoji: '🌿',
    gradient: 'from-green-100 to-sage-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '感恩',
    meaning: '珍惜所拥有的，心怀感激',
    action: '今天，对一个人说一声谢谢',
    plant: '向日葵',
    plantEmoji: '🌻',
    gradient: 'from-yellow-100 to-amber-100',
    lightColor: 'bg-yellow-50',
  },
  {
    name: '慷慨',
    meaning: '无私地分享和给予，传递善意',
    action: '今天，为他人做一件小事，不求回报',
    plant: '玉兰',
    plantEmoji: '🌺',
    gradient: 'from-orange-100 to-red-100',
    lightColor: 'bg-orange-50',
  }
];

export function getAllPlantNames(): string[] {
  return ATTITUDES.map(a => a.plant);
}

export function getRandomAttitude(): MindfulnessAttitude {
  const index = Math.floor(Math.random() * ATTITUDES.length);
  return ATTITUDES[index];
}

export function getAttitudeByPlant(plantName: string): MindfulnessAttitude | null {
  return ATTITUDES.find(a => a.plant === plantName) || null;
}

// ============ 植物成长阶段 ============

export type GrowthStage = 'seedling' | 'growing' | 'lush' | 'mature';

export interface GrowthInfo {
  stage: GrowthStage;
  emoji: string;
  description: string;
  scale: number;
  opacity: number;
  leafCount: number;
}

export function getGrowthInfo(value: number): GrowthInfo {
  if (value >= 10) {
    return {
      stage: 'mature',
      emoji: '✨',
      description: '已经绽放出独特的光彩',
      scale: 1.3,
      opacity: 1,
      leafCount: 4,
    };
  }
  if (value >= 6) {
    return {
      stage: 'lush',
      emoji: '🍃',
      description: '枝叶繁茂，生机盎然',
      scale: 1.15,
      opacity: 0.95,
      leafCount: 3,
    };
  }
  if (value >= 3) {
    return {
      stage: 'growing',
      emoji: '🌿',
      description: '正在慢慢舒展枝叶',
      scale: 1,
      opacity: 0.85,
      leafCount: 2,
    };
  }
  return {
    stage: 'seedling',
    emoji: '🌱',
    description: '刚刚发芽，充满可能',
    scale: 0.8,
    opacity: 0.7,
    leafCount: 1,
  };
}

export function getGrowthStage(value: number): GrowthStage {
  if (value >= 10) return 'mature';
  if (value >= 6) return 'lush';
  if (value >= 3) return 'growing';
  return 'seedling';
}

// 成长阶段提示语（温柔的、有陪伴感的文案）
export const GROWTH_MESSAGES = {
  seedling: [
    '刚刚发芽，一切都在开始',
    '小小的，但已经在努力',
    '嫩芽虽小，却有无限可能',
  ],
  growing: [
    '正在慢慢舒展',
    '开始有了自己的节奏',
    '根系在悄悄生长',
  ],
  lush: [
    '枝繁叶茂的它很美',
    '你已经守护它很久了',
    '这是坚持的力量',
  ],
  mature: [
    '已经有了独特的光彩',
    '它是你最温柔的陪伴',
    '森林为它骄傲',
  ],
};

export function getRandomGrowthMessage(stage: GrowthStage): string {
  const messages = GROWTH_MESSAGES[stage];
  return messages[Math.floor(Math.random() * messages.length)];
}
