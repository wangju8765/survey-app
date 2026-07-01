'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateSignalReport } from '@/lib/signal-map'
import { enhanceReport, type EnhancedReport, type DimensionInterpretation, type PhysioItem } from '@/lib/signal-interpretation'
import { detectPatterns } from '@/lib/pattern-detection'

const SIGNAL_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; badge: string }> = {
  GREEN:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  YELLOW: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  RED:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700' },
}

const LEVEL_LABELS: Record<string, string> = {
  GREEN: '良好', YELLOW: '需关注', RED: '重点干预',
}

const GROUP_ICONS: Record<string, string> = {
  '认知系统 (D)': '🧠',
  '动力系统 (M)': '🔥',
  '发展潜力 (Z)': '📈',
  '关系系统 (R)': '🤝',
}

function SignalBadge({ signal }: { signal: string }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES.YELLOW
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {LEVEL_LABELS[signal] || signal}
    </span>
  )
}

function PhysioIcon({ level }: { level: string }) {
  if (level === 'adequate') return <span className="text-green-500">✅</span>
  if (level === 'marginal') return <span className="text-yellow-500">⚠️</span>
  return <span className="text-red-500">❗</span>
}

function ReportContent() {
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

  if (loading) return <p className="text-center py-8 text-gray-400">生成报告中...</p>
  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">{error}</p>
      <Link href="/admin/" className="text-indigo-600 hover:text-indigo-800 text-sm">← 返回列表</Link>
    </div>
  )
  if (!code) return <p className="text-center py-8 text-gray-400">缺少编号参数</p>
  if (!report) return null

  // Dimension groups
  const groups = new Map<string, DimensionInterpretation[]>()
  for (const d of report.interpretations) {
    if (!groups.has(d.group)) groups.set(d.group, [])
    groups.get(d.group)!.push(d)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{report.studentName} · 学习状态分析报告</h1>
          <p className="text-sm text-gray-500 mt-1">
            编号 {report.studentCode}
            {report.grade ? ` · ${report.grade}` : ''}
            <span className="ml-3 text-xs text-gray-400">生成于 {report.generatedAt}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/report/parent/?code=${code}`} className="text-sm text-indigo-600 hover:text-indigo-800">
            📄 家长版
          </Link>
          <Link href="/admin/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回列表
          </Link>
        </div>
      </div>

      {/* Survey status */}
      <div className="flex gap-3 text-sm">
        <span className={report.surveysCompleted.student ? 'text-green-600' : 'text-gray-400'}>
          📝 学生{report.surveysCompleted.student ? '✅' : '⏳'}
        </span>
        <span className={report.surveysCompleted.parent ? 'text-green-600' : 'text-gray-400'}>
          👨‍👩‍👧 家长{report.surveysCompleted.parent ? '✅' : '⏳'}
        </span>
        <span className={report.surveysCompleted.teacher ? 'text-green-600' : 'text-gray-400'}>
          🏫 教师{report.surveysCompleted.teacher ? '✅' : '⏳'}
        </span>
      </div>

      {!report.surveysCompleted.student && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
          学生问卷尚未填写，报告仅基于家长和教师数据生成，部分维度可能不完整。
        </div>
      )}

      {/* ── 1. 整体画像 ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4">整体画像</h2>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {report.executiveSummary}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
            🟢 {report.strengthDimensions.length} 项良好
          </span>
          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">
            🟡 {report.growthDimensions.length} 项需关注
          </span>
          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full">
            🔴 {report.concernDimensions.length} 项重点干预
          </span>
        </div>
      </div>

      {/* ── 2. 模式标注 ── */}
      {report.patterns.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-4">
            模式标注
            <span className="text-xs font-normal text-gray-400 ml-2">（跨维度关联分析）</span>
          </h2>
          <div className="space-y-4">
            {report.patterns.map((p, i) => (
              <div key={i} className={`rounded-lg p-4 border ${
                p.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    p.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.severity === 'high' ? '⚠️ 重要模式' : '📌 关注模式'}
                  </span>
                  <span className="font-medium text-sm">{p.name}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{p.description}</p>
                <div className="bg-white/60 rounded p-3 text-sm text-indigo-700">
                  <span className="font-medium">教练应对：</span>{p.coachImplication}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. 维度详解 ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-1">维度详解</h2>
        <p className="text-xs text-gray-400 mb-4">每项能力处于什么水平，意味着什么，教练可以关注什么</p>

        <div className="space-y-6">
          {[...groups.entries()].map(([group, dims]) => (
            <div key={group}>
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1">
                <span>{GROUP_ICONS[group] || '📋'}</span> {group}
              </h3>
              <div className="space-y-3">
                {dims.map((d) => {
                  const s = SIGNAL_STYLES[d.signal] || SIGNAL_STYLES.YELLOW
                  return (
                    <div key={d.dimension} className={`rounded-lg p-4 border ${s.bg} ${s.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-800">{d.label}</span>
                        <SignalBadge signal={d.signal} />
                      </div>

                      {/* Coach interpretation — main content */}
                      <p className="text-sm text-gray-700 mb-2">{d.coachSummary}</p>

                      {/* Cross-source note */}
                      {d.crossSourceNote && (
                        <div className="bg-white/60 rounded p-2 mb-2 text-xs text-gray-600">
                          🔄 {d.crossSourceNote}
                        </div>
                      )}

                      {/* Coach action items */}
                      {d.coachActionItems.length > 0 && (
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <span className="font-medium text-gray-500">教练关注点：</span>
                          {d.coachActionItems.map((item, i) => (
                            <div key={i} className="flex gap-1">
                              <span className="text-indigo-400">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. 质性数据 ── */}
      {report.qualitativeData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-4">质性数据</h2>
          <p className="text-xs text-gray-400 mb-4">开放题原话——这些是学生、家长和教师用自己语言表达的内容，为信号解读提供重要背景</p>
          <div className="space-y-3">
            {report.qualitativeData.map((q, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    q.source === 'student' ? 'bg-blue-100 text-blue-700' :
                    q.source === 'parent' ? 'bg-purple-100 text-purple-700' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {q.source === 'student' ? '学生' : q.source === 'parent' ? '家长' : '教师'}
                  </span>
                  <span className="text-xs text-gray-500">{q.questionText}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.answerText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. 生理基础 ── */}
      {report.physiologicalBasics && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-1">生理基础</h2>
          <p className="text-xs text-gray-400 mb-4">家长报告的睡眠、屏幕和运动情况。这些是学习表现的底层支撑因素</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: '睡眠', icon: '😴', data: report.physiologicalBasics.sleep },
              { label: '屏幕时间', icon: '📱', data: report.physiologicalBasics.screen },
              { label: '运动', icon: '🏃', data: report.physiologicalBasics.exercise },
            ].map((item) => (
              <div key={item.label} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.icon} {item.label}
                  </span>
                  {item.data && <PhysioIcon level={item.data.level} />}
                </div>
                {item.data ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1">家长报告：{item.data.label}</p>
                    <p className="text-xs text-gray-600">{item.data.interpretation}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">未填写</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. 三角验证 ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-1">三角验证</h2>
        <p className="text-xs text-gray-400 mb-4">
          学生自评 vs 家长/教师观察的一致性检查
          {report.contradictions.length > 0 && (
            <span className="ml-2 text-yellow-600">（{report.contradictions.length} 处不一致）</span>
          )}
        </p>

        {report.contradictions.length === 0 ? (
          <p className="text-sm text-gray-400">学生、家长、教师三方信息基本一致，无明显矛盾。</p>
        ) : (
          <div className="space-y-3">
            {report.contradictions
              .sort((a, b) => (a.severity === 'high' ? -1 : 1) - (b.severity === 'high' ? -1 : 1))
              .map((c, i) => (
                <div key={i} className={`rounded-lg p-3 border ${
                  c.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      c.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {c.severity === 'high' ? '严重不一致' : '轻度不一致'}
                    </span>
                    <span className="font-medium text-sm text-gray-800">{c.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{c.description}</p>
                  <div className="bg-white/60 rounded p-2 text-xs space-y-1 mb-2">
                    <p>学生自评：<span className={c.studentEvidence.signal === 'RED' ? 'text-red-600' : c.studentEvidence.signal === 'GREEN' ? 'text-green-600' : 'text-yellow-600'}>{c.studentEvidence.questionText} → {c.studentEvidence.answerText}</span></p>
                    <p>{c.counterEvidence.source === 'parent' ? '家长' : '教师'}观察：<span className={c.counterEvidence.signal === 'RED' ? 'text-red-600' : c.counterEvidence.signal === 'GREEN' ? 'text-green-600' : 'text-yellow-600'}>{c.counterEvidence.questionText} → {c.counterEvidence.answerText}</span></p>
                  </div>
                  <p className="text-xs text-indigo-600 italic">
                    💬 建议追问："{c.suggestedQuestion}"
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── 7. 访谈指南 ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-1">首次访谈指南</h2>
        <p className="text-xs text-gray-400 mb-4">基于以上所有分析，以下是优先级排序的访谈方向和建议</p>

        {report.interviewGuide.length === 0 ? (
          <p className="text-sm text-gray-400">暂无明显需要重点访谈的方向。可在首次访谈中以开放性了解为主，建立教练关系。</p>
        ) : (
          <ol className="space-y-4">
            {report.interviewGuide.map((item) => (
              <li key={item.priority} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mt-0.5">
                  {item.priority}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-800">{item.focus}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-1">{item.rationale}</p>
                  <div className="space-y-1">
                    {item.probingQuestions.map((q, qi) => (
                      <p key={qi} className="text-xs text-indigo-700 bg-indigo-50 rounded px-2 py-1">
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<p className="text-center py-8 text-gray-400">加载中...</p>}>
      <ReportContent />
    </Suspense>
  )
}
