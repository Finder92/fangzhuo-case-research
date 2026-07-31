import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages 通过 /仓库名/ 提供页面，发布时由环境变量传入该前缀。
  base: process.env.VITE_DEPLOY_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^element-plus$/,
        replacement: fileURLToPath(new URL('./node_modules/element-plus/lib/index.js', import.meta.url)),
      },
    ],
  },
})
