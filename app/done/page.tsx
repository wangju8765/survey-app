'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface RoleStatus {
  student: boolean
  parent: boolean
  teacher: boolean
}

const ROLES = [
  { key: 'student' as const, label: '学生问卷', icon: '📝', desc: '学生本人填写' },
  { key: 'parent' as const, label: '家长问卷', icon: '👨‍👩‍👧', desc: '家长填写' },
  { key: 'teacher' as const, label: '教师问卷', icon: '🏫', desc: '班主任/主科教师填写' },
]

export default function DonePage() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<RoleStatus>({ student: false, parent: false, teacher: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const c = sessionStorage.getItem('survey_code') || ''
    const n = sessionStorage.getItem('student_name') || ''
    setCode(c)
    setName(n)

    if (c) {
      Promise.all([
        supabase.from('student_responses').select('id').eq('student_code', c).limit(1),
        supabase.from('parent_responses').select('id').eq('student_code', c).limit(1),
        supabase.from('teacher_responses').select('id').eq('student_code', c).limit(1),
      ]).then(([sr, pr, tr]) => {
        setStatus({
          student: (sr.data?.length || 0) > 0,
          parent: (pr.data?.length || 0) > 0,
          teacher: (tr.data?.length || 0) > 0,
        })
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const BASE = typeof window !== 'undefined' && window.location.pathname.startsWith('/survey-app') ? '/survey-app' : ''

  return (
    <div className="max-w-lg mx-auto text-center py-8 space-y-8">
      <div className="text-5xl">✅</div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">提交成功</h1>
        {name && <p className="text-gray-500">{name} 的问卷已安全保存</p>}
      </div>

      {loading ? null : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {[status.student, status.parent, status.teacher].filter(Boolean).length === 3
              ? '三份问卷已全部完成！'
              : '还有其他问卷需要填写：'}
          </p>

          <div className="grid gap-3">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  status[r.key]
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <span className="font-medium text-gray-800">{r.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{r.desc}</span>
                  </div>
                </div>
                {status[r.key] ? (
                  <span className="text-green-600 text-sm font-medium">已填写</span>
                ) : (
                  <Link
                    href={`${BASE}/${r.key}/?code=${code}`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    去填写
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`${BASE}/`}
        className="inline-block text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
