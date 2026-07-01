'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface StudentInfo {
  name: string
  code: string
  age: number | null
  grade: string | null
  gender: string | null
}

interface SurveyStatus { student: boolean; parent: boolean; teacher: boolean }

const ROLES = [
  { key: 'student' as const, label: '学生问卷', icon: '📝', time: '15-20 分钟', count: '30题' },
  { key: 'parent' as const, label: '家长问卷', icon: '👨‍👩‍👧', time: '10 分钟', count: '14题' },
  { key: 'teacher' as const, label: '教师问卷', icon: '🏫', time: '5-8 分钟', count: '7题' },
]

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCode = searchParams.get('code') || ''

  const [codeInput, setCodeInput] = useState('')
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [status, setStatus] = useState<SurveyStatus>({ student: false, parent: false, teacher: false })
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [initDone, setInitDone] = useState(false)

  // URL 带 code 参数时，验证并恢复问卷列表（支持返回按钮）
  useEffect(() => {
    if (!urlCode) { setInitDone(true); return }

    let cancelled = false
    ;(async () => {
      setChecking(true)
      const { data: info } = await supabase
        .from('students')
        .select('name, code, age, grade, gender')
        .eq('code', urlCode)
        .maybeSingle()

      if (cancelled) return
      if (!info) {
        // 无效编号，清除 URL 参数
        router.replace('/')
        setInitDone(true)
        setChecking(false)
        return
      }

      setStudent(info)
      const [sr, pr, tr] = await Promise.all([
        supabase.from('student_responses').select('id').eq('student_code', info.code).limit(1),
        supabase.from('parent_responses').select('id').eq('student_code', info.code).limit(1),
        supabase.from('teacher_responses').select('id').eq('student_code', info.code).limit(1),
      ])
      if (!cancelled) {
        setStatus({
          student: (sr.data?.length || 0) > 0,
          parent: (pr.data?.length || 0) > 0,
          teacher: (tr.data?.length || 0) > 0,
        })
      }
      setChecking(false)
      setInitDone(true)
    })()

    return () => { cancelled = true }
  }, [urlCode, router])

  const handleVerify = async () => {
    const trimmed = codeInput.trim().toUpperCase()
    if (!trimmed) { setError('请输入编号'); return }

    setChecking(true)
    setError('')

    const { data, error: queryError } = await supabase
      .from('students')
      .select('name, code, age, grade, gender')
      .eq('code', trimmed)
      .maybeSingle()

    if (queryError) {
      setError('验证失败，请检查网络后重试')
    } else if (data) {
      // 更新 URL 以记住验证状态（支持返回按钮）
      router.replace(`/?code=${data.code}`)
      // student state 会由 useEffect 自动设置
    } else {
      setError('编号无效，请确认教练给你的编号是否正确')
    }
    setChecking(false)
  }

  // 等待 URL 参数初始化完成
  if (!initDone) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center text-gray-400">
        加载中...
      </div>
    )
  }

  if (student) {
    const info = []
    if (student.age) info.push(`${student.age}岁`)
    if (student.grade) info.push(student.grade)
    if (student.gender) info.push(student.gender)
    const done = [status.student, status.parent, status.teacher].filter(Boolean).length

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-block bg-green-50 border border-green-200 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
            {done === 3 ? '🎉 全部完成' : `已填 ${done}/3`} · 编号 {student.code}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{student.name} 的测评</h1>
          {info.length > 0 && <p className="text-gray-500 text-sm">{info.join(' · ')}</p>}
        </div>

        <div className="grid gap-3">
          {ROLES.map((r) => (
            <div
              key={r.key}
              className={`flex items-center justify-between p-4 rounded-xl border bg-white ${
                status[r.key] ? 'border-green-200 bg-green-50/50' : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <span className="font-medium text-gray-800">{r.label}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {r.time} · {r.count}
                  </span>
                </div>
              </div>
              {status[r.key] ? (
                <span className="text-green-600 text-sm font-medium">已填写 ✅</span>
              ) : (
                <Link
                  href={`/${r.key}/?code=${student.code}`}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  去填写
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border text-sm text-gray-500 text-center">
          {done === 3
            ? '三份问卷已全部完成，感谢配合！'
            : '三份问卷可不同时间填写，使用同一编号即可'}
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              router.replace('/')
              setStudent(null)
              setStatus({ student: false, parent: false, teacher: false })
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            不是 {student.name}？点此切换编号
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">小王老师教练课</h1>
        <p className="text-gray-500">三方问卷系统</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          请输入教练给你的测评编号
        </label>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => { setCodeInput(e.target.value); setError('') }}
          placeholder="6位字母数字组合"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg tracking-widest text-center"
          autoFocus
          disabled={checking}
        />
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">{error}</div>
        )}
        <button
          onClick={handleVerify}
          disabled={checking}
          className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? '验证中...' : '进入测评'}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto pt-12 text-center text-gray-400">加载中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
