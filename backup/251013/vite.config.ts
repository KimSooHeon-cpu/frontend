import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'   // [251013] 추가: 절대경로 alias 지정 시 필요

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    global: {},// ✅ Summernote 내부에서 global 객체 필요
    'global.setImmediate': 'setTimeout',  // [251013] 이게 없으면 이미지 툴바 동작, 에디터 focus, HTML 변환이 전부 비정상 작동
  },

  // 반드시 추가 : https://ko.vite.dev/config/server-options
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8181/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/images": {
      target: "http://localhost:8181/",   // ✅ 백엔드 서버로 연결
      changeOrigin: true,                 // ✅ 호스트 헤더도 백엔드 기준으로 변경
      },
    },
  },

  // [250929] 추가: React Router 새로고침 대응
  /*
  resolve: {
    alias: {},
  },
  build: {
    rollupOptions: {
      input: "index.html",
    },
  }
  */
  // [251013] React Router 새로고침 대응 + alias + jQuery/Bootstrap 사전 번들링
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"), // 절대경로 import용
    },
  },
  //* 터미널에서 해당 명령어 실행 npm install --save-dev @types/node --legacy-peer-deps

  // [251013] Summernote 호환용: jQuery/Bootstrap 사전 번들링
  optimizeDeps: {
    include: ["jquery", "bootstrap"],
  },

  build: {
    rollupOptions: {
      input: "index.html",
    },
  }
  
})