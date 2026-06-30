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

  const extraFields = (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          学生姓名 *
        </label>
        <input
          type="text"
          name="student_name"
          data-extra="true"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          填答教师 *
        </label>
        <input
          type="text"
          name="teacher_name"
          data-extra="true"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          任教学科 *
        </label>
        <input
          type="text"
          name="subject"
          data-extra="true"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          认识该生时长（约 ____ 个月）
        </label>
        <input
          type="text"
          name="known_duration"
          data-extra="true"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例如 12"
        />
      </div>
    </div>
  )

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
