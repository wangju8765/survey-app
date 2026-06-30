'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [codeInput, setCodeInput] = useState('')
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    const trimmed = codeInput.trim().toUpperCase()
    if (!trimmed) {
      setError('请输入编号')
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      setError('编号只能包含字母和数字')
      return
    }

    setChecking(true)
    setError('')

    const { data, error: queryError } = await supabase
      .from('valid_codes')
      .select('code')
      .eq('code', trimmed)
      .eq('active', true)
      .maybeSingle()

    if (queryError) {
      setError('验证失败，请检查网络后重试')
      console.error(queryError)
    } else if (data) {
      sessionStorage.setItem('survey_code', trimmed)
      setVerifiedCode(trimmed)
    } else {
      setError('编号无效，请确认教练给你的编号是否正确')
    }

    setChecking(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify()
  }

  // 已验证通过 → 显示问卷选择
  if (verifiedCode) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-block bg-green-50 border border-green-200 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-3">
            ✅ 编号 {verifiedCode} 验证通过
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">三方问卷系统</h1>
          <p className="text-gray-500">请选择对应的问卷类型</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href={`/student/?code=${verifiedCode}`}
            className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
              学生问卷
            </h2>
            <p className="text-sm text-gray-500 mt-1">10-15 岁 · 约 10-15 分钟</p>
            <p className="text-xs text-gray-400 mt-2">18 题（16 选择 + 2 开放）</p>
          </Link>

          <Link
            href={`/parent/?code=${verifiedCode}`}
            className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="text-3xl mb-3">👨‍👩‍👧</div>
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
              家长问卷
            </h2>
            <p className="text-sm text-gray-500 mt-1">主要照顾者 · 约 10 分钟</p>
            <p className="text-xs text-gray-400 mt-2">14 题（12 选择 + 2 开放）</p>
          </Link>

          <Link
            href={`/teacher/?code=${verifiedCode}`}
            className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="text-3xl mb-3">🏫</div>
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
              教师问卷
            </h2>
            <p className="text-sm text-gray-500 mt-1">班主任/主科教师 · 约 5-8 分钟</p>
            <p className="text-xs text-gray-400 mt-2">7 题（5 选择 + 2 开放）</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">📌 填答提示</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>编号 <b>{verifiedCode}</b> 已绑定，提交时自动关联</li>
            <li>每一份问卷都是独立的，学生、家长、教师可以不同时间填写</li>
            <li>所有数据仅教练可见，不会公开</li>
          </ul>
        </div>
      </div>
    )
  }

  // 未验证 → 显示编号输入
  return (
    <div className="max-w-md mx-auto space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">小王老师教练课</h1>
        <p className="text-gray-500">三方问卷系统</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          请输入教练给你的编号
        </label>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => {
            setCodeInput(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="例如 ZW2026"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg tracking-widest text-center"
          autoFocus
          disabled={checking}
        />
        <p className="text-xs text-gray-400 mt-2 text-center">字母+数字，不含其他符号</p>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={checking}
          className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? '验证中...' : '进入问卷'}
        </button>
      </div>
    </div>
  )
}
