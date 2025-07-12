# Java 技术体系学习大纲
  
## 学习路径概览

Java 技术栈庞大而深入，从语言核心到企业级应用开发，本学习路径将为您提供系统化的知识体系。

<div style="text-align: center; margin: 20px 0; padding: 20px; background: #fafbfc; border: 1px solid #e1e5e9; border-radius: 8px;">
  <h3 style="margin-bottom: 15px; color: #333;">Java 全栈技术学习路径</h3>
  <img src="/public/assets/java-overview-diagram.svg" alt="Java 全栈开发学习路径" style="max-width: 100%; height: auto; border-radius: 4px;" />
</div>

---

## 各模块介绍

### 1. [Java 核心与基础](/docs/java/introduction)
**定位**：语言基础与虚拟机原理。
**核心内容**：Java SE (OOP, 集合, 并发)、JVM (内存模型, GC)、构建工具 (Maven, Gradle)。
本模块将带您深入 Java 的世界，从语言的底层机制到强大的并发处理，再到 JVM 的性能奥秘。掌握这些是成为一名优秀 Java 工程师的坚实一步，也是理解上层框架设计思想的前提。

### 2. [后端框架](/spring/introduction) (待撰写)
**定位**：应用开发与业务实现。
**核心内容**：Spring (IoC, AOP)、Spring Boot、Spring MVC/WebFlux、Spring Data、Spring Security、MyBatis、Netty。
本模块是 Java 企业级应用的核心。我们将解构 Spring 的设计哲学，学习如何利用 Spring Boot 快速构建健壮、可扩展的应用程序，并掌握数据持久化与网络通信的关键技术，从而高效地将业务需求转化为高质量的软件。

### 3. [数据存储](/database/introduction) (待撰写)
**定位**：持久化、缓存与检索方案。
**核心内容**：关系型数据库 (MySQL, PostgreSQL)、缓存 (Redis)、文档数据库 (MongoDB)、搜索引擎 (Elasticsearch)。
任何强大的应用都离不开高效的数据管理。本模块将介绍如何根据业务场景选择最合适的数据存储方案——从传统的关系型数据库，到用于提升性能的分布式缓存，再到灵活的 NoSQL 数据库和强大的全文搜索引擎。

### 4. [微服务生态](/microservices/introduction) (待撰写)
**定位**：分布式系统架构与治理。
**核心内容**：Spring Cloud (Nacos, Gateway, OpenFeign)、消息队列 (RabbitMQ, Kafka)、RPC 框架 (Dubbo)、分布式追踪 (SkyWalking)。
本模块将带您进入大规模分布式系统的世界。我们将学习如何利用 Spring Cloud 全家桶和各类中间件，构建一个高内聚、松耦合的微服务架构，解决服务治理、系统通信、链路监控等一系列复杂挑战，确保系统在规模化时依然稳定可靠。

### 5. [工程化与 DevOps](/devops/introduction) (待撰写)
**定位**：软件交付与运维自动化。
**核心内容**：版本控制 (Git)、CI/CD (Jenkins)、容器化 (Docker, Kubernetes)、监控 (Prometheus, Grafana)。
“代码写完只是开始”。本模块聚焦于软件开发的全生命周期管理，介绍如何通过版本控制、自动化构建与部署、容器化以及全方位的监控，建立一套高效、可靠的 DevOps 流程，实现从代码到产品的快速、高质量交付。 