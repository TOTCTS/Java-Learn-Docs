# Java 技术体系概览

**Java** 是目前最流行的企业级开发平台之一，拥有庞大的生态系统和丰富的开发工具。本模块将深入探讨 Java 的核心特性，从基础语法到高级特性，从 JVM 底层机制到并发编程，构建全面的 Java 技术体系。

---

## 🎯 学习路径

### **Phase 1: Java 核心基础** 
掌握 Java 语言的核心概念和基本语法，为后续深入学习奠定坚实基础。

#### **面向对象编程 (OOP)**
- [ ] 类与对象：封装、继承、多态
- [ ] 抽象类与接口的设计原则
- [ ] 内部类、匿名类与 Lambda 表达式
- [ ] 泛型编程：类型安全与性能优化

#### **异常处理机制**
- [ ] 异常分类：检查异常 vs 非检查异常
- [ ] try-catch-finally 与 try-with-resources
- [ ] 自定义异常设计最佳实践

#### **集合框架 (Collections Framework)**
- [ ] List、Set、Map 的选择与使用场景
- [ ] 集合性能分析：时间复杂度与空间复杂度
- [ ] 并发集合：ConcurrentHashMap、CopyOnWriteArrayList
- [ ] 集合的函数式编程：Stream API 与操作符

#### **I/O 操作与文件处理**
- [ ] 字节流与字符流的区别和应用
- [ ] NIO 与传统 I/O 的性能对比
- [ ] 文件操作：Path、Files 类的现代化用法

---

### **Phase 2: 并发编程深度** 
深入理解 Java 并发机制，掌握高性能多线程程序设计。

#### **线程基础与管理**
- [x] [线程的创建、状态与生命周期](./concurrent/thread-lifecycle-and-states.md)
- [ ] 线程池：ThreadPoolExecutor 与 ForkJoinPool
- [x] [`volatile` 关键字：可见性、有序性与 happens-before 原则](./concurrent/volatile-keyword-deep-dive.md)
- [x] [Java 内存模型 (JMM) 深度解读](./concurrent/jmm-deep-dive.md)

#### **同步与锁机制**
- [ ] `synchronized` 关键字：偏向锁、轻量级锁、重量级锁
- [ ] `ReentrantLock` 与 `ReadWriteLock`：公平锁与非公平锁
- [ ] `StampedLock`：乐观读锁的性能优势
- [ ] 锁优化：锁消除、锁粗化、自适应自旋

#### **高级并发工具**
- [ ] `CountDownLatch`、`CyclicBarrier`、`Semaphore`
- [ ] `CompletableFuture`：异步编程与组合式操作
- [ ] `Disruptor`：高性能并发框架

#### **并发设计模式**
- [ ] 生产者-消费者模式
- [ ] 读写者模式
- [ ] Future 模式与 Promise 模式

---

### **Phase 3: JVM 底层原理** 
深入 JVM 内部机制，理解性能调优和故障排查的本质。

#### **内存管理与垃圾回收**
- [x] [JVM 内存结构 (运行时数据区)](./jvm/jvm-memory-structure.md)
- [x] [对象的创建过程、内存布局与访问定位](./jvm/object-creation-and-memory-layout.md)
- [ ] 垃圾回收算法：标记-清除、复制、标记-整理
- [ ] 垃圾收集器：Serial、Parallel、CMS、G1、ZGC
- [ ] 内存泄漏与内存溢出的诊断与解决

#### **字节码与执行引擎**
- [ ] 字节码指令集与操作数栈
- [ ] 方法调用：解析、分派 (静态分派、动态分派)
- [ ] JIT 编译器：热点代码检测与优化
- [ ] 逃逸分析与标量替换

#### **类加载机制**
- [x] [类加载过程：加载、链接 (验证, 准备, 解析)、初始化](./jvm/class-loading-process.md)
- [ ] 类加载器：启动类加载器、扩展类加载器、应用类加载器
- [ ] 双亲委派模型与自定义类加载器
- [ ] 模块系统 (JPMS)：Jigsaw 项目的模块化设计

#### **性能监控与调优**
- [ ] JVM 参数调优：堆大小、垃圾收集器选择
- [ ] 性能分析工具：JProfiler、VisualVM、JConsole
- [ ] 故障排查：堆转储分析、线程转储分析
- [ ] APM 工具集成：监控指标与告警机制

---

## 💼 实践项目

### **项目 1: 高并发聊天室** 
**技术栈**: Netty + 线程池 + 并发集合  
**核心能力**: 网络编程、并发控制、内存管理

### **项目 2: 内存敏感的缓存系统** 
**技术栈**: 自定义数据结构 + JVM 调优 + 性能监控  
**核心能力**: 算法设计、内存优化、性能调优

### **项目 3: 多线程爬虫框架** 
**技术栈**: CompletableFuture + 线程池 + 限流器  
**核心能力**: 异步编程、资源控制、异常处理

---

## 📚 进阶学习资源

### **经典书籍推荐**
- 《Java并发编程实战》- Brian Goetz
- 《深入理解Java虚拟机》- 周志明  
- 《Effective Java》- Joshua Bloch
- 《Java性能调优指南》- Charlie Hunt

### **官方文档与规范**
- [OpenJDK Documentation](https://openjdk.java.net/)
- [Java Language Specification](https://docs.oracle.com/javase/specs/)
- [JVM Specification](https://docs.oracle.com/javase/specs/jvms/se11/html/)

---

**下一步**: 开始深入学习 [JVM 内存结构](./jvm/jvm-memory-structure.md)，理解 Java 程序的底层执行机制。 