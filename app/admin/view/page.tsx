'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { studentLabels, studentOptions, parentLabels, parentOptions, teacherLabels, teacherOptions } from '@/lib/question-labels'

function formatAnswer(qid: string, value: unknown, options: Record<string, Record<string, string>>): string {
  if (!value) return '（未填）'
  if (Array.isArray(value)) {
    return value.map((v: string) => options[qid]?.[v] || v).join('、')
  }
  return options[qid]?.[value as string] || (value as string)
}

function ResponseCard({ title, icon, data, labels, options }: {
  title: string
  icon: string
  data: Record<string, unknown> | null
  labels: Record<string, string>
  options: Record<string, Record<string, string>>
}) {
  if (!data) return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h2 className="font-bold text-gray-800 mb-2">{icon} {title}</h2>
      <p className="text-gray-400 text-sm">尚未填写</p>
    </div>
  )

  const qids = Object.keys(labels).filter(k => k !== 'parent_role' && k in data)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h2 className="font-bold text-gray-800 mb-4">{icon} {title}</h2>
      <p className="text-xs text-gray-400 mb-4">
        填写时间：{data.created_at ? new Date(data.created_at as string).toLocaleString('zh-CN') : ''}
      </p>
      <div className="space-y-3">
        {/* parent_role special case */}
        {!!data.parent_role && (
          <div className="border-b pb-2">
            <span className="text-xs text-gray-400">家长角色</span>
            <p className="text-sm text-gray-800 font-medium">{data.parent_role as string}</p>
          </div>
        )}
        {/* teacher extra fields */}
        {!!data.teacher_name && (
          <div className="border-b pb-2">
            <span className="text-xs text-gray-400">教师信息</span>
            <p className="text-sm text-gray-800">
              {data.teacher_name as string} · {(data.subject as string) || ''}
              {!!data.known_duration ? ` · 认识${data.known_duration as string}个月` : ''}
            </p>
            {!!data.student_name && (
              <p className="text-sm text-gray-500 mt-1">评价学生：{data.student_name as string}</p>
            )}
          </div>
        )}
        {qids.map((qid) => (
          <div key={qid} className="border-b border-gray-50 pb-2 last:border-0">
            <span className="text-xs text-gray-400">{labels[qid]}</span>
            <p className={`text-sm mt-0.5 ${!data[qid] ? 'text-gray-300 italic' : 'text-gray-800 font-medium'}`}>
              {formatAnswer(qid, data[qid], options)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ViewContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || ''
  const [studentData, setStudentData] = useState<Record<string, unknown> | null>(null)
  const [parentData, setParentData] = useState<Record<string, unknown> | null>(null)
  const [teacherData, setTeacherData] = useState<Record<string, unknown> | null>(null)
  const [studentInfo, setStudentInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) { setLoading(false); return }
    Promise.all([
      supabase.from('students').select('*').eq('code', code).maybeSingle(),
      supabase.from('student_responses').select('*').eq('student_code', code).maybeSingle(),
      supabase.from('parent_responses').select('*').eq('student_code', code).maybeSingle(),
      supabase.from('teacher_responses').select('*').eq('student_code', code).maybeSingle(),
    ]).then(([si, sr, pr, tr]) => {
      setStudentInfo(si.data)
      setStudentData(sr.data)
      setParentData(pr.data)
      setTeacherData(tr.data)
      setLoading(false)
    })
  }, [code])

  const handleExport = () => {
    const studentName = studentInfo?.name ? String(studentInfo.name) : code
    const now = new Date().toLocaleString('zh-CN')
    const lines: string[] = []

    lines.push(`# ${studentName} · 问卷数据导出`)
    lines.push('')
    lines.push(`> 编号：${code}  ')
    if (studentInfo) {
      const meta = [studentInfo.age, studentInfo.grade, studentInfo.gender].filter(Boolean).map(String).join(' · ');
      if (meta) lines.push(`> ${meta}`);
    }
    lines.push(`> 导出时间：${now}`)
    lines.push('')

    const surveys: { title: string; data: Record<string, unknown> | null; labels: Record<string, string>; options: Record<string, Record<string, string>>; extra?: (d: Record<string, unknown>) => string[] }[] = [
      {
        title: '📝 学生问卷',
        data: studentData,
        labels: studentLabels,
        options: studentOptions,
      },
      {
        title: '👨‍👩‍👧 家长问卷',
        data: parentData,
        labels: parentLabels,
        options: parentOptions,
        extra: (d) => d.parent_role ? [`家长角色：${d.parent_role}`] : [],
      },
      {
        title: '🏫 教师问卷',
        data: teacherData,
        labels: teacherLabels,
        options: teacherOptions,
      },
    ]

    for (const survey of surveys) {
      lines.push(`## ${survey.title}`)
      lines.push('')
      if (!survey.data) {
        lines.push('（未填写）')
        lines.push('')
        continue
      }
      lines.push(`填写时间：${survey.data.created_at ? new Date(survey.data.created_at as string).toLocaleString('zh-CN') : '未知'}`)
      lines.push('')

      if (survey.extra) {
        for (const line of survey.extra(survey.data)) {
          lines.push(`- ${line}`)
        }
        lines.push('')
      }

      const qids = Object.keys(survey.labels).filter(k => k !== 'parent_role' && k in survey.data)
      for (const qid of qids) {
        const label = survey.labels[qid] || qid
        const value = survey.data[qid]
        if (value === null || value === undefined || value === '') {
          lines.push(`- **${label}**：（未填）`)
        } else {
          const answerText = Array.isArray(value)
            ? (value as string[]).map(v => survey.options[qid]?.[v] || v).join('、')
            : survey.options[qid]?.[value as string] || String(value)
          lines.push(`- **${label}**：${answerText}`)
        }
      }
      lines.push('')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studentName}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <p className="text-center py-8 text-gray-400">加载中...</p>

  if (!code) return <p className="text-center py-8 text-gray-400">缺少编号参数</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {studentInfo?.name ? `${String(studentInfo.name)} 的问卷数据` : `编号 ${code}`}
          </h1>
          {studentInfo && (
            <p className="text-sm text-gray-500 mt-1">
              {[studentInfo.age, studentInfo.grade, studentInfo.gender].filter(Boolean).map(String).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            📥 导出 MD
          </button>
          <Link href="/admin/" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← 返回列表
          </Link>
        </div>
      </div>

      <ResponseCard title="学生卷" icon="📝" data={studentData} labels={studentLabels} options={studentOptions} />
      <ResponseCard title="家长卷" icon="👨‍👩‍👧" data={parentData} labels={parentLabels} options={parentOptions} />
      <ResponseCard title="教师卷" icon="🏫" data={teacherData} labels={teacherLabels} options={teacherOptions} />
    </div>
  )
}

export default function ViewPage() {
  return (
    <Suspense fallback={<p className="text-center py-8 text-gray-400">加载中...</p>}>
      <ViewContent />
    </Suspense>
  )
}
