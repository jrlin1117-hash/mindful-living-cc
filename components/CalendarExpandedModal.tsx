'use client';

import { useEffect, useState, useRef } from 'react';
import {
  getFirstUsedAt,
  getToday,
  getDayRecordSummary,
  DayRecordSummary,
} from '@/lib/storage';

interface CalendarExpandedModalProps {
  onClose: () => void;
}

interface DayCellData {
  date: string;
  dayNum: number;
  weekdayIndex: number;
  isToday: boolean;
  hasCard: boolean;
  hasMeditation: boolean;
}

// 获取本地日期 yyyy-mm-dd
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// 生成日期范围（正序：最早 → 最新）
function genDateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const cur = new Date(start + 'T00:00:00');
  const en = new Date(end + 'T00:00:00');
  while (cur <= en) {
    out.push(localDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export default function CalendarExpandedModal({ onClose }: CalendarExpandedModalProps) {
  const today = getToday();
  const [selected, setSelected] = useState<DayRecordSummary | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [weekdayLabels] = useState(['日', '一', '二', '三', '四', '五', '六']);

  // 初始化日期范围
  useEffect(() => {
    const first = getFirstUsedAt();
    setDates(genDateRange(first, today));
  }, []);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selected ? setSelected(null) : onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, onClose]);

  // 按月分组（保持原顺序）
  const months: { label: string; year: number; month: number; days: DayCellData[] }[] = [];
  dates.forEach(date => {
    const d = new Date(date + 'T00:00:00');
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const label = `${y}.${m}`;
    const summary = getDayRecordSummary(date);
    const cell: DayCellData = {
      date,
      dayNum: d.getDate(),
      weekdayIndex: d.getDay(),
      isToday: date === today,
      hasCard: summary.hasCard,
      hasMeditation: summary.hasMeditation,
    };
    const ex = months.find(g => g.label === label);
    if (ex) ex.days.push(cell);
    else months.push({ label, year: y, month: m, days: [cell] });
  });

  const handleDay = (cell: DayCellData) => {
    setSelected(getDayRecordSummary(cell.date));
  };

  return (
    <div className="card p-0 overflow-hidden animate-fade-in">
      {/* 弹窗（内联在页面中，高度适应内容） */}
      <div
        className="bg-white flex flex-col"
        style={{ maxHeight: '70vh', WebkitOverflowScrolling: 'touch' }}
      >
        {/* 固定头部 */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-sage-100 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-sage-700 text-base">浇灌日历</h2>
            <p className="text-xs text-sage-400 mt-0.5">看看小森林一路生长的痕迹</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sage-100 text-sage-400 hover:text-sage-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 可滚动区域 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {months.map(group => (
            <div key={group.label} className="mb-6">
              {/* 月份标题 */}
              <div className="text-xs font-medium text-sage-400 mb-2 pl-1">{group.label}</div>

              {/* 周标题行 */}
              <div className="grid grid-cols-7 mb-1">
                {weekdayLabels.map(w => (
                  <div key={w} className="text-center text-xs text-sage-300 py-1">{w}</div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-0.5">
                {/* 填充空白 */}
                {Array.from({ length: group.days[0].weekdayIndex }).map((_, i) => (
                  <div key={`b-${i}`} />
                ))}

                {/* 日期按钮 */}
                {group.days.map(cell => (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => handleDay(cell)}
                    className={`
                      flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 active:scale-95
                      ${cell.isToday
                        ? 'bg-gradient-to-br from-moss-500 to-sage-500 text-white shadow-sm ring-2 ring-moss-300'
                        : 'hover:bg-sage-50 text-sage-600'
                      }
                    `}
                    style={{ minHeight: '46px', padding: '4px 2px' }}
                  >
                    <span className={`text-sm font-medium ${cell.isToday ? 'text-white' : ''}`}>
                      {cell.dayNum}
                    </span>
                    <div className="flex items-center justify-center gap-px mt-0.5 h-4">
                      {cell.hasCard && (
                        <span className={`text-xs ${cell.isToday ? 'opacity-90' : 'text-moss-500'}`}>🌈</span>
                      )}
                      {cell.hasMeditation && (
                        <span className={`text-xs ${cell.isToday ? 'opacity-90' : 'text-cyan-500'}`}>🧘</span>
                      )}
                      {!cell.hasCard && !cell.hasMeditation && (
                        <span className={`text-xs ${cell.isToday ? 'text-white/40' : 'text-sage-300'}`}>·</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {months.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-sage-400">还没有任何记录</p>
            </div>
          )}
        </div>

        {/* 底部图例 */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-sage-100 flex justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sage-200" />
            <span className="text-xs text-sage-400">无记录</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🌈</span>
            <span className="text-xs text-sage-400">态度卡</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🧘</span>
            <span className="text-xs text-sage-400">冥想</span>
          </div>
        </div>
      </div>

      {/* 日期详情（覆盖在弹窗上方） */}
      {selected && (
        <DayDetail summary={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ============ 日期详情弹窗 ============

function DayDetail({ summary, onClose }: { summary: DayRecordSummary; onClose: () => void }) {
  const { date, hasCard, hasMeditation, cardRecord, meditationRecords } = summary;

  const fmt = (d: string) => {
    const nd = new Date(d + 'T00:00:00');
    const wds = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${nd.getMonth() + 1}月${nd.getDate()}日 ${wds[nd.getDay()]}`;
  };

  return (
    <div className="mt-3 bg-gradient-to-br from-sage-50/50 to-cream-50 rounded-2xl overflow-hidden animate-fade-in">
      {/* 头部 */}
      <div className="bg-white/60 px-5 py-3 flex items-center justify-between border-b border-sage-100">
        <p className="text-sm font-medium text-sage-700">{fmt(date)}</p>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-sage-100 text-sage-400 hover:text-sage-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* 内容 */}
      <div className="p-5 space-y-3">
        {!hasCard && !hasMeditation && (
          <div className="text-center py-6">
            <p className="text-sm text-sage-400 italic">这一天森林安静地休息着。</p>
          </div>
        )}

        {hasCard && cardRecord && (
          <div className="bg-gradient-to-br from-amber-50/60 to-yellow-50/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌈</span>
              <span className="text-sm font-medium text-sage-700">态度练习</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-xs text-sage-400 flex-shrink-0">态度</span>
                <span className="text-sm text-sage-600">{cardRecord.attitudeName}</span>
              </div>
              {cardRecord.actionPlan && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-sage-400 flex-shrink-0">行动</span>
                  <span className="text-sm text-sage-600">{cardRecord.actionPlan}</span>
                </div>
              )}
              {cardRecord.reflection && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-sage-400 flex-shrink-0">感受</span>
                  <span className="text-sm text-sage-500 italic">{cardRecord.reflection}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {hasMeditation && meditationRecords.length > 0 && (
          <div className="bg-gradient-to-br from-softteal-50/60 to-cyan-50/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧘</span>
              <span className="text-sm font-medium text-sage-700">正念冥想</span>
            </div>
            <div className="space-y-2">
              {meditationRecords.map((r, i) => (
                <div key={r.id || i} className="flex items-start gap-2 flex-wrap">
                  <span className="text-xs text-sage-400 flex-shrink-0">时长</span>
                  <span className="text-sm text-sage-600">{r.duration} 分钟</span>
                  {r.feeling && (
                    <>
                      <span className="text-xs text-sage-400 flex-shrink-0 ml-2">感受</span>
                      <span className="text-sm text-sage-500 italic">{r.feeling}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
