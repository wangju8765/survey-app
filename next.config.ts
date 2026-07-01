import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/survey-app' : '',
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
