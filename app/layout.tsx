import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '正念小森林 | Mindful Forest',
  description: '正念是一种生活态度，一起来浇灌吧',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-decoration bg-circle-1" />
          <div className="bg-decoration bg-circle-2" />
        </div>

        {/* 顶部导航 */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-sage-100/50">
          <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🌲</span>
              <span className="font-medium text-sage-700 group-hover:text-moss-600 transition-colors duration-300">
                正念小森林
              </span>
            </Link>
            <div className="flex items-center gap-5 text-sm">
              <Link href="/card" className="text-sage-500 hover:text-moss-600 transition-colors duration-300">
                态度卡
              </Link>
              <Link href="/meditation" className="text-sage-500 hover:text-moss-600 transition-colors duration-300">
                冥想
              </Link>
              <Link href="/forest" className="text-sage-500 hover:text-moss-600 transition-colors duration-300">
                森林
              </Link>
            </div>
          </div>
        </nav>

        {/* 主内容 */}
        <main className="pt-16 pb-24 min-h-screen relative z-10">
          {children}
        </main>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream-100/90 backdrop-blur-md border-t border-sage-100/50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-around">
            <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-sage-100">
              <span className="text-2xl">🏡</span>
            </Link>
            <Link href="/card" className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-sage-100">
              <span className="text-2xl">🎴</span>
            </Link>
            <Link href="/meditation" className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-sage-100">
              <span className="text-2xl">🧘</span>
            </Link>
            <Link href="/forest" className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-sage-100">
              <span className="text-2xl">🌲</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
