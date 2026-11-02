import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const proxy={
 '/news-feed':{target:'https://news.google.com',changeOrigin:true,secure:true,rewrite:()=>'/rss?hl=ko&gl=KR&ceid=KR:ko',proxyTimeout:12000,timeout:15000},
 '/api':{target:'http://localhost:8091',changeOrigin:true},
}
export default defineConfig({plugins:[react()],server:{host:'127.0.0.1',port:5181,strictPort:true,proxy},preview:{host:'127.0.0.1',port:4181,strictPort:true,proxy}})
