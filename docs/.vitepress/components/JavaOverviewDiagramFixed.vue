<template>
  <SimpleMermaidFixed :code="diagramCode" />
</template>

<script setup>
import SimpleMermaidFixed from './SimpleMermaidFixed.vue'

const diagramCode = `graph TD
    A[Java 全栈开发者] --> B[第一阶段: Java 核心]
    A --> C[第二阶段: 主流框架]
    A --> D[第三阶段: 数据存储]
    A --> E[第四阶段: 分布式组件]
    A --> F[第五阶段: 工程化]

    B --> B1[语言基础 & OOP]
    B --> B2[并发编程]
    B --> B3[JVM 虚拟机]

    C --> C1[Spring 全家桶]
    C --> C2[MyBatis]
    C --> C3[Netty]

    D --> D1[MySQL / PostgreSQL]
    D --> D2[Redis]
    D --> D3[MongoDB]

    E --> E1[消息队列 MQ]
    E --> E2[搜索引擎]
    E --> E3[微服务架构]

    F --> F1[Git]
    F --> F2[Maven / Gradle]
    F --> F3[Docker / K8s]
    F --> F4[CI/CD]

    style A fill:#ff6b6b,stroke:#333,stroke-width:3px,color:#fff
    style B fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style C fill:#45b7d1,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#96ceb4,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#ffeaa7,stroke:#333,stroke-width:2px,color:#333
    style F fill:#dda0dd,stroke:#333,stroke-width:2px,color:#333`
</script> 