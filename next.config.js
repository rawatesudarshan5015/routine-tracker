/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds to speed them up
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow builds with type errors (will fail on Vercel if real errors)
    tsconfigPath: './tsconfig.json',
  },
}

module.exports = nextConfig
