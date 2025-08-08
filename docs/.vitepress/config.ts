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

  // 忽略构建期死链（后续修复各模块链接时再开启）
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '技术总览', link: '/overview' },
      { text: 'Java', link: '/java/introduction' },
      { text: 'Spring', link: '/spring/introduction' },
      { text: '数据库', link: '/database/introduction' },
      { text: '微服务', link: '/microservices/introduction' },
      { text: 'MQ', link: '/mq/introduction' },
      { text: 'DevOps', link: '/devops/introduction' }
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
            { text: '类加载过程', link: '/java/jvm/class-loading-process' },
            { text: '内存泄漏与内存溢出的诊断与解决', link: '/java/jvm/memory-leak-and-oom-diagnosis' }
          ]
        },
        {
          text: 'Java 并发编程',
          items: [
            { text: '线程生命周期与状态', link: '/java/concurrent/thread-lifecycle-and-states' },
            { text: 'volatile 关键字深度解析', link: '/java/concurrent/volatile-keyword-deep-dive' },
            { text: 'Java 内存模型 (JMM)', link: '/java/concurrent/jmm-deep-dive' },
            { text: '线程池：ThreadPoolExecutor 与 ForkJoinPool', link: '/java/concurrent/threadpoolexecutor-and-forkjoinpool-deep-dive' }
          ]
        }
      ],
      '/spring/': [
        {
          text: 'Spring 体系',
          items: [
            { text: '技术体系概览', link: '/spring/introduction' }
          ]
        }
      ],
      '/database/': [
        {
          text: '数据存储',
          items: [
            { text: '技术体系概览', link: '/database/introduction' },
            { text: '数据建模与范式', link: '/database/data-modeling-and-normalization' },
            { text: 'SQL 基础', link: '/database/sql-basics-select-join-subquery-aggregation-window' },
            { text: '事务与隔离级别', link: '/database/transactions-and-isolation-levels' },
            { text: '索引结构与策略', link: '/database/index-structures-and-strategies' },
            { text: '查询优化', link: '/database/query-optimization-explain-and-statistics' },
            { text: '慢查询分析与治理', link: '/database/slow-query-analysis-and-governance' }
          ]
        }
      ],
      '/microservices/': [
        {
          text: '微服务生态',
          items: [
            { text: '技术体系概览', link: '/microservices/introduction' }
          ]
        }
      ],
      '/devops/': [
        {
          text: '工程化与 DevOps',
          items: [
            { text: '技术体系概览', link: '/devops/introduction' }
          ]
        }
      ],
      '/mq/': [
        {
          text: '消息队列 (MQ)',
          items: [
            { text: '技术体系概览', link: '/mq/introduction' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
}) 