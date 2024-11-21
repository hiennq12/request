import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { crx } from '@crxjs/vite-plugin';  // Plugin cần thiết cho Chrome Extension
import manifest from './manifest.json';  // Đảm bảo rằng manifest.json của bạn có sẵn ở thư mục gốc
// import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // monacoEditorPlugin({}),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: 'index.html'  // Entry point của extension
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
