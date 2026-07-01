'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SurveyForm from '@/components/SurveyForm'
import { parentSurvey } from '@/lib/questions'
import { supabase } from '@/lib/supabase'

function ParentForm() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || undefined

  const handleSubmit = async (data: Record<string, unknown>) => {
    const { error } = await supabase.from('parent_responses').insert(data)
    if (error) throw error
  }

  const extraFields = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        您是孩子的 *
      </label>
      <div className="space-y-2">
        {[
          { value: '父亲', label: '父亲' },
          { value: '母亲', label: '母亲' },
          { value: '其他', label: '其他' },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="parent_role"
              data-extra="true"
              value={opt.value}
              className="text-indigo-600 focus:ring-indigo-500"
              required
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{parentSurvey.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{parentSurvey.subtitle}</p>
      </div>
      <SurveyForm
        config={parentSurvey}
        tableName="parent_responses"
        prefilledCode={code}
        extraFields={extraFields}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default function ParentPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">加载中...</div>}>
      <ParentForm />
    </Suspense>
  )
}
