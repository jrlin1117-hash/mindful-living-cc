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

// ============ 态度卡数据 - 100条行动建议 ============

export const ATTITUDES: MindfulnessAttitude[] = [
  {
    name: '不评判',
    meaning: '对当下的一切保持客观，不急于下结论',
    actions: [
      '今天，当你发现自己在评判时，温柔地注意到它，然后轻轻放下',
      '遇到一件事，先深呼吸三次再下判断',
      '注意到一个想法升起时，像观察云朵一样看着它飘走',
      '今天尝试用"这是..."代替"这是不好的"',
      '倾听时不急于给出意见，只是陪伴',
      '注意到批评的想法时，问自己：这是事实还是猜测？',
      '今天对身边的人多一份好奇，少一份评价',
      '当你想说"应该"时，试着改成"可以"',
      '注意到自己在抱怨时，停下来喝口水',
      '今天给自己一个不做判断的空间',
      '听到不同意见时，先点头再思考',
      '注意到情绪升起时，给它命名但不陷入',
      '今天尝试描述看到的事物，而不是给它贴标签',
      '当你想纠正别人时，先问问自己是否必要',
      '注意到手机让你想评价时，放下它一分钟',
      '今天对食物保持全然的专注，不评判味道',
      '听到八卦时，温和地转移话题',
      '注意到自己在对比时，提醒自己：每个人都是独特的',
      '今天对天气不做评价，只是感受',
      '当你不认同某人时，先找一点你认同的',
      '注意到评判的冲动时，做一个深呼吸',
      '今天在镜子前对自己说：这已经足够好了',
      '听到批评时，先谢谢对方再说其他的',
      '注意到自己在给事物分类时，试着保持开放',
      '今天对孩子或宠物的行为不做评价，只是陪伴',
      '当你想说"我早就说过"时，选择沉默',
      '注意到头脑中的声音像收音机一样播放时，调节音量',
      '今天对陌生人微笑，不期待任何回报',
      '当你不耐烦时，承认它，然后继续',
      '注意到自己过于苛刻时，想象如果是朋友会怎么说',
      '今天对身体的感受保持中立观察',
      '听到不同观点时，想象对方也有温暖的家人',
      '注意到自己在担心结果时，回到当下',
      '今天对衣服是否得体不做过度思考',
      '当你想控制局面时，练习放手',
      '注意到自己想证明对错时，问自己：这真的重要吗？',
      '今天对孩子的作业只鼓励不指导',
      '听到诉求时，先共情再回应',
      '注意到自己在预演对话时，回到呼吸',
      '今天对自己的一天不做总结性评价',
      '当事情不如预期时，说"好吧，这样也可以"',
      '注意到自己在回忆过去的选择时，回到现在',
      '今天对外卖/快递的延误保持耐心',
      '当有人让你生气时，先等十秒再反应',
      '注意到自己想指责时，改为说"我理解"',
      '今天对路边的野花野草不做评判',
      '听到一个观点时，先想想它可能对的部分',
      '注意到自己在完美主义时，做一个不完美的事',
      '今天对自己说的话保持觉察，不夸大不缩小',
      '当你想打断别人时，让对方把话说完',
      '注意到自己的姿势时，不批评只是调整',
      '今天对WiFi慢/视频卡不做情绪反应',
      '当你不确定时，说"我不知道"而不是编造',
      '注意到自己想拒绝时，先考虑一分钟',
      '今天对擦肩而过的人保持微笑',
      '听到一个请求时，不立刻说yes或no',
      '注意到自己在等待时，保持临在',
      '今天对闹钟响的反应是不急不躁地起来',
      '当事情出错时，先关心人再关心事',
      '注意到自己想保密时，问是否真的需要',
      '今天对自己能记得的事表示感激',
      '当别人犯错时，把它当作正常的事',
      '注意到自己在社交媒体上想发帖时，先等五分钟',
      '今天对购物不做冲动决定',
      '当你想给建议时，先问对方是否想要',
      '注意到自己在安排时间时，留些空白',
      '今天对自己说：慢一点也没关系',
      '听到一个新想法时，不否定也不立即接受',
      '注意到自己累了时，不评判只是休息',
      '今天对噪音保持接纳，不烦躁',
      '当你不认同时，不争论只是尊重',
      '注意到自己在后悔时，回到当下',
      '今天对食物的来源多一份感恩',
      '当事情费时间时，不说"太慢了"',
      '注意到自己在比较时，记起每个人起点不同',
      '今天对自己的呼吸多一份关注',
      '听到一个故事时，不急于下结论',
      '注意到自己在计划时，留些灵活空间',
      '今天对自己说：我已经尽力了',
      '当你不确定时，不假装确定',
      '注意到自己想抱怨时，改为说谢谢',
      '今天对镜子里的自己说：你很棒',
      '当事情没有按计划发展时，深呼吸',
      '注意到自己在赶时间时，提醒自己：地球离开谁都转',
      '今天对公共交通的拥挤保持平静',
      '听到别人的好消息时，真诚祝贺',
      '注意到自己想拒绝邀请时，先考虑再决定',
      '今天对自己的家多一份欣赏',
      '当你看时间时，不做负面评价',
      '注意到自己在开会时想发言，先组织语言',
      '今天对自己的情绪贴标签但不评判',
      '当你不舒服时，不夸大也不忽视',
      '注意到自己想纠正别人的语法时，闭嘴',
      '今天对外卖的味道保持感恩',
      '听到一个秘密时，保守它',
      '注意到自己在人群中感到不适时，不评判这个感受',
      '今天对自己的不完美微笑',
      '当你说错了话时，及时道歉然后放下',
      '注意到自己在催促别人时，停止',
      '今天对身边的人表达感激',
      '当事情悬而未决时，练习接受不确定',
      '注意到自己在用手机时，问自己真的需要吗',
    ],
    plant: '蒲公英',
    plantEmoji: '🌼',
    plantReason: '蒲公英随风飘散，不强求落在何处，象征不评判、顺其自然的生活态度',
    gradient: 'from-amber-100 to-yellow-100',
    lightColor: 'bg-amber-50',
  },
  {
    name: '耐心',
    meaning: '理解一切都需要时间，允许事物按自己的节奏展开',
    actions: [
      '今天，做任何事都多给自己一点时间，不着急',
      '排队时把手机收起来，只是等待',
      '红灯时，做三次深呼吸',
      '等人时不频繁看手机，给对方时间',
      '今天尝试做一件需要时间的事',
      '当你想马上得到答案时，等待一小时再决定',
      '今天对孩子的磨蹭保持平静',
      '当你感到急躁时，停下来问问自己：时间真的那么紧吗？',
      '今天尝试一道需要时间的菜',
      '当事情进展缓慢时，不催促',
      '今天对电脑/手机的慢加载保持耐心',
      '当你被要求等待时，把这当作练习的机会',
      '今天尝试一个新爱好，不求马上掌握',
      '当你想快速解决一个问题时，慢下来思考',
      '今天对交通拥堵说：正好可以听听歌',
      '当某人让你等待，向对方表达理解',
      '今天练习系鞋带时慢动作进行',
      '当你感到不耐烦时，想象对方也在尽力',
      '今天对天气预报不准确保持接纳',
      '当事情比你预期的久时，不抱怨',
      '今天尝试等待网页完全加载再操作',
      '当你很想知道结果时，练习延迟满足',
      '今天对孩子的"为什么"保持耐心回答',
      '当你想马上改变一个人时，记住：成长需要时间',
      '今天尝试种一颗豆子或小花，每天观察',
      '当你排队时，感谢有机会活动手脚',
      '今天对冗长的会议保持专注和耐心',
      '当对方说话慢时，不打断',
      '今天尝试慢慢喝茶，感受温度',
      '当你感到焦虑时，告诉自己：一切都会来的',
      '今天对学习一个新技能说：我会慢慢来',
      '当你想快速减肥/健身时，提醒自己这是马拉松',
      '今天对宠物的慢节奏保持欣赏',
      '当事情需要多次尝试时，不气馁',
      '今天尝试写信/明信片，而不是发消息',
      '当你很急时，问自己：五分钟能改变什么？',
      '今天对老人的慢动作保持尊重',
      '当你想一次做很多事时，练习一次一件',
      '今天尝试等待水烧开再泡茶',
      '当对方需要时间思考时，安静等待',
      '今天对"慢工出细活"有新的理解',
      '当你被反复问同一个问题时，保持温和',
      '今天尝试不看时间完成一件事',
      '当事情需要重复时，把它当作练习',
      '今天对孩子的反复提问保持开放',
      '当你需要学习时，允许自己从错误中进步',
      '今天尝试等待太阳升起或落下',
      '当你想快速被理解时，练习清晰表达并等待',
      '今天对需要等待的事情心怀感恩',
      '当你感到时间压力时，做一个长时间深呼吸',
      '今天尝试不赶时间地散步',
      '当事情进展不如预期时，给自己空间',
      '今天对连续剧/电影保持耐心欣赏',
      '当你排队时，观察周围的人而不是急躁',
      '今天尝试等待好消息，而不是不停刷新',
      '当你想快速愈合时，允许自己慢慢来',
      '今天对阅读一本厚书说：慢慢来',
      '当事情需要孵化时，不急不躁',
      '今天尝试等待花朵完全绽放',
      '当你感到匆忙时，停下来整理思路',
      '今天对需要时间发酵的面团有耐心',
      '当对方需要时间成长时，给予空间',
      '今天尝试慢慢咀嚼食物',
      '当你等待某人成长时，自己也在成长',
      '今天对自然的节奏保持敬畏',
      '当你想快速看到结果时，庆祝小进步',
      '今天尝试不设定最后期限完成一件事',
      '当事情需要时间成熟时，信任过程',
      '今天对孩子的学习曲线保持耐心',
      '当你感到挫败时，提醒自己：罗马不是一天建成的',
      '今天尝试等待雨停再出门',
      '当事情比你预期的复杂时，给自己时间',
      '今天对需要反复确认的事保持从容',
      '当你急于表达时，先听听自己内心的声音',
      '今天尝试让时间慢下来的练习',
      '当某人正在经历困难时，给TA时间',
      '今天对需要多年积累的技能表示敬意',
      '当你感到焦虑时，数数到十',
      '今天尝试在阳光下静坐五分钟',
      '当你想快速解决冲突时，给双方时间',
      '今天对习惯的养成有耐心',
      '当事情不完美时，继续完善而不是放弃',
      '今天尝试不急不躁地穿衣服',
      '当你等待时，把等待变成冥想',
      '今天对食物的烹饪过程有耐心',
      '当你想快速被治愈时，给身体时间',
      '今天尝试慢慢走一段路',
      '当事情需要多次重复时，把它当作记忆',
      '今天对需要耐心的游戏保持兴趣',
      '当你感到匆忙时，重新评估优先级',
      '今天尝试等待日落',
      '当事情进展顺利时，享受过程',
      '今天对需要时间的友谊保持投入',
      '当你想快速成功时，提醒自己：好事多磨',
      '今天尝试在等待时做呼吸练习',
    ],
    plant: '竹子',
    plantEmoji: '🎋',
    plantReason: '竹子缓慢生长，却始终向上，象征不急不躁的坚持与耐心',
    gradient: 'from-green-100 to-emerald-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '初学者之心',
    meaning: '像第一次看到世界一样，保持好奇和开放',
    actions: [
      '今天，用新鲜的眼光看待一件熟悉的事物',
      '走在常走的路上，看看有没有新发现',
      '用非惯用手做一件事',
      '今天尝试一种从未吃过的蔬菜',
      '观察天空的颜色，像你第一次看到它一样',
      '今天听听平时忽略的声音',
      '用一个没用过的词描述你的感受',
      '今天尝试一条新的回家路线',
      '闻一种你熟悉的气味，像第一次闻到一样',
      '今天以游客的心态看你的城市',
      '摸摸不同的材质，水、棉布、木头',
      '今天尝试一道新菜谱',
      '看一幅画或一张照片，不要想它"意味着什么"',
      '今天尝试一种新的运动',
      '吃一口食物，慢慢品味，像从未吃过一样',
      '今天注意一个你从未注意过的身体感觉',
      '用"我不知道"代替"我知道了"',
      '今天尝试一本不同类型的书',
      '看日出或日落，像你是为它而来的',
      '今天尝试和陌生人交谈',
      '听一首歌，试着听清每一个乐器',
      '今天注意光影的变化',
      '用孩子的眼睛看一个问题',
      '今天尝试一种新的茶',
      '观察一朵花，不给它命名',
      '今天尝试闭眼静坐',
      '用第一次学骑车的心情面对今天',
      '今天注意脚下的感觉',
      '看云，不把它们想成任何东西',
      '今天尝试做一件你觉得自己做不好的事',
      '用好奇代替评判，问"这是怎么回事？"',
      '今天观察一个人，不做评价',
      '尝试一种新的发型或穿搭',
      '今天注意你的呼吸，不控制只是观察',
      '用"如果...会怎样"代替"因为...所以"',
      '今天尝试一个新的APP',
      '看一件旧物品，像你是它的制造者',
      '今天尝试一种新的交通方式',
      '注意一种声音的来源',
      '今天用不同的方式说"你好"',
      '观察水流动的方式',
      '今天尝试一个新的运动品牌',
      '用"我想要理解"代替"我理解"',
      '今天注意衣料贴着皮肤的感觉',
      '看星星，不要想它们有多远',
      '今天尝试一种新的水果',
      '用初学者的心态听一个你已经懂的话题',
      '今天注意你周围的三种颜色',
      '尝试一个新爱好的第一天',
      '今天观察一棵树，不查它的名字',
      '用"我很好奇"开始一个对话',
      '今天注意空气的温度',
      '看一个熟悉的人，像你们刚认识',
      '今天尝试一种新的音乐风格',
      '用"哇"代替"哦"',
      '今天注意你家的声音',
      '观察早晨的光线',
      '今天尝试一个简单的冥想',
      '用第一次收到礼物的期待感做事',
      '今天注意一种你讨厌的食物的营养',
      '看一片落叶的纹理',
      '今天尝试一个手工艺',
      '用"还有什么"代替"不过如此"',
      '今天注意你走路的声音',
      '观察雨后的地面',
      '今天尝试一种新的咖啡',
      '用孩子的问题"为什么"开始探索',
      '今天注意你呼吸的节奏',
      '看一本你小时候喜欢的书',
      '今天尝试一种新的拉伸',
      '用"我今天学到了"结束一天',
      '今天注意五种你能看到的东西',
      '观察你桌上物品的细节',
      '今天尝试一个简短的散步',
      '用"让我试试"代替"这不行"',
      '今天注意四种你能听到的声音',
      '看窗外的风景，不要想任何事',
      '今天尝试一种新的调味品',
      '用"可能性"代替"局限性"思考',
      '今天注意三种你能感觉到的触觉',
      '观察自己的情绪，像它们是新来的',
      '今天尝试写日记，描述今天的新鲜事',
      '用"也许"代替"肯定"',
      '今天注意你周围的气味',
      '看一张老照片，想想当时的感受',
      '今天尝试一个5分钟的静默',
      '用"我愿意了解"代替"我知道"',
      '今天注意光线在房间的变化',
      '观察自己走路的姿势',
      '今天尝试一种新的水果茶',
      '用初学者的谦虚面对一个小挑战',
      '今天注意三种你通常忽略的事物',
      '看云的变化',
      '今天尝试一个新的早餐',
      '用好奇的眼光看待熟悉的任务',
      '今天注意自己的姿势变化',
      '观察早晨唤醒你的声音',
    ],
    plant: '樱花',
    plantEmoji: '🌸',
    plantReason: '樱花年年盛开，却每一年都像是第一次绽放，象征永远保持好奇与新鲜',
    gradient: 'from-pink-100 to-rose-100',
    lightColor: 'bg-pink-50',
  },
  {
    name: '信任',
    meaning: '相信自己和他人的内在智慧，建立信任感',
    actions: [
      '今天，相信自己的直觉，做一个小决定',
      '相信自己的第一反应，不过度思考',
      '完成一件事后，不要反复检查',
      '今天把一个小秘密分享给信任的人',
      '当感到不确定时，对自己说：我可以的',
      '今天尝试相信天气预报，即使它可能不准',
      '把自己交给一个有能力的人',
      '今天做一件不需要确认结果的事',
      '当你知道自己已经尽力时，接受结果',
      '今天对孩子的选择表达信任',
      '把手机放在一边，相信自己会记得重要的事',
      '今天相信自己的身体会告诉你它需要什么',
      '当你有冲动想做某件事时，问问它是否来自内心',
      '今天尝试不查路线，相信导航',
      '给朋友发一条信息，不期待秒回',
      '今天相信时间会治愈伤痛',
      '做一件事，即使不确定结果',
      '今天把自己交给按摩师/理发师等专业的人',
      '相信别人有能力照顾好自己',
      '今天尝试盲走一小段路（安全环境下）',
      '当你做了决定后，不反复修改',
      '今天相信食物会给你营养',
      '把自己的感受写下来，然后相信它们',
      '今天尝试听一首你不熟悉的歌，不跳过',
      '相信自己有解决问题的能力',
      '今天把自己交给一个未知的体验',
      '当别人给你建议时，先相信它有价值',
      '今天尝试相信你的记忆，即使它可能不完美',
      '给自己一个放松的理由，相信宇宙会照顾你',
      '今天做一件不需要别人认可的事',
      '相信你的身体知道什么时候该休息',
      '今天把一个小任务交给别人',
      '当你感到害怕时，做一件小事证明自己可以',
      '今天尝试相信幸福会到来',
      '把自己的愤怒交给时间',
      '今天相信今天的你比昨天更好',
      '当你做错事时，相信自己可以改正',
      '今天尝试相信明天会更好',
      '把自己的不确定告诉一个信任的人',
      '今天相信眼泪有时是治愈的一部分',
      '做一件小事，不要寻求确认',
      '今天把自己交给一次深呼吸',
      '相信你爱的人有能力爱你',
      '今天尝试相信过程的价值',
      '当你不确定时，相信内心深处的声音',
      '今天把一个问题放下，相信它会自己解决',
      '相信自己配得上好的事物',
      '今天尝试一种新的食物，不担心是否喜欢',
      '相信每个人都在尽力',
      '今天把自己的故事讲给别人听',
      '当机会来敲门时，相信它是给你的',
      '今天尝试不计划明天的每个细节',
      '相信自己是独一无二的',
      '今天把担忧变成祝福',
      '当别人成功时，相信这不影响你的价值',
      '今天尝试接受别人的帮助',
      '相信自己可以学会任何东西',
      '今天把过去的教训变成智慧',
      '当你不确定时，相信你的价值观会引导你',
      '今天尝试信任一个朋友的新想法',
      '相信自己有能力原谅',
      '今天把一个小愿望交给宇宙',
      '当事情没有按计划时，相信有更好的在等待',
      '今天尝试说"我不知道，但我相信会找到答案"',
      '相信自己和他人一样有价值',
      '今天把自己交给一段安静的时间',
      '当有人指出你的缺点时，相信它出于好意',
      '今天尝试相信自己有创造力',
      '相信自己的成长速度刚刚好',
      '今天把恐惧告诉一个信任的人',
      '当你不被理解时，相信理解你的人存在',
      '今天尝试相信自己不完美也很美',
      '相信自己配得上休息',
      '今天把自己交给一次散步',
      '当失败时，相信它是成功的老师',
      '今天尝试相信自己和他人一样有能力',
      '相信自己被爱着',
      '今天把焦虑变成祈祷',
      '当你不自信时，做一件你能做好的小事',
      '今天尝试相信今天的努力不会白费',
      '相信你值得被温柔对待',
      '今天把自己交给一个信任的拥抱',
      '当你不确定时，相信自己走了很远的路',
      '今天尝试相信未来充满可能',
      '相信自己的选择会带来成长',
      '今天把控制权交给信任的人',
      '当事情变得困难时，相信你会变得更强',
      '今天尝试相信简单生活的美好',
      '相信自己有能力让世界变好',
      '今天把明天交给明天的自己',
      '当你感到孤独时，相信连接存在',
      '今天尝试相信每一步都算数',
      '相信自己有能力被治愈',
    ],
    plant: '银杏',
    plantEmoji: '🍃',
    plantReason: '银杏活过千年依然金黄不变，象征内在永恒的智慧与信任',
    gradient: 'from-teal-100 to-cyan-100',
    lightColor: 'bg-teal-50',
  },
  {
    name: '不强求',
    meaning: '接受事物本来的样子，不过度执着',
    actions: [
      '今天，对无法改变的事说一句"没关系"',
      '放弃控制某件小事',
      '当计划被打断时，把它当作意外的礼物',
      '今天接受别人的帮助，即使你能自己做',
      '当你失去某样东西时，感恩曾经拥有',
      '今天允许事情按它们自己的节奏发展',
      '放手让某人按自己的方式完成任务',
      '今天对天气不做评价',
      '当事情没有按计划时，看看它带来了什么',
      '今天接受"不知道"的答案',
      '放下对结果的过度期待',
      '今天允许自己说"今天不想做"',
      '当你不被认可时，接受这个事实然后放下',
      '今天对无法控制的事不再担忧',
      '放弃对某人行为的执着',
      '今天接受"不够完美"',
      '当你不满意时，练习说"这样也可以"',
      '今天放手让事情自然发展',
      '接受自己的不完美',
      '今天不再紧抓某个特定结果',
      '当别人与你不同，接受它',
      '今天放下对小事的执念',
      '接受生活中的一些混乱',
      '今天不再试图让所有人满意',
      '放手一段不再适合你的关系',
      '今天允许自己休息',
      '当你不确定时，接受不确定性',
      '今天放下对过去的遗憾',
      '接受事情有时就是会出错',
      '今天不再追求证明自己',
      '放手对他人的期待',
      '今天接受今天的不舒服',
      '当事情不如你所愿时，说"我接受"',
      '今天放下对明天的焦虑',
      '接受别人的帮助',
      '今天放手让问题自己解决',
      '接受你无法让所有人开心',
      '今天放下自我批评',
      '接受事情需要时间',
      '今天放手控制局面',
      '接受你无法改变过去',
      '今天放下对完美的追求',
      '接受他人的不同意见',
      '今天放手对结果的执念',
      '接受有时你也不知道答案',
      '今天放下想要被理解的渴望',
      '接受事情可以只是"还好"',
      '今天放手想要控制一切的冲动',
      '接受别人的好意，即使表达方式不同',
      '今天放下对他人的评判',
      '接受你有时就是会失败',
      '今天放手让时间解决问题',
      '接受自己有时就是会犯困',
      '今天放下想要被注意的渴望',
      '接受有些日子就是会比较难',
      '今天放手对某个目标的执着',
      '接受你无法让每件事都顺利',
      '今天放下对被爱的执念',
      '接受事情有它们自己的时间',
      '今天放手让他人做决定',
      '接受你有时就是会犯错',
      '今天放下对认同的渴望',
      '接受每个人都有自己的局限',
      '今天放手对小事的担忧',
      '接受今天身体的感觉',
      '今天放下对被感谢的期待',
      '接受有些事就是无法解释',
      '今天放手对完美的想象',
      '接受自己有时就是会拖延',
      '今天放下想要掌控的欲望',
      '接受别人有自己的节奏',
      '今天放手对某段关系的执念',
      '接受你无法控制所有事',
      '今天放下对被批评的恐惧',
      '接受你已经在尽力了',
      '今天放手对结果的过度担忧',
      '接受有些话就是没人会说',
      '今天放手对别人行为的控制',
      '接受有些梦想可能需要调整',
      '今天放下想要被看见的渴望',
      '接受你有时就是会想放弃',
      '今天放手对某个习惯的坚持',
      '接受你无法让时光倒流',
      '今天放下对某人的怨恨',
      '接受改变需要时间',
      '今天放手对某物的执着',
      '接受你有时就是会不自信',
    ],
    plant: '薰衣草',
    plantEmoji: '💜',
    plantReason: '薰衣草随风摇曳不强求，象征接受与放下',
    gradient: 'from-violet-100 to-purple-100',
    lightColor: 'bg-violet-50',
  },
  {
    name: '接纳',
    meaning: '开放地接受当下的真实，不抗拒',
    actions: [
      '今天，承认自己的感受，不批评它',
      '当负面情绪出现时，把它当作客人一样迎接',
      '照镜子时，接受自己的样子',
      '今天承认今天很累',
      '当你犯错时，说"我犯错了，这很自然"',
      '今天接受自己的身体',
      '当你不满意自己时，想象如果是朋友会怎么说',
      '今天接受自己的情绪，不压抑',
      '当你焦虑时，观察它而不推开',
      '今天承认自己的需要',
      '接受今天的天气',
      '今天接受自己的不完美',
      '当你感到脆弱时，接受它',
      '今天接受自己的外貌',
      '当你不开心时，不假装开心',
      '今天接受自己的平凡',
      '当你感到害怕时，说"我在害怕"',
      '今天接受自己的过去',
      '当你不确定时，接受这个感觉',
      '今天接受自己的感受，不要推开',
      '当你生气时，不要否认',
      '今天接受自己的局限',
      '当你不自信时，接受它',
      '今天接受自己的孤独',
      '当你感到失落时，承认它',
      '今天接受自己的渴望',
      '当你不被理解时，接受这个事实',
      '今天接受自己的脆弱',
      '当事情没有成功时，接受结果',
      '今天接受自己的选择',
      '当你感到嫉妒时，观察它',
      '今天接受自己的不成熟',
      '当你不耐烦时，不要批判',
      '今天接受自己的担忧',
      '当你感到后悔时，承认它',
      '今天接受自己的渴望',
      '当你不满意现状时，接受它',
      '今天接受自己的身份',
      '当你感到空虚时，不要填满它',
      '今天接受自己的情绪起伏',
      '当别人比你成功时，接受这个差距',
      '今天接受自己的独特',
      '当你感到疲惫时，不要硬撑',
      '今天接受自己的缺点',
      '当事情不如预期时，接受现实',
      '今天接受自己的节奏',
      '当你无法原谅时，接受这个感受',
      '今天接受自己的悲伤',
      '当你不确定未来时，接受未知',
      '今天接受自己的愤怒',
      '当你感到羞耻时，不要推开',
      '今天接受自己的不满足',
      '当你不完美时，接受它',
      '今天接受自己的无力',
      '当事情出错时，接受它已经发生了',
      '今天接受自己的渴望休息',
      '当你与他人比较时，接受差异',
      '今天接受自己的年龄',
      '当你感到尴尬时，不要否定',
      '今天接受自己的不安全感',
      '当事情需要时间时，接受等待',
      '今天接受自己的成长速度',
      '当你不喜欢某人时，接受这个感受',
      '今天接受自己的感受',
      '当你不舒服时，不要逃避',
      '今天接受自己的恐惧',
      '当你不满意工作时，接受现状',
      '今天接受自己的渴望被爱',
      '当你感到不足时，接受它',
      '今天接受自己的每一刻',
      '当你不被爱时，接受这个感受',
      '今天接受自己的伤口',
      '当你自责时，停止批评自己',
      '今天接受自己的全部',
      '当事情困难时，接受它',
      '今天接受自己的每一种情绪',
      '当你感到失败时，接受它',
      '今天接受自己的旅程',
      '当你不理解时，接受不理解',
      '今天接受自己的不完美',
      '当你感到疲惫不堪时，接受它',
      '今天接受自己今天的样子',
      '当你不确定时，接受它',
      '今天接受自己的每一步',
      '当你需要帮助时，接受它',
      '今天接受自己正在成长',
      '当你不完美时，接受这就是你',
      '今天接受自己的全部',
      '当你感到失落时，接受它',
      '今天接受自己的独特旅程',
      '当你不确定时，接受当下',
    ],
    plant: '莲花',
    plantEmoji: '🪷',
    plantReason: '莲花出淤泥而不染，接纳所有经历化为成长',
    gradient: 'from-rose-100 to-pink-100',
    lightColor: 'bg-rose-50',
  },
  {
    name: '放下',
    meaning: '释放不必要的负担，让一切自然流动',
    actions: [
      '今天，放下一个小小的担忧或执念',
      '把一个不再需要的东西扔掉或送人',
      '删除手机里一个不常用的APP',
      '今天放下对过去的后悔',
      '原谅一个你一直无法释怀的人',
      '今天放下对未来的过度担忧',
      '当有人说伤害你的话，放下它',
      '今天放下对完美的追求',
      '不再紧抓某段已经结束的关系',
      '今天放下对被认可的渴望',
      '释放对小事的控制欲',
      '今天放下对自己过于苛刻的标准',
      '当事情出错时，放下"为什么是我"',
      '今天放下想要改变他人的想法',
      '释放对某件事的过度期待',
      '今天放下对过去的遗憾',
      '放下对某人行为的愤怒',
      '今天放下对结果的执着',
      '释放对手机的依赖',
      '今天放下对自我的怀疑',
      '放下一个你已经尽力但仍失败的期待',
      '今天放下对他人的评判',
      '释放对某段记忆的紧抓',
      '今天放下想要被感谢的期待',
      '放下对某人的怨恨',
      '今天放下对不公平的抱怨',
      '释放对控制的渴望',
      '今天放下对被爱的执念',
      '放下对某段关系的执念',
      '今天放下对认同的需求',
      '释放对物品的执着',
      '今天放下对自己形象的过度关注',
      '放下对别人眼光的在意',
      '今天放下对完美的想象',
      '释放对失败的恐惧',
      '今天放下对成功的执念',
      '放下对被理解的渴望',
      '今天放下对时间不够的焦虑',
      '释放对忙碌的追求',
      '今天放下对别人做法的批评',
      '放下对某段经历的不甘',
      '今天放下对被看见的渴望',
      '释放对控制的幻想',
      '今天放下对公正的期待',
      '放下对自己过高的要求',
      '今天放下对未来的焦虑',
      '释放对认可的追求',
      '今天放下对被爱的执念',
      '放下对某人的失望',
      '今天放下对完美计划的需要',
      '释放对事情应该怎样的想象',
      '今天放下对别人成功的嫉妒',
      '放下对自己不足的自责',
      '今天放下对被接纳的渴望',
      '释放对某段过去的紧抓',
      '今天放下对控制的渴望',
      '放下对被批评的恐惧',
      '今天放下对公平的需要',
      '释放对完美的幻想',
      '今天放下对别人应该怎样的期待',
      '放下对某段关系的紧抓',
      '今天放下对被看见的需要',
      '释放对认可的追求',
      '今天放下对成功的执念',
      '放下对失败的恐惧',
      '今天放下对被理解的需要',
      '释放对控制的渴望',
      '今天放下对完美的渴望',
      '放下对某段记忆的执念',
      '今天放下对他人的期待',
      '释放对事情应该怎样的想象',
      '今天放下对被爱的执念',
      '放下对被感谢的期待',
      '今天放下对被赞赏的需要',
      '释放对认可的渴望',
      '今天放下对公正的期待',
      '放下对被公平对待的需要',
      '今天放下对别人做法的执着',
      '释放对控制的幻想',
      '今天放下对完美的追求',
      '放下对结果的执着',
      '今天放下对自己的苛责',
      '释放对认可的追求',
      '今天放下对被接纳的渴望',
      '放下对被看见的需要',
      '今天放下对被理解的需要',
      '释放对忙碌的崇拜',
      '今天放下对简单生活的逃避',
    ],
    plant: '柳树',
    plantEmoji: '🌿',
    plantReason: '柳树随风摇曳能屈能伸，象征放下与顺应',
    gradient: 'from-green-100 to-sage-100',
    lightColor: 'bg-green-50',
  },
  {
    name: '感恩',
    meaning: '珍惜所拥有的，心怀感激',
    actions: [
      '今天，对一个人说一声谢谢',
      '在睡前感谢今天发生的一件小事',
      '醒来时感谢自己还活着',
      '今天感谢自己的身体还在运转',
      '感谢一个曾经伤害过你的人，因为他让你成长',
      '今天感谢自己有遮风挡雨的地方',
      '感谢清洁工/外卖员/快递员',
      '今天感谢一缕阳光',
      '写下三件今天顺利的事',
      '今天感谢一杯水',
      '感谢一位老师或 mentor',
      '今天感谢一顿饭',
      '感谢大自然给予的一切',
      '今天感谢自己的眼睛能看到世界',
      '感谢自己的手能做事情',
      '今天感谢自己的耳朵能听到声音',
      '感谢给你打电话的人',
      '今天感谢有人愿意听你说话',
      '感谢今天遇见的陌生人',
      '今天感谢一本好书或好电影',
      '感谢你拥有的衣服',
      '今天感谢你喜欢的音乐',
      '感谢一个朋友',
      '今天感谢健康',
      '感谢今天吃到的好吃的',
      '今天感谢家人',
      '感谢自己的呼吸',
      '今天感谢自己今天做出的选择',
      '感谢今天学到的东西',
      '今天感谢有人给你一个微笑',
      '感谢自己的记忆',
      '今天感谢便利的生活',
      '感谢今天的好天气',
      '今天感谢自己的腿能走路',
      '感谢手机让连接更便捷',
      '今天感谢一个邻居',
      '感谢今天的公共交通',
      '今天感谢一把舒适的椅子',
      '感谢今天帮助你的APP',
      '今天感谢图书馆或书店',
      '感谢一段温暖的对话',
      '今天感谢自己的皮肤',
      '感谢让你笑的事物',
      '今天感谢安静的时光',
      '感谢一顿家常便饭',
      '今天感谢一杯热饮',
      '感谢自己的牙齿还能咀嚼',
      '今天感谢一首歌',
      '感谢今天的小进步',
      '今天感谢一把好用的工具',
      '感谢自己的免疫系统',
      '今天感谢温暖的被窝',
      '感谢你爱的人',
      '今天感谢自己的味觉',
      '感谢一只鸟或一只猫',
      '今天感谢窗外的风景',
      '感谢一次深呼吸',
      '今天感谢一口新鲜空气',
      '感谢让你感到平静的地方',
      '今天感谢自己坚持下来了',
      '感谢自己的声音能表达',
      '今天感谢自己的心在跳动',
      '感谢一个善意的举动',
      '今天感谢自己被原谅',
      '感谢你住的地方',
      '今天感谢WiFi信号',
      '感谢一张舒适的大床',
      '今天感谢自己能学习',
      '感谢身边有爱你的人',
      '今天感谢自己的双手',
      '感谢一段美好的回忆',
      '今天感谢雨后的空气',
      '感谢自己能哭泣',
      '今天感谢一次拥抱',
      '感谢宠物给你的陪伴',
      '今天感谢自己的笑声',
      '感谢有人记住了你的名字',
      '今天感谢一次日出或日落',
      '感谢自己能做梦',
      '今天感谢自己的免疫系统',
      '感谢一次说走就走的体验',
      '今天感谢自己的好奇心',
      '感谢一只蝴蝶或一只蜜蜂',
      '今天感谢一棵树的绿荫',
      '感谢自己感到幸福的能力',
      '今天感谢大地承载着你',
      '感谢头顶的星空',
      '今天感谢宇宙的广阔',
      '感谢自己还活着',
    ],
    plant: '向日葵',
    plantEmoji: '🌻',
    plantReason: '向日葵永远朝向阳光生长，象征心怀感恩与希望',
    gradient: 'from-yellow-100 to-amber-100',
    lightColor: 'bg-yellow-50',
  },
  {
    name: '慷慨',
    meaning: '无私地分享和给予，传递善意',
    actions: [
      '今天，为他人做一件小事，不求回报',
      '给别人一个真诚的赞美',
      '今天分享你的食物',
      '帮助陌生人',
      '今天倾听朋友的问题',
      '捐款给需要的人',
      '今天给陌生人一个微笑',
      '分享你读到的有价值的信息',
      '今天给老人让座',
      '主动帮助同事/同学',
      '今天送给朋友一个小礼物',
      '分享你的知识或技能',
      '今天给他人真诚的鼓励',
      '给流浪动物喂食或水',
      '今天帮家人做家务',
      '主动问候很久不联系的朋友',
      '今天给陌生人撑门',
      '分享你的好心情',
      '今天帮助需要提东西的人',
      '给别人一个温暖的拥抱',
      '今天做志愿者',
      '分享你的快乐经历',
      '今天给别人真诚的感谢',
      '帮助迷路的游客',
      '今天借东西给需要的人',
      '分享你的午餐',
      '今天给他人写一张感谢卡',
      '为朋友保守秘密',
      '今天主动帮别人拿东西',
      '分享你喜欢的东西给别人',
      '今天给他人真诚的祝福',
      '为陌生人按电梯',
      '今天分享你的故事',
      '给老人打电话问候',
      '今天帮助需要的人开门',
      '分享你的时间',
      '今天给他人真诚的肯定',
      '帮助孩子过马路',
      '今天分享你的经验',
      '给陌生人指路',
      '今天分享你的快乐',
      '帮助需要帮助的人',
      '今天给他人一个机会',
      '分享你的爱心',
      '今天为他人祈祷',
      '帮助受伤的人',
      '今天分享你的温暖',
      '给别人真诚的道歉',
      '今天分享你的笑容',
      '帮助等公交的人',
      '今天分享你的故事',
      '给陌生人一个点头',
      '今天帮助需要的人',
      '分享你的零食',
      '今天给他人真诚的建议',
      '帮助不方便的人',
      '今天分享你的音乐',
      '给陌生人一个祝福',
      '今天帮助朋友家人',
      '分享你的美食',
      '今天给他人真诚的陪伴',
      '帮助需要安静的人',
      '今天分享你的爱好',
      '给老人开门',
      '今天帮助需要建议的人',
      '分享你的资源',
      '今天给他人真诚的关注',
      '帮助等很久的人',
      '今天分享你的勇气',
      '给陌生人一份关心',
      '今天帮助邻居',
      '分享你的知识',
      '今天给他人真诚的理解',
      '帮助需要陪伴的人',
      '今天分享你的祝福',
      '给陌生人一份善意',
      '今天帮助独处的人',
      '分享你的时间',
      '今天给他人真诚的赞美',
      '帮助需要方向的人',
      '今天分享你的力量',
      '给陌生人一份温暖',
      '今天帮助需要爱',
      '分享你的笑声',
      '今天给他人真诚的关怀',
      '帮助需要希望的人',
      '分享你的智慧',
      '今天给他人真诚的接纳',
      '帮助需要安慰的人',
      '分享你的耐心',
    ],
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

export function getRandomAction(attitudeIndex: number, currentAction?: string): string {
  const actions = ATTITUDES[attitudeIndex]?.actions || [];
  if (actions.length === 0) return '活在当下';
  if (actions.length === 1) return actions[0];

  let newAction: string;
  do {
    newAction = actions[Math.floor(Math.random() * actions.length)];
  } while (newAction === currentAction && actions.length > 1);

  return newAction;
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
