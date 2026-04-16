'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ATTITUDES,
  MindfulnessAttitude,
  CardDraw,
  getTodayCards,
  getTodayFirstCard,
  drawCard,
  completeCard,
  getRandomAction,
  getStreak,
  getToday,
  ATTITUDE_PALETTES,
  AttitudePalette,
  generateStructuredSuggestion,
} from '@/lib/storage';

// ============ 类型定义 ============

type CardPhase = 'idle' | 'planning' | 'wallpaperReady' | 'actionPending' | 'completed';

// 今日态度卡状态（用于 localStorage）
interface TodayCardState {
  date: string;
  cardIndex: number;
  drawTime: string;
  actionPlan: string;           // 行动计划（用户输入的或默认的行动灵感）
  hasGeneratedPlan: boolean;    // 是否已生成计划
  hasSavedWallpaper: boolean;   // 是否已保存壁纸
  feeling: string;              // 晚间感受
  isCompleted: boolean;          // 是否已完成浇灌
}

const CARD_STATE_KEY = 'mindful_forest_today_card_state';

// ============ 辅助函数 ============

function getTodayCardState(): TodayCardState | null {
  if (typeof window === 'undefined') return null;
  const today = getToday();
  const data = localStorage.getItem(CARD_STATE_KEY);
  if (!data) return null;
  const state: TodayCardState = JSON.parse(data);
  // 跨天自动重置
  if (state.date !== today) {
    localStorage.removeItem(CARD_STATE_KEY);
    return null;
  }
  return state;
}

function saveTodayCardState(state: TodayCardState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CARD_STATE_KEY, JSON.stringify(state));
}

function clearTodayCardState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CARD_STATE_KEY);
}

// ============ 壁纸卡片组件 ============

interface WallpaperCardProps {
  attitude: MindfulnessAttitude;
  actionPlan: string;
}

function WallpaperCard({ attitude, actionPlan }: WallpaperCardProps) {
  return (
    <div
      id="wallpaper-card"
      className="wallpaper-card"
      style={{
        width: '360px',
        height: '640px',
        background: `linear-gradient(135deg, #f0f7f4 0%, #e8f5e9 50%, #f1f8e9 100%)`,
        borderRadius: '32px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰性背景圆 */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,199,132,0.15) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        left: '-60px',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(174,213,129,0.12) 0%, transparent 70%)',
      }} />

      {/* 顶部：态度名称 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <div style={{
          fontSize: '14px',
          color: '#81c784',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          今日态度
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#2e5a3a',
          letterSpacing: '2px',
        }}>
          {attitude.name}
        </div>
      </div>

      {/* 中间：植物视觉主体 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '20px 0',
      }}>
        {/* 植物大图标 */}
        <div style={{
          fontSize: '72px',
          marginBottom: '16px',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
        }}>
          {attitude.plantEmoji}
        </div>
        {/* 植物名称 */}
        <div style={{
          fontSize: '16px',
          color: '#66bb6a',
          letterSpacing: '2px',
        }}>
          {attitude.plant}
        </div>
      </div>

      {/* 底部：行动计划 */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        padding: '24px 16px',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#a5d6a7',
          letterSpacing: '2px',
          marginBottom: '12px',
        }}>
          今日行动计划
        </div>
        <div style={{
          fontSize: '15px',
          color: '#3d5c45',
          lineHeight: '1.8',
          letterSpacing: '1px',
        }}>
          {actionPlan}
        </div>
      </div>

      {/* 底部：水印 */}
      <div style={{
        marginTop: '20px',
        fontSize: '11px',
        color: '#b8d4be',
        letterSpacing: '2px',
      }}>
        正念小森林
      </div>
    </div>
  );
}

// ============ 主页面组件 ============

export default function CardPage() {
  const [phase, setPhase] = useState<CardPhase>('idle');
  const [cardState, setCardState] = useState<TodayCardState | null>(null);
  const [currentAction, setCurrentAction] = useState('');       // 当前显示的行动灵感
  const [userPlan, setUserPlan] = useState('');                // 用户输入的计划
  const [feeling, setFeeling] = useState('');                   // 晚间感受
  const [streak, setStreak] = useState({ currentStreak: 0 });
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 初始化
  useEffect(() => {
    setMounted(true);
    loadState();
    setStreak(getStreak());
  }, []);

  // 加载今日状态
  const loadState = useCallback(() => {
    const saved = getTodayCardState();
    if (saved) {
      setCardState(saved);
      setUserPlan(saved.actionPlan);
      setFeeling(saved.feeling || '');
      setCurrentAction(saved.actionPlan);

      // 根据保存的状态恢复 phase
      if (saved.isCompleted) {
        setPhase('completed');
      } else if (saved.hasSavedWallpaper) {
        setPhase('actionPending');
      } else if (saved.hasGeneratedPlan) {
        setPhase('wallpaperReady');
      } else {
        setPhase('planning');
      }
    }
  }, []);

  // 抽取新卡
  const handleDrawNew = () => {
    const draw = drawCard();
    const attitude = ATTITUDES[draw.cardIndex];
    const defaultAction = getRandomAction(draw.cardIndex);

    const newState: TodayCardState = {
      date: getToday(),
      cardIndex: draw.cardIndex,
      drawTime: draw.drawTime,
      actionPlan: defaultAction,
      hasGeneratedPlan: false,
      hasSavedWallpaper: false,
      feeling: '',
      isCompleted: false,
    };

    saveTodayCardState(newState);
    setCardState(newState);
    setCurrentAction(defaultAction);
    setUserPlan('');
    setFeeling('');
    setPhase('planning');
  };

  // 选择指定态度
  const handleSelectAttitude = (index: number) => {
    const draw = drawCard(index);
    const attitude = ATTITUDES[draw.cardIndex];
    const defaultAction = getRandomAction(draw.cardIndex);

    const newState: TodayCardState = {
      date: getToday(),
      cardIndex: draw.cardIndex,
      drawTime: draw.drawTime,
      actionPlan: defaultAction,
      hasGeneratedPlan: false,
      hasSavedWallpaper: false,
      feeling: '',
      isCompleted: false,
    };

    saveTodayCardState(newState);
    setCardState(newState);
    setCurrentAction(defaultAction);
    setUserPlan('');
    setFeeling('');
    setPhase('planning');
  };

  // 换一个行动灵感
  const handleNewAction = () => {
    if (!cardState) return;
    const newAction = getRandomAction(cardState.cardIndex, currentAction);
    setCurrentAction(newAction);
    // 如果用户还没输入自定义计划，同步更新
    if (!userPlan) {
      setUserPlan(newAction);
    }
  };

  // 生成计划（进入壁纸生成阶段）
  const handleGeneratePlan = () => {
    if (!cardState) return;

    // 如果用户写了计划就用用户的，否则用当前显示的行动灵感
    const finalPlan = userPlan.trim() || currentAction;

    const updatedState: TodayCardState = {
      ...cardState,
      actionPlan: finalPlan,
      hasGeneratedPlan: true,
    };

    saveTodayCardState(updatedState);
    setCardState(updatedState);
    setCurrentAction(finalPlan);
    setPhase('wallpaperReady');
  };

  // ============ 高清壁纸绘制 ============
  // 真实手机壁纸比例：9:19.5 (接近 iPhone)
  // 顶部 20% 留安全区，底部 12% 留品牌区

  const WALLPAPER_WIDTH = 1080;
  const WALLPAPER_HEIGHT = 2340;

  // 辅助函数：绘制圆角矩形
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // 辅助函数：文本换行
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const chars = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of chars) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    return lines;
  };

  // 绘制高清壁纸（真实手机壁纸布局）
  const generateWallpaperCanvas = (
    attitude: MindfulnessAttitude,
    actionPlan: string
  ): string => {
    const w = WALLPAPER_WIDTH;
    const h = WALLPAPER_HEIGHT;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // 抗锯齿
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // ========== 获取该态度的专属配色 ==========
    const palette = ATTITUDE_PALETTES[attitude.name] || ATTITUDE_PALETTES['耐心'];

    // ========== 背景（使用态度专属配色）==========
    const bgGradient = ctx.createLinearGradient(0, 0, w, h);
    bgGradient.addColorStop(0, palette.bgStart);
    bgGradient.addColorStop(0.5, palette.bgEnd);
    bgGradient.addColorStop(1, palette.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // 右上角柔和光晕
    const topGlow = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.7);
    topGlow.addColorStop(0, palette.accent + '20');
    topGlow.addColorStop(0.5, palette.accent + '08');
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h);

    // 左下角柔和光晕
    const bottomGlow = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.6);
    bottomGlow.addColorStop(0, palette.accent + '18');
    bottomGlow.addColorStop(0.6, palette.accent + '05');
    bottomGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, w, h);

    // ========== 区域 2：标题区（给顶部状态栏留足空间）============
    const titleY = h * 0.32;

    // 小标签：今日态度
    ctx.fillStyle = palette.accent;
    ctx.font = `600 ${w * 0.032}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('今日态度', w / 2, titleY);

    // 主标题：态度名称
    ctx.fillStyle = palette.titleColor;
    ctx.font = `bold ${w * 0.11}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(attitude.name, w / 2, titleY + h * 0.07);

    // ========== 区域 3：植物视觉主体（画面中部）============
    const plantY = h * 0.52;

    // 植物 emoji
    const emojiSize = Math.round(w * 0.35);
    ctx.font = `${emojiSize}px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(attitude.plantEmoji, w / 2, plantY);

    // 植物名称
    ctx.fillStyle = palette.accent;
    ctx.font = `500 ${w * 0.045}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(attitude.plant, w / 2, plantY + h * 0.09);

    // ========== 区域 4：行动计划卡片（画面下半部分）============
    const cardW = w * 0.8;
    const cardH = h * 0.18;
    const cardX = (w - cardW) / 2;
    const cardY = h * 0.68;
    const cardRadius = w * 0.04;

    // 卡片半透明背景
    ctx.fillStyle = palette.cardBg;
    roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.fill();

    // 卡片内边距
    const contentW = cardW - w * 0.12;

    // 行动计划标签
    ctx.fillStyle = palette.subtle;
    ctx.font = `500 ${w * 0.028}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('今日行动', w / 2, cardY + h * 0.04);

    // 行动计划内容（限制 3 行）
    ctx.fillStyle = palette.cardText;
    const actionFontSize = w * 0.038;
    ctx.font = `${actionFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const lineHeight = actionFontSize * 1.7;
    const lines = wrapText(ctx, actionPlan, contentW * 0.95);
    const maxLines = 3;
    const displayLines = lines.slice(0, maxLines);
    const textStartY = cardY + h * 0.1;
    displayLines.forEach((line, i) => {
      ctx.fillText(line, w / 2, textStartY + i * lineHeight);
    });

    // ========== 区域 5：底部品牌区 ==========
    ctx.fillStyle = palette.subtle + '99';
    ctx.font = `500 ${w * 0.025}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('正念小森林', w / 2, h * 0.9);

    return canvas.toDataURL('image/png', 1.0);
  };

  // 保存壁纸到本地
  const handleSaveWallpaper = () => {
    if (!cardState) return;
    const attitude = ATTITUDES[cardState.cardIndex];

    setIsExporting(true);
    try {
      const dataUrl = generateWallpaperCanvas(attitude, currentAction);

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `正念小森林-${attitude.name}-${getToday()}.png`;
      link.href = dataUrl;
      link.click();

      // 更新状态
      const updatedState: TodayCardState = {
        ...cardState!,
        hasSavedWallpaper: true,
      };
      saveTodayCardState(updatedState);
      setCardState(updatedState);
      setPhase('actionPending');

    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 返回修改计划
  const handleBackToEdit = () => {
    setPhase('planning');
  };

  // 完成行动，浇灌森林
  const handleComplete = () => {
    if (!cardState) return;

    // 保存感受
    completeCard(cardState.drawTime, feeling);

    // 更新状态
    const updatedState: TodayCardState = {
      ...cardState,
      feeling: feeling,
      isCompleted: true,
    };
    saveTodayCardState(updatedState);
    setCardState(updatedState);
    setPhase('completed');
  };

  // 再练习一次
  const handlePracticeAgain = () => {
    clearTodayCardState();
    setCardState(null);
    setCurrentAction('');
    setUserPlan('');
    setFeeling('');
    setPhase('idle');
    setStreak(getStreak());
  };

  // 返回键
  const handleGoBack = () => {
    if (cardState?.hasSavedWallpaper && !cardState?.isCompleted) {
      setPhase('actionPending');
    } else if (cardState?.hasGeneratedPlan && !cardState?.hasSavedWallpaper) {
      setPhase('wallpaperReady');
    } else {
      setPhase('planning');
    }
  };

  // 获取当前态度
  const getCurrentAttitude = (): MindfulnessAttitude | null => {
    if (!cardState) return null;
    return ATTITUDES[cardState.cardIndex] || null;
  };

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto px-5 py-8">
        <div className="card p-8 text-center">
          <div className="loading-dot mx-auto mb-4" />
          <p className="text-sage-400">加载中...</p>
        </div>
      </div>
    );
  }

  const attitude = getCurrentAttitude();

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">

      {/* ========== 标题栏 ========== */}
      {phase !== 'idle' && (
        <div className="flex items-center mb-6">
          <button
            onClick={phase === 'completed' ? handlePracticeAgain : handleGoBack}
            className="text-sage-400 hover:text-sage-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-medium text-sage-700">态度卡</h1>
          </div>
          <div className="w-6" />
        </div>
      )}

      {/* ========== Phase: Idle（初始状态） ========== */}
      {phase === 'idle' && (
        <div className="space-y-5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-medium text-sage-700 mb-2">抽取态度卡</h1>
            <p className="text-sm text-sage-400">
              抽取今日的正念态度，生成行动计划
            </p>
          </div>

          {/* Streak 显示 */}
          {streak.currentStreak > 0 && (
            <div className="card p-3 mb-4 text-center bg-gradient-to-br from-amber-50 to-orange-50">
              <span className="text-sm text-amber-600">
                🔥 连续 {streak.currentStreak} 天
              </span>
            </div>
          )}

          {/* 今日已抽取的卡 */}
          <div className="text-center py-6">
            <div className="relative inline-block mb-8">
              <div className="w-40 h-56 mx-auto rounded-3xl bg-gradient-to-br from-sage-100 to-moss-100 shadow-soft-lg flex items-center justify-center">
                <span className="text-6xl opacity-50">🎴</span>
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cream-100 shadow-soft flex items-center justify-center">✨</div>
            </div>

            <button
              onClick={handleDrawNew}
              className="w-full btn-primary py-4 text-base mb-4"
            >
              🎲 抽取今日态度卡
            </button>

            <button
              onClick={() => {/* 暂时隐藏选择器 */}}
              className="w-full py-3 text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300"
            >
              我想练习某种态度
            </button>
          </div>
        </div>
      )}

      {/* ========== Phase: Planning（填写计划阶段） ========== */}
      {phase === 'planning' && attitude && (
        <div className="space-y-4 animate-scale-in">
          {/* 态度卡 */}
          <div className={`bg-gradient-to-br ${attitude.gradient} rounded-3xl p-6 shadow-soft-lg relative overflow-hidden`}>
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              {/* 植物图标 */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2 animate-breathe">{attitude.plantEmoji}</div>
                <h2 className="text-xl font-medium text-sage-700">{attitude.name}</h2>
                <p className="text-sm text-sage-500">{attitude.meaning}</p>
              </div>

              {/* 植物解释 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4">
                <div className="text-xs font-medium text-sage-400 mb-1">
                  🌿 {attitude.plant}
                </div>
                <p className="text-sm text-sage-600 leading-relaxed">
                  {attitude.plantReason}
                </p>
              </div>

              {/* 行动灵感 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-sage-400 uppercase tracking-wider">
                    行动灵感
                  </div>
                  <button
                    onClick={handleNewAction}
                    className="text-xs text-moss-500 hover:text-moss-600 transition-colors"
                  >
                    换一个 ↻
                  </button>
                </div>
                <p className="text-sage-600 leading-relaxed">
                  {currentAction}
                </p>
              </div>
            </div>
          </div>

          {/* 行动计划输入 */}
          <div className="card p-4">
            <label className="block text-sm text-sage-500 mb-2">
              今日践行此项态度的行动计划
            </label>
            <textarea
              value={userPlan}
              onChange={e => setUserPlan(e.target.value)}
              placeholder="写下你今天准备如何践行这一态度（选填）"
              className="w-full bg-cream-50 border border-sage-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300 max-h-32 overflow-y-auto"
              rows={3}
            />
            <p className="text-xs text-sage-400 mt-2">
              如果不填写，将使用上方的行动灵感作为今日计划
            </p>
          </div>

          {/* 生成计划按钮 */}
          <button
            onClick={handleGeneratePlan}
            className="w-full btn-primary py-4 text-base"
          >
            👉 生成计划
          </button>
        </div>
      )}

      {/* ========== Phase: WallpaperReady（壁纸已生成） ========== */}
      {phase === 'wallpaperReady' && attitude && (
        <div className="space-y-4 animate-scale-in">
          {/* 壁纸预览（缩放显示） */}
          <div className="flex justify-center">
            <div className="rounded-3xl overflow-hidden shadow-soft-lg" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <WallpaperCard attitude={attitude} actionPlan={currentAction} />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleSaveWallpaper}
              disabled={isExporting}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="loading-dot" />
                  导出中...
                </>
              ) : (
                <>📥 保存到本地</>
              )}
            </button>

            <button
              onClick={handleBackToEdit}
              className="w-full py-3 text-sm text-sage-500 hover:text-sage-600 transition-colors duration-300"
            >
              ← 返回修改计划
            </button>
          </div>
        </div>
      )}

      {/* ========== Phase: ActionPending（等待完成行动） ========== */}
      {phase === 'actionPending' && attitude && (
        <div className="space-y-5 animate-scale-in">
          {/* 提示卡片 */}
          <div className="card p-6 text-center bg-gradient-to-br from-moss-50 to-sage-50">
            <div className="text-4xl mb-3">🌿</div>
            <h2 className="text-lg font-medium text-moss-600 mb-2">
              今日行动已准备好
            </h2>
            <p className="text-sm text-sage-500 leading-relaxed">
              这张壁纸会陪你完成今天的练习<br/>
              去生活里轻轻实践，晚些时候再回来看看自己<br/>
              今天的种子已经种下了
            </p>
          </div>

          {/* 今日计划回顾 */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{attitude.plantEmoji}</span>
              <div>
                <div className="font-medium text-sage-700">{attitude.name}</div>
                <div className="text-xs text-sage-400">{attitude.plant}</div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-xl p-3">
              <div className="text-xs text-sage-400 mb-1">今日行动计划</div>
              <p className="text-sage-600 text-sm">{cardState?.actionPlan}</p>
            </div>
          </div>

          {/* 晚间回来记录感受 */}
          <div className="card p-4">
            <label className="block text-sm text-sage-500 mb-2">
              今天行动后的感受记录
            </label>
            <textarea
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
              placeholder="写下你完成后的感受、发现或收获"
              className="w-full bg-cream-50 border border-sage-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300 max-h-40 overflow-y-auto"
              rows={4}
            />
          </div>

          {/* 完成按钮 */}
          <button
            onClick={handleComplete}
            className="w-full btn-primary py-4 text-base"
          >
            🌱 完成行动，浇灌森林
          </button>
        </div>
      )}

      {/* ========== Phase: Completed（已完成） ========== */}
      {phase === 'completed' && attitude && (
        <div className="space-y-5 animate-scale-in">
          {/* 完成卡片 */}
          <div className="card p-6 text-center bg-gradient-to-br from-moss-50 to-sage-50">
            <div className="text-5xl mb-3 animate-breathe">
              ✨
            </div>
            <div className="font-medium text-moss-600 text-lg mb-1">
              今日态度卡已完成
            </div>
            <div className="text-sm text-sage-500">
              你为今天的自己浇了一次水
            </div>
          </div>

          {/* 态度信息 */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{attitude.plantEmoji}</span>
              <div>
                <div className="font-medium text-sage-700">{attitude.name}</div>
                <div className="text-xs text-sage-400">{attitude.plant}</div>
              </div>
            </div>

            {/* 行动计划 */}
            <div className="bg-cream-50 rounded-xl p-3 mb-3">
              <div className="text-xs text-sage-400 mb-1">行动计划</div>
              <p className="text-sage-600 text-sm">{cardState?.actionPlan}</p>
            </div>

            {/* 感受记录 */}
            {cardState?.feeling && (
              <div className="bg-moss-50 rounded-xl p-3">
                <div className="text-xs text-moss-500 mb-1">你的感受</div>
                <p className="text-sage-600 text-sm italic">{cardState.feeling}</p>
              </div>
            )}
          </div>

          {/* 温柔反馈 */}
          <div className="card p-4 text-center bg-gradient-to-br from-sage-50 to-moss-50">
            <p className="text-moss-600 text-sm leading-relaxed">
              {cardState?.feeling
                ? '森林记住了这次真实的行动，一次小小践行，也会带来生长'
                : '森林记住了这次真实的行动'}
            </p>
          </div>

          {/* 操作按钮 */}
          <button
            onClick={handlePracticeAgain}
            className="w-full btn-primary py-4 text-base"
          >
            🎲 再抽一张态度卡
          </button>
        </div>
      )}

      {/* 底部导航 */}
      <div className="mt-8">
        <Link href="/forest" className="block w-full py-4 text-center text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300">
          🌳 去看看我的森林 →
        </Link>
      </div>
    </div>
  );
}
