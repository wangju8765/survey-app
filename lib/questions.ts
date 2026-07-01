export interface Question {
  id: string
  type: 'radio' | 'checkbox' | 'textarea'
  text: string
  options?: { value: string; label: string }[]
  required?: boolean
  hasOther?: boolean
}

export interface SurveyPart {
  title: string
  questions: Question[]
}

export interface SurveyConfig {
  title: string
  subtitle: string
  intro: string
  parts: SurveyPart[]
}

// ========== 学生问卷 ==========

export const studentSurvey: SurveyConfig = {
  title: '学生问卷',
  subtitle: '小王老师教练课 · 学习状态调查',
  intro: '下面有一些问题，选最像你的那个选项就行。没有对错，你选了哪个就是哪个。如果你觉得哪个都不太像，选最接近的。标有"其他"的选项，可以自己写。',
  parts: [
    {
      title: '第一部分：学习中的感觉',
      questions: [
        {
          id: 'q1',
          type: 'radio',
          text: '1. 最近一个月，你在学校上课时大多数时候是什么感觉？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '大部分课都挺有意思，我想知道更多' },
            { value: 'B', label: '有些课有意思，有些课很无聊' },
            { value: 'C', label: '上课主要是为了考试，谈不上有意思没意思' },
            { value: 'D', label: '大部分课我都不太听得进去' },
            { value: 'E', label: '我经常觉得很烦，不想听' },
          ],
        },
        {
          id: 'q2',
          type: 'radio',
          text: '2. 老师布置了一道你没见过的新题——你的第一反应通常是？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '觉得有挑战，想试试能不能做出来' },
            { value: 'B', label: '有点紧张，但仔细看应该能做' },
            { value: 'C', label: '先看看别人做不做得出来' },
            { value: 'D', label: '觉得我可能做不对' },
            { value: 'E', label: '不想做，直接等老师讲' },
          ],
        },
        {
          id: 'q3',
          type: 'radio',
          text: '3. 做错了题的时候，你的第一反应通常是？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '想"哪里出问题了"，然后找原因' },
            { value: 'B', label: '想"果然又错了"，不太想再看' },
            { value: 'C', label: '觉得很难受，不想继续做了' },
            { value: 'D', label: '无所谓，错就错了' },
          ],
        },
        {
          id: 'q4',
          type: 'radio',
          text: '4. 做对了题的时候，你的感觉通常是？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '觉得是我努力/方法对了的结果' },
            { value: 'B', label: '觉得是运气好，或者这次题不难' },
            { value: 'C', label: '挺高兴的，但不会想太多' },
            { value: 'D', label: '没什么特别感觉' },
          ],
        },
        {
          id: 'q5',
          type: 'radio',
          text: '5. 你做完一道数学题之后，能不能说清楚"我是怎么做出这道题的"？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '基本都能说清楚自己的每一步思路' },
            { value: 'B', label: '有时候能说清楚，有时候说不太清' },
            { value: 'C', label: '大概知道怎么做的，但具体说不上来' },
            { value: 'D', label: '做出来就做出来了，没想过"怎么做的"' },
            { value: 'E', label: '经常做出来也不知道自己怎么做的' },
          ],
        },
        {
          id: 'q6',
          type: 'checkbox',
          text: '6. 当你做一道题被卡住了，你通常会怎么做？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '自己再想想，换一个方法试试' },
            { value: 'B', label: '翻课本或笔记' },
            { value: 'C', label: '问同学' },
            { value: 'D', label: '问老师或家长' },
            { value: 'E', label: '先跳过去，过一会儿再回来' },
            { value: 'F', label: '不想做了' },
            { value: 'G', label: '看一下别人的答案' },
            { value: 'H', label: '上网搜答案' },
          ],
        },
        {
          id: 'q7',
          type: 'radio',
          text: '7. 关于"计划"，哪句话最像你？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我一般会提前想好今晚学什么、先做什么后做什么' },
            { value: 'B', label: '我大概知道要做什么，但不一定按计划来' },
            { value: 'C', label: '看当天有什么作业就做什么' },
            { value: 'D', label: '基本不计划，想到什么做什么' },
            { value: 'E', label: '我不知道怎么计划' },
          ],
        },
        {
          id: 'q8',
          type: 'radio',
          text: '8. 在课堂上老师提问让大家举手回答——你通常会？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '经常举手，不管对不对' },
            { value: 'B', label: '有把握的时候才举手' },
            { value: 'C', label: '很少举手，但心里会想答案' },
            { value: 'D', label: '不想被叫到，最好别问我' },
          ],
        },
        {
          id: 'q9',
          type: 'radio',
          text: '9. 你觉得班里同学是怎么看"学习好"这件事的？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '班里挺多人觉得学习好是件厉害的事' },
            { value: 'B', label: '有些同学在意，有些无所谓' },
            { value: 'C', label: '学习好的人经常被说"卷"或者"书呆子"' },
            { value: 'D', label: '班里不太讨论学习这件事' },
            { value: 'E', label: '没注意过' },
          ],
        },
        {
          id: 'q10',
          type: 'radio',
          text: '10. 这学期，在学校有没有可以一起讨论功课的同学？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '有，经常一起讨论' },
            { value: 'B', label: '有一两个可以问的' },
            { value: 'C', label: '有，但不太想找他们' },
            { value: 'D', label: '没有可以讨论功课的同学' },
          ],
        },
      ],
    },
    {
      title: '第二部分：学习中的行动',
      questions: [
        {
          id: 'q20',
          type: 'radio',
          text: '11. 写作业之前，你能马上开始动笔吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '说开始就能开始，不用别人催' },
            { value: 'B', label: '有时候要想一会儿才开始' },
            { value: 'C', label: '经常要拖一会儿，但最后还是能开始' },
            { value: 'D', label: '要反复催才能开始' },
            { value: 'E', label: '很难开始，经常拖着不做' },
          ],
        },
        {
          id: 'q21',
          type: 'radio',
          text: '12. 做作业的时候，你能一口气做完不跑神吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '基本能做到底，不太分心' },
            { value: 'B', label: '偶尔会跑神，但能自己拉回来' },
            { value: 'C', label: '经常跑神，需要提醒才能回来' },
            { value: 'D', label: '很难集中，做一会儿就做别的去了' },
            { value: 'E', label: '我也不知道我在干什么' },
          ],
        },
        {
          id: 'q22',
          type: 'radio',
          text: '13. 老师说了好几件要做的事（比如"先做第5页，再预习第6课，明天带练习册"），你能都记住吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '基本都能记住，不用别人提醒' },
            { value: 'B', label: '能记住大部分，偶尔忘一两件' },
            { value: 'C', label: '经常忘掉一部分' },
            { value: 'D', label: '基本记不住，需要别人再说一遍' },
          ],
        },
        {
          id: 'q23',
          type: 'radio',
          text: '14. 一道题用这个方法做不出来——你会换别的方法试试吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '会，我会主动想别的办法' },
            { value: 'B', label: '有时候会，有时候就一直卡着' },
            { value: 'C', label: '不太会换方法，就卡在那里' },
            { value: 'D', label: '做不出来就算了，不想再试' },
          ],
        },
        {
          id: 'q24',
          type: 'radio',
          text: '15. 做不出来题的时候，你会越来越着急/越来越烦吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '不会，我能让自己平静下来再试' },
            { value: 'B', label: '有一点着急，但还能控制' },
            { value: 'C', label: '会挺着急的，影响继续做' },
            { value: 'D', label: '会特别烦躁，完全做不下去了' },
            { value: 'E', label: '我直接就不做了' },
          ],
        },
        {
          id: 'q27',
          type: 'radio',
          text: '16. 做一道有点难的新题时，你需要别人帮忙吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我一般能自己搞定' },
            { value: 'B', label: '大多数时候能自己搞定，偶尔需要一点提示' },
            { value: 'C', label: '需要别人给一些提示才能做' },
            { value: 'D', label: '基本需要别人一步步教' },
            { value: 'E', label: '完全需要别人帮忙' },
          ],
        },
        {
          id: 'q28',
          type: 'radio',
          text: '17. 上周学过的东西，这周你还记得多少？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '大部分都记得，而且能用出来' },
            { value: 'B', label: '记得一部分，有些忘了' },
            { value: 'C', label: '记得一些，但说不清楚' },
            { value: 'D', label: '基本忘光了' },
          ],
        },
      ],
    },
    {
      title: '第三部分：驱动力与兴趣',
      questions: [
        {
          id: 'q11',
          type: 'radio',
          text: '18. 你觉得自己现在学习，主要是因为什么？（选最接近的一个）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '学的东西本身有意思，我想搞懂' },
            { value: 'B', label: '我知道学好这些对我以后有用' },
            { value: 'C', label: '考不好会很丢脸/会让爸妈失望' },
            { value: 'D', label: '不学会被爸妈说/被老师批评' },
            { value: 'E', label: '说实话我不太清楚为什么要学' },
          ],
        },
        {
          id: 'q12',
          type: 'radio',
          text: '19. 关于"怎么学"，下面哪句话最像你的情况？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我基本上能决定自己怎么学、先学什么' },
            { value: 'B', label: '大部分时候是爸妈或老师安排，但我偶尔自己决定' },
            { value: 'C', label: '基本是爸妈或老师安排好的' },
            { value: 'D', label: '没想过这个问题' },
          ],
        },
        {
          id: 'q13',
          type: 'checkbox',
          text: '20. 下面哪些让你觉得学习"值得做"？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '学的过程本身就有意思' },
            { value: 'B', label: '学好了让我觉得自己挺厉害的' },
            { value: 'C', label: '学好了对以后考学/找工作有用' },
            { value: 'D', label: '不学的话爸妈会不高兴' },
            { value: 'E', label: '说不上来' },
          ],
        },
        {
          id: 'q29',
          type: 'radio',
          text: '21. 最近有没有哪门课或哪个话题，让你觉得越来越有意思了？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '有，我发现自己越来越想了解，还会主动去学' },
            { value: 'B', label: '有，觉得比以前有意思了，但还没主动多学' },
            { value: 'C', label: '有一点点兴趣，但说不上来' },
            { value: 'D', label: '没什么特别感兴趣的' },
            { value: 'E', label: '最近对学习越来越没兴趣' },
          ],
        },
        {
          id: 'q30',
          type: 'radio',
          text: '22. 课下（不是作业要求）你会自己去学你感兴趣的东西吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '经常，我会自己查资料、看书或看视频去了解' },
            { value: 'B', label: '有时候会，偶尔会主动去了解一下' },
            { value: 'C', label: '很少，除非作业要求' },
            { value: 'D', label: '不会，课下不想碰和学习有关的东西' },
          ],
        },
      ],
    },
    {
      title: '第四部分：自我认识与反思',
      questions: [
        {
          id: 'q14',
          type: 'radio',
          text: '23. 以下哪种描述最接近你对自己的看法？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我以前不太行，但最近在慢慢变好' },
            { value: 'B', label: '我一直都还不错' },
            { value: 'C', label: '我就是不太擅长学习的人' },
            { value: 'D', label: '我也不知道自己算哪种' },
            { value: 'E', label: '我对这个不太在意' },
          ],
        },
        {
          id: 'q15',
          type: 'radio',
          text: '24. 如果你很认真复习了，结果还是考得不好——你会怎么想？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '可能是我复习的方法不太对，下次换个方法' },
            { value: 'B', label: '可能是我还不够努力' },
            { value: 'C', label: '会很难受，觉得自己是不是真的不行' },
            { value: 'D', label: '无所谓，一次考不好没什么' },
          ],
        },
        {
          id: 'q16',
          type: 'radio',
          text: '25. 你想象一下几年后的自己——下面哪句话更接近你的想法？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我能比较清楚地想象自己以后在做什么' },
            { value: 'B', label: '我大概有一些模糊的想法' },
            { value: 'C', label: '我不太想以后的事' },
            { value: 'D', label: '我不知道自己以后能做什么' },
          ],
        },
        {
          id: 'q17',
          type: 'radio',
          text: '26. 在考试之前，下面哪种情况最像你？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '正常复习，心态比较稳' },
            { value: 'B', label: '会紧张，但还是会认真复习' },
            { value: 'C', label: '明知道该复习但拖着不开始，拖到最后才看' },
            { value: 'D', label: '觉得复习了也没用，干脆不怎么复习' },
            { value: 'E', label: '考前会跟别人说"我这次肯定考不好"' },
          ],
        },
        {
          id: 'q25',
          type: 'radio',
          text: '27. 做完一次作业或考完一次试之后，你会想想"我这次做得怎么样？哪里好哪里不好"吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '每次都会想，还会想下次怎么做得更好' },
            { value: 'B', label: '有时候会想一下' },
            { value: 'C', label: '很少想，考完就完了' },
            { value: 'D', label: '完全不想，过去就过去了' },
          ],
        },
        {
          id: 'q26',
          type: 'radio',
          text: '28. 这次没考好——你接下来会怎么做？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '想想哪里出问题了，换个方法准备下次' },
            { value: 'B', label: '再多花点时间复习同样的内容' },
            { value: 'C', label: '会难过一阵子，但还是会继续学' },
            { value: 'D', label: '觉得自己怎么学都没用，不太想再努力了' },
            { value: 'E', label: '不在意，考不好就考不好' },
          ],
        },
      ],
    },
    {
      title: '第五部分：开放题（选填）',
      questions: [
        {
          id: 'q18',
          type: 'textarea',
          text: '29. 说一件最近让你觉得"我还挺厉害的"的事（不一定是学习方面的）。',
          required: false,
        },
        {
          id: 'q19',
          type: 'textarea',
          text: '30. 你希望这学期的教练课上，我们能一起做什么？',
          required: false,
        },
      ],
    },
  ],
}

// ========== 家长问卷 ==========

export const parentSurvey: SurveyConfig = {
  title: '家长问卷',
  subtitle: '小王老师教练课 · 学习状态调查',
  intro: '感谢您花时间填写这份问卷。它不是考试，没有正确答案。您的每一个回答都在帮助我们更准确地理解孩子的情况，从而提供更有效的支持。请根据最近一个月的实际情况选择最接近的选项。标有"其他"的选项，可以补充您认为重要的情况。',
  parts: [
    {
      title: '第一部分：学习行为观察',
      questions: [
        {
          id: 'q1',
          type: 'radio',
          text: '1. 孩子在家做作业时，通常是什么状态？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '基本能自己规划时间、独立完成' },
            { value: 'B', label: '需要提醒一两次，但提醒后能自己做完' },
            { value: 'C', label: '需要反复提醒和监督' },
            { value: 'D', label: '经常拖延、抗拒，需要大人坐在旁边才行' },
            { value: 'E', label: '基本不愿意做，每天都在拉锯' },
          ],
        },
        {
          id: 'q2',
          type: 'radio',
          text: '2. 孩子做完一道题或一项作业后，会主动检查吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '基本都会自己检查一遍' },
            { value: 'B', label: '有时候会，有时候不会' },
            { value: 'C', label: '需要提醒才肯检查' },
            { value: 'D', label: '提醒了也不检查，或者敷衍了事' },
            { value: 'E', label: '没注意过' },
          ],
        },
        {
          id: 'q3',
          type: 'checkbox',
          text: '3. 孩子遇到不会做的题时，通常的反应是？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '自己先想一会儿，尝试用不同的方法' },
            { value: 'B', label: '翻书或笔记找相关的内容' },
            { value: 'C', label: '直接喊人帮忙' },
            { value: 'D', label: '烦躁、发脾气或者干脆不做了' },
            { value: 'E', label: '发呆或做别的，不主动求助' },
          ],
        },
        {
          id: 'q4',
          type: 'radio',
          text: '4. 孩子跟你聊学校或学习的事吗？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '经常主动跟我说' },
            { value: 'B', label: '偶尔说，我问的时候会说一些' },
            { value: 'C', label: '我问了才说几句' },
            { value: 'D', label: '基本不说，问了也回避' },
          ],
        },
      ],
    },
    {
      title: '第二部分：亲子互动中的学习支持',
      questions: [
        {
          id: 'q5',
          type: 'radio',
          text: '5. 关于孩子的作业，以下哪种描述最接近您的情况？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '我知道他在做什么，但基本让他自己管' },
            { value: 'B', label: '我会在他需要的时候提供帮助' },
            { value: 'C', label: '我会检查他的作业，指出需要改的地方' },
            { value: 'D', label: '我基本陪着他做，不然他不做或做不完' },
            { value: 'E', label: '作业的事主要是家里其他人在管' },
          ],
        },
        {
          id: 'q6',
          type: 'checkbox',
          text: '6. 孩子考得不好时，您通常会说什么？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '"我们看看哪里出了问题，下次怎么调整"' },
            { value: 'B', label: '"没事，下次努力就行"' },
            { value: 'C', label: '"你最近是不是不够认真？"' },
            { value: 'D', label: '"你看 xxx 怎么就能考好？"' },
            { value: 'E', label: '"考不好就别想xxx了"' },
            { value: 'F', label: '基本上不说话，或者叹气，或者我很失望但没说' },
          ],
        },
        {
          id: 'q7',
          type: 'radio',
          text: '7. 您觉得您和孩子的亲子关系怎么样？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '挺好的，我们之间有信任，孩子愿意跟我说心里话' },
            { value: 'B', label: '大部分时候还可以，但有时会吵架' },
            { value: 'C', label: '经常因为学习的事起冲突' },
            { value: 'D', label: '现在关系比较紧张，不知道怎么办' },
          ],
        },
      ],
    },
    {
      title: '第三部分：对孩子学习问题的理解',
      questions: [
        {
          id: 'q8',
          type: 'checkbox',
          text: '8. 您觉得孩子学习上最大的困难是什么？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '注意力不集中，容易分心' },
            { value: 'B', label: '拖拉，没有时间观念' },
            { value: 'C', label: '遇到难题容易放弃' },
            { value: 'D', label: '对学习没什么兴趣' },
            { value: 'E', label: '学习方法不对' },
            { value: 'F', label: '基础太差，跟不上' },
            { value: 'G', label: '情绪问题（焦虑、没自信）' },
            { value: 'H', label: '不知道他在想什么' },
          ],
        },
        {
          id: 'q9',
          type: 'radio',
          text: '9. 以下哪句话最接近您对孩子学习能力的看法？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '孩子挺聪明的，就是不用功' },
            { value: 'B', label: '孩子不算很聪明，但是肯努力' },
            { value: 'C', label: '孩子能力和努力都还行' },
            { value: 'D', label: '孩子能力一般，努力程度也一般' },
            { value: 'E', label: '我觉得学习的事主要还是看孩子自己' },
          ],
        },
      ],
    },
    {
      title: '第四部分：生理基础（睡眠/屏幕/运动）',
      questions: [
        {
          id: 'q10',
          type: 'radio',
          text: '10. 孩子上学日每天大概睡多长时间？',
          required: true,
          options: [
            { value: 'A', label: '9 小时及以上' },
            { value: 'B', label: '8-9 小时' },
            { value: 'C', label: '7-8 小时' },
            { value: 'D', label: '6-7 小时' },
            { value: 'E', label: '不到 6 小时' },
          ],
        },
        {
          id: 'q11',
          type: 'radio',
          text: '11. 孩子上学日每天娱乐屏幕（游戏/短视频/社交媒体）大概多长时间？',
          required: true,
          options: [
            { value: 'A', label: '不到半小时' },
            { value: 'B', label: '半小时到 1 小时' },
            { value: 'C', label: '1-2 小时' },
            { value: 'D', label: '2-3 小时' },
            { value: 'E', label: '3 小时以上' },
          ],
        },
        {
          id: 'q12',
          type: 'radio',
          text: '12. 孩子每周有几天能进行让身体热起来的活动（体育课不算）？',
          required: true,
          options: [
            { value: 'A', label: '几乎每天' },
            { value: 'B', label: '3-4 天' },
            { value: 'C', label: '1-2 天' },
            { value: 'D', label: '几乎没有' },
          ],
        },
      ],
    },
    {
      title: '第五部分：开放题（选填）',
      questions: [
        {
          id: 'q13',
          type: 'textarea',
          text: '13. 您希望这学期的教练课帮孩子解决的最重要的一件事是什么？',
          required: false,
        },
        {
          id: 'q14',
          type: 'textarea',
          text: '14. 您觉得我们（教练）最需要了解孩子的哪方面？',
          required: false,
        },
      ],
    },
  ],
}

// ========== 教师问卷 ==========

export const teacherSurvey: SurveyConfig = {
  title: '教师问卷',
  subtitle: '小王老师教练课 · 学习状态调查',
  intro: '感谢您在百忙中填答。这份简短的问卷旨在帮助孩子的学习教练更准确地了解他在学校的真实表现。您的观察是我们无法从其他渠道获得的一手信息。每题请根据该生在班级中的实际表现选择。标有"其他"的选项，可以补充您认为重要的情况。',
  parts: [
    {
      title: '',
      questions: [
        {
          id: 'q1',
          type: 'radio',
          text: '1. 该生在课堂上的参与状态，以下哪种描述最接近？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '积极参与，经常举手或主动回应' },
            { value: 'B', label: '注意力基本在线，但很少主动发言' },
            { value: 'C', label: '有时走神，有时参与，不太稳定' },
            { value: 'D', label: '经常走神或做其他事，较难融入课堂' },
            { value: 'E', label: '我对该生的课堂参与印象不深' },
          ],
        },
        {
          id: 'q2',
          type: 'checkbox',
          text: '2. 该生在学习上遇到困难时，通常的反应是？（可以多选）',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '会主动来问问题' },
            { value: 'B', label: '在课堂上被注意到有困难时会回应' },
            { value: 'C', label: '不太主动求助，但单独问的时候能说' },
            { value: 'D', label: '回避困难，或表现出"无所谓"的态度' },
          ],
        },
        {
          id: 'q3',
          type: 'radio',
          text: '3. 该生在班级中的学业水平，大致处于什么位置？',
          required: true,
          options: [
            { value: 'A', label: '班级前 20%' },
            { value: 'B', label: '班级 20%-50%' },
            { value: 'C', label: '班级 50%-80%' },
            { value: 'D', label: '班级后 20%' },
            { value: 'E', label: '不太确定' },
          ],
        },
        {
          id: 'q4',
          type: 'radio',
          text: '4. 该生和同学的关系怎么样？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '和大多数同学关系融洽，有固定的朋友' },
            { value: 'B', label: '有一两个朋友，和大部分同学关系一般' },
            { value: 'C', label: '和同学互动少，比较边缘' },
            { value: 'D', label: '有比较明显的人际困难（被排斥/孤立/冲突频繁）' },
            { value: 'E', label: '不太了解' },
          ],
        },
        {
          id: 'q5',
          type: 'radio',
          text: '5. 如果用一个词来形容该生在学校的状态，您会选择？',
          required: true,
          hasOther: true,
          options: [
            { value: 'A', label: '积极' },
            { value: 'B', label: '平静/稳定' },
            { value: 'C', label: '紧张/焦虑' },
            { value: 'D', label: '退缩/沉默' },
            { value: 'E', label: '对抗/逆反' },
            { value: 'F', label: '很难用一个词概括' },
          ],
        },
        {
          id: 'q6',
          type: 'textarea',
          text: '6. 您觉得该生最大的优势是什么？（选填）',
          required: false,
        },
        {
          id: 'q7',
          type: 'textarea',
          text: '7. 您觉得该生最需要改善的一个方面是什么？（选填）',
          required: false,
        },
      ],
    },
  ],
}
