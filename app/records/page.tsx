'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllRecords, RecordEntry, CardCompletionRecord, MeditationRecordFull } from '@/lib/storage';

function isAttitudeRecord(r: RecordEntry): r is CardCompletionRecord {
  return r.type === 'attitude';
}

function isMeditationRecord(r: RecordEntry): r is MeditationRecordFull {
  return r.type === 'meditation';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 星期${weekday}`;
}

// 按日期分组记录
function groupByDate(records: RecordEntry[]): Map<string, RecordEntry[]> {
  const groups = new Map<string, RecordEntry[]>();
  records.forEach(record => {
    const existing = groups.get(record.date) || [];
    existing.push(record);
    groups.set(record.date, existing);
  });
  return groups;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<Map<string, RecordEntry[]>>(new Map());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const all = getAllRecords();
    setRecords(all);
    setGroupedRecords(groupByDate(all));
  }, []);

  // 按日期倒序排列
  const sortedDates = Array.from(groupedRecords.keys()).sort((a, b) => b.localeCompare(a));

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto px-5 pt-8 pb-4">
        <div className="card p-8 text-center">
          <div className="loading-dot mx-auto mb-4" />
          <p className="text-sage-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-4 page-enter">
      {/* 返回导航 */}
      <div className="flex items-center mb-6">
        <Link href="/forest" className="text-sage-400 hover:text-sage-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-medium text-sage-700">浇灌记录</h1>
        </div>
        <div className="w-6" />
      </div>

      {/* 副标题 */}
      <p className="text-center text-sm text-sage-400 mb-6">
        这里保存着你照顾森林的每一次练习。
      </p>

      {records.length === 0 ? (
        /* 空状态 */
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">🌱</div>
          <p className="text-sage-500 text-sm mb-2">还没有记录。</p>
          <p className="text-sage-400 text-xs mb-8 leading-relaxed">
            完成一次态度练习或冥想练习后，<br />
            这里会慢慢长出你的足迹。
          </p>
          <div className="space-y-3">
            <Link
              href="/card"
              className="block w-full py-3 px-6 bg-gradient-to-br from-sage-400 to-moss-500 text-white text-sm rounded-2xl hover:from-sage-500 hover:to-moss-600 transition-colors"
            >
              去抽一张态度卡
            </Link>
            <Link
              href="/meditation"
              className="block w-full py-3 px-6 bg-gradient-to-br from-softteal-50 to-cyan-50 text-sage-600 text-sm rounded-2xl hover:from-softteal-100 hover:to-cyan-100 transition-colors border border-sage-200"
            >
              开始一次冥想
            </Link>
          </div>
        </div>
      ) : (
        /* 记录列表 */
        <div className="space-y-6">
          {sortedDates.map(date => {
            const dayRecords = groupedRecords.get(date) || [];
            return (
              <div key={date}>
                {/* 日期标题 */}
                <div className="sticky top-0 bg-cream-50/90 backdrop-blur-sm py-2 mb-3 z-10">
                  <h3 className="text-sm font-medium text-sage-500">
                    {formatDateHeader(date)}
                  </h3>
                </div>

                {/* 该日期的记录 */}
                <div className="space-y-3">
                  {dayRecords.map(record => {
                    if (isAttitudeRecord(record)) {
                      return (
                        <div key={record.id} className="card p-4">
                          {/* 标签 */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-sage-100 text-sage-600">
                              态度练习
                            </span>
                            <span className="text-xs text-sage-400">
                              {formatTime(record.completedAt)}
                            </span>
                          </div>

                          {/* 态度信息 */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{record.emoji}</span>
                            <div>
                              <div className="font-medium text-sage-700">{record.attitudeName}</div>
                              <div className="text-xs text-sage-400">{record.plantName}</div>
                            </div>
                          </div>

                          {/* 行动计划 */}
                          {record.actionPlan && (
                            <div className="mb-3">
                              <div className="text-xs text-sage-400 mb-1">今日行动计划</div>
                              <p className="text-sm text-sage-600 leading-relaxed">{record.actionPlan}</p>
                            </div>
                          )}

                          {/* 行动感受 */}
                          {record.reflection && (
                            <div className="bg-moss-50/60 rounded-xl p-3">
                              <div className="text-xs text-moss-500 mb-1">完成记录</div>
                              <p className="text-sm text-sage-600 leading-relaxed italic">{record.reflection}</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (isMeditationRecord(record)) {
                      return (
                        <div key={record.id} className="card p-4">
                          {/* 标签 */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-softteal-100 text-softteal-600">
                              冥想练习
                            </span>
                            <span className="text-xs text-sage-400">
                              {formatTime(record.completedAt)}
                            </span>
                          </div>

                          {/* 冥想信息 */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🧘</span>
                            <div>
                              <div className="font-medium text-sage-700">冥想 {record.duration} 分钟</div>
                              <div className="text-xs text-sage-400">
                                {formatDate(record.date)}
                              </div>
                            </div>
                          </div>

                          {/* 冥想感受 */}
                          {record.reflection && (
                            <div className="bg-softteal-50/60 rounded-xl p-3">
                              <div className="text-xs text-softteal-500 mb-1">练习记录</div>
                              <p className="text-sm text-sage-600 leading-relaxed italic">{record.reflection}</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 底部留白 */}
      <div className="h-8" />
    </div>
  );
}
