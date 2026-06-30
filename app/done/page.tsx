import Link from 'next/link'

export default function DonePage() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">提交成功</h1>
      <p className="text-gray-500 mb-8">感谢你的填答！你的回答已经安全保存。</p>
      <Link
        href="/"
        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
