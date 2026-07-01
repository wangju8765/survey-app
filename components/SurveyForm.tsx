'use client'

import { useState } from 'react'
import type { SurveyConfig } from '@/lib/questions'

const OTHER_MARKER = '__other__'

interface Props {
  config: SurveyConfig
  extraFields?: React.ReactNode
  tableName: 'student_responses' | 'parent_responses' | 'teacher_responses'
  prefilledCode?: string
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export default function SurveyForm({ config, extraFields, prefilledCode, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({})
  const [studentCode, setStudentCode] = useState(prefilledCode || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRadio = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
    // Clear other text if switching away from "其他"
    if (value !== OTHER_MARKER) {
      setOtherTexts((prev) => {
        const next = { ...prev }
        delete next[qid]
        return next
      })
    }
  }

  const handleCheckbox = (qid: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[qid] as string[]) || []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [qid]: next }
    })
  }

  const handleOtherText = (qid: string, text: string) => {
    setOtherTexts((prev) => ({ ...prev, [qid]: text }))
  }

  const handleTextarea = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }))
  }

  const isOtherSelected = (qid: string, type: string): boolean => {
    if (type === 'radio') return answers[qid] === OTHER_MARKER
    return ((answers[qid] as string[]) || []).includes(OTHER_MARKER)
  }

  const validate = (): boolean => {
    if (!studentCode.trim()) {
      setError('请输入教练给你的编号')
      return false
    }
    if (!/^[a-zA-Z0-9]+$/.test(studentCode.trim())) {
      setError('编号只能包含字母和数字，不含其他符号')
      return false
    }
    for (const part of config.parts) {
      for (const q of part.questions) {
        if (!q.required) continue
        const val = answers[q.id]

        // "其他"选了但没填文字
        if (q.hasOther && isOtherSelected(q.id, q.type) && !otherTexts[q.id]?.trim()) {
          const label = q.text.split('.')[0]
          setError(`请在"${label}"的"其他"选项中输入具体内容`)
          return false
        }

        if (!val) {
          setError(`请完成第 ${q.text.split('.')[0]} 题`)
          return false
        }
        if (Array.isArray(val) && val.length === 0) {
          setError(`请至少选择一个选项：第 ${q.text.split('.')[0]} 题`)
          return false
        }
      }
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setError('')

    try {
      const data: Record<string, unknown> = {
        student_code: studentCode.trim().toUpperCase(),
      }

      // Merge survey answers, replacing __other__ with actual text
      for (const [key, value] of Object.entries(answers)) {
        if (Array.isArray(value)) {
          data[key] = value.map((v) => (v === OTHER_MARKER ? (otherTexts[key] || '') : v))
        } else if (value === OTHER_MARKER) {
          data[key] = otherTexts[key] || ''
        } else {
          data[key] = value
        }
      }

      // Merge extra fields
      const form = e.target as HTMLFormElement
      const extraInputs = form.querySelectorAll<HTMLInputElement>('[data-extra]')
      const seen = new Set<string>()
      extraInputs.forEach((input) => {
        if (seen.has(input.name)) return
        if (input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value
            seen.add(input.name)
          }
        } else {
          data[input.name] = input.value
          seen.add(input.name)
        }
      })

      await onSubmit(data)
      const base = window.location.pathname.startsWith('/survey-app') ? '/survey-app' : ''
      window.location.href = `${base}/done/`
    } catch (err) {
      setError('提交失败，请检查网络后重试')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* 编号显示 */}
      {prefilledCode ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            编号：<span className="font-bold text-lg tracking-widest">{prefilledCode}</span>
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-blue-900 mb-1">
            请输入教练给你的编号 *
          </label>
          <input
            type="text"
            value={studentCode}
            onChange={(e) => {
              setStudentCode(e.target.value)
              setError('')
            }}
            placeholder="例如 ZW2026"
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest"
            required
          />
          <p className="text-xs text-blue-700 mt-1">字母+数字，不含其他符号</p>
        </div>
      )}

      {/* 额外字段（教师姓名等） */}
      {extraFields}

      {/* 问卷介绍 */}
      <div className="bg-gray-50 border-l-4 border-indigo-400 p-4 rounded">
        <p className="text-gray-700 text-sm leading-relaxed">{config.intro}</p>
      </div>

      {/* 各部分的题目 */}
      {config.parts.map((part, pi) => (
        <section key={pi}>
          {part.title && (
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
              {part.title}
            </h2>
          )}
          <div className="space-y-6">
            {part.questions.map((q) => (
              <div key={q.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <p className="text-gray-800 mb-3 font-medium">
                  {q.text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>

                {q.type === 'radio' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          answers[q.id] === opt.value
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.value}
                          checked={answers[q.id] === opt.value}
                          onChange={() => handleRadio(q.id, opt.value)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                    {/* "其他" 选项 */}
                    {q.hasOther && (
                      <div>
                        <label
                          className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isOtherSelected(q.id, 'radio')
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={OTHER_MARKER}
                            checked={isOtherSelected(q.id, 'radio')}
                            onChange={() => handleRadio(q.id, OTHER_MARKER)}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">其他</span>
                        </label>
                        {isOtherSelected(q.id, 'radio') && (
                          <input
                            type="text"
                            value={otherTexts[q.id] || ''}
                            onChange={(e) => handleOtherText(q.id, e.target.value)}
                            placeholder="请注明"
                            className="ml-8 mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full max-w-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'checkbox' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          ((answers[q.id] as string[]) || []).includes(opt.value)
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={((answers[q.id] as string[]) || []).includes(opt.value)}
                          onChange={() => handleCheckbox(q.id, opt.value)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                    {/* "其他" 选项 */}
                    {q.hasOther && (
                      <div>
                        <label
                          className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isOtherSelected(q.id, 'checkbox')
                              ? 'bg-indigo-50 border border-indigo-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={OTHER_MARKER}
                            checked={isOtherSelected(q.id, 'checkbox')}
                            onChange={() => handleCheckbox(q.id, OTHER_MARKER)}
                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">其他</span>
                        </label>
                        {isOtherSelected(q.id, 'checkbox') && (
                          <input
                            type="text"
                            value={otherTexts[q.id] || ''}
                            onChange={(e) => handleOtherText(q.id, e.target.value)}
                            placeholder="请注明"
                            className="ml-8 mt-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full max-w-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {q.type === 'textarea' && (
                  <textarea
                    rows={3}
                    value={(answers[q.id] as string) || ''}
                    onChange={(e) => handleTextarea(q.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="在这里输入..."
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '提交中...' : '提交'}
      </button>
    </form>
  )
}
