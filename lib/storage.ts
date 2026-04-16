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
  date: string;
  duration: number;
  feeling: string;
  completed: boolean;
}

export interface PlantData {
  [key: string]: number;
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

// ============ 日期工具 ============

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getNow(): string {
  return new Date().toISOString();
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
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
  '不评判': {
    bgStart: '#faf8f3',
    bgEnd: '#f5f0e8',
    titleColor: '#5d5245',
    bodyText: '#4a4238',
    cardBg: 'rgba(255, 252, 245, 0.85)',
    cardText: '#5d5245',
    accent: '#c4a86a',
    subtle: '#a89a85',
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
    bgStart: '#f4f8f7',
    bgEnd: '#e8f0ed',
    titleColor: '#3a5a50',
    bodyText: '#2e4a40',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardText: '#3a5a50',
    accent: '#8fc9a8',
    subtle: '#a5d4b8',
  },
  '不强求': {
    bgStart: '#f7f5fa',
    bgEnd: '#efeef5',
    titleColor: '#5a4a6a',
    bodyText: '#4a3d5a',
    cardBg: 'rgba(252, 250, 255, 0.85)',
    cardText: '#5a4a6a',
    accent: '#b8a5c9',
    subtle: '#a590b8',
  },
  '接纳': {
    bgStart: '#faf5f5',
    bgEnd: '#f5eeee',
    titleColor: '#5a4a4a',
    bodyText: '#4a3d3d',
    cardBg: 'rgba(255, 252, 252, 0.85)',
    cardText: '#5a4a4a',
    accent: '#d4a5a5',
    subtle: '#c49393',
  },
  '放下': {
    bgStart: '#f4f8f4',
    bgEnd: '#e6f0e6',
    titleColor: '#3a5a3a',
    bodyText: '#2e4a2e',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardText: '#3a5a3a',
    accent: '#95c995',
    subtle: '#a5d4a5',
  },
  '感恩': {
    bgStart: '#faf8f0',
    bgEnd: '#f5f0e0',
    titleColor: '#5a5230',
    bodyText: '#4a4228',
    cardBg: 'rgba(255, 252, 240, 0.85)',
    cardText: '#5a5230',
    accent: '#d4c490',
    subtle: '#c4b480',
  },
  '慷慨': {
    bgStart: '#faf5f0',
    bgEnd: '#f5ede5',
    titleColor: '#5a4540',
    bodyText: '#4a3835',
    cardBg: 'rgba(255, 252, 248, 0.85)',
    cardText: '#5a4540',
    accent: '#d4a590',
    subtle: '#c49580',
  },
};

// 结构化行动建议生成数据
interface StructuredSuggestion {
  situations: string[];
  actions: string[];
  reflections: string[];
}

const STRUCTURED_SUGGESTIONS: { [key: string]: StructuredSuggestion } = {
  '不评判': {
    situations: [
      '当你注意到自己在心里给某件事下了定论时',
      '当有人说了让你想反驳的话时',
      '当你在评判今天的天气时',
      '当你发现自己正在对比自己和别人时',
      '当一个旧有的想法再次出现时',
      '当你在心里说"应该"或"不应该"时',
      '当你想要纠正别人的时候',
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
    ],
  },
  '耐心': {
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
    ],
  },
  '初学者之心': {
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
    ],
  },
  '信任': {
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
    ],
  },
  '不强求': {
    situations: [
      '当事情没有按你想要的方式发展时',
      '当结果不是你期待的那样时',
      '当有人没有按你期望的方式回应时',
      '当事情进展得太慢时',
      '当事情出错的时候',
      '当计划被打乱时',
      '当事情需要你放下控制时',
      '当你不确定事情会怎样时',
      '当事情超出你的能力范围时',
      '当别人让你失望时',
      '当事情不如你预期时',
      '当你想改变却改变不了时',
      '当事情需要时间却你很急时',
      '当你想抓紧却抓不住时',
      '当事情已经结束却你不想放下时',
      '当未来不确定时',
      '当你不接受某个现实时',
      '当你想让事情不同却无能为力时',
      '当事情需要"顺其自然"时',
      '当你想控制局面却控制不了时',
    ],
    actions: [
      '对自己说：好，这样也可以',
      '承认此刻的样子，允许它就这样',
      '放下对结果的执着',
      '练习说"我不知道也没关系"',
      '把注意力从"为什么"转向"是什么"',
      '让自己接受事物的本来面目',
      '对自己说：事情正在以它们的方式发生',
      '放下不需要紧抓的东西',
      '感受此刻的平静',
      '练习放手，而不是放弃',
      '对自己说：一切都会好的',
      '把期待放下，把当下拿起',
      '感受事物自然展开的节奏',
      '提醒自己：有些事我无法控制',
      '让自己放松在"不知道"的空间里',
      '感受呼吸，把注意力带回身体',
      '对自己说：没关系',
      '允许事情按它们的方式发生',
      '放下抗争，感受事物的流动',
      '接受不确定性作为生命的一部分',
    ],
    reflections: [
      '我无法控制一切，这没关系',
      '事情有它们自己的道路',
      '我可以放手，让生命引导',
      '不强求，是一种温柔的力量',
      '有些事我无法改变，但我可以接受',
      '放下不是放弃，而是选择平静',
      '我愿意接受事物本来的样子',
      '我可以在不确定中保持平静',
      '有些结果不是我能决定的',
      '让事情自然发生，而不是紧抓不放',
      '我已经尽力，剩下的交给生命',
      '我可以选择不抗争',
      '事情会过去，生命在继续',
      '我值得拥有平静，哪怕结果不如预期',
      '我可以接受，同时也在前进',
      '不强求，让我更自由',
      '放下对结果的执着是一种智慧',
      '我相信一切都会在最合适的时候发生',
      '我愿意让自己松开手',
      '好，这样也可以',
    ],
  },
  '接纳': {
    situations: [
      '当你感到疲惫时',
      '当负面情绪出现时',
      '当你不满意自己时',
      '当你犯错的时候',
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
      '当你要承认自己的局限时',
    ],
    actions: [
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
    ],
  },
  '放下': {
    situations: [
      '当你在紧抓某件事不放时',
      '当过去的事情还在困扰你时',
      '当你在反复回想某段对话时',
      '当担忧占据你的思绪时',
      '当你在抓着怨恨不放时',
      '当你在为结果反复担忧时',
      '当你在紧抓一个身份或角色时',
      '当你在抓着控制权不放时',
      '当你在紧抓某种情绪时',
      '当你在抓着期待不放时',
      '当你在抓着恐惧不放时',
      '当你在抓着评判不放时',
      '当你在抓着别人的看法不放时',
      '当你在抓着想要改变的事不放手',
      '当你在抓着遗憾不放时',
      '当你在抓着愤怒不放时',
      '当你在抓着某种需要不放时',
      '当你在抓着不安全感不放时',
      '当你在抓着应该和不应该不放时',
      '当你在抓着完美主义不放时',
    ],
    actions: [
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
    ],
  },
  '感恩': {
    situations: [
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
    ],
    actions: [
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
    ],
  },
  '慷慨': {
    situations: [
      '当你在路上遇到陌生人时',
      '当有人需要帮助时',
      '当你可以给予赞美时',
      '当你在倾听时',
      '当你拥有的比需要的更多时',
      '当有人感到沮丧时',
      '当你可以分享时',
      '当有人在痛苦中时',
      '当你收到温暖的微笑时',
      '当你可以给予时间时',
      '当有人在等待时',
      '当你可以分享知识时',
      '当你可以给予鼓励时',
      '当有人在困惑时',
      '当你可以主动帮助时',
      '当你可以给予微笑时',
      '当有人在孤独时',
      '当你可以给予理解时',
      '当你可以传递善意时',
      '当你可以分享你的资源时',
    ],
    actions: [
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
      '给需要的人一个拥抱',
      '说一些温暖的话',
      '记住别人的名字和故事',
      '用善意回应他人',
      '给予而不求回报',
      '让自己成为他人生命中的一束光',
      '今天，选择做一件善意的小事',
      '对擦肩而过的人表示祝福',
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
    ],
  },
};

// 随机选择数组中的一个元素
function pickRandom<T>(arr: T[], exclude?: T): T {
  let pool = exclude ? arr.filter(item => item !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 生成结构化行动建议
export function generateStructuredSuggestion(attitudeName: string, previousSuggestion?: string): string {
  const data = STRUCTURED_SUGGESTIONS[attitudeName];
  if (!data) return '活在当下，感受此刻';

  const situation = pickRandom(data.situations);
  const action = pickRandom(data.actions);
  const reflection = pickRandom(data.reflections);

  // 随机选择句式模板
  const templates = [
    `${situation}，试着${action}，${reflection}。`,
    `${situation}，也许可以${action}。${reflection}。`,
    `当你${situation.slice(2)}，${action}。${reflection}。`,
    `如果${situation}，${action}。${reflection}。`,
    `${situation}时，${action}。让自己感受到，${reflection}。`,
  ];

  const suggestion = pickRandom(templates);

  // 避免重复
  if (suggestion !== previousSuggestion) {
    return suggestion;
  }
  return generateStructuredSuggestion(attitudeName, previousSuggestion);
}

// 兼容旧接口
export function getRandomAction(attitudeIndex: number, currentAction?: string): string {
  const attitudes = ATTITUDES[attitudeIndex];
  if (!attitudes) return '活在当下，感受此刻';
  return generateStructuredSuggestion(attitudes.name, currentAction);
}

export const ATTITUDES: MindfulnessAttitude[] = [
  {
    name: '不评判',
    meaning: '对当下的一切保持客观，不急于下结论',
    actions: [],
    plant: '蒲公英',
    plantEmoji: '🌼',
    plantReason: '蒲公英随风飘散，不强求落在何处，象征不评判、顺其自然的生活态度',
    gradient: 'from-amber-100 to-yellow-100',
    lightColor: 'bg-amber-50',
  },
  {
    name: '耐心',
    meaning: '理解一切都需要时间，允许事物按自己的节奏展开',
    actions: [],
    plant: '竹子',
    plantEmoji: '🎋',
    plantReason: '竹子缓慢生长，却始终向上，象征不急不躁的坚持与耐心',
    gradient: 'from-green-100 to-emerald-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '初学者之心',
    meaning: '像第一次看到世界一样，保持好奇和开放',
    actions: [],
    plant: '樱花',
    plantEmoji: '🌸',
    plantReason: '樱花年年盛开，却每一年都像是第一次绽放，象征永远保持好奇与新鲜',
    gradient: 'from-pink-100 to-rose-100',
    lightColor: 'bg-pink-50',
  },
  {
    name: '信任',
    meaning: '相信自己和他人的内在智慧，建立信任感',
    actions: [],
    plant: '银杏',
    plantEmoji: '🍃',
    plantReason: '银杏活过千年依然金黄不变，象征内在永恒的智慧与信任',
    gradient: 'from-teal-100 to-cyan-100',
    lightColor: 'bg-teal-50',
  },
  {
    name: '不强求',
    meaning: '接受事物本来的样子，不过度执着',
    actions: [],
    plant: '薰衣草',
    plantEmoji: '💜',
    plantReason: '薰衣草随风摇曳不强求，象征接受与放下',
    gradient: 'from-violet-100 to-purple-100',
    lightColor: 'bg-violet-50',
  },
  {
    name: '接纳',
    meaning: '开放地接受当下的真实，不抗拒',
    actions: [],
    plant: '莲花',
    plantEmoji: '🪷',
    plantReason: '莲花出淤泥而不染，接纳所有经历化为成长',
    gradient: 'from-rose-100 to-pink-100',
    lightColor: 'bg-rose-50',
  },
  {
    name: '放下',
    meaning: '释放不必要的负担，让一切自然流动',
    actions: [],
    plant: '柳树',
    plantEmoji: '🌿',
    plantReason: '柳树随风摇曳能屈能伸，象征放下与顺应',
    gradient: 'from-green-100 to-sage-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '感恩',
    meaning: '珍惜所拥有的，心怀感激',
    actions: [],
    plant: '向日葵',
    plantEmoji: '🌻',
    plantReason: '向日葵永远朝向阳光生长，象征心怀感恩与希望',
    gradient: 'from-yellow-100 to-amber-100',
    lightColor: 'bg-yellow-50',
  },
  {
    name: '慷慨',
    meaning: '无私地分享和给予，传递善意',
    actions: [],
    plant: '玉兰',
    plantEmoji: '🌺',
    plantReason: '玉兰花大而芬芳，先开花后长叶，象征无私的给予与分享',
    gradient: 'from-orange-100 to-red-100',
    lightColor: 'bg-orange-50',
  },
];
// ============ 态度卡记录 ============

const CARD_DRAWS_KEY = 'mindful_forest_card_draws';
const CARD_COMPLETIONS_KEY = 'mindful_forest_card_completions';

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
  if (drawIndex >= 0) {
    draws[drawIndex].completed = true;
    if (feeling) draws[drawIndex].feeling = feeling;
    localStorage.setItem(CARD_DRAWS_KEY, JSON.stringify(draws));
  }

  // 保存完成记录
  const completionsData = localStorage.getItem(CARD_COMPLETIONS_KEY);
  const completions: { date: string; drawTime: string }[] = completionsData ? JSON.parse(completionsData) : [];
  completions.push({ date: today, drawTime });
  localStorage.setItem(CARD_COMPLETIONS_KEY, JSON.stringify(completions));

  // 增加植物正念值
  const draw = draws.find(d => d.drawTime === drawTime);
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
  records.push(record);
  localStorage.setItem(MEDITATION_RECORDS_KEY, JSON.stringify(records));
  updateStreak();
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
  localStorage.removeItem(MEDITATION_RECORDS_KEY);
  localStorage.removeItem(PLANT_VALUES_KEY);
  localStorage.removeItem(STREAK_KEY);
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
