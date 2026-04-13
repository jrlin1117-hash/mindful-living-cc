'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ATTITUDES,
  MindfulnessAttitude,
  CardDraw,
  getTodayCards,
  getTodayFirstCard,
  hasDrawnToday,
  drawCard,
  completeCard,
  getRandomAction,
  getStreak,
} from '@/lib/storage';

type Phase = 'idle' | 'viewing' | 'completed' | 'picker';

export default function CardPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [todayCards, setTodayCards] = useState<CardDraw[]>([]);
  const [completedDrawIds, setCompletedDrawIds] = useState<string[]>([]);
  const [currentDraw, setCurrentDraw] = useState<CardDraw | null>(null);
  const [currentAction, setCurrentAction] = useState('');
  const [feeling, setFeeling] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [streak, setStreak] = useState({ currentStreak: 0 });
  const [mounted, setMounted] = useState(false);

  // 初始化
  useEffect(() => {
    setMounted(true);
    loadTodayData();
  }, []);

  const loadTodayData = useCallback(() => {
    const { draws, completedDrawIds: completed } = getTodayCards();
    setTodayCards(draws);
    setCompletedDrawIds(completed);
    setStreak(getStreak());

    // 如果今天有第一张卡，自动进入完成态
    const firstCard = getTodayFirstCard();
    if (firstCard) {
      setCurrentDraw(firstCard);
      setCurrentAction(firstCard.actionSuggestion || '');
      setPhase('completed');
    }
  }, []);

  // 抽取新卡
  const handleDrawNew = () => {
    const draw = drawCard();
    setCurrentDraw(draw);
    setCurrentAction(draw.actionSuggestion || '');
    setFeeling('');
    setPhase('viewing');
  };

  // 选择指定态度
  const handleSelectAttitude = (index: number) => {
    const draw = drawCard(index);
    setCurrentDraw(draw);
    setCurrentAction(draw.actionSuggestion || '');
    setFeeling('');
    setPhase('viewing');
  };

  // 换一个行动建议
  const handleNewAction = () => {
    if (!currentDraw) return;
    const newAction = getRandomAction(currentDraw.cardIndex, currentAction);
    setCurrentAction(newAction);
  };

  // 完成浇灌
  const handleComplete = () => {
    if (!currentDraw) return;

    completeCard(currentDraw.drawTime, feeling);
    setShowToast(true);
    setToastMessage(`🌱 ${ATTITUDES[currentDraw.cardIndex].plant} +1`);
    setTimeout(() => setShowToast(false), 3000);

    loadTodayData();
    setPhase('completed');
  };

  // 再练习一次
  const handlePracticeAgain = () => {
    setCurrentDraw(null);
    setCurrentAction('');
    setFeeling('');
    setPhase('idle');
  };

  // 打开态度选择器
  const handleShowPicker = () => {
    setPhase('picker');
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

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {showToast && <div className="toast">{toastMessage}</div>}

      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-sage-700 mb-2">抽取态度卡</h1>
        <p className="text-sm text-sage-400">
          {todayCards.length > 0
            ? `今日已抽取 ${todayCards.length} 张`
            : '抽取今日的正念态度，浇灌你的植物'}
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

      {/* ========== 初始状态 ========== */}
      {phase === 'idle' && (
        <div className="space-y-5">
          {/* 今日已抽取的卡 */}
          {todayCards.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-sage-600">今日态度</h3>
                <span className="text-xs text-sage-400">
                  {completedDrawIds.length}/{todayCards.length} 完成
                </span>
              </div>
              <div className="space-y-3">
                {todayCards.map((draw, index) => {
                  const attitude = ATTITUDES[draw.cardIndex];
                  const isCompleted = completedDrawIds.includes(draw.drawTime);
                  const isCurrent = currentDraw?.drawTime === draw.drawTime;

                  return (
                    <div
                      key={draw.drawTime}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${attitude.gradient} ${
                        isCurrent ? 'ring-2 ring-moss-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{attitude.plantEmoji}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sage-700">{attitude.name}</div>
                          <div className="text-xs text-sage-500">{attitude.plant}</div>
                        </div>
                        {isCompleted && (
                          <span className="text-lg">✨</span>
                        )}
                      </div>
                      {isCompleted && (
                        <p className="text-xs text-sage-500 mt-2 italic">
                          "{draw.actionSuggestion}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 主操作区 */}
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
              🎲 抽取态度卡
            </button>

            <button
              onClick={handleShowPicker}
              className="w-full py-3 text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300"
            >
              我想练习某种态度
            </button>
          </div>
        </div>
      )}

      {/* ========== 查看/练习卡 ========== */}
      {phase === 'viewing' && currentDraw && (
        <div className="space-y-4 animate-scale-in">
          {(() => {
            const attitude = ATTITUDES[currentDraw.cardIndex];
            const isAlreadyCompleted = completedDrawIds.includes(currentDraw.drawTime);

            return (
              <>
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

                    {/* 行动建议 */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-sage-400 uppercase tracking-wider">
                          今日行动
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

                {/* 感受输入 */}
                {!isAlreadyCompleted && (
                  <div className="card p-4">
                    <label className="block text-sm text-sage-500 mb-2">
                      记录此刻的感受（选填）
                    </label>
                    <textarea
                      value={feeling}
                      onChange={e => setFeeling(e.target.value)}
                      placeholder="写给自己的话..."
                      className="w-full bg-cream-50 border border-sage-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300 max-h-40 overflow-y-auto"
                      rows={3}
                    />
                  </div>
                )}

                {/* 按钮 */}
                {!isAlreadyCompleted ? (
                  <button
                    onClick={handleComplete}
                    className="w-full btn-primary py-4 text-base"
                  >
                    🌱 完成浇灌
                  </button>
                ) : (
                  <div className="card p-4 text-center bg-gradient-to-br from-moss-50 to-sage-50">
                    <span className="text-2xl mb-2 block">✨</span>
                    <p className="text-moss-600 font-medium">今日已完成浇灌</p>
                  </div>
                )}

                <button
                  onClick={handlePracticeAgain}
                  className="w-full py-3 text-sm text-sage-400 hover:text-sage-600 transition-colors duration-300"
                >
                  ← 再抽一张
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* ========== 完成状态 ========== */}
      {phase === 'completed' && currentDraw && (
        <div className="space-y-5 animate-scale-in">
          {(() => {
            const attitude = ATTITUDES[currentDraw.cardIndex];
            const isCompleted = completedDrawIds.includes(currentDraw.drawTime);

            return (
              <>
                {/* 完成卡片 */}
                <div className="card p-6 text-center bg-gradient-to-br from-moss-50 to-sage-50">
                  <div className="text-5xl mb-3 animate-breathe">
                    {isCompleted ? '✨' : attitude.plantEmoji}
                  </div>
                  <div className="font-medium text-moss-600 text-lg mb-1">
                    {isCompleted ? '今日态度卡已完成' : attitude.name}
                  </div>
                  <div className="text-sm text-sage-500">
                    {isCompleted
                      ? `你的${attitude.plant}正在茁壮成长`
                      : '准备好了吗？'}
                  </div>
                </div>

                {/* 行动建议回顾 */}
                {isCompleted && (
                  <div className="card p-4">
                    <div className="text-xs font-medium text-sage-400 mb-2">今日行动</div>
                    <p className="text-sage-600 italic">
                      "{currentDraw.actionSuggestion}"
                    </p>
                  </div>
                )}

                {/* 操作按钮 */}
                <button
                  onClick={handlePracticeAgain}
                  className="w-full btn-primary py-4 text-base"
                >
                  🎲 再抽一张态度卡
                </button>

                <button
                  onClick={handleShowPicker}
                  className="w-full py-3 text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300"
                >
                  我想练习某种态度
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* ========== 态度选择器 ========== */}
      {phase === 'picker' && (
        <div className="space-y-4 animate-scale-in">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-sage-700 mb-1">选择态度</h3>
            <p className="text-sm text-sage-400">点击选择你想练习的态度</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ATTITUDES.map((attitude, index) => (
              <button
                key={attitude.name}
                onClick={() => handleSelectAttitude(index)}
                className={`bg-gradient-to-br ${attitude.gradient} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300`}
              >
                <div className="text-3xl mb-2">{attitude.plantEmoji}</div>
                <div className="text-xs font-medium text-sage-700">{attitude.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setPhase(currentDraw ? 'viewing' : 'idle')}
            className="w-full py-3 text-sm text-sage-400 hover:text-sage-600 transition-colors duration-300"
          >
            ← 返回
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
