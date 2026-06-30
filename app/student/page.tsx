'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SurveyForm from '@/components/SurveyForm'
import { studentSurvey } from '@/lib/questions'
import { supabase } from '@/lib/supabase'

function StudentForm() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || undefined

  const handleSubmit = async (data: Record<string, unknown>) => {
    const { error } = await supabase.from('student_responses').insert(data)
    if (error) throw error
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{studentSurvey.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{studentSurvey.subtitle}</p>
      </div>
      <SurveyForm
        config={studentSurvey}
        tableName="student_responses"
        prefilledCode={code}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">加载中...</div>}>
      <StudentForm />
    </Suspense>
  )
}
