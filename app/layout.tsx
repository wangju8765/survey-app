import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '小王老师教练课 · 问卷系统',
  description: '三方问卷系统 - 学生卷 / 家长卷 / 教师卷',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-indigo-700 hover:text-indigo-800 transition-colors">
              小王老师教练课
            </a>
            <span className="text-sm text-gray-400">问卷系统</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-8">
          小王老师教练课 · 问卷系统
        </footer>
      </body>
    </html>
  )
}
