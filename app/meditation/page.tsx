'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getToday, saveMeditationRecord, incrementAllPlants, MeditationRecord, getMeditationRecords } from '@/lib/storage';

type Duration = 5 | 10 | 15 | number;

export default function MeditationPage() {
  const [selectedDuration, setSelectedDuration] = useState<Duration>(5);
  const [customDuration, setCustomDuration] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const today = getToday();

  useEffect(() => {
    const records = getMeditationRecords();
    const todayRecord = records.find(r => r.date === today && r.completed);
    if (todayRecord) {
      setTodayCompleted(true);
      setIsCompleted(true);
    }
  }, [today]);

  const getDurationInSeconds = useCallback((duration: Duration): number => {
    if (typeof duration === 'number') return duration * 60;
    return duration * 60;
  }, []);

  const startTimer = () => {
    const duration = customDuration ? parseInt(customDuration) : selectedDuration;
    setTimeLeft(getDurationInSeconds(duration as Duration));
    setIsRunning(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const completeMeditation = () => {
    const duration = customDuration ? parseInt(customDuration) : selectedDuration;

    const record: MeditationRecord = {
      date: today,
      duration,
      feeling,
      completed: true,
    };
    saveMeditationRecord(record);
    incrementAllPlants(1);

    setIsCompleted(true);
    setTodayCompleted(true);
    setIsRunning(false);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeMeditation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedDuration && !customDuration
    ? ((getDurationInSeconds(selectedDuration as Duration) - timeLeft) / getDurationInSeconds(selectedDuration as Duration)) * 100
    : customDuration
    ? ((parseInt(customDuration) * 60 - timeLeft) / (parseInt(customDuration) * 60)) * 100
    : 0;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {showToast && <div className="toast">🌱 所有植物 +1</div>}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-medium text-sage-700 mb-2">正念冥想</h1>
        <p className="text-sm text-sage-400">给自己一段安静的时光</p>
      </div>

      {todayCompleted && (
        <div className="card p-6 mb-6 text-center bg-gradient-to-br from-softteal-50 to-sage-50">
          <div className="text-5xl mb-3">🧘</div>
          <div className="font-medium text-moss-600">今日冥想已完成</div>
          <div className="text-xs text-sage-500 mt-1">所有植物正在生长</div>
        </div>
      )}

      {/* 计时器 */}
      <div className="relative py-10 flex items-center justify-center">
        {/* 背景呼吸环 */}
        <div className={`absolute w-64 h-64 rounded-full border-2 border-sage-100 ${isRunning ? 'animate-breathe' : ''}`} />

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
              stroke={isRunning ? '#688a52' : '#9aa882'}
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
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-sage-400 mt-2">
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-moss-500 animate-pulse" />
                  冥想中...
                </span>
              ) : timeLeft > 0 ? (
                '已暂停'
              ) : (
                '准备开始'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 时长选择 */}
      {!isRunning && timeLeft === 0 && !isCompleted && (
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
            开始冥想
          </button>
        </div>
      )}

      {/* 运行中 */}
      {isRunning && (
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
      {!isRunning && timeLeft > 0 && (
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

      {/* 完成后 */}
      {(isCompleted || todayCompleted) && !isRunning && timeLeft === 0 && (
        <div className="space-y-5">
          <div className="card p-6 text-center">
            <div className="text-5xl mb-4 animate-breathe">✨</div>
            <p className="font-medium text-moss-600 mb-1">冥想完成</p>
            <p className="text-sm text-sage-400">给自己一点时间，安静地回到当下</p>
          </div>

          {!todayCompleted && (
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
          )}

          {!todayCompleted && (
            <button
              onClick={completeMeditation}
              className="w-full btn-primary py-4 text-base"
            >
              🌱 完成浇灌
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        <Link href="/forest" className="block w-full py-4 text-center text-sm text-sage-500 hover:text-moss-600 transition-colors duration-300">
          🌳 去看看我的森林 →
        </Link>
      </div>
    </div>
  );
}
