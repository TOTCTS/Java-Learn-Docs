# Java 核心技术体系大纲

欢迎来到 Java 的世界！本大纲旨在为您提供一个结构化、由浅入深的 Java 技术学习路径，内容覆盖从语言核心、并发模型、虚拟机底层到现代 Java 新特性与核心生态。

您可以将此视为您的学习地图，每个知识点未来都将链接到一篇深度解析的文档。

---

## 第一部分: Java 核心编程 (Core Java Programming)

本模块专注于 Java 语言的内在机制和标准库，是构建一切上层应用的基础。

### 1.1 基础语法与面向对象
- [ ] JDK 安装与环境配置
- [ ] 程序基本结构与 `main` 方法
- [ ] 数据类型、运算符与控制流
- [ ] 面向对象三大特性：封装、继承、多态
- [ ] `abstract` 类与 `interface` 接口的异同
- [ ] `static`, `final` 关键字深度解析
- [ ] `Object` 类的核心方法 (`equals`, `hashCode`, `toString`, `clone`)

### 1.2 核心 API 与异常处理
- [ ] `String`, `StringBuilder`, `StringBuffer` 的原理与应用场景
- [ ] 常用工具类：`Math`, 包装类, 日期时间 API
- [ ] 异常处理机制：`try-catch-finally`, `throw`, `throws`, 受检与非受检异常

### 1.3 集合框架与泛型
- [ ] `Collection` 与 `Map` 接口体系
- [ ] `List` 实现对比：`ArrayList` vs `LinkedList` 源码分析
- [ ] `Set` 实现对比：`HashSet` vs `TreeSet` 源码分析
- [ ] `Map` 实现对比：`HashMap` vs `ConcurrentHashMap` vs `TreeMap` 源码分析
- [ ] 泛型：类型擦除、通配符与边界

### 1.4 I/O 与文件操作
- [ ] 字节流 (`InputStream`/`OutputStream`) 与字符流 (`Reader`/`Writer`)
- [ ] 缓冲流 (`Buffered...`) 与性能提升
- [ ] 文件与目录操作 (`File`, `Paths`, `Files`)
- [ ] NIO (New I/O) 核心概念：`Channel`, `Buffer`, `Selector`

### 1.5 反射机制
- [ ] `Class` 对象的获取与使用
- [ ] 动态创建对象、调用方法、访问字段
- [ ] 反射的应用场景与性能考量

---

## 第二部分: 并发编程 (Concurrent Programming)

本模块深入探讨 Java 的并发模型与工具，这是开发高性能、高并发系统的关键。

### 2.1 线程基础与内存模型
- [x] [线程的创建、状态与生命周期](/docs/java/concurrent/thread-lifecycle-and-states.md)
- [ ] `synchronized` 关键字：用法、原理与锁优化 (偏向锁, 轻量级锁, 重量级锁)
- [x] [`volatile` 关键字：可见性、有序性与 happens-before 原则](/docs/java/concurrent/volatile-keyword-deep-dive.md)
- [x] [Java 内存模型 (JMM) 深度解读](/docs/java/concurrent/jmm-deep-dive.md)

### 2.2 J.U.C 并发包详解
- [ ] `Lock` 体系：`ReentrantLock`, `ReentrantReadWriteLock`
- [ ] 原子类：`AtomicInteger`, `LongAdder` 的原理与性能对比
- [ ] 线程池：`ThreadPoolExecutor` 核心参数、工作流程与拒绝策略
- [ ] 并发工具类：`CountDownLatch`, `CyclicBarrier`, `Semaphore`
- [ ] `ThreadLocal` 原理与内存泄漏风险

### 2.3 异步编程模型
- [ ] `Future` 与 `Callable`
- [ ] `CompletableFuture`：组合式异步编程

---

## 第三部分: JVM 深度探索 (Deep Dive into the JVM)

本模块深入虚拟机底层，揭示 Java 跨平台、自动化内存管理的奥秘。

### 3.1 内存结构与对象生命周期
- [x] [JVM 内存结构 (运行时数据区)](/docs/java/jvm/jvm-memory-structure.md)
- [x] [对象的创建过程、内存布局与访问定位](/docs/java/jvm/object-creation-and-memory-layout.md)
- [ ] TLAB (Thread-Local Allocation Buffer)
- [ ] 逃逸分析与栈上分配

### 3.2 垃圾回收机制
- [ ] GC Roots 与可达性分析算法
- [ ] GC 核心算法：标记-清除, 标记-复制, 标记-整理
- [ ] HotSpot 主流垃圾收集器：Serial, Parallel, CMS, G1, ZGC
- [ ] 分代回收模型与跨代引用问题

### 3.3 类加载与执行引擎
- [x] [类加载过程：加载、链接 (验证, 准备, 解析)、初始化](/docs/java/jvm/class-loading-process.md)
- [ ] 类加载器与双亲委派模型
- [ ] 执行引擎：解释器与 JIT (Just-In-Time) 编译器

### 3.4 性能调优与故障排查
- [ ] JVM 常用参数配置
- [ ] 命令行工具：`jps`, `jstat`, `jmap`, `jstack`
- [ ] 可视化工具：JConsole, VisualVM, MAT
- [ ] OOM 与 StackOverflowError 案例分析

---

## 第四部分: 现代 Java 与生态 (Modern Java & Ecosystem)

本模块关注 Java 的演进方向和核心开发工具，确保技术栈的先进性。

### 4.1 Java 8-21 关键新特性
- [ ] Java 8: Lambda 表达式、Stream API, `Optional`
- [ ] Java 9: 模块化系统 (Project Jigsaw)
- [ ] Java 11: `var` 局部变量类型推断, 新 `String` API
- [ ] Java 17: Records, Sealed Classes, `switch` 表达式增强
- [ ] Java 21: 虚拟线程 (Project Loom), 结构化并发, Record Patterns

### 4.2 核心生态与构建工具
- [ ] 构建工具：Maven (POM, 生命周期, 依赖管理)
- [ ] 构建工具：Gradle (Groovy/Kotlin DSL, 任务模型) 