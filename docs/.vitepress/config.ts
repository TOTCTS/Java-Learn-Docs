import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Java 全栈学习文档",
  description: "一份涵盖Java核心、主流框架、数据库、中间件及 DevOps 的学习笔记。",
  
  // 主题配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '技术总览', link: '/overview' },
      { text: 'Java', link: '/java/introduction' }
    ],

    sidebar: {
      '/java/': [
        {
          text: 'Java 基础',
          items: [
            { text: '简介', link: '/java/introduction' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
}) 