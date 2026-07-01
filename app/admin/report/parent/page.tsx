'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateSignalReport } from '@/lib/signal-map'
import { enhanceReport, type EnhancedReport } from '@/lib/signal-interpretation'
import { detectPatterns } from '@/lib/pattern-detection'

// Everyday-language labels for parent report — no technical terms
const PARENT_FRIENDLY_LABELS: Record<string, string> = {
  'D1': '面对成功和失败时的想法',
  'D2': '对自己学习过程的觉察',
  'D3-SRL': '规划学习的能力',
  'D3-SR': '考后反思的习惯',
  'D4-EF': '学习的自我管理',
  'D5': '遇到困难时想办法',
  'M1': '学习动力的来源',
  'M2': '学习中的自主感',
  'M3': '对学习意义的理解',
  'M4': '面对学习的心理压力',
  'M5': '课堂参与和主动性',
  'M6': '面对考试的应对方式',
  'M7': '对学习的兴趣',
  'M8': '学习中的情绪感受',
  'Z1': '独立学习的能力',
  'R3': '家庭中的学习支持方式',
  'R4': '亲子沟通',
  'R5-R6': '学习伙伴',
}

function ParentReportContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || ''

  const [report, setReport] = useState<EnhancedReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) { setLoading(false); return }

    Promise.all([
      supabase.from('students').select('*').eq('code', code).maybeSingle(),
      supabase.from('student_responses').select('*').eq('student_code', code).maybeSingle(),
      supabase.from('parent_responses').select('*').eq('student_code', code).maybeSingle(),
      supabase.from('teacher_responses').select('*').eq('student_code', code).maybeSingle(),
    ]).then(([si, sr, pr, tr]) => {
      if (si.error || sr.error || pr.error || tr.error) {
        setError('数据加载失败，请检查网络后重试')
      } else if (!si.data) {
        setError('未找到该学生的信息')
      } else {
        const baseReport = generateSignalReport(
          sr.data, pr.data, tr.data,
          si.data as { name: string; code: string; age?: number; grade?: string; gender?: string },
        )
        const patterns = detectPatterns(baseReport.dimensions)
        const enhanced = enhanceReport(baseReport, patterns, pr.data as Record<string, unknown> | null)
        setReport(enhanced)
      }
      setLoading(false)
    }).catch(() => {
      setError('数据加载失败，请检查网络后重试')
      setLoading(false)
    })
  }, [code])

  if (loading) return <p className="text-center py-12 text-gray-400">正在生成报告...</p>
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/admin/" className="text-indigo-600 hover:text-indigo-800 text-sm">← 返回</Link>
    </div>
  )
  if (!code) return <p className="text-center py-12 text-gray-400">缺少编号参数</p>
  if (!report) return null

  const childName = report.studentName
  const topStrengths = report.strengthDimensions.slice(0, 5)
  const growthAreas = [...report.concernDimensions, ...report.growthDimensions]

  // Collect parent suggestions, deduplicate by first 30 chars
  const seenSuggestions = new Set<string>()
  const allSuggestions: string[] = []
  const pushUnique = (items: string[]) => {
    for (const item of items) {
      const key = item.slice(0, 30)
      if (!seenSuggestions.has(key)) {
        seenSuggestions.add(key)
        allSuggestions.push(item)
      }
    }
  }

  // Strengths first
  for (const d of topStrengths) pushUnique(d.parentSuggestions.slice(0, 1))
  // Then growth area suggestions
  for (const d of growthAreas) pushUnique(d.parentSuggestions.slice(0, 2))

  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Link href={`/admin/report/?code=${code}`} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
          ← 教练版
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md"
        >
          🖨️ 打印 / 导出PDF
        </button>
      </div>

      {/* Print hint */}
      <div className="print:hidden max-w-2xl mx-auto mt-12 mb-4 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 text-center">
          💡 点击右上角「打印 / 导出PDF」按钮，在打印对话框中选择「另存为PDF」即可保存
        </div>
      </div>

      {/* Report content */}
      <div className="print-content max-w-3xl mx-auto px-4 py-8 print:py-0">
        {/* ── Cover ── */}
        <div className="text-center mb-10 print:mb-8 print:mt-4">
          <p className="text-sm text-gray-400 mb-2 print:text-xs">小王老师教练课</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1 print:text-xl">
            {childName} · 学习状态测评报告
          </h1>
          <p className="text-sm text-gray-400 print:text-xs">{dateStr}</p>
        </div>

        {/* ── Section 1: 关于这次测评 ── */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">关于这次测评</h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-2 print:text-xs print:leading-relaxed">
            <p>
              这份报告基于{childName}填写的学生问卷{report.surveysCompleted.parent ? '、您填写的家长问卷' : ''}{report.surveysCompleted.teacher ? '以及任课教师填写的教师问卷' : ''}综合分析而成。
            </p>
            <p>
              测评不是考试，没有对错。它帮助我们了解孩子在以下几个方面的现状：学习习惯、学习动力、学习中的情绪感受、以及和同学、老师、家人的关系。这些信息为教练课提供了重要的参考——我们会更有针对性地支持孩子的成长。
            </p>
            <p>
              请带着"了解孩子"而非"评判孩子"的眼光来读这份报告。每个孩子都有自己的成长节奏，测评结果反映的是当下的状态，不是固定的"标签"。
            </p>
          </div>
        </div>

        {/* ── Section 2: 孩子的优势 ── */}
        <div className="mb-8 print:mb-6 print-break-before">
          <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">
            {childName}的优势
          </h2>

          {topStrengths.length === 0 ? (
            <div className="text-sm text-gray-600 leading-relaxed print:text-xs">
              <p>
                这次测评中，{childName}在很多方面的问卷结果都提示我们需要一起多关注。这不代表孩子"没有优势"——问卷能捕捉到的信息毕竟有限。在教练课上，我们会继续观察和发现孩子身上那些问卷没能体现出来的闪光点。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topStrengths.map((d) => (
                <div key={d.dimension} className="border-l-4 border-green-300 pl-4 py-1">
                  <h3 className="font-medium text-sm text-gray-800 print:text-xs">
                    {PARENT_FRIENDLY_LABELS[d.dimension] || d.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed print:text-xs print:leading-relaxed">
                    {d.parentSummary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: 正在成长中的能力 ── */}
        {growthAreas.length > 0 && (
          <div className="mb-8 print:mb-6 print-break-before">
            <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">
              正在成长中的能力
            </h2>
            <p className="text-sm text-gray-500 mb-4 print:text-xs">
              以下方面{childName}目前还在发展的过程中。有些能力需要更多的时间，有些需要合适的支持方式。我们把这些写出来，不是为了"指出问题"，而是为了让我们（教练、孩子和家长）有一个共同的努力方向。
            </p>
            <div className="space-y-4">
              {growthAreas.slice(0, 6).map((d) => (
                <div key={d.dimension} className="border rounded-lg p-4 print:p-3 print:border-gray-300">
                  <h3 className="font-medium text-sm text-gray-800 mb-1 print:text-xs">
                    {PARENT_FRIENDLY_LABELS[d.dimension] || d.label}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed print:text-xs print:leading-relaxed">
                    {d.parentSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 4: 家庭中可以尝试的事 ── */}
        {allSuggestions.length > 0 && (
          <div className="mb-8 print:mb-6 print-break-before">
            <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">
              家庭中可以尝试的事
            </h2>
            <p className="text-sm text-gray-500 mb-4 print:text-xs">
              以下建议是基于测评结果整理的，您可以从中选择最符合家庭实际情况的来尝试。不需要全部做到——哪怕只尝试其中一两项，也会对孩子有帮助。
            </p>
            <div className="space-y-2">
              {allSuggestions.slice(0, 8).map((suggestion, i) => (
                <div key={i} className="flex gap-3 text-sm print:text-xs">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5 leading-relaxed print:leading-relaxed">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 5: 生理基础（如果家长已填） ── */}
        {report.physiologicalBasics && (
          <div className="mb-8 print:mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">
              生活节奏小提示
            </h2>
            <p className="text-sm text-gray-500 mb-4 print:text-xs">
              睡眠、屏幕时间和运动是学习表现的底层支撑。以下是您提供的信息和我们的建议：
            </p>
            <div className="space-y-2 text-sm print:text-xs">
              {report.physiologicalBasics.sleep && (
                <div className="flex gap-2">
                  <span className="text-gray-400">😴 睡眠：</span>
                  <span className="text-gray-700">{report.physiologicalBasics.sleep.interpretation}</span>
                </div>
              )}
              {report.physiologicalBasics.screen && (
                <div className="flex gap-2">
                  <span className="text-gray-400">📱 屏幕：</span>
                  <span className="text-gray-700">{report.physiologicalBasics.screen.interpretation}</span>
                </div>
              )}
              {report.physiologicalBasics.exercise && (
                <div className="flex gap-2">
                  <span className="text-gray-400">🏃 运动：</span>
                  <span className="text-gray-700">{report.physiologicalBasics.exercise.interpretation}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Section 6: 教练课的下一步 ── */}
        <div className="mb-8 print:mb-6 print-break-before">
          <h2 className="text-lg font-bold text-gray-800 mb-3 print:text-base">
            教练课的下一步
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-2 print:text-xs print:leading-relaxed">
            <p>
              在接下来的教练课中，小王老师会重点关注以下几个方面：
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>帮助{childName}建立学习中的小成功体验，慢慢积累"我能行"的信心</li>
              <li>针对{childName}目前正在成长中的能力，提供具体的方法和工具，而不是空洞的"加油"</li>
              <li>和家长保持沟通——您对孩子的了解是教练课最重要的信息来源之一</li>
              <li>根据孩子的兴趣和优势，找到让学习变得更有意思、更有意义的切入点</li>
            </ul>
            <p className="mt-3">
              教练课不是补习，也不是"管教"。它是一个安全的空间，让孩子可以——不着急、不被评判地——找到适合自己的学习方式。这个过程需要时间，也需要我们一起的耐心。
            </p>
            <p>
              如果您对这份报告有任何疑问，或想聊一聊孩子的情况，随时可以联系小王老师。
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t pt-4 text-center text-xs text-gray-400 print:text-[10px] print:pt-2">
          <p>报告生成于 {dateStr} · 基于学生、家长、教师三方问卷综合分析</p>
          <p className="mt-1">问卷测评不是标准化心理测验，结果仅供教练参考和沟通使用</p>
          <p className="mt-1">小王老师教练课 · 内部资料</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #1f2937 !important;
            background: white !important;
          }
          .print-content {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-break-before {
            page-break-before: always;
          }
          .print\\:text-xs {
            font-size: 12px !important;
          }
          .print\\:text-base {
            font-size: 15px !important;
          }
          .print\\:text-xl {
            font-size: 18px !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:mb-8 {
            margin-bottom: 2rem !important;
          }
          .print\\:mt-4 {
            margin-top: 1rem !important;
          }
          .print\\:pt-2 {
            padding-top: 0.5rem !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .print\\:p-3 {
            padding: 0.75rem !important;
          }
          .print\\:leading-relaxed {
            line-height: 1.625 !important;
          }
          .shadow-md, .shadow-sm {
            box-shadow: none !important;
          }
          .rounded-lg, .rounded-xl {
            border-radius: 0.375rem !important;
          }
        }
      `}</style>
    </>
  )
}

export default function ParentReportPage() {
  return (
    <Suspense fallback={<p className="text-center py-12 text-gray-400">加载中...</p>}>
      <ParentReportContent />
    </Suspense>
  )
}
