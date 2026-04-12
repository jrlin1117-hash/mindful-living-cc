'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ATTITUDES,
  MindfulnessAttitude,
  getRandomAttitude,
  getToday,
  getCardRecords,
  saveCardRecord,
  incrementPlantValue,
  CardRecord,
} from '@/lib/storage';

export default function CardPage() {
  const [currentCard, setCurrentCard] = useState<MindfulnessAttitude | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [todayCard, setTodayCard] = useState<MindfulnessAttitude | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = getToday();
    const records = getCardRecords();
    const todayRecord = records.find(r => r.date === today && r.completed);
    if (todayRecord) {
      setHasDrawnToday(true);
      setTodayCard(ATTITUDES[todayRecord.cardIndex]);
      setIsCompleted(true);
    }
  }, []);

  const handleDrawCard = () => {
    const card = getRandomAttitude();
    setCurrentCard(card);
    setShowCard(true);
    setShowAllCards(false);
  };

  const handleComplete = () => {
    if (!currentCard) return;

    const today = getToday();
    const cardIndex = ATTITUDES.findIndex(a => a.name === currentCard.name);

    const record: CardRecord = {
      date: today,
      cardIndex,
      completed: true,
    };
    saveCardRecord(record);
    incrementPlantValue(currentCard.plant);

    setIsCompleted(true);
    setHasDrawnToday(true);
    setTodayCard(currentCard);

    setToastMessage(`🌱 ${currentCard.plant} +1`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    setFeeling('');
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
        <p className="text-sm text-sage-400">抽取今日的正念态度，浇灌你的植物</p>
      </div>

      {hasDrawnToday && todayCard && (
        <div className={`card p-6 mb-6 bg-gradient-to-br ${todayCard.gradient}`}>
          <div className="text-center">
            <div className="text-sm text-sage-500 mb-3">今日态度</div>
            <div className="text-5xl mb-3 animate-float-slow">{todayCard.plantEmoji}</div>
            <div className="font-medium text-sage-700 text-lg">{todayCard.name}</div>
            <div className="text-xs text-sage-500 mt-2 opacity-70">森林已记住这次浇灌</div>
          </div>
        </div>
      )}

      {!showCard && !hasDrawnToday && (
        <div className="text-center py-16">
          <div className="relative inline-block mb-8">
            <div className="w-40 h-56 mx-auto rounded-3xl bg-gradient-to-br from-sage-100 to-moss-100 shadow-soft-lg flex items-center justify-center">
              <span className="text-6xl opacity-50">🎴</span>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-cream-100 shadow-soft flex items-center justify-center">✨</div>
          </div>
          <button onClick={handleDrawCard} className="btn-primary text-base px-10 py-4">
            抽取今日态度卡
          </button>
        </div>
      )}

      {showCard && currentCard && (
        <div className="space-y-5 animate-scale-in">
          <div className={`bg-gradient-to-br ${currentCard.gradient} rounded-3xl p-8 shadow-soft-lg relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="text-center mb-6">
                <div className="text-7xl mb-4 animate-breathe">{currentCard.plantEmoji}</div>
                <h2 className="text-2xl font-medium text-sage-700 mb-2">{currentCard.name}</h2>
                <p className="text-sm text-sage-500 leading-relaxed">{currentCard.meaning}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                <div className="text-xs font-medium text-sage-400 mb-2 uppercase tracking-wider">今日行动</div>
                <p className="text-sage-600 leading-relaxed">{currentCard.action}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <label className="block text-sm text-sage-500 mb-3">记录此刻的感受（选填）</label>
            <textarea
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
              placeholder="写给自己的话..."
              className="w-full bg-cream-50 border border-sage-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300"
              rows={3}
            />
          </div>

          <button onClick={handleComplete} className="w-full btn-primary py-4 text-base">
            🌱 完成浇灌
          </button>

          <button
            onClick={() => setShowCard(false)}
            className="w-full py-3 text-sm text-sage-400 hover:text-sage-600 transition-colors duration-300"
          >
            重新抽取
          </button>
        </div>
      )}

      {isCompleted && !showCard && (
        <div className="text-center py-10 space-y-4">
          <div className="text-6xl animate-breathe">🌸</div>
          <p className="text-moss-600 font-medium">今日态度卡已完成</p>
          <p className="text-sm text-sage-400">你的{todayCard?.plant}正在茁壮成长</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowAllCards(!showAllCards)}
          className="w-full py-4 text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300 flex items-center justify-center gap-2"
        >
          {showAllCards ? '收起' : '查看'}全部态度卡
          <span className={`transform transition-transform duration-300 ${showAllCards ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {showAllCards && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {ATTITUDES.map((attitude) => (
              <div
                key={attitude.name}
                className={`bg-gradient-to-br ${attitude.gradient} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => {
                  if (!hasDrawnToday) {
                    setCurrentCard(attitude);
                    setShowCard(true);
                  }
                }}
              >
                <div className="text-3xl mb-2">{attitude.plantEmoji}</div>
                <div className="text-xs font-medium text-sage-600">{attitude.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link href="/forest" className="block w-full py-4 text-center text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300">
          🌳 去看看我的森林 →
        </Link>
      </div>
    </div>
  );
}
