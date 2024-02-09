/** @type {import('next').NextConfig} */
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

const NextConfig = {
  ...withNextra(),
  output: "standalone",
  experimental: {
    serverActions: true,
  },
}

module.exports = NextConfig
