'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateSignalReport, type SignalReport } from '@/lib/signal-map'

const SIGNAL_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  GREEN:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-500' },
  YELLOW: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  RED:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
}

const SIGNAL_LABELS: Record<string, string> = {
  GREEN: '良好', YELLOW: '需关注', RED: '重点干预',
}

function SignalDot({ signal }: { signal: string }) {
  const s = SIGNAL_STYLES[signal] || SIGNAL_STYLES.YELLOW
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {SIGNAL_LABELS[signal] || signal}
    </span>
  )
}

function ReportContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || ''

  const [report, setReport] = useState<SignalReport | null>(null)
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
        const r = generateSignalReport(
          sr.data, pr.data, tr.data,
          si.data as { name: string; code: string; age?: number; grade?: string; gender?: string },
        )
        setReport(r)
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

  // 按 group 分组维度
  const groups = new Map<string, typeof report.dimensions>()
  for (const d of report.dimensions) {
    if (!groups.has(d.group)) groups.set(d.group, [])
    groups.get(d.group)!.push(d)
  }

  return (
    <div className="space-y-6">
      {/* 段1：学生头部 + 完成状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{report.studentName} · 信号地图</h1>
          <p className="text-sm text-gray-500 mt-1">
            编号 {report.studentCode}
            {report.grade ? ` · ${report.grade}` : ''}
            <span className="ml-3 text-xs text-gray-400">生成于 {report.generatedAt}</span>
          </p>
        </div>
        <Link href="/admin/" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← 返回列表
        </Link>
      </div>

      {/* 完成状态 */}
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

      {/* 段2：维度总览表 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4">维度信号总览</h2>

        {[...groups.entries()].map(([group, dims]) => (
          <div key={group} className="mb-4 last:mb-0">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{group}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {dims.map((d) => {
                const s = SIGNAL_STYLES[d.signal] || SIGNAL_STYLES.YELLOW
                const strongestEvidence = d.evidence
                  .filter(e => e.signal !== 'GREEN')
                  .slice(0, 2)
                return (
                  <div key={d.dimension} className={`rounded-lg p-3 border ${s.bg} ${s.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800">{d.label}</span>
                      <SignalDot signal={d.signal} />
                    </div>
                    {strongestEvidence.length > 0 ? (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {strongestEvidence.map((e, i) => (
                          <div key={i}>
                            <span className="text-gray-400">{e.source === 'student' ? '学生' : e.source === 'parent' ? '家长' : '教师'}：</span>
                            {e.answerText.length > 40 ? e.answerText.slice(0, 40) + '...' : e.answerText}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">无异常信号</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 段3：关键发现 + 矛盾 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 关键发现 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-4">
            关键发现
            <span className="text-xs font-normal text-gray-400 ml-2">
              （{report.dimensions.filter(d => d.signal !== 'GREEN').length} 个维度需要关注）
            </span>
          </h2>

          {report.dimensions.filter(d => d.signal !== 'GREEN').length === 0 ? (
            <p className="text-sm text-gray-400">所有维度信号均为绿色，暂无特别需要关注的方面。</p>
          ) : (
            <div className="space-y-4">
              {report.dimensions
                .filter(d => d.signal !== 'GREEN')
                .sort((a, b) => (a.signal === 'RED' ? -1 : 1) - (b.signal === 'RED' ? -1 : 1))
                .map((d) => (
                  <div key={d.dimension} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-800">{d.label}</span>
                      <SignalDot signal={d.signal} />
                    </div>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {d.evidence.filter(e => e.signal !== 'GREEN').map((e, i) => (
                        <li key={i}>· [{e.source === 'student' ? '生' : e.source === 'parent' ? '家' : '师'}] {e.questionText}：{e.answerText}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 三角验证矛盾 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-4">
            三角验证矛盾
            <span className="text-xs font-normal text-gray-400 ml-2">
              （{report.contradictions.length} 处不一致）
            </span>
          </h2>

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
                        {c.severity === 'high' ? '严重' : '轻微'}
                      </span>
                      <span className="font-medium text-sm text-gray-800">{c.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{c.description}</p>
                    <div className="text-xs space-y-0.5 mb-2">
                      <p>学生：<span className={c.studentEvidence.signal === 'RED' ? 'text-red-600' : 'text-green-600'}>{c.studentEvidence.answerText}</span></p>
                      <p>{c.counterEvidence.source === 'parent' ? '家长' : '教师'}：<span className={c.counterEvidence.signal === 'RED' ? 'text-red-600' : 'text-green-600'}>{c.counterEvidence.answerText}</span></p>
                    </div>
                    <p className="text-xs text-indigo-600 italic">
                      💬 建议追问："{c.suggestedQuestion}"
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 段4：首次访谈重点 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4">首次访谈重点</h2>

        {report.firstInterviewFocus.length === 0 ? (
          <p className="text-sm text-gray-400">暂无明显需要重点访谈的方向。</p>
        ) : (
          <ol className="space-y-3">
            {report.firstInterviewFocus.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-gray-700 pt-0.5">{item}</span>
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
