'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getToday, saveMeditationRecord, incrementAllPlants, MeditationRecord, getMeditationRecords } from '@/lib/storage';

type Duration = 5 | 10 | 15 | number;
type Phase = 'idle' | 'running' | 'paused' | 'completed';

// ============ 钟声相关 ============

const BELL_STORAGE_KEY = 'meditation_bell_enabled';

function getBellEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(BELL_STORAGE_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

function setBellEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BELL_STORAGE_KEY, String(enabled));
}

function playBell(): void {
  try {
    const audio = new Audio('/sounds/bell.mp3');
    audio.volume = 0.5;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
}

// ============ 组件 ============

export default function MeditationPage() {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(5);
  const [customDuration, setCustomDuration] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [feeling, setFeeling] = useState('');
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [bellEnabled, setBellEnabledState] = useState(true);
  const [showFeelingCard, setShowFeelingCard] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlayedEndBell = useRef(false);
  const currentSessionRef = useRef({ duration: 0, feeling: '' });
  // 息屏后继续计时：用开始时间戳 + wall clock 差值，而非逐秒递减
  const sessionStartRef = useRef<number | null>(null);
  const sessionTotalRef = useRef<number>(0); // 总时长（秒）

  const today = getToday();

  // 初始化
  useEffect(() => {
    setBellEnabledState(getBellEnabled());

    const records = getMeditationRecords();
    const todayRecord = records.find(r => r.date === today && r.completed);
    if (todayRecord) {
      setTodayCompleted(true);
    }
  }, [today]);

  // 切换钟声开关
  const toggleBell = useCallback(() => {
    const newValue = !bellEnabled;
    setBellEnabledState(newValue);
    setBellEnabled(newValue);
  }, [bellEnabled]);

  const getDurationInSeconds = useCallback((duration: Duration): number => {
    if (typeof duration === 'number') return duration * 60;
    return duration * 60;
  }, []);

  // 重置到初始状态（可重新开始）
  const resetToInitial = useCallback(() => {
    setPhase('idle');
    setTimeLeft(0);
    setFeeling('');
    setShowFeelingCard(false);
    hasPlayedEndBell.current = false;
    currentSessionRef.current = { duration: 0, feeling: '' };
    sessionStartRef.current = null;
    sessionTotalRef.current = 0;
  }, []);

  // 开始练习
  const startTimer = () => {
    const duration = customDuration ? parseInt(customDuration) : selectedDuration;
    const seconds = getDurationInSeconds(duration as Duration);
    setTimeLeft(seconds);
    setPhase('running');
    hasPlayedEndBell.current = false;
    currentSessionRef.current = { duration, feeling: '' };
    // 记录开始时间和总时长，用于息屏后恢复计算
    sessionStartRef.current = Date.now();
    sessionTotalRef.current = seconds;

    if (bellEnabled) {
      playBell();
    }
  };

  // 暂停
  const pauseTimer = () => {
    // 记录暂停时刻，保留剩余时间用于恢复
    sessionStartRef.current = null; // 暂停时不依赖wall clock
    setPhase('paused');
  };

  // 继续
  const resumeTimer = () => {
    // 以当前剩余时间重新开始wall clock计时
    sessionStartRef.current = Date.now();
    sessionTotalRef.current = timeLeft; // 用当前剩余秒数作为新的总时长
    setPhase('running');
  };

  // 重置（回到初始选择时长状态）
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setPhase('idle');
    setTimeLeft(0);
    hasPlayedEndBell.current = false;
    sessionStartRef.current = null;
    sessionTotalRef.current = 0;
  };

  // 完成练习
  const completeMeditation = useCallback(() => {
    if (hasPlayedEndBell.current) return;
    hasPlayedEndBell.current = true;

    const duration = currentSessionRef.current.duration;

    // 保存记录
    const record: MeditationRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      date: today,
      completedAt: new Date().toISOString(),
      duration,
      feeling: currentSessionRef.current.feeling,
      completed: true,
    };
    saveMeditationRecord(record);
    incrementAllPlants(1);

    setPhase('completed');
    setTodayCompleted(true);

    if (bellEnabled) {
      playBell();
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // 延迟显示感受卡片
    setTimeout(() => {
      setShowFeelingCard(true);
    }, 500);
  }, [bellEnabled, today]);

  // 息屏后继续计时的关键：用开始时间戳来计算，而不是依赖 setInterval 计数
  // 这样手机息屏后唤醒时能通过 wall clock 差值计算出正确剩余时间

  // 使用 requestAnimationFrame 或定期同步机制来保证息屏后重新计算
  const syncTimeFromWallClock = useCallback(() => {
    if (sessionStartRef.current === null || sessionTotalRef.current === 0) return;
    const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    const remaining = Math.max(0, sessionTotalRef.current - elapsed);
    setTimeLeft(remaining);
    if (remaining === 0) {
      completeMeditation();
    }
  }, [completeMeditation]);

  // 页面重新可见时（从息屏唤醒）同步时间
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && phase === 'running') {
        syncTimeFromWallClock();
        // 同时重启 interval（interval 只用于触发同步，不直接减秒）
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(syncTimeFromWallClock, 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase, syncTimeFromWallClock]);

  // 计时器逻辑
  useEffect(() => {
    if (phase === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(syncTimeFromWallClock, 1000);
    } else if (timeLeft === 0 && phase === 'running') {
      completeMeditation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [phase, timeLeft, completeMeditation, syncTimeFromWallClock]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getActiveDuration = (): number => {
    if (customDuration) return parseInt(customDuration) || 0;
    return selectedDuration as number;
  };

  const progress = timeLeft > 0
    ? ((getDurationInSeconds(getActiveDuration() as Duration) - timeLeft) / getDurationInSeconds(getActiveDuration() as Duration)) * 100
    : 0;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // 再练习一次
  const handlePracticeAgain = () => {
    resetToInitial();
  };

  // 保存感受并完成
  const handleSaveAndComplete = () => {
    currentSessionRef.current.feeling = feeling;
    // 记录已经保存在 completeMeditation 中了，这里只是关闭卡片
    setShowFeelingCard(false);
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {showToast && <div className="toast">🔔 钟声响起，练习完成</div>}

      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium text-sage-700 mb-2">正念冥想</h1>
        <p className="text-sm text-sage-400">给自己一段安静的时光</p>
      </div>

      {/* 钟声开关 - 仅在未运行时显示 */}
      {phase === 'idle' && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-sm text-sage-500">🔔 钟声提醒</span>
          <button
            onClick={toggleBell}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              bellEnabled ? 'bg-moss-500' : 'bg-sage-200'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-soft transition-all duration-300 ${
                bellEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          <span className={`text-sm ${bellEnabled ? 'text-moss-600' : 'text-sage-400'}`}>
            {bellEnabled ? '开' : '关'}
          </span>
        </div>
      )}

      {/* 今日已完成提示 */}
      {todayCompleted && phase === 'idle' && (
        <div className="card p-4 mb-4 text-center bg-gradient-to-br from-softteal-50 to-sage-50">
          <div className="flex items-center justify-center gap-2">
            <span>✨</span>
            <span className="text-sm text-moss-600">今日已完成 {getMeditationRecords().filter(r => r.date === today && r.completed).length} 次练习</span>
          </div>
        </div>
      )}

      {/* 计时器 */}
      <div className="relative py-8 flex items-center justify-center">
        {/* 背景呼吸环 */}
        <div className={`absolute w-64 h-64 rounded-full border-2 border-sage-100 ${phase === 'running' ? 'animate-breathe' : ''}`} />

        <div className="relative">
          <svg className="w-56 h-56 transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="90"
              stroke="#e8ebe3"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="112"
              cy="112"
              r="90"
              stroke={phase === 'running' ? '#688a52' : '#9aa882'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-light text-sage-700 tracking-wider">
              {phase === 'idle' ? formatTime(getDurationInSeconds(getActiveDuration() as Duration)) : formatTime(timeLeft)}
            </div>
            <div className="text-sm text-sage-400 mt-2">
              {phase === 'running' ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-moss-500 animate-pulse" />
                  冥想中...
                </span>
              ) : phase === 'paused' ? (
                '已暂停'
              ) : phase === 'completed' ? (
                '✨ 练习完成'
              ) : (
                '准备开始'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 初始状态 - 时长选择 + 开始 */}
      {phase === 'idle' && (
        <div className="space-y-5">
          <div className="flex justify-center gap-3">
            {([5, 10, 15] as Duration[]).map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`w-20 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  selectedDuration === duration && !customDuration
                    ? 'bg-gradient-to-br from-moss-500 to-sage-500 text-white shadow-soft'
                    : 'bg-cream-100 text-sage-600 hover:bg-sage-100'
                }`}
              >
                {duration}
                <span className="block text-xs mt-1 opacity-70">分钟</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <input
              type="number"
              value={customDuration}
              onChange={e => setCustomDuration(e.target.value)}
              placeholder="自定义"
              className="w-24 py-3 rounded-2xl border border-sage-200 text-center bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300"
              min="1"
              max="60"
            />
            <span className="text-sage-400 text-sm">分钟</span>
          </div>

          <button
            onClick={startTimer}
            className="w-full btn-primary py-4 text-base"
          >
            开始练习
          </button>
        </div>
      )}

      {/* 运行中 */}
      {phase === 'running' && (
        <div className="flex justify-center">
          <button
            onClick={pauseTimer}
            className="px-12 py-4 rounded-2xl bg-cream-100 text-sage-600 font-medium shadow-soft hover:bg-sage-100 transition-all duration-300"
          >
            暂停
          </button>
        </div>
      )}

      {/* 暂停状态 */}
      {phase === 'paused' && (
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={resumeTimer}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-moss-500 to-sage-500 text-white font-medium shadow-soft hover:shadow-soft-lg transition-all duration-300"
            >
              继续
            </button>
            <button
              onClick={resetTimer}
              className="px-10 py-4 rounded-2xl bg-cream-100 text-sage-500 font-medium hover:bg-sage-100 transition-all duration-300"
            >
              重置
            </button>
          </div>
          <button
            onClick={completeMeditation}
            className="w-full py-3 text-sm text-sage-400 hover:text-sage-600 transition-colors duration-300"
          >
            提前完成
          </button>
        </div>
      )}

      {/* 完成状态 */}
      {phase === 'completed' && (
        <div className="space-y-5 animate-scale-in">
          {/* 完成后主卡片 */}
          <div className="card p-6 text-center">
            <div className="text-5xl mb-4 animate-breathe">✨</div>
            <p className="font-medium text-moss-600 mb-1">练习完成</p>
            <p className="text-sm text-sage-400">给自己一点时间，安静地回到当下</p>
          </div>

          {/* 记录感受（延迟显示） */}
          {showFeelingCard && (
            <div className="card p-5 animate-scale-in">
              <label className="block text-sm text-sage-500 mb-3">记录此刻的感受（选填）</label>
              <textarea
                value={feeling}
                onChange={e => setFeeling(e.target.value)}
                placeholder="写给自己的话..."
                className="w-full bg-cream-50 border border-sage-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-200 transition-all duration-300"
                rows={3}
              />
              <button
                onClick={handleSaveAndComplete}
                className="w-full mt-4 py-3 rounded-2xl text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300"
              >
                保存
              </button>
            </div>
          )}

          {/* 操作按钮 */}
          <button
            onClick={handlePracticeAgain}
            className="w-full btn-primary py-4 text-base"
          >
            🔄 再练习一次
          </button>

          <Link
            href="/forest"
            className="block w-full py-3 text-center text-sm text-sage-400 hover:text-moss-600 transition-colors duration-300"
          >
            🌳 返回森林
          </Link>
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
