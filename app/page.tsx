'use client';

import Link from 'next/link';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { getTodayStats, getTotalMindfulValue, getStreak } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ cardCount: 0, meditationCount: 0 });
  const [totalValue, setTotalValue] = useState(0);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getTodayStats());
    setTotalValue(getTotalMindfulValue());
    setStreak(getStreak());
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {/* 主标题区 */}
      <div className="text-center py-8 space-y-3">
        <div className="relative inline-block">
          <span className="text-6xl animate-float-slow">🌱</span>
          <div className="absolute -top-2 -right-2 text-xl animate-breathe">✨</div>
        </div>
        <h1 className="text-3xl font-medium text-sage-700 tracking-wide">
          正念小森林
        </h1>
        <p className="text-sage-400 text-sm leading-relaxed max-w-xs mx-auto">
          正念如植物，你悉心照料它
          <br />
          它也会照顾好你
        </p>
      </div>

      {/* 连续打卡 */}
      {mounted && streak.currentStreak > 0 && (
        <div className="card p-4 mb-6 text-center bg-gradient-to-br from-moss-50 to-sage-50">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-2xl font-medium text-moss-600">
                {streak.currentStreak}
              </div>
              <div className="text-xs text-sage-500">
                天连续照顾自己
              </div>
            </div>
          </div>
          {streak.longestStreak > streak.currentStreak && (
            <div className="text-xs text-sage-400 mt-1">
              最长连续 {streak.longestStreak} 天
            </div>
          )}
        </div>
      )}

      {mounted && streak.currentStreak === 0 && (
        <div className="card p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-sm text-sage-500">
              开始你的正念之旅
            </span>
          </div>
        </div>
      )}

      {/* 本周日历 */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sage-300">——</span>
          <h2 className="text-sm font-medium text-sage-400">最近一周</h2>
          <span className="text-sage-300">——</span>
        </div>
        <WeeklyCalendar />
      </div>

      {/* 今日数据 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center py-5 group hover:scale-[1.02] transition-all duration-300">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">💧</div>
          <div className="text-2xl font-medium text-moss-600 value-change">
            {mounted ? stats.cardCount : '-'}
          </div>
          <div className="text-xs text-sage-400 mt-1">今日态度卡</div>
        </div>
        <div className="card text-center py-5 group hover:scale-[1.02] transition-all duration-300">
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🧘</div>
          <div className="text-2xl font-medium text-moss-600 value-change">
            {mounted ? stats.meditationCount : '-'}
          </div>
          <div className="text-xs text-sage-400 mt-1">今日冥想</div>
        </div>
      </div>

      {/* 总正念值 */}
      <div className="card p-4 mb-6 text-center bg-gradient-to-br from-sage-100 to-moss-100">
        <div className="text-sm text-sage-500 mb-1">森林总正念值</div>
        <div className="text-3xl font-medium text-moss-600">
          {mounted ? totalValue : '-'}
        </div>
      </div>

      {/* 入口卡片 */}
      <div className="space-y-4">
        {/* 抽取态度卡 */}
        <Link href="/card" className="card-entry group block">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-all duration-300">
              🎴
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sage-700 mb-1 group-hover:text-moss-600 transition-colors duration-300">
                抽取态度卡
              </h3>
              <p className="text-sm text-sage-400 leading-relaxed">
                看看今天的内在方向
              </p>
            </div>
            <div className="text-sage-300 group-hover:translate-x-1 transition-transform duration-300">
              →
            </div>
          </div>
        </Link>

        {/* 正念冥想 */}
        <Link href="/meditation" className="card-entry group block">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-softteal-50 to-cyan-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-all duration-300">
              🧘
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sage-700 mb-1 group-hover:text-moss-600 transition-colors duration-300">
                正念冥想
              </h3>
              <p className="text-sm text-sage-400 leading-relaxed">
                给自己一段安静的时光
              </p>
            </div>
            <div className="text-sage-300 group-hover:translate-x-1 transition-transform duration-300">
              →
            </div>
          </div>
        </Link>

        {/* 进入森林 */}
        <Link href="/forest" className="card-entry group block">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-50 to-moss-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-all duration-300">
              🌳
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sage-700 mb-1 group-hover:text-moss-600 transition-colors duration-300">
                进入森林
              </h3>
              <p className="text-sm text-sage-400 leading-relaxed">
                看看你的小森林长得怎么样了
              </p>
            </div>
            <div className="text-sage-300 group-hover:translate-x-1 transition-transform duration-300">
              →
            </div>
          </div>
        </Link>
      </div>

      {/* 底部小提示 */}
      <div className="mt-10 text-center">
        <p className="text-xs text-sage-300 italic">
          🌿 每一份练习，都在浇灌你的森林
        </p>
      </div>
    </div>
  );
}
