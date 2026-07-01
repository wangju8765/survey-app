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
        <Link href="/admin/" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← 返回列表
        </Link>
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
