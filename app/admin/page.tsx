'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateCode } from '@/lib/codegen'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'coach2026'
const SURVEY_URL = 'https://wangju8765.github.io/survey-app/'

interface Student {
  id: string
  name: string
  age: number | null
  grade: string | null
  gender: string | null
  code: string
  created_at: string
}

interface SurveyStatus {
  student: boolean
  parent: boolean
  teacher: boolean
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('admin_authed') === 'true'
    return false
  })
  const [pwError, setPwError] = useState('')

  // 新建
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [grade, setGrade] = useState('')
  const [gender, setGender] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [generatedName, setGeneratedName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [copied, setCopied] = useState(false)

  // 列表
  const [students, setStudents] = useState<Student[]>([])
  const [statuses, setStatuses] = useState<Record<string, SurveyStatus>>({})
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('admin_authed', 'true')
      setPwError('')
    } else {
      setPwError('密码错误')
    }
  }

  const loadStudents = async () => {
    setLoading(true)
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false })
    if (data) {
      setStudents(data)
      const stats: Record<string, SurveyStatus> = {}
      for (const s of data) {
        const [sr, pr, tr] = await Promise.all([
          supabase.from('student_responses').select('id').eq('student_code', s.code).limit(1),
          supabase.from('parent_responses').select('id').eq('student_code', s.code).limit(1),
          supabase.from('teacher_responses').select('id').eq('student_code', s.code).limit(1),
        ])
        stats[s.code] = {
          student: (sr.data?.length || 0) > 0,
          parent: (pr.data?.length || 0) > 0,
          teacher: (tr.data?.length || 0) > 0,
        }
      }
      setStatuses(stats)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authed) loadStudents()
  }, [authed])

  const handleCreate = async () => {
    if (!name.trim()) {
      setCreateError('请输入学生姓名')
      return
    }
    setCreating(true)
    setCreateError('')

    const code = generateCode()

    const { error } = await supabase.from('students').insert({
      name: name.trim(),
      age: age ? parseInt(age) : null,
      grade: grade || null,
      gender: gender || null,
      code,
    })

    if (error) {
      setCreateError('创建失败：' + error.message)
    } else {
      setGeneratedCode(code)
      setGeneratedName(name.trim())
      setName('')
      setAge('')
      setGrade('')
      setGender('')
      setCopied(false)
      loadStudents()
    }
    setCreating(false)
  }

  const forwardTemplate = `${generatedName}家长您好：

这是孩子的专属学习测评入口。请按以下信息完成问卷：

🔑 测评编号：${generatedCode}
🔗 问卷链接：${SURVEY_URL}

📋 需填写三份：学生卷 + 家长卷 + 教师卷
⏰ 学生卷约10-15分钟，家长卷约10分钟，教师卷约5-8分钟
📌 三份可不同时间填写，使用同一编号即可

——小王老师教练课`

  const handleDelete = async (studentId: string, studentName: string, studentCode: string) => {
    if (!window.confirm(`确定要删除「${studentName}」（编号：${studentCode}）吗？\n\n这将同时删除该学生的所有问卷回答数据（学生卷、家长卷、教师卷），且不可恢复。`)) {
      return
    }
    setDeletingId(studentId)
    try {
      // 删除关联的问卷回答
      await Promise.all([
        supabase.from('student_responses').delete().eq('student_code', studentCode),
        supabase.from('parent_responses').delete().eq('student_code', studentCode),
        supabase.from('teacher_responses').delete().eq('student_code', studentCode),
      ])
      // 删除学生记录
      const { error } = await supabase.from('students').delete().eq('id', studentId)
      if (error) throw error
      loadStudents()
    } catch (err) {
      alert('删除失败：' + (err instanceof Error ? err.message : '未知错误'))
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(forwardTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto pt-12">
        <h1 className="text-xl font-bold text-center mb-6">教练管理后台</h1>
        <form onSubmit={handleLogin} className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入管理密码"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
            autoFocus
          />
          {pwError && <p className="text-red-500 text-sm text-center">{pwError}</p>}
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            进入后台
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">教练管理后台</h1>
        <button onClick={() => { setAuthed(false); sessionStorage.removeItem('admin_authed') }} className="text-sm text-gray-500 hover:text-gray-700">
          退出
        </button>
      </div>

      {/* 新建学生 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4">新建学生测评编号</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="学生姓名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="如 12" min={6} max={18} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="如 五年级 / 初一" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
        </div>

        {createError && <p className="text-red-500 text-sm mt-3">{createError}</p>}

        {generatedCode && (
          <div className="mt-4 space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 mb-1">测评编号已生成</p>
              <p className="text-3xl font-bold text-green-800 tracking-widest">{generatedCode}</p>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">📋 转发话术</span>
                <button onClick={handleCopy} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                  {copied ? '已复制 ✅' : '一键复制'}
                </button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{forwardTemplate}</pre>
            </div>
          </div>
        )}

        <button onClick={handleCreate} disabled={creating} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {creating ? '生成中...' : '生成测评编号'}
        </button>
      </div>

      {/* 已有学生列表 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4">已创建的学生</h2>
        <button onClick={loadStudents} disabled={loading} className="text-sm text-indigo-600 hover:text-indigo-800 mb-3">
          {loading ? '刷新中...' : '刷新'}
        </button>

        {students.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无学生</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-2">姓名</th>
                  <th className="py-2 pr-2">年级</th>
                  <th className="py-2 pr-2">编号</th>
                  <th className="py-2 pr-2">学生</th>
                  <th className="py-2 pr-2">家长</th>
                  <th className="py-2 pr-2">教师</th>
                  <th className="py-2 pr-2">数据</th>
                  <th className="py-2 pr-2">报告</th>
                  <th className="py-2 pr-2">家长版</th>
                  <th className="py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const st = statuses[s.code]
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-medium">{s.name}</td>
                      <td className="py-2 pr-2 text-gray-500">{s.grade || '-'}</td>
                      <td className="py-2 pr-2 font-mono text-xs tracking-wider">{s.code}</td>
                      <td className="py-2 pr-2">{st?.student ? '✅' : '⏳'}</td>
                      <td className="py-2 pr-2">{st?.parent ? '✅' : '⏳'}</td>
                      <td className="py-2 pr-2">{st?.teacher ? '✅' : '⏳'}</td>
                      <td className="py-2 pr-2">
                        <Link href={`/admin/view/?code=${s.code}`} className="text-indigo-600 hover:text-indigo-800 text-xs">
                          查看
                        </Link>
                      </td>
                      <td className="py-2 pr-2">
                        <Link href={`/admin/report/?code=${s.code}`} className="text-indigo-600 hover:text-indigo-800 text-xs">
                          报告
                        </Link>
                      </td>
                      <td className="py-2 pr-2">
                        <Link href={`/admin/report/parent/?code=${s.code}`} className="text-emerald-600 hover:text-emerald-800 text-xs">
                          家长版
                        </Link>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleDelete(s.id, s.name, s.code)}
                          disabled={deletingId === s.id}
                          className="text-red-500 hover:text-red-700 text-xs disabled:opacity-30"
                        >
                          {deletingId === s.id ? '删除中...' : '删除'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
