'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ATTITUDES,
  getPlantValues,
  getTodayStats,
  getTotalMindfulValue,
  getRecentRecords,
  resetAllData,
  getGrowthInfo,
  GrowthInfo,
  getRandomGrowthMessage,
  getStreak,
  getPlantProgress,
  PlantProgress,
} from '@/lib/storage';

interface PlantDisplay {
  attitude: typeof ATTITUDES[0];
  value: number;
  growthInfo: GrowthInfo;
  message: string;
}

interface ExpandedPlant {
  attitude: typeof ATTITUDES[0];
  value: number;
  growthInfo: GrowthInfo;
  message: string;
}

export default function ForestPage() {
  const [plants, setPlants] = useState<PlantDisplay[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [todayStats, setTodayStats] = useState({ cardCount: 0, meditationCount: 0 });
  const [recentRecords, setRecentRecords] = useState<Array<{ type: 'card' | 'meditation'; date: string; content: string; plant?: string }>>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedPlant, setExpandedPlant] = useState<ExpandedPlant | null>(null);
  const [streak, setStreak] = useState({ currentStreak: 0 });

  const loadData = () => {
    const values = getPlantValues();
    const plantDisplays: PlantDisplay[] = ATTITUDES.map(attitude => {
      const value = values[attitude.plant] || 0;
      const growthInfo = getGrowthInfo(value);
      return {
        attitude,
        value,
        growthInfo,
        message: getRandomGrowthMessage(growthInfo.stage),
      };
    });
    setPlants(plantDisplays);
    setTotalValue(getTotalMindfulValue());
    setTodayStats(getTodayStats());
    setRecentRecords(getRecentRecords());
    setStreak(getStreak());
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const handleReset = () => {
    resetAllData();
    loadData();
    setShowResetConfirm(false);
    setExpandedPlant(null);
  };

  const handlePlantClick = (plant: PlantDisplay) => {
    if (expandedPlant?.attitude.name === plant.attitude.name) {
      setExpandedPlant(null);
    } else {
      setExpandedPlant(plant);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getPlantVisualSize = (info: GrowthInfo): string => {
    switch (info.stage) {
      case 'mature': return 'text-4xl';
      case 'lush': return 'text-3xl';
      case 'growing': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-sage-700 mb-2">我的森林</h1>
        <p className="text-sm text-sage-400">用心浇灌，静待生长</p>
      </div>

      {/* 总览数据 */}
      <div className="card p-5 mb-5 bg-gradient-to-br from-sage-500 to-moss-600 text-white">
        <div className="flex justify-around text-center">
          <div className="flex-1">
            <div className="text-2xl font-light mb-1">{mounted ? totalValue : '-'}</div>
            <div className="text-xs opacity-70">总正念值</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1">
            <div className="text-2xl font-light mb-1">{mounted ? todayStats.cardCount : '-'}</div>
            <div className="text-xs opacity-70">今日态度卡</div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1">
            <div className="text-2xl font-light mb-1">{mounted ? todayStats.meditationCount : '-'}</div>
            <div className="text-xs opacity-70">今日冥想</div>
          </div>
        </div>

        {/* Streak */}
        {streak.currentStreak > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <span className="text-sm">
              🔥 连续 {streak.currentStreak} 天浇灌森林
            </span>
          </div>
        )}
      </div>

      {/* 展开的植物详情 */}
      {expandedPlant && (() => {
        const progress = getPlantProgress(expandedPlant.value);
        return (
          <div className="card p-5 mb-5 bg-gradient-to-br from-white to-cream-100 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{expandedPlant.attitude.plantEmoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sage-700 text-lg">{expandedPlant.attitude.plant}</h3>
                    <p className="text-sm text-moss-600">{expandedPlant.attitude.name}</p>
                  </div>
                  <button
                    onClick={() => setExpandedPlant(null)}
                    className="text-sage-400 hover:text-sage-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-sage-400 mb-1">态度释义</div>
                    <p className="text-sm text-sage-600">{expandedPlant.attitude.meaning}</p>
                  </div>

                  <div>
                    <div className="text-xs text-sage-400 mb-1">为什么是 {expandedPlant.attitude.plant}？</div>
                    <p className="text-sm text-sage-600 italic">
                      "{expandedPlant.attitude.plantReason}"
                    </p>
                  </div>

                  {/* 成长进度条 */}
                  <div className="bg-sage-50/80 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{progress.currentStage === 'mature' ? '✨' : progress.currentStage === 'lush' ? '🍃' : progress.currentStage === 'growing' ? '🌿' : '🌱'}</span>
                        <span className="text-sm font-medium text-sage-600">{progress.currentStageName}</span>
                      </div>
                      <span className="text-xs text-sage-400">
                        {progress.currentScore} / {progress.nextStage ? progress.nextStageThreshold : progress.currentScore}
                      </span>
                    </div>

                    {/* 进度条 */}
                    <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-sage-300 to-moss-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>

                    {/* 阶段节点 */}
                    <div className="flex justify-between text-xs text-sage-400">
                      <span>🌱</span>
                      <span>🌿</span>
                      <span>🍃</span>
                      <span>✨</span>
                    </div>

                    {/* 下一阶段提示 */}
                    {progress.nextStage && (
                      <div className="mt-2 text-xs text-sage-500 text-center">
                        再积累 <span className="text-moss-500 font-medium">{progress.pointsToNext}</span> 次浇灌，进入「{progress.nextStageName}」
                      </div>
                    )}
                    {progress.currentStage === 'mature' && (
                      <div className="mt-2 text-xs text-moss-500 text-center">
                        🌟 这株植物已经绽放！
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-xl font-medium text-moss-600">{expandedPlant.value}</div>
                      <div className="text-xs text-sage-400">正念值</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl">{expandedPlant.growthInfo.emoji}</div>
                      <div className="text-xs text-sage-400">{expandedPlant.growthInfo.stage === 'mature' ? '成熟' : expandedPlant.growthInfo.stage === 'lush' ? '茂盛' : expandedPlant.growthInfo.stage === 'growing' ? '生长中' : '幼苗'}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-sage-500 italic">
                        "{expandedPlant.message}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 森林网格 */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sage-300">——</span>
          <h2 className="text-sm font-medium text-sage-400">正念花园</h2>
          <span className="text-sage-300">——</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {plants.map((plant, index) => {
            const { attitude, value, growthInfo } = plant;
            const isExpanded = expandedPlant?.attitude.name === attitude.name;
            const progress = getPlantProgress(value);

            return (
              <button
                key={attitude.name}
                onClick={() => handlePlantClick(plant)}
                className={`rounded-3xl p-3 bg-gradient-to-br ${attitude.gradient} transition-all duration-500 cursor-pointer text-left
                  ${isExpanded ? 'ring-2 ring-moss-400 scale-105' : 'hover:scale-102'}
                `}
                style={{
                  minHeight: `${100 + growthInfo.scale * 30}px`,
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {/* 植物图标 */}
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`${getPlantVisualSize(growthInfo)} transition-all duration-700`}
                    style={{
                      transform: `scale(${growthInfo.scale})`,
                      opacity: growthInfo.opacity,
                    }}
                  >
                    {attitude.plantEmoji}
                  </div>
                </div>

                {/* 植物名称 */}
                <div className="text-center">
                  <div className="text-xs font-medium text-sage-700">{attitude.plant}</div>
                  <div className="text-xs text-sage-500">{attitude.name}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs">{growthInfo.emoji}</span>
                    <span className="text-xs text-sage-400">{value}</span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mt-2">
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/70 rounded-full transition-all duration-500"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 最近记录 */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-medium text-sage-400 mb-4">最近浇灌</h2>
        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-sage-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{record.plant || (record.type === 'card' ? '💧' : '🧘')}</span>
                  <div>
                    <div className="text-sm text-sage-700">{record.content}</div>
                    <div className="text-xs text-sage-400">{formatDate(record.date)}</div>
                  </div>
                </div>
                <span className="text-xs text-sage-300">
                  {record.type === 'card' ? '态度卡' : '冥想'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-30">🌱</div>
            <p className="text-sm text-sage-400">还没有记录</p>
            <p className="text-xs text-sage-300 mt-1">开始你的正念之旅吧</p>
          </div>
        )}
      </div>

      {/* 成长阶段说明 */}
      <div className="text-center mb-6">
        <p className="text-xs text-sage-400 mb-3">成长阶段</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-sage-400">
            <span>🌱</span>
            <span>幼苗</span>
            <span className="text-sage-300">0-2</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sage-400">
            <span>🌿</span>
            <span>生长</span>
            <span className="text-sage-300">3-5</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sage-400">
            <span>🍃</span>
            <span>茂盛</span>
            <span className="text-sage-300">6-9</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sage-400">
            <span>✨</span>
            <span>成熟</span>
            <span className="text-sage-300">10+</span>
          </div>
        </div>
      </div>

      {/* 重置确认 */}
      {showResetConfirm ? (
        <div className="card p-5 border-2 border-red-100">
          <p className="text-sm text-red-600 text-center mb-4">
            确定要重置所有数据吗？<br />
            <span className="text-xs">这将清空你的整个森林</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-2xl text-sm text-sage-600 bg-cream-100 hover:bg-sage-100 transition-colors duration-300"
            >
              取消
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-2xl text-sm text-white bg-red-400 hover:bg-red-500 transition-colors duration-300"
            >
              确认重置
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 text-sm text-sage-300 hover:text-red-400 transition-colors duration-300"
        >
          重置数据
        </button>
      )}

      {/* 底部快捷入口 */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/card"
          className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 text-center group"
        >
          <span className="text-xl mb-1 block">🎴</span>
          <span className="text-xs text-sage-600 group-hover:text-moss-600 transition-colors duration-300">抽取态度卡</span>
        </Link>
        <Link
          href="/meditation"
          className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-softteal-50 to-cyan-50 text-center group"
        >
          <span className="text-xl mb-1 block">🧘</span>
          <span className="text-xs text-sage-600 group-hover:text-moss-600 transition-colors duration-300">正念冥想</span>
        </Link>
      </div>

      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-sage-300 italic">
          森林记住了你的每一次觉察
        </p>
      </div>
    </div>
  );
}
