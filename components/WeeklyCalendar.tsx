'use client';

import { useEffect, useState } from 'react';
import { getLast7Days, getToday } from '@/lib/storage';

interface DayStatus {
  date: string;
  hasCard: boolean;
  hasMeditation: boolean;
  isToday: boolean;
}

// 从记录中提取日期字符串
function getRecordDate(record: { date?: string; completedAt?: string }): string {
  return record.date || record.completedAt?.slice(0, 10) || '';
}

interface WeeklyCalendarProps {
  onExpand?: () => void;
}

export default function WeeklyCalendar({ onExpand }: WeeklyCalendarProps) {
  const [days, setDays] = useState<DayStatus[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = getToday();
    const last7Days = getLast7Days();

    const statuses = last7Days.map(date => ({
      date,
      isToday: date === today,
      hasCard: false,
      hasMeditation: false,
    }));

    setDays(statuses);
  }, []);

  const getDayStatus = (date: string): { hasCard: boolean; hasMeditation: boolean } => {
    if (typeof window === 'undefined') return { hasCard: false, hasMeditation: false };

    // 态度卡记录（完整格式）
    const cardRecords = JSON.parse(localStorage.getItem('mindful_forest_card_completions_full') || '[]');
    // 冥想记录
    const meditationRecords = JSON.parse(localStorage.getItem('mindful_forest_meditation_records') || '[]');

    return {
      hasCard: cardRecords.some((r: any) => getRecordDate(r) === date),
      hasMeditation: meditationRecords.some((r: any) => getRecordDate(r) === date),
    };
  };

  const formatDate = (dateStr: string): { day: string; weekday: string; isToday: boolean } => {
    const date = new Date(dateStr);
    const today = getToday();
    const day = date.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return {
      day: day.toString(),
      weekday: weekdays[date.getDay()],
      isToday: dateStr === today,
    };
  };

  if (!mounted) {
    return (
      <div className="card p-5">
        <div className="flex justify-between items-start">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-6 h-4 bg-sage-100 rounded animate-pulse" />
              <div className="w-12 h-12 bg-sage-50 rounded-2xl animate-pulse" />
              <div className="w-4 h-4 bg-sage-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 cursor-pointer hover:shadow-soft transition-all duration-300" onClick={onExpand}>
      <div className="flex justify-between items-start">
        {days.map((day, index) => {
          const { hasCard, hasMeditation } = getDayStatus(day.date);
          const { day: dayNum, weekday, isToday } = formatDate(day.date);

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                index === 0 ? 'ml-0' : index === 6 ? 'mr-0' : ''
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* 星期 */}
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isToday ? 'text-moss-600' : 'text-sage-400'
                }`}
              >
                {weekday}
              </span>

              {/* 日期卡片 */}
              <div
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-medium
                  transition-all duration-300 ease-out
                  ${isToday
                    ? 'bg-gradient-to-br from-moss-500 to-sage-500 text-white shadow-lg shadow-moss-200 scale-105'
                    : 'bg-cream-100 text-sage-500 hover:bg-sage-100 hover:scale-105'
                  }
                `}
              >
                {dayNum}
                {/* 今日标记 */}
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-moss-400" />
                )}
              </div>

              {/* 状态指示器：同时显示态度卡和冥想 */}
              <div className="h-5 flex items-center justify-center gap-1">
                {hasCard && <span className="text-sm">🌈</span>}
                {hasMeditation && <span className="text-sm">🧘</span>}
                {!hasCard && !hasMeditation && (
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-200" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 + 展开提示 */}
      <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-sage-100">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-200" />
          <span className="text-xs text-sage-400">暂无记录</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🌈</span>
          <span className="text-xs text-sage-400">态度卡</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">🧘</span>
          <span className="text-xs text-sage-400">冥想</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-sage-300">
          <span>点击展开</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
