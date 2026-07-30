import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
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
