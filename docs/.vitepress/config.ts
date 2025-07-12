import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Java 全栈学习文档",
  description: "一份涵盖Java核心、主流框架、数据库、中间件及 DevOps 的学习笔记。",
  
  // 移除 base 设置，避免路径重复
  // base: '/docs/',
  
  // 添加 vite 配置来处理路径别名
  vite: {
    resolve: {
      alias: {
        '/docs/public': '/public'
      }
    }
  },
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '技术总览', link: '/overview' },
      { text: 'Java', link: '/java/introduction' }
    ],

    sidebar: {
      '/java/': [
        {
          text: 'Java 核心编程',
          items: [
            { text: '技术体系概览', link: '/java/introduction' }
          ]
        },
        {
          text: 'JVM 深度探索',
          items: [
            { text: 'JVM 内存结构', link: '/java/jvm/jvm-memory-structure' },
            { text: '对象创建与内存布局', link: '/java/jvm/object-creation-and-memory-layout' },
            { text: '类加载过程', link: '/java/jvm/class-loading-process' }
          ]
        },
        {
          text: 'Java 并发编程',
          items: [
            { text: '线程生命周期与状态', link: '/java/concurrent/thread-lifecycle-and-states' },
            { text: 'volatile 关键字深度解析', link: '/java/concurrent/volatile-keyword-deep-dive' },
            { text: 'Java 内存模型 (JMM)', link: '/java/concurrent/jmm-deep-dive' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
}) 