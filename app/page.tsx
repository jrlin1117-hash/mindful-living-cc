'use client';

import Link from 'next/link';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import CalendarExpandedModal from '@/components/CalendarExpandedModal';
import { getStreak, ensureFirstUsedAt } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Home() {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showExpandedCalendar, setShowExpandedCalendar] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStreak(getStreak());
    ensureFirstUsedAt();
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {/* 主标题区 */}
      <div className="text-center py-5 space-y-2">
        <h1 className="text-2xl font-medium text-sage-700 tracking-wide">
          正念小森林
        </h1>
        <p className="text-sage-400 text-xs leading-relaxed max-w-xs mx-auto">
          正念如植物，你悉心照料它
          <br />
          它也会照顾好你
        </p>
      </div>

      {/* 云呼呼欢迎卡片 */}
      <div className="mb-6">
        <div className="card p-5">
          {/* 默认状态：简短欢迎 */}
          <div className="text-center">
            <div className="mb-3">
              <img
                src="/images/yunhuhu/welcome.png"
                alt="云呼呼"
                className="w-20 h-auto mx-auto object-contain"
              />
            </div>
            <p className="text-sm font-medium text-sage-700 mb-1">你好呀，我是森林守护者云呼呼</p>
            <p className="text-xs text-sage-400">我会陪你把正念慢慢带进生活</p>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="mt-3 text-xs text-moss-500 hover:text-moss-600 transition-colors"
            >
              {showGuide ? '收起说明 ↑' : '了解小森林怎么运作 ↓'}
            </button>
          </div>

          {/* 展开状态：详细说明 */}
          {showGuide && (
            <div className="mt-5 pt-4 border-t border-sage-100 space-y-4 animate-fade-in">
              <div className="space-y-1">
                <p className="text-xs text-sage-400 leading-relaxed">
                  在这里，你可以做两件事：
                </p>
              </div>

              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">🌈</span>
                  <div>
                    <p className="text-sm font-medium text-sage-700">浇灌日常里的正念态度</p>
                    <p className="text-xs text-sage-400 mt-1 leading-relaxed">
                      每天抽取或选择一个态度，把它带到真实生活里练习。完成行动并记录之后，对应的植物就会长大一点点。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-2xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">🧘</span>
                  <div>
                    <p className="text-sm font-medium text-sage-700">记录正式的正念冥想</p>
                    <p className="text-xs text-sage-400 mt-1 leading-relaxed">
                      你可以完成计时的正念冥想练习，并记录感受。每一次练习都会滋养整片森林。
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-2xl p-4">
                <p className="text-xs font-medium text-amber-600 mb-2">小森林的浇灌规则</p>
                <div className="space-y-1.5 text-xs text-sage-500 leading-relaxed">
                  <p>• 每个态度都有一株属于自己的植物</p>
                  <p>• 完成一次态度行动，这株植物正念值 +1</p>
                  <p>• 完成一次冥想，所有植物的正念值 +1</p>
                  <p>• 每株植物的正念值满分是 10 分</p>
                  <p>• 连续 7 天未照料，植物会回到初始状态</p>
                </div>
              </div>

              <p className="text-xs text-sage-400 text-center italic leading-relaxed">
                不用一次做很多。每天一点点，森林就会慢慢长出来。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 连续照顾自己 / 日历展开 */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-sage-300">——</span>
          <h2 className="text-sm font-medium text-sage-400">
            {mounted && streak.currentStreak > 0
              ? `连续 ${streak.currentStreak} 天照顾自己`
              : '开始你的正念之旅'}
          </h2>
          <span className="text-sage-300">——</span>
        </div>
        {showExpandedCalendar ? (
          <CalendarExpandedModal onClose={() => setShowExpandedCalendar(false)} />
        ) : (
          <WeeklyCalendar onExpand={() => setShowExpandedCalendar(true)} />
        )}
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

      {/* 展开日历弹窗 */}
      {showExpandedCalendar && (
        <CalendarExpandedModal onClose={() => setShowExpandedCalendar(false)} />
      )}
    </div>
  );
}
