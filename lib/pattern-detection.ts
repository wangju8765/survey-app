// 跨维度模式检测：自动识别多个维度同时亮灯时形成的典型学习困难模式
// 纯客户端运算，无服务端依赖

import type { DimensionSignal } from '@/lib/signal-map'
import type { PatternRule } from '@/lib/signal-interpretation'

interface RuleDefinition {
  id: string
  name: string
  description: string
  coachImplication: string
  severity: 'high' | 'medium' | 'low'
  predicate: (dims: DimensionSignal[]) => { triggered: boolean; dimensions: string[] }
}

function sig(dims: DimensionSignal[], key: string): string | null {
  const d = dims.find(d => d.dimension === key)
  return d?.signal || null
}

function isNonGreen(dims: DimensionSignal[], key: string): boolean {
  const s = sig(dims, key)
  return s === 'YELLOW' || s === 'RED'
}

const RULES: RuleDefinition[] = [
  {
    id: 'learned-helplessness',
    name: '习得性无助早期信号',
    description:
      '学生的归因风格呈现消极模式（D1=RED），同时学习情感体验负面（M8=RED）或心理成本高（M4=RED），并出现自我妨碍行为（M6=YELLOW/RED）。这三个维度的共变构成了习得性无助的核心心理画像——学生已经内化了"努力不会改变结果"的信念，学习行为从"主动尝试"转向"保护自尊"（拖延、提前宣称失败、或直接放弃）。',
    coachImplication:
      '优先处理归因重塑而非学业提升。在教练课中避免直接挑战学生的"我不行"信念（会增加防御），改用在具体任务中创造小成功体验，再引导复盘"你是怎么做到的"。同时需要与家长沟通：减少对成绩的追问，增加对努力和策略的肯定——家庭反馈方式往往是维持习得性无助的重要环境因素。',
    severity: 'high',
    predicate: (dims) => {
      const d1 = sig(dims, 'D1')
      const m8 = sig(dims, 'M8')
      const m4 = sig(dims, 'M4')
      const m6 = sig(dims, 'M6')
      const triggered = d1 === 'RED' && (m8 === 'RED' || m4 === 'RED') && (m6 === 'YELLOW' || m6 === 'RED')
      const involved: string[] = []
      if (d1 === 'RED') involved.push('D1')
      if (m8 === 'RED' || m4 === 'RED') { if (m8 === 'RED') involved.push('M8'); if (m4 === 'RED') involved.push('M4') }
      if (m6 === 'YELLOW' || m6 === 'RED') involved.push('M6')
      return { triggered, dimensions: involved }
    },
  },
  {
    id: 'ef-cluster',
    name: '执行功能薄弱簇',
    description:
      '学生的执行功能（D4-EF）处于重点干预水平，且自我调节学习的多个相关维度（元认知监控D2、计划D3-SRL、反思D3-SR）中至少有2个也亮黄灯或红灯。执行功能是认知系统的底层基础设施——当EF薄弱时，上层的计划、监控和反思功能会因为缺乏底层支持而同时受限。这形成了一个"EF薄弱→无法有效计划/监控/反思→学习效率低下→更少成功体验→动机下降"的恶性循环。',
    coachImplication:
      '执行功能是当前最需要结构化支持的领域。建议从外部支架入手（任务清单、时间可视化、分解步骤、定时提醒），而非期待学生"自觉"。EF训练需要大量重复和渐进减支——从完全外部支持开始，逐步过渡到学生自我管理。同时注意：如果学生在EF相关题目上表现出明显的负面情绪（烦躁、放弃），支架的设计需要特别强调"降低认知负荷"而非"增加任务量"。',
    severity: 'high',
    predicate: (dims) => {
      const d4ef = sig(dims, 'D4-EF')
      if (d4ef !== 'RED') return { triggered: false, dimensions: [] }
      const subDims = ['D2', 'D3-SRL', 'D3-SR']
      const weakCount = subDims.filter(k => isNonGreen(dims, k)).length
      if (weakCount >= 2) {
        const involved = ['D4-EF', ...subDims.filter(k => isNonGreen(dims, k))]
        return { triggered: true, dimensions: involved }
      }
      return { triggered: false, dimensions: [] }
    },
  },
  {
    id: 'external-drive',
    name: '外部驱动型学习',
    description:
      '学生在动机自主性的三个核心维度——调节质地（M1）、自主性满足（M2）和价值结构（M3）——均亮黄灯或红灯。这构成了系统的外部驱动型学习画像：学生学习的动力主要来源于外部压力（父母期望、成绩焦虑、避免惩罚），而非内在兴趣或对学习价值的认同。这种动机结构在高控制的学习环境（学校和家庭）中尚能维持表面运转，但一旦外部压力减弱或任务难度增大，学习行为就会停滞。',
    coachImplication:
      '教练课的首要目标是帮助学生建立"学习可以是有趣/有意义的"体验——在动机系统内外皆空的状况下，任何学业干预都会事倍功半。建议从以下顺序入手：1）通过具体的小成功建立胜任感（"我能做到"），2）在安全环境中给学生选择权（"我自己决定的"），3）帮助学生找到学习内容与个人兴趣或生活目标的连接（"这对我有意义"）。当这三个心理需求被重新满足时，内在动机才有可能恢复。',
    severity: 'medium',
    predicate: (dims) => {
      const m1 = isNonGreen(dims, 'M1')
      const m2 = isNonGreen(dims, 'M2')
      const m3 = isNonGreen(dims, 'M3')
      const triggered = m1 && m2 && m3
      return { triggered, dimensions: triggered ? ['M1', 'M2', 'M3'] : [] }
    },
  },
  {
    id: 'anxiety-low-efficacy',
    name: '高焦虑低效能模式',
    description:
      '学生的学习情感体验严重负面（M8=RED），同时伴随消极归因倾向（D1=YELLOW/RED）或自我妨碍行为（M6=YELLOW/RED）。这构成了一个自我强化的焦虑-低效能循环：学习引发负面情绪（焦虑、烦躁、厌倦）→学生通过消极归因或自我妨碍来保护自尊→这些策略反过来恶化学习结果→进一步确认"我不行"的信念→学习引发更强的负面情绪。',
    coachImplication:
      '情绪调节应先于学业干预。在教练课中，学生的焦虑信号（回避、自我贬低、躯体紧张）是需要首先关注的靶点——在学生情绪高度紧张的状态下，任何认知层面的干预（策略教学、归因训练）都会被情绪防御过滤掉。建议：1）建立安全的教练关系——让学生体验到"在这里做错题没关系"，2）引入简单的情绪调节技术（深呼吸、情绪命名、暂停信号），3）在学生情绪平稳时再进行认知层面的干预。',
    severity: 'high',
    predicate: (dims) => {
      const m8 = sig(dims, 'M8')
      if (m8 !== 'RED') return { triggered: false, dimensions: [] }
      const d1 = isNonGreen(dims, 'D1')
      const m6 = isNonGreen(dims, 'M6')
      if (d1 || m6) {
        const involved: string[] = ['M8']
        if (d1) involved.push('D1')
        if (m6) involved.push('M6')
        return { triggered: true, dimensions: involved }
      }
      return { triggered: false, dimensions: [] }
    },
  },
  {
    id: 'parent-child-tension',
    name: '亲子关系紧张影响学习',
    description:
      '亲子关系质量（R4）和家长自主支持（R3）均需关注，同时学生也表现出负面的学习情感体验（M8）或高心理成本（M4）。这三个维度的共变提示：学习困难可能不仅仅是学生个人能力或动机的问题，而是嵌套在家庭互动模式中的系统性困境——亲子之间围绕学习形成了"催促-回避-冲突-更多催促"的恶性循环，学习变成了亲子关系的战场。',
    coachImplication:
      '在处理该学生的学业问题之前，建议先与家长进行一次单独沟通。沟通重点：1）传递"关系优先于成绩"的理念，2）帮助家长看到亲子互动模式可能如何无意中维持了孩子的学习困难，3）提供具体的"关系降温"建议（如让另一位家人短期接管学习管理、设定"不谈学习"的时间段）。在教练课中，也需要关注学生谈及父母时的情绪反应。',
    severity: 'high',
    predicate: (dims) => {
      const r4 = isNonGreen(dims, 'R4')
      const r3 = isNonGreen(dims, 'R3')
      if (!r4 || !r3) return { triggered: false, dimensions: [] }
      const m8 = isNonGreen(dims, 'M8')
      const m4 = isNonGreen(dims, 'M4')
      if (m8 || m4) {
        const involved: string[] = ['R4', 'R3']
        if (m8) involved.push('M8')
        if (m4) involved.push('M4')
        return { triggered: true, dimensions: involved }
      }
      return { triggered: false, dimensions: [] }
    },
  },
  {
    id: 'peer-isolation',
    name: '同伴系统脆弱',
    description:
      '学生的同伴系统信号为红色（缺乏学业同伴支持或存在同伴关系困难），同时学习情感体验负面（M8）或兴趣发展低迷（M7）。同伴关系在青少年阶段是核心的心理支持来源——当学校环境中既没有内在的学习动力（没兴趣、没动力），也没有社会动力（没学习伙伴、缺乏归属感）时，学习变成一件极孤独的事。',
    coachImplication:
      '在教练课中需要了解学生的社交处境——有没有朋友？课间是一个人待着还是和别人在一起？如果孤立的根源是社交技能不足，可以考虑在教练课中融入社交技能训练；如果是由班级氛围或同伴文化导致（如排斥、孤立），则需要与学校和家长协调。教练课本身也可以部分充当"学习伙伴"的角色——在教练课中创造合作和讨论的安全空间。',
    severity: 'medium',
    predicate: (dims) => {
      const r5r6 = sig(dims, 'R5-R6')
      if (r5r6 !== 'RED') return { triggered: false, dimensions: [] }
      const m8 = isNonGreen(dims, 'M8')
      const m7 = isNonGreen(dims, 'M7')
      if (m8 || m7) {
        const involved: string[] = ['R5-R6']
        if (m8) involved.push('M8')
        if (m7) involved.push('M7')
        return { triggered: true, dimensions: involved }
      }
      return { triggered: false, dimensions: [] }
    },
  },
]

export function detectPatterns(dimensions: DimensionSignal[]): PatternRule[] {
  const patterns: PatternRule[] = []
  for (const rule of RULES) {
    const result = rule.predicate(dimensions)
    if (result.triggered) {
      patterns.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        coachImplication: rule.coachImplication,
        severity: rule.severity,
        triggeredDimensions: result.dimensions,
      })
    }
  }
  return patterns
}
