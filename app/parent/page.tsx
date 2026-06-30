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
