'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SurveyForm from '@/components/SurveyForm'
import { teacherSurvey } from '@/lib/questions'
import { supabase } from '@/lib/supabase'

function TeacherForm() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || undefined

  const handleSubmit = async (data: Record<string, unknown>) => {
    const { error } = await supabase.from('teacher_responses').insert(data)
    if (error) throw error
  }

  const extraFields = null

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{teacherSurvey.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{teacherSurvey.subtitle}</p>
      </div>
      <SurveyForm
        config={teacherSurvey}
        tableName="teacher_responses"
        prefilledCode={code}
        extraFields={extraFields}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default function TeacherPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">加载中...</div>}>
      <TeacherForm />
    </Suspense>
  )
}
