// 6位编号：混合字母+数字，排除易混淆字符 0/O、1/I/L
const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const DIGITS = '23456789'

export function generateCode(): string {
  const arr = new Uint32Array(6)
  crypto.getRandomValues(arr)
  const code = Array.from(arr, (n, i) => {
    // 前3位字母，后3位数字
    if (i < 3) return LETTERS[n % LETTERS.length]
    return DIGITS[n % DIGITS.length]
  })
  // 随机打乱顺序，确保结构不固定
  for (let i = code.length - 1; i > 0; i--) {
    const j = (arr[i] * (i + 1)) % code.length
    ;[code[i], code[j]] = [code[j], code[i]]
  }
  return code.join('')
}
