// 信号地图：将三份问卷回答翻译为维度信号、三角验证矛盾和首次访谈重点
// 纯客户端运算，无服务端依赖

import {
  studentLabels, studentOptions,
  parentLabels, parentOptions,
  teacherLabels, teacherOptions,
} from '@/lib/question-labels'

// ============================================================
// Types
// ============================================================

export type SignalColor = 'GREEN' | 'YELLOW' | 'RED'

export interface EvidenceItem {
  source: 'student' | 'parent' | 'teacher'
  qid: string
  questionText: string
  answerText: string
  signal: SignalColor
}

export interface DimensionSignal {
  dimension: string
  label: string
  group: string
  signal: SignalColor
  evidence: EvidenceItem[]
}

export interface Contradiction {
  dimension: string
  label: string
  description: string
  studentEvidence: EvidenceItem
  counterEvidence: EvidenceItem
  severity: 'high' | 'medium'
  suggestedQuestion: string
}

export interface SignalReport {
  studentName: string
  studentCode: string
  grade: string
  generatedAt: string
  surveysCompleted: { student: boolean; parent: boolean; teacher: boolean }
  dimensions: DimensionSignal[]
  contradictions: Contradiction[]
  firstInterviewFocus: string[]
}

// ============================================================
// 选项→信号映射表
// A=最适应/正面 → D/E=最需关注/负面
// ============================================================

const STUDENT_SIGNAL: Record<string, Record<string, SignalColor>> = {
  q1:  { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'RED', E:'RED' },
  q2:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q3:  { A:'GREEN', B:'RED',    C:'RED',    D:'YELLOW' },
  q4:  { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'YELLOW' },
  q5:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q7:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q8:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED' },
  q9:  { A:'GREEN', B:'GREEN',  C:'RED',    D:'YELLOW', E:'YELLOW' },
  q10: { A:'GREEN', B:'GREEN',  C:'RED',    D:'RED' },
  q11: { A:'GREEN', B:'GREEN',  C:'RED',    D:'RED', E:'RED' },
  q12: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'YELLOW' },
  q14: { A:'GREEN', B:'GREEN',  C:'RED',    D:'YELLOW', E:'YELLOW' },
  q15: { A:'GREEN', B:'YELLOW', C:'RED',    D:'YELLOW' },
  q16: { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED' },
  q17: { A:'GREEN', B:'GREEN',  C:'RED',    D:'RED', E:'RED' },
  q20: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q21: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q22: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED' },
  q23: { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED' },
  q24: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q25: { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED' },
  q26: { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'RED', E:'YELLOW' },
  q27: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q28: { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED' },
  q29: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q30: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED' },
}

// Checkbox: which option values are GREEN (positive) or RED (negative)
const STUDENT_CHECKBOX_SIGNAL: Record<string, { green: string[]; red: string[] }> = {
  q6:  { green: ['A','B','C','D','E'], red: ['F','G','H'] },
  q13: { green: ['A','B','C'], red: ['D','E'] },
}

const PARENT_SIGNAL: Record<string, Record<string, SignalColor>> = {
  q1:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q2:  { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'RED', E:'YELLOW' },
  q4:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED' },
  q5:  { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'YELLOW' },
  q7:  { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED' },
  q9:  { A:'RED',   B:'GREEN',  C:'GREEN',  D:'YELLOW', E:'YELLOW' },
  q10: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'RED' },
  q11: { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'RED', E:'RED' },
  q12: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED' },
}

const PARENT_CHECKBOX_SIGNAL: Record<string, { green: string[]; red: string[] }> = {
  q3: { green: ['A','B'], red: ['D','E'] },
  q6: { green: ['A'], red: ['C','D','E'] },
  q8: { green: [], red: ['G'] },
}

const TEACHER_SIGNAL: Record<string, Record<string, SignalColor>> = {
  q1: { A:'GREEN', B:'YELLOW', C:'YELLOW', D:'RED', E:'YELLOW' },
  q3: { A:'GREEN', B:'GREEN',  C:'YELLOW', D:'RED', E:'YELLOW' },
  q4: { A:'GREEN', B:'YELLOW', C:'RED',    D:'RED', E:'YELLOW' },
  q5: { A:'GREEN', B:'GREEN',  C:'RED',    D:'RED', E:'RED', F:'YELLOW' },
}

const TEACHER_CHECKBOX_SIGNAL: Record<string, { green: string[]; red: string[] }> = {
  q2: { green: ['A'], red: ['C','D'] },
}

// ============================================================
// 维度定义
// ============================================================

interface DimDef { label: string; group: string }
const DIMENSIONS: Record<string, DimDef> = {
  'D1':    { label: '归因风格',           group: '认知系统 (D)' },
  'D2':    { label: '元认知监控',         group: '认知系统 (D)' },
  'D3-SRL':{ label: 'SRL 前思与表现',     group: '认知系统 (D)' },
  'D3-SR': { label: 'SRL 反思阶段',       group: '认知系统 (D)' },
  'D4-EF': { label: '执行功能 (EF)',      group: '认知系统 (D)' },
  'D5':    { label: '策略库与策略选择',   group: '认知系统 (D)' },
  'M1':    { label: '调节质地 (SDT)',     group: '动力系统 (M)' },
  'M2':    { label: '自主性满足',         group: '动力系统 (M)' },
  'M3':    { label: '价值结构',           group: '动力系统 (M)' },
  'M4':    { label: '心理成本',           group: '动力系统 (M)' },
  'M5':    { label: '成就目标取向',       group: '动力系统 (M)' },
  'M6':    { label: '自我妨碍',           group: '动力系统 (M)' },
  'M7':    { label: '兴趣发展',           group: '动力系统 (M)' },
  'M8':    { label: '学习情感体验',       group: '动力系统 (M)' },
  'Z1':    { label: '最近发展区 (ZPD)',   group: '发展潜力 (Z)' },
  'R3':    { label: '家长自主支持',       group: '关系系统 (R)' },
  'R4':    { label: '亲子关系质量',       group: '关系系统 (R)' },
  'R5-R6': { label: '同伴系统',           group: '关系系统 (R)' },
}

// ============================================================
// 题目→维度映射
// ============================================================

const STUDENT_Q_TO_DIM: Record<string, string> = {
  q1: 'M8',     q2: 'M4',     q3: 'D1',     q4: 'D1',
  q5: 'D2',     q6: 'D5',     q7: 'D3-SRL', q8: 'M5',
  q9: 'R5-R6',  q10:'R5-R6',  q11:'M1',     q12:'M2',
  q13:'M3',     q14:'D1',     q15:'D1',     q16:'M8',
  q17:'M6',     q20:'D4-EF',  q21:'D4-EF',  q22:'D4-EF',
  q23:'D4-EF',  q24:'D4-EF',  q25:'D3-SR',  q26:'D3-SR',
  q27:'Z1',     q28:'Z1',     q29:'M7',     q30:'M7',
}

const PARENT_Q_TO_DIM: Record<string, string> = {
  q1: 'D3-SRL', q2: 'D2',     q3: 'D5',     q4: 'R4',
  q5: 'R3',     q6: 'R4',     q7: 'R4',     q8: 'M8',
  q9: 'D1',     q10:'M8',     q11:'M8',     q12:'M8',
}

const TEACHER_Q_TO_DIM: Record<string, string> = {
  q1: 'M5',     q2: 'D5',     q3: 'M5',     q4: 'R5-R6',
  q5: 'M8',
}

// ============================================================
// 三角验证矛盾检测对
// ============================================================

interface TriPair {
  studentQid: string
  otherSource: 'parent' | 'teacher'
  otherQid: string
  dimension: string
  description: string
  suggestedQuestion: string
}

const TRIANGULATION_PAIRS: TriPair[] = [
  {
    studentQid: 'q8', otherSource: 'teacher', otherQid: 'q1', dimension: 'M5',
    description: '课堂参与：学生自评 vs 教师观察',
    suggestedQuestion: '老师看到你在课堂上不太主动发言，你自己觉得是这样吗？',
  },
  {
    studentQid: 'q5', otherSource: 'parent', otherQid: 'q2', dimension: 'D2',
    description: '自我检查：学生自评 vs 家长观察',
    suggestedQuestion: '做完题之后，你一般会不会自己检查一遍？',
  },
  {
    studentQid: 'q20', otherSource: 'parent', otherQid: 'q1', dimension: 'D4-EF',
    description: '任务启动：学生自评 vs 家长观察',
    suggestedQuestion: '平时开始做作业的时候，你觉得是自己就能开始，还是要催？',
  },
  {
    studentQid: 'q27', otherSource: 'parent', otherQid: 'q3', dimension: 'Z1',
    description: '独立水平：学生自评 vs 家长观察',
    suggestedQuestion: '遇到不会的题，你一般是自己先想还是直接问？',
  },
  {
    studentQid: 'q10', otherSource: 'teacher', otherQid: 'q4', dimension: 'R5-R6',
    description: '同伴关系：学生自评 vs 教师观察',
    suggestedQuestion: '在学校有没有能一起聊学习的同学？',
  },
  {
    studentQid: 'q24', otherSource: 'parent', otherQid: 'q8', dimension: 'D4-EF',
    description: '情绪调节：学生自评 vs 家长观察',
    suggestedQuestion: '遇到做不出来的题，你会不会很烦躁？',
  },
  {
    studentQid: 'q14', otherSource: 'parent', otherQid: 'q9', dimension: 'D1',
    description: '自我认知：学生自评 vs 家长看法',
    suggestedQuestion: '你怎么看自己学习这件事？爸爸妈妈又是怎么看的？',
  },
  {
    studentQid: 'q29', otherSource: 'parent', otherQid: 'q8', dimension: 'M7',
    description: '学习兴趣：学生自评 vs 家长观察',
    suggestedQuestion: '最近有没有哪门课让你觉得挺有意思的？',
  },
  {
    studentQid: 'q15', otherSource: 'parent', otherQid: 'q6', dimension: 'D1',
    description: '失败归因：学生自评 vs 家长沟通方式',
    suggestedQuestion: '如果你很认真复习了还是考不好，你觉得是为什么？',
  },
  {
    studentQid: 'q21', otherSource: 'parent', otherQid: 'q8', dimension: 'D4-EF',
    description: '专注力：学生自评 vs 家长观察',
    suggestedQuestion: '做作业的时候，你能一口气做到底吗？还是容易跑神？',
  },
]

// ============================================================
// 辅助函数
// ============================================================

function getSourceLabels(source: 'student' | 'parent' | 'teacher'): {
  labels: Record<string, string>
  options: Record<string, Record<string, string>>
} {
  switch (source) {
    case 'student': return { labels: studentLabels, options: studentOptions }
    case 'parent':  return { labels: parentLabels, options: parentOptions }
    default:        return { labels: teacherLabels, options: teacherOptions }
  }
}

function formatAnswerText(
  qid: string, value: unknown, options: Record<string, Record<string, string>>
): string {
  if (!value) return '（未填）'
  if (Array.isArray(value)) {
    return value.map(v => options[qid]?.[v] || v).join('、')
  }
  return options[qid]?.[value as string] || (value as string)
}

function getRadioSignal(
  qid: string, value: string, signalMap: Record<string, Record<string, SignalColor>>
): SignalColor {
  const qMap = signalMap[qid]
  if (!qMap) return 'YELLOW'
  return qMap[value] || 'YELLOW'
}

function getCheckboxSignal(
  qid: string, values: string[],
  signalMap: Record<string, { green: string[]; red: string[] }>
): SignalColor {
  const qMap = signalMap[qid]
  if (!qMap || !values.length) return 'YELLOW'
  const hasRed = values.some(v => qMap.red.includes(v))
  if (hasRed) return 'RED'
  const hasGreen = values.some(v => qMap.green.includes(v))
  if (hasGreen) return 'GREEN'
  return 'YELLOW'
}

// ============================================================
// 主函数
// ============================================================

export function generateSignalReport(
  studentData: Record<string, unknown> | null,
  parentData: Record<string, unknown> | null,
  teacherData: Record<string, unknown> | null,
  studentInfo: { name: string; code: string; age?: number; grade?: string; gender?: string } | null,
): SignalReport {
  const name = studentInfo?.name || '未知'
  const code = studentInfo?.code || ''
  const grade = studentInfo?.grade || ''

  const surveysCompleted = {
    student: !!studentData,
    parent: !!parentData,
    teacher: !!teacherData,
  }

  // 收集各问卷证据
  function collectEvidence(
    data: Record<string, unknown> | null,
    source: 'student' | 'parent' | 'teacher',
    qToDim: Record<string, string>,
    radioSignal: Record<string, Record<string, SignalColor>>,
    checkboxSignal: Record<string, { green: string[]; red: string[] }>,
  ): EvidenceItem[] {
    if (!data) return []
    const { labels, options } = getSourceLabels(source)
    const evidence: EvidenceItem[] = []

    for (const qid of Object.keys(qToDim)) {
      const value = data[qid]
      if (value === null || value === undefined) continue

      let signal: SignalColor
      if (Array.isArray(value)) {
        signal = getCheckboxSignal(qid, value as string[], checkboxSignal)
      } else if (typeof value === 'string') {
        signal = getRadioSignal(qid, value, radioSignal)
      } else {
        continue
      }

      const questionText = labels[qid] || qid
      const answerText = formatAnswerText(qid, value, options)

      evidence.push({ source, qid, questionText, answerText, signal })
    }

    return evidence
  }

  const studentEvidence = collectEvidence(
    studentData, 'student', STUDENT_Q_TO_DIM, STUDENT_SIGNAL, STUDENT_CHECKBOX_SIGNAL,
  )
  const parentEvidence = collectEvidence(
    parentData, 'parent', PARENT_Q_TO_DIM, PARENT_SIGNAL, PARENT_CHECKBOX_SIGNAL,
  )
  const teacherEvidence = collectEvidence(
    teacherData, 'teacher', TEACHER_Q_TO_DIM, TEACHER_SIGNAL, TEACHER_CHECKBOX_SIGNAL,
  )

  // 按维度聚合（取最差信号）
  const dimMap = new Map<string, EvidenceItem[]>()
  for (const e of [...studentEvidence, ...parentEvidence, ...teacherEvidence]) {
    let dim: string | undefined
    if (e.source === 'student') dim = STUDENT_Q_TO_DIM[e.qid]
    else if (e.source === 'parent') dim = PARENT_Q_TO_DIM[e.qid]
    else dim = TEACHER_Q_TO_DIM[e.qid]
    if (!dim) continue

    if (!dimMap.has(dim)) dimMap.set(dim, [])
    dimMap.get(dim)!.push(e)
  }

  const dimensions: DimensionSignal[] = []
  for (const [dim, evidence] of dimMap) {
    const def = DIMENSIONS[dim] || { label: dim, group: '其他' }
    const signals = evidence.map(e => e.signal)
    const signal: SignalColor = signals.includes('RED') ? 'RED'
      : signals.includes('YELLOW') ? 'YELLOW' : 'GREEN'
    dimensions.push({ dimension: dim, label: def.label, group: def.group, signal, evidence })
  }

  // 三角验证矛盾检测
  const contradictions: Contradiction[] = []
  for (const pair of TRIANGULATION_PAIRS) {
    const sEv = studentEvidence.find(e => e.qid === pair.studentQid)
    let oEv: EvidenceItem | undefined
    if (pair.otherSource === 'parent') {
      oEv = parentEvidence.find(e => e.qid === pair.otherQid)
    } else {
      oEv = teacherEvidence.find(e => e.qid === pair.otherQid)
    }
    if (!sEv || !oEv) continue

    // 矛盾：一方 GREEN 另一方 RED
    if (
      (sEv.signal === 'GREEN' && oEv.signal === 'RED') ||
      (sEv.signal === 'RED' && oEv.signal === 'GREEN')
    ) {
      const dimDef = DIMENSIONS[pair.dimension] || { label: pair.dimension, group: '' }
      contradictions.push({
        dimension: pair.dimension,
        label: dimDef.label,
        description: pair.description,
        studentEvidence: sEv,
        counterEvidence: oEv,
        severity: 'high',
        suggestedQuestion: pair.suggestedQuestion,
      })
    } else if (
      (sEv.signal !== 'YELLOW' && oEv.signal === 'YELLOW') ||
      (sEv.signal === 'YELLOW' && oEv.signal !== 'YELLOW')
    ) {
      const dimDef = DIMENSIONS[pair.dimension] || { label: pair.dimension, group: '' }
      contradictions.push({
        dimension: pair.dimension,
        label: dimDef.label,
        description: pair.description,
        studentEvidence: sEv,
        counterEvidence: oEv,
        severity: 'medium',
        suggestedQuestion: pair.suggestedQuestion,
      })
    }
  }

  // 首次访谈重点
  const focusList: string[] = []

  // RED 维度优先
  const redDims = dimensions.filter(d => d.signal === 'RED')
  for (const d of redDims.slice(0, 3)) {
    const worstEvidence = d.evidence.filter(e => e.signal === 'RED')
    const summary = worstEvidence.slice(0, 2).map(e => `"${e.questionText}" → ${e.answerText}`).join('；')
    focusList.push(`【${d.label}】信号为红色。关键证据：${summary}`)
  }

  // HIGH 矛盾其次
  const highContra = contradictions.filter(c => c.severity === 'high')
  for (const c of highContra.slice(0, 2)) {
    if (focusList.length >= 5) break
    focusList.push(
      `【矛盾信号：${c.label}】${c.description}——学生：${c.studentEvidence.answerText}，${c.counterEvidence.source === 'parent' ? '家长' : '教师'}：${c.counterEvidence.answerText}。建议追问："${c.suggestedQuestion}"`,
    )
  }

  // 如果还不够，补 YELLOW 维度
  if (focusList.length < 3) {
    const yellowDims = dimensions.filter(d => d.signal === 'YELLOW')
    for (const d of yellowDims.slice(0, 3 - focusList.length)) {
      focusList.push(`【${d.label}】信号为黄色，需在访谈中进一步了解。`)
    }
  }

  return {
    studentName: name,
    studentCode: code,
    grade,
    generatedAt: new Date().toLocaleString('zh-CN'),
    surveysCompleted,
    dimensions,
    contradictions,
    firstInterviewFocus: focusList.slice(0, 5),
  }
}
