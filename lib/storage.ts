// localStorage 数据持久化工具 - 全面升级版

// ============ 类型定义 ============

export interface CardRecord {
  date: string; // yyyy-mm-dd
  cardIndex: number;
  completed: boolean;
  drawTime?: string; // 抽取时间
}

export interface CardDraw {
  date: string;
  cardIndex: number;
  completed: boolean;
  actionSuggestion?: string;
  feeling?: string;
  drawTime: string;
}

export interface MeditationRecord {
  id: string;
  date: string;
  completedAt: string; // ISO datetime
  duration: number;
  feeling: string;
  completed: boolean;
}

// 态度卡完成记录（完整结构）
export interface CardCompletionRecord {
  id: string;
  type: 'attitude';
  date: string;       // yyyy-mm-dd
  completedAt: string; // ISO datetime
  drawTime: string;    // 抽取时的 drawTime，用于关联原记录
  attitudeName: string;
  plantName: string;
  emoji: string;
  actionPlan: string;
  reflection: string;  // 晚间感受/行动感受
}

// 冥想记录（带完整字段）
export interface MeditationRecordFull {
  id: string;
  type: 'meditation';
  date: string;
  completedAt: string;
  duration: number;
  reflection: string;
}

// 统一记录类型（用于展示）
export type RecordEntry = CardCompletionRecord | MeditationRecordFull;

export interface PlantData {
  [key: string]: number;
}

// 植物数据存储结构（含浇灌时间）
interface PlantStore {
  scores: { [key: string]: number };
  lastWateredAt: { [key: string]: string }; // ISO date string yyyy-mm-dd
}

export interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
  longestStreak: number;
}

export interface MindfulnessAttitude {
  name: string;
  meaning: string;
  actions: string[]; // 100条行动建议
  plant: string;
  plantEmoji: string;
  plantReason: string; // 为什么选择这个植物
  gradient: string;
  lightColor: string;
}

// ============ firstUsedAt 工具 ============

const FIRST_USED_AT_KEY = 'mindful_forest_first_used_at';

// 动态计算最早记录日期，不缓存（避免新记录被忽略）
function computeFirstUsedAt(): string {
  const today = getToday();
  const cardRecords = getCardCompletionRecords();
  const meditationRecords = getMeditationRecords();

  let earliest = today;

  cardRecords.forEach(r => {
    const d = r.date || r.completedAt?.slice(0, 10);
    if (d && d < earliest) earliest = d;
  });

  meditationRecords.forEach(r => {
    const d = r.date || r.completedAt?.slice(0, 10);
    if (d && d < earliest) earliest = d;
  });

  return earliest;
}

export function getFirstUsedAt(): string {
  if (typeof window === 'undefined') return getToday();
  // 始终从现有记录动态计算真实的最早日期
  return computeFirstUsedAt();
}

// 仅用于初始化本地存储的首次日期
export function ensureFirstUsedAt(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(FIRST_USED_AT_KEY)) {
    localStorage.setItem(FIRST_USED_AT_KEY, getToday());
  }
}

// ============ 日期工具 ============

// 获取本地日期字符串（yyyy-mm-dd）
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(): string {
  return toLocalDateString(new Date());
}

export function getNow(): string {
  return new Date().toISOString();
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(toLocalDateString(date));
  }
  return days;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === toLocalDateString(yesterday);
}

// 生成两个日期之间的所有日期（包含首尾，按顺序）
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const current = new Date(start);
  while (current <= end) {
    dates.push(toLocalDateString(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// 获取某一天的态度卡记录
export function getCardRecordForDate(date: string): CardCompletionRecord | undefined {
  const records = getCardCompletionRecords();
  return records.find(r => {
    const d = r.date || r.completedAt?.slice(0, 10);
    return d === date;
  });
}

// 获取某一天的冥想记录（可能有多个）
export function getMeditationRecordsForDate(date: string): MeditationRecord[] {
  return getMeditationRecords().filter(r => {
    const d = r.date || r.completedAt?.slice(0, 10);
    return d === date && r.completed;
  });
}

// 获取某一天的综合记录（用于日历详情）
export interface DayRecordSummary {
  date: string;
  hasCard: boolean;
  hasMeditation: boolean;
  cardRecord?: CardCompletionRecord;
  meditationRecords: MeditationRecord[];
}

export function getDayRecordSummary(date: string): DayRecordSummary {
  return {
    date,
    hasCard: !!getCardRecordForDate(date),
    hasMeditation: getMeditationRecordsForDate(date).length > 0,
    cardRecord: getCardRecordForDate(date),
    meditationRecords: getMeditationRecordsForDate(date),
  };
}

// ============ Streak 计算 ============

const STREAK_KEY = 'mindful_forest_streak';

export function getStreak(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, lastActiveDate: '', longestStreak: 0 };
  }
  const data = localStorage.getItem(STREAK_KEY);
  return data ? JSON.parse(data) : { currentStreak: 0, lastActiveDate: '', longestStreak: 0 };
}

export function updateStreak(): StreakData {
  const today = getToday();
  const streak = getStreak();

  if (streak.lastActiveDate === today) {
    // 今天已经更新过
    return streak;
  }

  if (isYesterday(streak.lastActiveDate) || streak.lastActiveDate === '') {
    // 连续第二天 或 首次
    const newStreak = {
      currentStreak: streak.lastActiveDate === '' ? 1 : streak.currentStreak + 1,
      lastActiveDate: today,
      longestStreak: Math.max(streak.longestStreak, streak.lastActiveDate === '' ? 1 : streak.currentStreak + 1),
    };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
    return newStreak;
  }

  // 连胜中断，重新开始
  const newStreak = {
    currentStreak: 1,
    lastActiveDate: today,
    longestStreak: Math.max(streak.longestStreak, 1),
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
  return newStreak;
}

// ============ 态度卡数据 - 结构化生成系统 ============

// 每个态度的专属配色 Palette（基于真实植物/emoji色调）
export interface AttitudePalette {
  bgStart: string;      // 背景渐变起始
  bgEnd: string;        // 背景渐变结束
  titleColor: string;   // 主标题颜色
  bodyText: string;     // 正文颜色
  cardBg: string;       // 卡片背景
  cardText: string;     // 卡片文字
  accent: string;       // 强调色/标签色
  subtle: string;       // 淡色文字
}

export const ATTITUDE_PALETTES: { [key: string]: AttitudePalette } = {
  '非评判': {
    bgStart: '#f0f4f2',
    bgEnd: '#e6ebe8',
    titleColor: '#3d5245',
    bodyText: '#4a5c50',
    cardBg: 'rgba(255, 252, 248, 0.85)',
    cardText: '#4a5c50',
    accent: '#8faa98',
    subtle: '#a5b8a8',
  },
  '耐心': {
    bgStart: '#f0f7f4',
    bgEnd: '#e6f0ea',
    titleColor: '#2e5a3a',
    bodyText: '#3d5c45',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardText: '#3d5c45',
    accent: '#81c784',
    subtle: '#a5d6a7',
  },
  '初学者之心': {
    bgStart: '#fef7f9',
    bgEnd: '#fceef1',
    titleColor: '#6b4e5a',
    bodyText: '#5a4350',
    cardBg: 'rgba(255, 252, 254, 0.85)',
    cardText: '#6b4e5a',
    accent: '#d4a5b5',
    subtle: '#c4939f',
  },
  '信任': {
    bgStart: '#F9F6F7',
    bgEnd: '#F6F3F5',
    titleColor: '#5C4A52',
    bodyText: '#4A3D42',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardText: '#5C4A52',
    accent: '#C7B8BF',
    subtle: '#D4CACD',
  },
  '无为': {
    bgStart: '#f4f7f4',
    bgEnd: '#e6ede6',
    titleColor: '#3a5a40',
    bodyText: '#4a5c45',
    cardBg: 'rgba(252, 255, 250, 0.85)',
    cardText: '#4a5c45',
    accent: '#a5c9a8',
    subtle: '#b8d8c0',
  },
  '接纳': {
    bgStart: '#f8f5f7',
    bgEnd: '#f0eef0',
    titleColor: '#5a4a5a',
    bodyText: '#4a3d4a',
    cardBg: 'rgba(255, 252, 255, 0.85)',
    cardText: '#5a4a5a',
    accent: '#c9a5c9',
    subtle: '#d8b8d8',
  },
  '放下': {
    bgStart: '#faf5f3',
    bgEnd: '#f5efe8',
    titleColor: '#5a4535',
    bodyText: '#4a3830',
    cardBg: 'rgba(255, 252, 248, 0.85)',
    cardText: '#5a4535',
    accent: '#d4a580',
    subtle: '#c49570',
  },
  '感恩': {
    bgStart: '#f5f8f5',
    bgEnd: '#e8f0e8',
    titleColor: '#3a5a3a',
    bodyText: '#4a4a40',
    cardBg: 'rgba(255, 255, 250, 0.85)',
    cardText: '#4a4a40',
    accent: '#a5c9a5',
    subtle: '#b8d8b8',
  },
  '慷慨': {
    bgStart: '#faf8f0',
    bgEnd: '#f5f0e0',
    titleColor: '#5a5230',
    bodyText: '#4a4228',
    cardBg: 'rgba(255, 252, 240, 0.85)',
    cardText: '#5a5230',
    accent: '#d4c490',
    subtle: '#c4b480',
  },
};

// 结构化行动建议生成数据
interface StructuredSuggestion {
  situations: string[];
  actions: string[];
  reflections: string[];
}


// 随机选择数组中的一个元素
function pickRandom<T>(arr: T[], exclude?: T): T {
  let pool = exclude ? arr.filter(item => item !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============ 态度数据 - 非评判 ============
const NON_JUDGING = {
  situations: [
    '当你注意到自己在心里给某件事下了定论时',
    '当有人说了让你想反驳的话时',
    '当你在评判今天的天气时',
    '当你在对比自己和别人时',
    '当一个旧有的想法再次出现时',
    '当你在心里说"应该"或"不应该"时',
    '当你想纠正别人的时候',
    '当你在评判自己今天的表现时',
    '当你听到对某人的议论时',
    '当你在给事物贴上好或坏的标签时',
    '当你不耐烦的感觉升起时',
    '当你在回想过去做的决定时',
    '当别人的选择让你不解时',
    '当你在催促或责怪自己时',
    '当某种情绪让你想逃避时',
    '当你在预测事情会怎么发展时',
    '当你的身体告诉你它有些疲惫时',
    '当你想为某件事找一个原因时',
    '当你在社交媒体上浏览时',
    '当一件计划外的事情发生时',
    '当你发现自己站在道德高位时',
    '当你在给某人的行为贴标签时',
    '当你在评判一个新闻或事件时',
    '当你的第一反应是批评时',
    '当你在想"为什么他那样做"时',
    '当你要对某件事下结论时',
    '当你在后悔时',
    '当你在期待事情应该怎样时',
    '当你注意到自己在怨恨时',
    '当你想要控制某件事的结果时',
  ],
  actions: [
    '先停下来，不急着下结论',
    '像观察云朵一样，看着这个想法飘过',
    '深呼吸三次，不做任何反应',
    '用"也许"代替"一定"来描述它',
    '只是注意到它，不跟随它',
    '问自己：这是事实还是猜测？',
    '给这个感受起个名字，然后放下',
    '像对待一位老朋友那样，对待这个想法',
    '允许它存在，不急着处理它',
    '观察它从哪来、往哪去',
    '把这个评判写下来，看看它是否真实',
    '对自己说：此刻我选择不做评判',
    '想象你是一个客观的旁观者',
    '把注意力带回当下',
    '用好奇代替评判',
    '提醒自己：每个人都有自己的故事',
    '对自己温柔一点',
    '允许事物按它本来的样子存在',
    '给这个感受一些空间',
    '让判断的冲动慢慢消散',
    '注意到评判升起，然后轻轻放下',
    '用呼吸带走评判的冲动',
    '告诉自己：此刻我选择不参与',
    '想象评判像一片云，飘来又飘走',
    '问自己：这个评判对我有帮助吗？',
    '给它一个轻柔的微笑',
    '把注意力放在胸口，感受那里的感觉',
    '让自己从判断中抽离出来',
    '告诉自己：我不需要紧抓这个想法',
    '用"我注意到"代替"这是对的"',
  ],
  reflections: [
    '评判也是暂时的，不需要紧紧抓住',
    '事情往往不是非黑即白的',
    '我不需要为每个感受负责，只需要观察它',
    '允许它存在，不意味着认同它',
    '给自己一份不做事的空间也没关系',
    '也许事情有它自己的发展节奏',
    '我可以选择不下结论，只是看着',
    '每个人都在尽力，包括我自己',
    '这一刻，我不需要知道所有答案',
    '存在本身就是可以接受的',
    '我可以在不确定中平静',
    '让心保持柔软，不被评判硬化',
    '事情来了又走，我不需要紧抓',
    '也许我误解了什么，也许没有',
    '我可以选择放下评判的重担',
    '此刻，一切都刚刚好',
    '给自己一个不带评判的呼吸',
    '我愿意用好奇代替指责',
    '也许明天会有不同的理解',
    '就这样，已经很好了',
    '评判不会让事情变得更好',
    '我可以选择让它来，也让它走',
    '心可以像湖面，评判像涟漪，不影响湖的平静',
    '我不需要跟随每一个想法',
    '选择不下结论，也是一种自由',
    '评判只是一种习惯，不等于真实',
    '给自己一个没有评判的空间',
    '也许放下的瞬间，会更轻松',
    '事情本来的样子，已经足够',
    '我可以选择平静，而不是评判',
  ],
};

// ============ 态度数据 - 耐心 ============
const PATIENCE = {
  situations: [
    '当事情进展比预期慢时',
    '当你在排队或等待时',
    '当某件事需要你付出额外的时间时',
    '当孩子或宠物做事情很慢时',
    '当你想马上得到答案时',
    '当事情需要多次尝试才能做好时',
    '当你在等一个人的回复时',
    '当学习一个新技能感到困难时',
    '当计划被打乱需要重新等待时',
    '当有人让你等待时',
    '当事情比你预期的更复杂时',
    '当你想快速看到结果时',
    '当进度不如你预期时',
    '当需要等待一个时机时',
    '当事情需要慢慢酝酿时',
    '当你不确定还要等多久时',
    '当进展停滞让你焦虑时',
    '当别人需要更多时间来理解时',
    '当习惯的养成需要时间时',
    '当事情需要反复确认时',
    '当你觉得自己已经等了太久时',
    '当你想要催促事情发生时',
    '当你对重复感到烦躁时',
    '当事情卡在某个环节时',
    '当你要等待一个不确定的结果时',
    '当事情进展顺利却还是着急时',
    '当你发现自己已经不耐烦时',
    '当你要等待一个重要消息时',
    '当你想要快进时间时',
    '当你感到事情太慢了时',
  ],
  actions: [
    '深呼吸，给自己多一次机会',
    '把等待当作练习专注的机会',
    '提醒自己：一切都需要时间',
    '想象种子在地底下慢慢生根',
    '用等待的时间做一个小练习',
    '告诉自己：慢慢来也没关系',
    '把注意力放在过程而不是结果',
    '感谢此刻你还能等待',
    '接受事物有自己的节奏',
    '用平常心看待这段等待',
    '提醒自己：罗马不是一天建成的',
    '把"快一点"换成"来得及"',
    '允许事情按它的速度展开',
    '感受此刻呼吸的节奏',
    '信任过程的价值',
    '给自己不需要着急的空间',
    '庆祝每一小步的进展',
    '提醒自己：有些事值得等待',
    '感受当下这一刻的力量',
    '接受"不知道"的答案也没关系',
    '想象自己在等待中变得平静',
    '感受身体里那股着急的能量，然后温柔地放下它',
    '对自己说：再等一等，它会发生',
    '把注意力放在此刻能做的事情上',
    '允许事物在它自己的时间里发生',
    '感受等待时的呼吸',
    '提醒自己：有些果实需要更久才能成熟',
    '允许事情慢一点',
    '在等待中感受自己的呼吸',
    '告诉自己：时间不是敌人',
  ],
  reflections: [
    '耐心不是等待，而是保持平静地存在',
    '事物有自己的时间表',
    '此刻我在正确的位置，做着正确的事',
    '时间不是敌人，是盟友',
    '每颗种子都有它的季节',
    '我不需要催促生命',
    '让事情按它自己的节奏展开',
    '我相信一切都会在需要的时候到来',
    '不需要抓住每一刻，让它们自然流过',
    '慢慢来，其实更快',
    '我信任过程，即使我不知道结果',
    '给自己时间，也是在爱自己',
    '有些美好的事物需要时间酝酿',
    '我可以在等待中保持平静',
    '事情会在它准备好的时候发生',
    '让自己成为一个温暖的等待',
    '时间会治愈，会带来，会揭示',
    '我相信事情正在向我想要的方向展开',
    '我愿意放下急躁，接受当下',
    '一切都刚刚好在这个时刻',
    '等待本身也可以是美好的',
    '我可以在不知道结果时依然平静',
    '每件事都有它的时节',
    '耐心是一种温柔的力量',
    '我相信正在发生的一切',
    '事物正在以它们的方式展开',
    '我已经走了这么远，这本身就值得庆祝',
    '让心像大地一样，承载一切而不急',
    '我愿意用平静代替着急',
    '一切都会在最合适的时候到来',
  ],
};

// ============ 态度数据 - 初学者之心 ============
const BEGINNERS_MIND = {
  situations: [
    '当你面对一件熟悉的事时',
    '当你走过每天经过的路时',
    '当你用惯用的方式解决问题时',
    '当你以为自己已经知道答案时',
    '当你对某件事有固定看法时',
    '当你注意到自己又用老眼光看问题时',
    '当你去一个去过的地方时',
    '当你听到熟悉的话题时',
    '当你对某个人有固定印象时',
    '当一件事重复发生的时候',
    '当你的自动化反应被触发时',
    '当你想要跳过当下的体验时',
    '当你注意到"我早就知道了"的想法时',
    '当你面对一个曾经失败过的事时',
    '当你处于一个熟悉的角色中时',
    '当你在做一件例行公事时',
    '当你用旧的习惯应对新情况时',
    '当你觉得没有新东西可学的时候',
    '当你对某件事失去好奇时',
    '当你要尝试一个熟悉的方法时',
    '当你走进一个熟悉的房间时',
    '当你听到一句熟悉的话时',
    '当你重复同样的工作流程时',
    '当你在用同一个应用时',
    '当你和熟悉的人说话时',
    '当你觉得一切都在意料之中时',
    '当你发现自己不再感到惊喜时',
    '当你觉得已经掌握了一切时',
    '当你对某件事有预设的答案时',
    '当你想要跳过探索直接到达时',
  ],
  actions: [
    '用第一次看到它的眼光观察它',
    '问自己：我真的了解这件事的全部吗？',
    '假装你是第一次遇到这个情况',
    '好奇地探索，而不是急于下结论',
    '注意平时忽略的细节',
    '用一个全新的角度看待它',
    '想象一个孩子会怎样发现这件事',
    '放下"应该"知道的心态',
    '用"我不知道"开始探索',
    '对熟悉的事物说"你好"',
    '注意事物此刻正在发生的变化',
    '练习用好奇代替熟悉',
    '让自己重新感到惊喜',
    '像一个游客一样探索',
    '注意你平时没有注意到的部分',
    '让自己成为一个学习者',
    '接受"我不知道"的轻松',
    '用初学者的心面对这一天',
    '对每件事都说"有意思"',
    '让头脑像一个空白的画布',
    '假装你从来不知道这件事',
    '用惊讶的眼光看这个熟悉的东西',
    '问自己：如果我不知道它是这样呢？',
    '注意今天有什么是新奇的',
    '对自己说：我愿意用新的眼光看这件事',
    '用一个陌生人的视角看你的生活',
    '注意你平时忽略的声音和气味',
    '发现一个你从未注意过的细节',
    '想象这是你第一次做这件事',
    '带着"这会是怎样的"的好奇',
  ],
  reflections: [
    '每一天都可以是新的开始',
    '我知道的，其实没有我以为的那么多',
    '世界总在以新的方式呈现自己',
    '保持好奇，就是保持年轻',
    '我不需要知道所有答案',
    '放下已知，才能发现更多',
    '初学者的心是开放的心',
    '生活总在教我新的东西',
    '也许这一次会有所不同',
    '我愿意用新鲜的眼光看这个世界',
    '我不知道，这很好',
    '每个时刻都是全新的',
    '我可以选择用好奇代替自以为是',
    '放下过去，就能看见现在',
    '发现往往藏在熟悉之中',
    '我愿意对生活保持惊讶',
    '世界那么大，我永远学不完',
    '用孩子的眼睛，世界很美',
    '我选择用初学者的心面对',
    '每一个当下都是新的',
    '我愿意让每一天都是第一次',
    '世界永远有我不知道的部分',
    '好奇是一种礼物',
    '我可以永远保持学习的心',
    '每一天都值得用新鲜的眼光看',
    '放下预设，就会看见更多',
    '初学者的心是自由的心',
    '我愿意对一切保持好奇',
    '不知道，是一种很美的状态',
    '世界总是新鲜的',
  ],
};

// ============ 态度数据 - 信任 ============
const TRUST = {
  situations: [
    '当你不确定下一步该怎么走时',
    '当你要做一个重要的决定时',
    '当未来充满未知时',
    '当你需要依赖别人时',
    '当事情没有按计划发展时',
    '当你要把事情交给别人处理时',
    '当机会似乎还未来临',
    '当结果不是你期待的那样',
    '当你要把心里话说出来时',
    '当你需要放弃控制时',
    '当你要信任自己的身体时',
    '当你要相信自己的选择时',
    '当你要接受不确定性时',
    '当你要信任时间的力量时',
    '当你要放下担忧时',
    '当你要依靠直觉时',
    '当你要相信一切会好起来时',
    '当你要把事情放下时',
    '当你要信任自己的成长时',
    '当你要信任生命的过程时',
    '当你要做出一个没有把握的决定时',
    '当你面临选择不知所措时',
    '当你不确定自己是否做对了时',
    '当你想要变成另一个人时',
    '当你在怀疑自己的时候',
    '当你感到迷失方向时',
    '当你要相信自己的感受时',
    '当你要把重要的东西托付给别人时',
    '当你想要抓住确定性时',
    '当你要做出冒险的决定时',
  ],
  actions: [
    '闭上眼，感受自己走到今天的能力',
    '问自己：此刻我最相信什么？',
    '回忆过去那些"没想到会好"的事',
    '把注意力从担忧带回当下',
    '相信自己的第一直觉',
    '对自己说：我可以',
    '把控制权轻轻放下',
    '让事情按它自己的方式展开',
    '提醒自己：我已经走了这么远',
    '对自己已经做出的选择表示认可',
    '感受信任在身体里的感觉',
    '把担忧变成祝福',
    '给自己一个不需要知道一切的许可',
    '相信事情会在对的时间对的地方发生',
    '感受当下这一刻的足够',
    '对自己温柔地说：会好的',
    '让信任代替焦虑',
    '提醒自己：有些事我控制不了',
    '感受内在有一股稳定的力量',
    '把自己交给这个时刻',
    '注意身体里那个"我知道"的感觉',
    '对自己说：我相信我正在正确的道路上',
    '回忆一个你曾经相信并成功的事',
    '让自己感受到被保护的感觉',
    '对自己说：无论结果如何，我都可以',
    '注意你的呼吸，让它带你回到平静',
    '告诉自己：我信任生命会照顾我',
    '把注意力放在信任的感觉上，而不是担忧上',
    '问自己：如果我相信一切都会好起来，我会怎么做？',
    '让自己接受"不知道"的自由',
  ],
  reflections: [
    '我相信我有能力面对将要发生的一切',
    '我不知道未来会怎样，但我相信会好的',
    '我已经走到这里，这就是证明',
    '信任是一种选择，也是一种练习',
    '我不需要知道所有的路怎么走',
    '相信生命会带我到需要去的地方',
    '我可以同时感到不确定和安心',
    '内在的智慧会引导我',
    '一切都在按它应有的方式展开',
    '我信任自己，也信任生命',
    '有些路，走着走着就清晰了',
    '我不需要紧抓，事情会自然展开',
    '相信是我可以给自己的礼物',
    '我知道如何找到我需要的东西',
    '生命值得我相信',
    '我会照顾好我自己的',
    '我愿意让好事发生在我身上',
    '我值得被信任',
    '放下担忧，我已经被照顾得很好',
    '相信一切都有它最好的安排',
    '我走在正确的路上',
    '每一步都在带我前进',
    '我信任生命的过程',
    '相信，是我能给自己的最好礼物',
    '我知道我已经被支持着',
    '我不需要紧抓方向盘',
    '生活会把我带到需要的地方',
    '我相信自己有答案',
    '内在的智慧一直在引导我',
    '我信任我自己',
  ],
};

// ============ 态度数据 - 无为 ============
const NON_STRIVING = {
  situations: [
    '当你发现自己在用力"想把事情做好"时',
    '在做一件事时（工作/学习）',
    '当你为达到某个目标焦虑时',
    '当你发现自己在过度努力时',
    '当你对结果有强烈执念时',
    '当你无法放松地做一件事时',
    '当你在事情中找不到呼吸时',
    '当你被目标紧紧抓住时',
    '当你在追逐某个"应该"时',
    '当你在用力的状态里无法停下时',
    '当你发现自己太想要某个结果时',
    '当你在做事时身体很紧绷',
    '当你对"做得好"有强烈渴望时',
    '当你在事情里迷失了当下时',
    '当你在不停地计划下一步时',
    '当你的行动带着强迫性时',
    '当你发现自己过于紧绷时',
    '当你做事时没有享受只有压力时',
    '当你太专注于结果而忘了过程时',
    '当你发现自己过度思考时',
    '当你的努力开始失去平衡时',
    '当你对进步感到焦虑时',
    '当你不停检查进度时',
    '当你发现自己无法接受不完美时',
    '当你在努力中失去快乐时',
    '当你为"应该怎样"而挣扎时',
    '当你无法放下对结果的期待时',
    '当你发现自己"太想要"时',
    '当你在用力中失去当下时',
  ],
  actions: [
    '把注意带回当下的身体感受',
    '留意身体是否紧绷，温柔地觉察，再继续',
    '提醒自己先做好当下这一刻',
    '对自己说：好，我只需要在这里',
    '把注意力从目标移开，放回此刻',
    '感受呼吸，让呼吸带你回到当下',
    '提醒自己：此刻我能做什么？',
    '轻轻地放下对结果的执念',
    '让自己在做事时保持呼吸',
    '感受手在做的事，不去想结果',
    '对自己说：好，已经够了',
    '让努力变得轻松一点',
    '注意身体的感觉，温柔地调整',
    '提醒自己：过程就是意义',
    '让自己在做的过程中放松',
    '感受"正在做"本身就是礼物',
    '对自己说：此刻我已经足够',
    '把对结果的抓取轻轻放下',
    '感受做事的过程，而不是终点',
    '让自己在当下找到平静',
    '注意呼吸，感受当下的空气',
    '问自己：我现在能放下的有什么？',
    '让自己感受"已经足够"的感觉',
    '把努力调整到合适的程度',
    '提醒自己：不需要更多，只是这里',
    '让自己在当下这一刻休息',
    '感受身体里的紧绷，然后温柔地松开',
    '对自己说：我可以慢一点',
    '让呼吸带你离开过度用力的状态',
    '感受此刻你已经做到的',
  ],
  reflections: [
    '努力但不过度用力，是一种平衡',
    '当下这一刻，已经是全部',
    '我不需要到达某个地方才能平静',
    '做，本身就是意义',
    '我可以同时努力和放松',
    '结果不是唯一的价值',
    '此刻我已经在路上了',
    '放下对结果的执念，不是放弃',
    '我可以在做中享受',
    '一切会水到渠成',
    '每一步都是旅程的一部分',
    '我不需要紧抓目的地',
    '享受过程的人，更容易到达',
    '当下是最真实的时刻',
    '我可以努力，但不被努力消耗',
    '一切都在展开中',
    '我不需要完美才能有价值',
    '我已经在做到了',
    '让心在努力中保持柔软',
    '我可以选择不和自己较劲',
    '做就好，不要紧抓',
    '我在正确的位置，做我能做的',
    '一切都会自然展开',
    '让事物按它们的方式发生',
    '我相信过程',
    '我可以在行动中保持平静',
    '努力和呼吸可以同时存在',
    '我已经足够好',
    '让一切水到渠成',
  ],
};

// ============ 态度数据 - 接纳 ============
const ACCEPTANCE = {
  situations: [
    '当你有不舒服的情绪时',
    '今天允许自己有一个"不完美"的状态时',
    '当你找一个安静的时刻觉察身体时',
    '当你感到疲惫时',
    '当负面情绪出现时',
    '当你不满意自己时',
    '当你不确定自己够不够好时',
    '当你感到脆弱时',
    '当你不舒服的感觉出现时',
    '当你不想要某种情绪时',
    '当你与自己想要的不同时',
    '当你的身体有些不适时',
    '当你不自信的时候',
    '当你感到失落时',
    '当你不想要某种想法时',
    '当你不确定时',
    '当你的情绪起伏时',
    '当你不满意现状时',
    '当你感到孤独时',
    '当你觉得自己不够好时',
    '当你不舒服某种关系时',
    '当你感到焦虑时',
    '当你感到害怕时',
    '当你感到悲伤时',
    '当你发现自己有阴暗的想法时',
    '当你不接受自己的某个部分时',
    '当你和现实抗争时',
    '当你想要事情是另一种样子时',
    '当你无法接受某种现实时',
    '当你对自己有评判时',
  ],
  actions: [
    '对自己说：它可以先在这里',
    '允许自己有一个"不完美"的状态',
    '找一个安静的时刻，觉察身体，不去调整它，只是陪它一会儿',
    '对自己说：我现在感到……这是可以的',
    '像欢迎客人一样迎接这个感受',
    '给自己一个不需要完美的许可',
    '承认自己此刻的感受',
    '对自己温柔地说：我知道你累了',
    '给这个情绪一个名字，然后看着它',
    '对自己说：我已经尽力了',
    '接受此刻的自己',
    '对自己说：我可以感到……',
    '让自己感受这种脆弱而不评判',
    '对自己说：没关系',
    '承认自己不是完美的也没关系',
    '让自己感受到自己真实的样子',
    '对自己说：这样也可以',
    '接受自己的情绪',
    '允许自己不完美',
    '对自己温柔以待',
    '接受此刻身体的感受',
    '承认自己需要帮助也可以',
    '对自己说：我在成长中',
    '让自己感受到当下的真实',
    '对自己说：我接受这一刻的全部',
    '不急着改变，只是陪伴',
    '对自己说：我允许它在这里',
    '感受接纳在身体里的感觉',
    '对自己说：我接受这个时刻的全部',
    '让情绪像波浪一样起伏，不抓取',
  ],
  reflections: [
    '接纳不是认同，而是允许存在',
    '我可以在不评判中与自己相处',
    '我值得被温柔对待，包括对自己',
    '每个情绪都是信使',
    '我不需要完美才值得被爱',
    '我接纳此刻的自己',
    '我可以在脆弱中找到力量',
    '我愿意对自己的感受温柔',
    '承认不完美是一种勇气',
    '我接纳自己的全部',
    '我不需要逃避任何感受',
    '我在这里，即使不完美',
    '我可以与自己和平共处',
    '我值得拥有平静和接纳',
    '我接纳生命本来的样子',
    '我接纳自己一路走来的所有',
    '我可以对自己说"没关系"',
    '我不需要成为别人',
    '我接纳自己的旅程',
    '我在这里，我已经很好了',
    '我可以和不舒服的感觉待在一起',
    '接纳不等于放弃',
    '我接受此刻的全部',
    '感受存在本身就是一种力量',
    '我允许一切如其所是',
    '我可以面对任何感受',
    '我接受自己真实的样子',
    '接纳是温柔的开始',
    '我在这里，这就是全部',
    '我允许一切发生',
  ],
};

// ============ 态度数据 - 放下 ============
const LETTING_GO = {
  situations: [
    '当你写下一件最近反复想起的事情时',
    '当你开始反复思考一件事时',
    '今天练习结束一件小事后',
    '当你在紧抓某件事不放时',
    '当过去的事情还在困扰你时',
    '当你在反复回想某段对话时',
    '当担忧占据你的思绪时',
    '当你在抓着怨恨不放时',
    '当你在为结果反复担忧时',
    '当你在抓着某种情绪时',
    '当你在抓着期待不放时',
    '当你在抓着恐惧不放时',
    '当你在抓着评判不放时',
    '当你在抓着别人的看法不放时',
    '当你在抓着想要改变的事不放手时',
    '当你在抓着遗憾不放时',
    '当你在抓着愤怒不放时',
    '当你在抓着完美主义不放时',
    '当你紧抓着无法改变的事时',
    '当你在抓着应该和不应该不放时',
    '当你抓着控制权不放时',
    '当你在抓着身份或角色时',
    '当你抓着某个结果不放时',
    '当你在抓着某个人不放时',
    '当你抓着过去的伤痛不放时',
    '当你在抓着对未来的担忧时',
    '当你在抓着确定性不放时',
    '当你在抓着别人的期待不放时',
    '当你抓着某种需要不放时',
  ],
  actions: [
    '轻轻对自己说：它已经过去了',
    '把注意力带回呼吸或身体',
    '不再反复纠结它',
    '问自己：这件事我真的需要抓着吗？',
    '想象把这个重担轻轻放下',
    '对自己说：我选择放下',
    '深呼吸，然后释放',
    '提醒自己：过去已经过去了',
    '感受放下之后的轻松',
    '对自己说：这件事我可以不处理',
    '把注意力从过去转向当下',
    '给自己一个放下的空间',
    '承认你可以选择放下',
    '对自己说：我不需要紧抓不放',
    '感受放手的感觉',
    '提醒自己：放下不意味着失去',
    '让自己从重担中解脱',
    '对自己说：我允许自己放下',
    '感受呼吸带走一份沉重',
    '想象自己松开紧握的手',
    '让自己轻轻地放下',
    '感受自己在放下中变得更轻盈',
    '告诉自己：我现在就可以放下',
    '轻轻放开紧抓的手',
    '呼吸，让沉重随呼吸离开',
    '对自己说：已经够了',
    '想象事情已经结束',
    '让自己感受到轻松',
    '告诉自己：我选择放下',
    '感受放下带来的自由',
  ],
  reflections: [
    '放下是一种选择，不是一种失去',
    '过去已经过去，我只能活在当下',
    '放下不等于放弃，而是不再紧抓',
    '我可以带着过去，但不被它压垮',
    '松手之后，生命会更轻松',
    '我可以放下那些不再为我服务的东西',
    '放下是一种解脱',
    '我可以选择什么重要，什么可以放下',
    '生命在前行，我也可以放下',
    '我值得拥有轻盈的感觉',
    '放下是一种力量',
    '我已经背负够久了',
    '我可以轻装前行',
    '有些东西，抓着只会更痛',
    '放下之后，生命会有更多空间',
    '我可以选择不被过去束缚',
    '让我放下那些不再需要紧抓的东西',
    '我可以松手，让生命接住我',
    '放下是可能的，而且会让我自由',
    '今天，我选择放下',
    '过去已经过去了',
    '我已经不再需要紧抓它',
    '放下让我更自由',
    '我可以给过去一个温柔的道别',
    '此刻我可以轻松一点',
    '放下是给自己的礼物',
    '我允许自己放下',
    '生命在继续，我也继续',
    '放下是新的开始',
    '我选择让自己轻松',
  ],
};

// ============ 态度数据 - 感恩 ============
const GRATITUDE = {
  situations: [
    '睡前回想今天发生的三件值得感恩的事',
    '留意并感谢你平时习以为常的支持时',
    '对一个人说一句"谢谢"时',
    '当一天即将结束的时候',
    '当你醒来的时候',
    '当有人帮助了你的时候',
    '当你看到美好的事物时',
    '当事情顺利进行时',
    '当有人对你微笑时',
    '当你的身体感觉良好时',
    '当吃到美味的食物时',
    '当天气很好时',
    '当有人为你付出时',
    '当你有片刻安静时',
    '当看到孩子的笑脸时',
    '当收到好消息时',
    '当有人理解你时',
    '当完成一件事时',
    '当感受到爱时',
    '当能够呼吸新鲜空气时',
    '当看到自然的美时',
    '当有一个温暖的角落时',
    '当你在读到这里时',
    '当你喝到一杯温水时',
    '当你有一张舒适的床时',
    '当有人记得你的名字时',
    '当你听到喜欢的音乐时',
    '当你有一把伞遮挡风雨时',
    '当有人在排队的队伍里让你先时',
    '当有人给你一个肯定的微笑时',
  ],
  actions: [
    '回想今天发生的三件值得感恩的事',
    '感谢你平时习以为常的支持',
    '对一个人说一句"谢谢"',
    '停下来，注意你此刻拥有的一切',
    '对自己说：我感谢今天拥有的',
    '注意一件你平时忽略的小事',
    '对自己拥有的表示认可',
    '感受一份感恩在心中升起',
    '对自己说：今天有哪些美好的时刻？',
    '感谢自己的身体还在运转',
    '感谢给自己带来便利的一切',
    '感谢那些看不见的付出',
    '感谢自己一路走来的成长',
    '感受自然的馈赠无处不在',
    '对自己说：今天有什么值得感谢？',
    '感谢能够看到、听到、感受到',
    '感谢有人爱你，关心你',
    '感谢大地承载着你的每一步',
    '感受阳光、空气、水的存在',
    '感谢那些微小的善举',
    '感谢生命还在继续',
    '感谢自己的勇敢和坚持',
    '对自己说：今天我感谢……',
    '注意一件今天被你忽略的小事',
    '对某个人在心里说一声谢谢',
    '感谢自己的身体还在运转',
    '感谢这个温暖的时刻',
    '感谢有人愿意听你说话',
    '感谢你此刻拥有的这一刻',
    '感谢一切让你走到这里的一切',
  ],
  reflections: [
    '感恩让我看到生命中已经拥有的',
    '我生命中有很多值得感激的',
    '感谢让我的心更柔软',
    '我知道我被这个世界温柔地爱着',
    '今天我已经拥有了很多',
    '感恩是生命的礼物',
    '我选择专注于我已经拥有的',
    '世界在我身边放置了很多美好',
    '我知道如何找到值得感激的事物',
    '感谢让我更接近内心',
    '我为自己拥有的感到幸福',
    '我已经足够好了，已经足够多',
    '我感谢每一个支持我的人',
    '我选择用感恩的心开始这一天',
    '生命中的一切都是礼物',
    '我被爱着，被照顾着',
    '每一天都是新的礼物',
    '我已经拥有了生存所需的一切',
    '感恩打开了更多美好进来',
    '我选择记住美好的事物',
    '我有太多值得感谢的',
    '世界在默默地照顾着我',
    '我已经拥有我需要的一切',
    '感恩让我更富足',
    '每一个小事物都值得感谢',
    '我被爱包围着',
    '生命中有很多美好等待发现',
    '感谢让我更接近幸福',
    '我已经很幸运了',
    '每一天都是值得感激的礼物',
  ],
};

// ============ 态度数据 - 慷慨 ============
const GENEROSITY = {
  situations: [
    '今天对一个人多一点耐心或理解时',
    '主动做一件很小的善意行为时',
    '当你状态还不错时',
    '当你在路上遇到陌生人时',
    '当有人需要帮助时',
    '当你可以给予赞美时',
    '当你在倾听时',
    '当你可以分享时',
    '当有人在痛苦中时',
    '当你能感受到善意在流动时',
    '当你可以给予时间时',
    '当有人在等待时',
    '当你可以分享知识时',
    '当你可以给予鼓励时',
    '当有人在困惑时',
    '当你想要主动帮助时',
    '当你可以给予微笑时',
    '当有人在孤独时',
    '当你可以给予理解时',
    '当你可以传递善意时',
    '当你有余力时',
    '当你听到有人需要支持时',
    '当你看到有人struggle时',
    '当你发现有小事可以做时',
    '当你注意到有人需要善意时',
    '当你能够轻松地付出时',
    '当你看到不公平的事情时',
    '当有人在寻求帮助时',
    '当你发现自己有能力给予时',
    '当你想要让世界好一点时',
  ],
  actions: [
    '对一个人多一点耐心或理解',
    '主动做一件很小的善意行为',
    '把一点点善意分享出去',
    '主动给予一个真诚的微笑',
    '对陌生人表示善意',
    '给予别人真诚的赞美',
    '倾听而不打断',
    '分享你拥有的',
    '主动提供帮助',
    '给他人真诚的鼓励',
    '传递一个善意的举动',
    '让自己成为善意的源头',
    '给予时间和关注',
    '在小事上帮助他人',
    '分享你的故事或知识',
    '给需要的人一个微笑',
    '说一些温暖的话',
    '记住别人的名字和故事',
    '用善意回应他人',
    '给予而不求回报',
    '让自己成为他人生命中的一束光',
    '今天选择做一件善意的小事',
    '对擦肩而过的人表示祝福',
    '帮助一个陌生人',
    '给身边的人一点温暖',
    '做一件不需要回报的事',
    '把善意传出去',
    '让一个人感受到被在乎',
    '说一句温暖的话',
    '用行动传递善意',
  ],
  reflections: [
    '给予让我感到富足',
    '善意会传染，会循环',
    '当我给予，我也在收获',
    '我可以成为别人生命中的祝福',
    '善意不需要大，只要真诚',
    '我拥有很多可以分享的东西',
    '给予比索取更让我感到完整',
    '我可以成为改变的一部分',
    '善意是免费的，却很有力量',
    '当我给予，世界变得更好',
    '我选择成为一个给予者',
    '我愿意成为他人的支持',
    '善意让世界连接在一起',
    '我可以做出改变，哪怕很小',
    '给予让我的生命更有意义',
    '我相信善意的力量',
    '我拥有很多可以分享的礼物',
    '让世界因我而更温暖',
    '我愿意种下善意的种子',
    '给予本身就是我给自己的礼物',
    '我有余力时，世界需要我的善意',
    '给予是一种快乐',
    '我选择成为善意的传播者',
    '我相信善意会循环回来',
    '我可以用微小的事物带来改变',
    '给予让我的生命更丰富',
    '善意是最值得投资的事',
    '我愿意在有余力时给予更多',
    '世界因善意而更美好',
    '我选择用善意填满这个世界',
  ],
};

// 结构化行动建议生成数据
interface StructuredSuggestion {
  situations: string[];
  actions: string[];
  reflections: string[];
}

const STRUCTURED_SUGGESTIONS: { [key: string]: StructuredSuggestion } = {
  '非评判': NON_JUDGING,
  '耐心': PATIENCE,
  '初学者之心': BEGINNERS_MIND,
  '信任': TRUST,
  '无为': NON_STRIVING,
  '接纳': ACCEPTANCE,
  '放下': LETTING_GO,
  '感恩': GRATITUDE,
  '慷慨': GENEROSITY,
};

// ============ 预写高质量行动灵感句子库 ============

const ACTION_IDEAS: { [key: string]: string[] } = {
  '非评判': [
    '注意到自己在评判，只是轻轻把注意力带回到当下。',
    '今天当你心里升起一个「应该」或「不应该」时，先不急着跟随它。',
    '试着对自己说：这只是心里的一个想法，不是事实。',
    '当你在对比自己和别人时，把注意力转回到自己的呼吸上。',
    '今天留意一下，你有多少次在心里给事物贴上了好或坏的标签。',
    '当一个熟悉的想法再次出现时，试着用好奇的眼光看待它。',
    '注意到评判升起时，把它当作一片云，静静看着它飘过就好。',
    '今天对某件事想要下结论时，先停一下，问自己：这是真的吗？',
    '当你想要纠正别人时，先观察自己心里的冲动，然后让它自然消散。',
    '注意到自己在反复回想某件事时，轻轻把注意力带回到此刻的身体感受。',
    '今天试着像一个旁观者一样，看着自己心里的各种想法来来去去。',
    '当你在催促或责怪自己时，用一句温柔的话替代，比如「慢慢来」。',
    '注意到自己站在道德高地上时，试着想象自己走到对方的位置看看。',
    '今天留意一件你平时觉得理所当然的事，看看它有什么不一样。',
    '当别人的选择让你不解时，提醒自己：每个人都有自己的故事。',
    '注意到自己在预测事情会怎样发展时，把注意力轻轻拉回到现在。',
    '今天给自己一个不带评判的空间，哪怕只是几分钟。',
    '当你对某件事感到不耐烦时，先觉察呼吸三次，不做自动化反应。',
    '注意到自己紧抓着一个判断不放时，试着用「也许」替代「一定」。',
    '当你对自己不满意时，试着只是看见这种不满意。',
  ],
  '耐心': [
    '今天当你着急想要某个结果时，提醒自己：种子不会因为我们催促就更快发芽。',
    '当你发现自己想要快进时间时，把注意力放在此刻身体的感觉上。',
    '今天遇到等待时，把这段等待当作练习耐心的机会。',
    '提醒自己：有些事情需要时间酝酿，就像好酒需要年份。',
    '今天做一件小事时（比如喝水），从头到尾完整地感受它。',
    '当你感到事情进展太慢时，对自己有耐心地说：我可以等。',
    '当你特别着急时，试着先暂停，觉察一下呼吸。',
    '当你想要催促事情发生时，先停下来，感受一下此刻已经发生的。',
    '今天注意一下自己一天中有多次在急着赶往下一个时刻。',
    '当事情需要多次尝试才能做好时，告诉自己：每一次尝试都是学习。',
    '今天对自己说：慢一点，没关系。',
    '当你因为事情复杂而感到烦躁时，先深呼吸，然后一步一步来。',
    '今天试着接受「事情需要时间」这件事，不和它抗争。',
    '当你对某个人感到不耐烦时，知道他也在自己的时区里慢慢成长。',
    '今天提醒自己：连竹子在地底下的根都需要几年才能长得强壮。',
    '当你发现自己太想要某个结果时，把注意力分一些给过程。',
    '试着不加评判地体验"还没完成"的状态。',
    '当你感到焦虑时，问自己：这一刻真正需要处理的是什么？',
    '今天注意身体是否紧绷，如果有，温柔地邀请它放松。',
    '当你需要等待一个不确定的结果时，试着相信事情正在以它的节奏展开。',
  ],
  '初学者之心': [
    '今天用第一次的眼光看一个你最熟悉的地方，比如你的房间。',
    '和一个熟悉的人聊天时，带着好奇去听，而不是预设他要说什么。',
    '今天做一件日常小事（洗手、喝水），当作从未做过一样去体验。',
    '注意到「我早就知道了」的想法时，用「原来是这样吗」替代它。',
    '今天经过一条常走的路时，注意平时忽略的某个细节。',
    '当你对某件事有固定看法时，试着找出一个你从未注意过的角度。',
    '今天对一件熟悉的事说：「让我来看看你有什么新东西。」',
    '注意到自己在用旧的方式应对新情况时，问自己：有没有别的可能？',
    '今天用一个陌生人的好奇眼光，看看你今天遇到的人。',
    '当你觉得某件事无聊时，试着深入挖掘一个有趣的细节。',
    '今天注意一下，你有多少次在用「应该」来代替真正的观察。',
    '对自己说：我不知道接下来会发现什么，但这很有趣。',
    '今天尝试用孩子的眼睛看天空，看看它和平时有什么不同。',
    '当你走进一个熟悉的房间时，假扮自己第一次走进来。',
    '今天对一件你已经掌握的事，试着发现一个新的知识点。',
    '注意到自己不再感到惊喜时，问问自己：我错过了什么？',
    '今天用「有意思」代替「我知道」来开始对一个话题的探索。',
    '当一件事重复发生时，试着用全新的方式去体验它。',
    '今天让自己对最平常的事物保持开放的好奇心。',
  ],
  '信任': [
    '今天当你不确定下一步怎么走时，先停下来问问自己：我内心真正想要的是什么？',
    '做一个小决定时（比如今天吃什么），优先相信自己的感觉。',
    '当你想要变成另外一个人时，问问自己：我如何更好地成为自己？',
    '今天注意一下，你有多相信自己的直觉，而不是反复比较分析。',
    '当你在犹豫时，先停一下，听一听自己最真实的感受。',
    '当你觉得自己不够好时，告诉自己：现在的自己已经在路上。',
    '今天允许自己用自己的方式去完成一件事。',
    '今天当你担心结果时，把注意力拉回到当下能做的事上。',
    '今天，充分地做你自己。',
    '当你开始依赖外界评价时，把注意带回自己。',
    '今天拉伸身体时，尊重身体的极限。',
    '今天面对权威时，也记得倾听自己的感受。',
    '当你开始怀疑自己时，对自己说一句：我可以先试试看。',
    '今天对自己说：我信任自己走过的路。',
    '当你想要完美再开始时，试着先开始一点点。',
    '今天做一个小决定时，试着少比较一点，多相信自己的选择。',
    '提醒自己：你不需要知道所有的路怎么走，才能开始走。',
    '今天对自己已经做出的选择表示认可，而不是反复纠结。',
    '当你感到迷失方向时，回到此刻的呼吸，它一直在带你前行。',
    '今天试着不去盲目效仿别人，先信任自己的选择。',
  ],
  '无为': [
    '今天当你发现自己在用力「想把事情做好」时，把注意带回当下的呼吸。',
    '在做一件事时（工作或学习），留意身体是否紧绷，再温柔地继续。',
    '今天当你为某个目标焦虑时，提醒自己先做好这一秒。',
    '注意到自己在过度努力时，试着把力度降低一点点。',
    '觉得辛苦时对自己说：你已经足够努力了。',
    '当你发现对结果有强烈执念时，把注意放在「做」本身，而不是「做到」。',
    '今天试着在行动中保持呼吸，而不是憋着气冲刺。',
    '今天给自己留一段没有目标的时间。',
    '今天对自己说：我可以努力，但不需要过度用力。',
    '当你被目标紧紧抓住时，想象自己松开了手，让事情自然流动。',
    '今天注意一下，有多少焦虑是因为你在提前担心还没发生的事。',
    '提醒自己：结果不是唯一的价值，过程本身也是有意义的。',
    '今天让自己在做事时保持轻松的专注，而不是紧绷的抓取。',
    '当你发现自己不停计划下一步时，把注意力带回当下正在发生的事。',
    '今天试着感受「正在做」的本身就是礼物，而不只是到达目的地。',
    '提醒自己：事物会按它自己的节奏展开，我只需要在正确的位置。',
    '今天对自己说：此刻我已经足够好。',
    '当你因为太想要某个结果而焦虑时，问自己：放下对结果的期待，会怎样？',
    '今天让自己在每个行动之间都有一个短暂的休息空间。',
    '今天留意到"应该、必须"的要求，问问自己是否必要。',
  ],
  '接纳': [
    '今天当你不舒服的情绪出现时，对自己说：它可以先在这里。',
    '允许自己今天有一个「不完美」的状态，不急着改变它。',
    '找一个安静的时刻，觉察身体的感受，不去调整它，只是陪它一会儿。',
    '今天当你不满意自己时，试着像对待朋友一样对待自己。',
    '今天不要求自己必须感觉更好。',
    '今天对自己说：我接受此刻的全部。',
    '当你有不舒服的感觉时，把它当作一位客人，温柔地说：请坐。',
    '今天注意一下，你有多少次在推开或逃避不舒服的感觉。',
    '今天提醒自己：每个情绪都是信使，不是敌人。',
    '今天给自己一个不需要完美的许可。',
    '当你犯错或做得不够好时，对自己说：我已经尽力了，这已经很好。',
    '当你不喜欢某个状态时，试着不抗拒它。',
    '今天允许自己有一个不那么好的状态。',
    '今天当你感到脆弱时，不急着修复它，只是承认它在那里。',
    '对自己说：此刻，我可以和自己待在一起。',
    '今天注意身体的感觉，不去改变它，只是观察。',
    '提醒自己：我可以接受自己的情绪，而不被它控制。',
    '今天当你对某件事感到抗拒时，试着有意识地呼一口气，然后接受。',
    '对自己说：我不完美，但这没关系。',
    '今天找一个时刻，什么都不做，就只是存在着。',
  ],
  '放下': [
    '今天写下一件反复想起的事，然后轻轻对自己说：它已经过去了。',
    '当你开始反复思考一件事时，把注意力带回呼吸或身体。',
    '今天练习结束一件小事后，不再反复纠结它。',
    '提醒自己：放下不是失去，而是轻盈地继续前行。',
    '今天在执着时对自己说：我选择放下。',
    '当你紧抓着某个结果不放时，想象自己的手松开了。',
    '今天注意一下，有多少对过去的紧抓，其实是在消耗当下的能量。',
    '沉浸在过去时提醒自己：过去已经过去，我只能活在今天。',
    '今天对自己说：松手之后，生命会给我新的东西。',
    '当你抓着怨恨不放时，想象自己把这份沉重放在了地上。',
    '当你想抓住某个结果时，试着松一点。',
    '让一个已经结束的对话就停在那里。',
    '今天对自己说：此刻，我选择放下什么？',
    '当你为结果反复担忧时，问自己：这件事我真的需要抓着吗？',
    '当你意识到自己在纠结时，轻轻放开。',
    '提醒自己：放下是一种力量，不是一种放弃。',
    '今天对自己说：我允许自己放下。',
    '当你紧抓着控制权时，试着把一点点控制交出去。',
    '今天注意一下，放下之后，是不是有一些轻松感？',
    '提醒自己：生命在前行，我也可以放下，让新的东西进来。',
  ],
  '感恩': [
    '今天留意一件你平时习以为常、却一直在支持你的事物。',
    '睡前回想今天发生的三件值得感恩的事，哪怕很小。',
    '今天对一个人说一句简单的谢谢。',
    '当你吃到一顿饭时，真正注意它的味道，感谢它来到你的碗里。',
    '今天注意一下，有多少人在默默为你提供便利。',
    '感谢自己的身体还在正常运转，这是多么了不起的事。',
    '今天回想一个最近帮助过你的人，把这份感谢真正收进心里。',
    '当你看到美好的事物时（阳光、花朵），停一下，真正看见它。',
    '今天对自己说：我已经拥有了很多。',
    '感谢大地承载着你的每一步，这是看不见的馈赠。',
    '今天注意阳光、空气、水，这些我们习以为常却不可或缺的事物。',
    '感谢那些微小的善举，哪怕只是一个微笑。',
    '今天对自己一路走来的成长说一声谢谢。',
    '当你有片刻安静时，感受这份平静本身就是一种馈赠。',
    '今天注意那些你平时忽略的小幸运。',
    '感谢生命还在继续，这是一个奇迹。',
    '今天对自己说一句感谢的话。',
    '当你收到一个小小的善意时，真正感受它带来的温暖。',
    '留意生活中一个微小但持续的支持。',
    '感谢今天的一切，无论是顺境还是挑战，它们都让你成长。',
  ],
  '慷慨': [
    '今天对一个人多一点耐心或理解，哪怕只是多听几秒。',
    '主动做一件很小的善意行为，比如让路、微笑、说句暖心的话。',
    '帮一个人拿一下东西。',
    '今天对擦肩而过的人表示祝福，哪怕只是在心里默默祝福。',
    '主动帮助一个陌生人，哪怕只是很小的举动。',
    '今天给予别人真诚的鼓励，而不是批评或建议。',
    '倾听而不打断，让对方感受到被重视。',
    '今天把自己的一点时间或关注给予需要的人。',
    '说一句温暖的话，让一个人的一天变得不同。',
    '当别人情绪不好时，多听一会儿，不急着给建议。',
    '在小事上帮助他人，比如捡起掉落的物品、指路。',
    '今天在一个细节上多考虑一下别人。',
    '用善意回应他人，而不是冷漠或急躁。',
    '今天用温和的方式回应一次冲突。',
    '做一个不求回报的善意举动。',
    '主动夸一句别人做得不错的地方。',
    '主动表达一句真诚的认可。',
    '今天在群里回应一个被忽略的人。',
    '让自己在分享中感受到富足，而不是失去。',
    '对别人主动问一句：你还好吗？',
  ],
};

// 随机获取行动灵感（避免重复）
export function getRandomActionIdea(attitudeName: string, previousIdea?: string): string {
  const ideas = ACTION_IDEAS[attitudeName];
  if (!ideas || ideas.length === 0) return '活在当下，感受此刻';

  // 如果只有一个，直接返回
  if (ideas.length === 1) return ideas[0];

  // 过滤掉上一条，避免重复
  const available = previousIdea ? ideas.filter(idea => idea !== previousIdea) : ideas;

  // 如果过滤后空了（理论上不应该），回退到全部
  if (available.length === 0) return ideas[Math.floor(Math.random() * ideas.length)];

  return available[Math.floor(Math.random() * available.length)];
}

// 兼容旧接口
export function getRandomAction(attitudeIndex: number, currentAction?: string): string {
  const attitude = ATTITUDES[attitudeIndex];
  if (!attitude) return '活在当下，感受此刻';
  return getRandomActionIdea(attitude.name, currentAction);
}

export const ATTITUDES: MindfulnessAttitude[] = [
  {
    name: '非评判',
    meaning: '看见心里的喜欢与不喜欢，却不必跟随它行动',
    actions: [],
    plant: '松树',
    plantEmoji: '🌲',
    plantReason: '四季变换，松树见证一切风景，但不被左右',
    gradient: 'from-amber-100 to-yellow-100',
    lightColor: 'bg-amber-50',
  },
  {
    name: '耐心',
    meaning: '允许一切按照它自己的节奏展开',
    actions: [],
    plant: '竹子',
    plantEmoji: '🎋',
    plantReason: '竹子在地下默默生长多年，才会破土而出',
    gradient: 'from-green-100 to-emerald-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '初学者之心',
    meaning: '带着开放与好奇，看到每一刻的新鲜、丰富和趣味',
    actions: [],
    plant: '樱花',
    plantEmoji: '🌸',
    plantReason: '樱花不会重复开放，每一场花期都如是独一无二的',
    gradient: 'from-pink-100 to-rose-100',
    lightColor: 'bg-pink-50',
  },
  {
    name: '信任',
    meaning: '尊崇自己的感受，更好地成为你自己',
    actions: [],
    plant: '莲花',
    plantEmoji: '🪷',
    plantReason: '莲花出淤泥而不染，生长在泥里，却不让它定义自己',
    gradient: 'from-teal-100 to-cyan-100',
    lightColor: 'bg-teal-50',
  },
  {
    name: '无为',
    meaning: '努力但不过度用力，照看好每个当下，一切会水到渠成',
    actions: [],
    plant: '叶子',
    plantEmoji: '🍃',
    plantReason: '一片叶子会随风而动，顺势而为',
    gradient: 'from-violet-100 to-purple-100',
    lightColor: 'bg-violet-50',
  },
  {
    name: '接纳',
    meaning: '允许一切如其所是地存在',
    actions: [],
    plant: '薰衣草',
    plantEmoji: '🪻',
    plantReason: '伴随薰衣草的芳香，在任何状态下安放自己',
    gradient: 'from-rose-100 to-pink-100',
    lightColor: 'bg-rose-50',
  },
  {
    name: '放下',
    meaning: '允许人、事物的消逝和变化',
    actions: [],
    plant: '枫树',
    plantEmoji: '🍁',
    plantReason: '枫树会在季节到来时自然落叶，轻轻放手',
    gradient: 'from-orange-100 to-red-100',
    lightColor: 'bg-orange-50',
  },
  {
    name: '感恩',
    meaning: '把注意轻轻放回已经拥有的部分',
    actions: [],
    plant: '四叶草',
    plantEmoji: '🍀',
    plantReason: '像发现四叶草那样，看见那些本来就在的幸运',
    gradient: 'from-green-100 to-sage-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '慷慨',
    meaning: '在有余力的时候，给予这个世界温柔与善意',
    actions: [],
    plant: '向日葵',
    plantEmoji: '🌻',
    plantReason: '向日葵接住阳光，也把温暖传递出去',
    gradient: 'from-yellow-100 to-amber-100',
    lightColor: 'bg-yellow-50',
  },
];
// ============ 态度卡记录 ============

const CARD_DRAWS_KEY = 'mindful_forest_card_draws';
// 注意：getTodayCards 仍使用此 key（{ drawTime }[] 格式），但 records page 需要 CardCompletionRecord[]
// 保持向后兼容：写入时同时写两个格式，读records时需要根据是否有 type 字段来判断
const CARD_COMPLETIONS_KEY = 'mindful_forest_card_completions';
const CARD_COMPLETIONS_FULL_KEY = 'mindful_forest_card_completions_full';

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export interface TodayCardsState {
  draws: CardDraw[]; // 今天所有抽取的卡
  completedDrawIds: string[]; // 完成的抽取ID (drawTime)
}

export function getTodayCards(): TodayCardsState {
  if (typeof window === 'undefined') return { draws: [], completedDrawIds: [] };

  const today = getToday();
  const drawsData = localStorage.getItem(CARD_DRAWS_KEY);
  const completionsData = localStorage.getItem(CARD_COMPLETIONS_KEY);

  const allDraws: CardDraw[] = drawsData ? JSON.parse(drawsData) : [];
  const allCompletions: { drawTime: string }[] = completionsData ? JSON.parse(completionsData) : [];

  const todayDraws = allDraws.filter(d => d.date === today);
  const completedDrawIds = allCompletions
    .filter(c => todayDraws.some(d => d.drawTime === c.drawTime))
    .map(c => c.drawTime);

  return { draws: todayDraws, completedDrawIds };
}

export function getTodayFirstCard(): CardDraw | null {
  const { draws } = getTodayCards();
  return draws.length > 0 ? draws[0] : null;
}

export function hasDrawnToday(): boolean {
  return getTodayFirstCard() !== null;
}

export function drawCard(attitudeIndex?: number): CardDraw {
  const today = getToday();
  const index = attitudeIndex ?? Math.floor(Math.random() * ATTITUDES.length);
  const action = getRandomAction(index);

  const draw: CardDraw = {
    date: today,
    cardIndex: index,
    completed: false,
    actionSuggestion: action,
    drawTime: getNow(),
  };

  // 保存抽取记录
  const drawsData = localStorage.getItem(CARD_DRAWS_KEY);
  const draws: CardDraw[] = drawsData ? JSON.parse(drawsData) : [];
  draws.push(draw);
  localStorage.setItem(CARD_DRAWS_KEY, JSON.stringify(draws));

  // 更新 streak
  updateStreak();

  return draw;
}

export function completeCard(drawTime: string, feeling?: string): void {
  const today = getToday();

  // 更新 draws 中的完成状态
  const drawsData = localStorage.getItem(CARD_DRAWS_KEY);
  const draws: CardDraw[] = drawsData ? JSON.parse(drawsData) : [];
  const drawIndex = draws.findIndex(d => d.drawTime === drawTime);
  const draw = draws.find(d => d.drawTime === drawTime);
  if (drawIndex >= 0) {
    draws[drawIndex].completed = true;
    if (feeling) draws[drawIndex].feeling = feeling;
    localStorage.setItem(CARD_DRAWS_KEY, JSON.stringify(draws));
  }

  // 保存完整的完成记录（用于记录页面，写到独立 key）
  const fullRecordsData = localStorage.getItem(CARD_COMPLETIONS_FULL_KEY);
  const fullRecords: CardCompletionRecord[] = fullRecordsData ? JSON.parse(fullRecordsData) : [];

  if (draw) {
    const attitude = ATTITUDES[draw.cardIndex];
    fullRecords.push({
      id: generateId(),
      type: 'attitude',
      date: today,
      completedAt: getNow(),
      drawTime,
      attitudeName: attitude.name,
      plantName: attitude.plant,
      emoji: attitude.plantEmoji,
      actionPlan: draw.actionSuggestion || '',
      reflection: feeling || '',
    });
  }

  localStorage.setItem(CARD_COMPLETIONS_FULL_KEY, JSON.stringify(fullRecords));

  // 增加植物正念值
  if (draw) {
    incrementPlantValue(ATTITUDES[draw.cardIndex].plant);
  }

  // 更新 streak
  updateStreak();
}

export function getTodayCompletedCount(): number {
  return getTodayCards().completedDrawIds.length;
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
  // 确保有 id 和 completedAt
  if (!record.id) {
    record.id = generateId();
  }
  if (!record.completedAt) {
    record.completedAt = getNow();
  }
  records.push(record);
  localStorage.setItem(MEDITATION_RECORDS_KEY, JSON.stringify(records));
  updateStreak();
}

// 获取卡完成记录
export function getCardCompletionRecords(): CardCompletionRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CARD_COMPLETIONS_FULL_KEY);
  return data ? JSON.parse(data) : [];
}

// 获取所有浇灌记录（态度卡 + 冥想），按时间倒序
export function getAllRecords(): RecordEntry[] {
  if (typeof window === 'undefined') return [];

  const cardRecords = getCardCompletionRecords();
  const meditationRecords = getMeditationRecords() as unknown as MeditationRecordFull[];

  // 统一格式，兼容旧数据（缺字段时补默认值）
  const attitudeEntries: RecordEntry[] = cardRecords.map(r => ({
    id: r.id || generateId(),
    type: 'attitude' as const,
    date: r.date || '',
    completedAt: r.completedAt || r.date || new Date().toISOString(),
    drawTime: r.drawTime || '',
    attitudeName: r.attitudeName || '',
    plantName: r.plantName || '',
    emoji: r.emoji || '🌱',
    actionPlan: r.actionPlan || '',
    reflection: r.reflection || '',
  }));

  const meditationEntries: RecordEntry[] = meditationRecords.map(r => ({
    id: r.id || generateId(),
    type: 'meditation' as const,
    date: r.date || '',
    completedAt: r.completedAt || r.date || new Date().toISOString(),
    duration: r.duration || 0,
    reflection: r.reflection || r.feeling || '',
  }));

  // 合并并按 completedAt 倒序（安全排序，兼容缺字段的旧数据）
  const all = [...attitudeEntries, ...meditationEntries];
  all.sort((a, b) => {
    const timeA = a.completedAt || a.date || '';
    const timeB = b.completedAt || b.date || '';
    return timeB.localeCompare(timeA);
  });

  return all;
}

// ============ 植物正念值 ============

const PLANT_VALUES_KEY = 'mindful_forest_plant_values';
const DAYS_UNTIL_STALE = 7;

// 获取原始存储数据
function getPlantStore(): PlantStore {
  if (typeof window === 'undefined') return { scores: {}, lastWateredAt: {} };
  const data = localStorage.getItem(PLANT_VALUES_KEY);
  if (!data) return { scores: {}, lastWateredAt: {} };
  const parsed = JSON.parse(data);
  // 兼容旧格式：直接是 { plantName: score }
  if (!parsed.scores && !parsed.lastWateredAt) {
    return { scores: parsed as PlantData, lastWateredAt: {} };
  }
  return { scores: parsed.scores || {}, lastWateredAt: parsed.lastWateredAt || {} };
}

// 保存植物数据
function savePlantStore(store: PlantStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLANT_VALUES_KEY, JSON.stringify(store));
}

// 获取植物分数（含7天未浇灌归零逻辑）
export function getPlantValues(): PlantData {
  const store = getPlantStore();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - DAYS_UNTIL_STALE);
  const staleThreshold = toLocalDateString(thirtyDaysAgo);

  let didReset = false;

  // 检查每株植物是否超过7天未浇灌
  Object.keys(store.lastWateredAt).forEach(plant => {
    if (store.lastWateredAt[plant] && store.lastWateredAt[plant] < staleThreshold) {
      store.scores[plant] = 0;
      // 清除旧的浇水记录，避免重复检查
      delete store.lastWateredAt[plant];
      didReset = true;
    }
  });

  // 如果有归零操作，保存
  if (didReset) {
    savePlantStore(store);
  }

  return store.scores;
}

// 获取某株植物的最后浇灌日期
export function getPlantLastWateredAt(plantName: string): string | null {
  const store = getPlantStore();
  return store.lastWateredAt[plantName] || null;
}

export function savePlantValues(values: PlantData): void {
  if (typeof window === 'undefined') return;
  const store = getPlantStore();
  // 保留 lastWateredAt，只更新 scores
  store.scores = values;
  savePlantStore(store);
}

export function incrementPlantValue(plantName: string, amount: number = 1): void {
  const store = getPlantStore();
  store.scores[plantName] = (store.scores[plantName] || 0) + amount;
  store.lastWateredAt[plantName] = getToday();
  savePlantStore(store);
}

export function incrementAllPlants(amount: number = 1): void {
  const plants = getAllPlantNames();
  const store = getPlantStore();
  const today = getToday();
  plants.forEach(plant => {
    store.scores[plant] = (store.scores[plant] || 0) + amount;
    store.lastWateredAt[plant] = today;
  });
  savePlantStore(store);
}

// ============ 统计数据 ============

export function getTodayStats(): {
  cardCount: number;
  meditationCount: number;
} {
  const today = getToday();
  const cardRecords = getTodayCards().completedDrawIds.length;
  const meditationRecords = getMeditationRecords().filter(r => r.date === today && r.completed).length;

  return {
    cardCount: cardRecords,
    meditationCount: meditationRecords,
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
  drawTime?: string;
}> {
  const todayCards = getTodayCards().draws.filter(d => d.completed);
  const meditationRecords = getMeditationRecords().filter(r => r.completed);

  const allRecords = [
    ...todayCards.map(r => ({
      type: 'card' as const,
      date: r.date,
      content: ATTITUDES[r.cardIndex]?.plant || '态度卡',
      plant: ATTITUDES[r.cardIndex]?.plantEmoji,
      drawTime: r.drawTime,
    })),
    ...meditationRecords.map(r => ({
      type: 'meditation' as const,
      date: r.date,
      content: `${r.duration}分钟`,
      plant: '🧘',
      drawTime: undefined as undefined,
    }))
  ];

  return allRecords
    .sort((a, b) => {
      const timeA = a.drawTime || a.date;
      const timeB = b.drawTime || b.date;
      return timeB.localeCompare(timeA);
    })
    .slice(0, limit);
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CARD_DRAWS_KEY);
  localStorage.removeItem(CARD_COMPLETIONS_KEY);
  localStorage.removeItem(CARD_COMPLETIONS_FULL_KEY);
  localStorage.removeItem(MEDITATION_RECORDS_KEY);
  localStorage.removeItem(PLANT_VALUES_KEY);
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem(FIRST_USED_AT_KEY);
}

// ============ 辅助函数 ============

export function getAllPlantNames(): string[] {
  return ATTITUDES.map(a => a.plant);
}

export function getAttitudeByPlant(plantName: string): MindfulnessAttitude | null {
  return ATTITUDES.find(a => a.plant === plantName) || null;
}

export function getAttitudeByIndex(index: number): MindfulnessAttitude | null {
  return ATTITUDES[index] || null;
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

// 进度信息接口
export interface PlantProgress {
  currentScore: number;
  currentStage: GrowthStage;
  currentStageName: string;
  nextStage: GrowthStage | null;
  nextStageName: string;
  nextStageThreshold: number;
  pointsToNext: number;
  progressPercent: number;
  stageThresholds: { seedling: number; growing: number; lush: number; mature: number };
}

// 获取植物进度信息
export function getPlantProgress(score: number): PlantProgress {
  const thresholds = { seedling: 0, growing: 3, lush: 6, mature: 10 };
  const MAX_SCORE = 10;

  let currentStage: GrowthStage;
  let currentStageName: string;
  let nextStage: GrowthStage | null;
  let nextStageName: string;
  let nextStageThreshold: number;
  let pointsToNext: number;

  // 统一按10分制计算进度百分比
  const progressPercent = Math.min(score, MAX_SCORE) / MAX_SCORE * 100;

  if (score >= 10) {
    currentStage = 'mature';
    currentStageName = '绽放';
    nextStage = null;
    nextStageName = '';
    nextStageThreshold = MAX_SCORE;
    pointsToNext = 0;
  } else if (score >= 6) {
    currentStage = 'lush';
    currentStageName = '茂盛';
    nextStage = 'mature';
    nextStageName = '绽放';
    nextStageThreshold = MAX_SCORE;
    pointsToNext = MAX_SCORE - score;
  } else if (score >= 3) {
    currentStage = 'growing';
    currentStageName = '生长中';
    nextStage = 'lush';
    nextStageName = '茂盛';
    nextStageThreshold = 6;
    pointsToNext = 6 - score;
  } else {
    currentStage = 'seedling';
    currentStageName = '幼苗';
    nextStage = 'growing';
    nextStageName = '生长中';
    nextStageThreshold = 3;
    pointsToNext = 3 - score;
  }

  return {
    currentScore: score,
    currentStage,
    currentStageName,
    nextStage,
    nextStageName,
    nextStageThreshold,
    pointsToNext,
    progressPercent,
    stageThresholds: thresholds,
  };
}

// 打卡庆祝文案
const CELEBRATION_MESSAGES = {
  watering: [
    '这份态度，正在你的森林里扎根',
    '你的植物收到了这一次浇灌',
    '又一份觉察，滋养了这株植物',
    '今天你为森林浇了一次水',
    '这株植物因为你的觉察又长大了一点',
  ],
  stageUp: [
    '恭喜！你的植物进入了下一个阶段',
    '它在你的陪伴下又成长了',
    '持续浇灌，静待花开',
  ],
  firstTime: [
    '这是你第一次浇灌这株植物',
    '新的种子已经种下',
  ],
};

// 根据浇水场景获取庆祝文案
export function getCelebrationMessage(plantName: string, attitudeName: string, score: number, previousScore: number): string {
  // 如果是第一次浇水
  if (previousScore === 0 && score === 1) {
    return CELEBRATION_MESSAGES.firstTime[Math.floor(Math.random() * CELEBRATION_MESSAGES.firstTime.length)];
  }

  // 如果升级了
  const prevProgress = getPlantProgress(previousScore);
  const currProgress = getPlantProgress(score);
  if (prevProgress.currentStage !== currProgress.currentStage) {
    return CELEBRATION_MESSAGES.stageUp[Math.floor(Math.random() * CELEBRATION_MESSAGES.stageUp.length)];
  }

  // 普通的浇水文案
  return CELEBRATION_MESSAGES.watering[Math.floor(Math.random() * CELEBRATION_MESSAGES.watering.length)];
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
