# Java 知识体系大纲

欢迎来到 Java 的世界！本大纲旨在为您提供一个纯粹的、深入的 Java 语言学习路径，涵盖从核心基础到并发编程、虚拟机底层和最新特性的完整知识体系。

您可以将此视为您的学习地图，每个知识点未来都将链接到一篇详细的文档。

---

## 一、 Java 核心基础

这一部分是所有 Java 开发者的基石，无论技术如何变迁，扎实的基础永远是核心竞争力。

### 1.1 环境与入门
- [ ] JDK 的安装与配置 (Windows/Mac/Linux)
- [ ] 编写并运行第一个 Java 程序 (Hello World)
- [ ] 理解 `javac` 和 `java` 命令
- [ ] 使用 IDE (IntelliJ IDEA)

### 1.2 语言基础
- [ ] 数据类型 (基本类型与引用类型)
- [ ] 运算符
- [ ] 控制流程 (if-else, switch, for, while)
- [ ] 数组

### 1.3 面向对象 (OOP)
- [ ] 类与对象
- [ ] 封装、继承、多态
- [ ] `abstract` 类与 `interface` 接口
- [ ] `static` 与 `final` 关键字
- [ ] `Object` 类常用方法 (`equals`, `hashCode`, `toString`)

### 1.4 核心 API
- [ ] `String`, `StringBuilder`, `StringBuffer`
- [ ] 常用工具类 (`Math`, `Date`, `Calendar`)
- [ ] 包装类
- [ ] 异常处理 (`try-catch-finally`, `throw`, `throws`)
- [ ] 泛型
- [ ] I/O 流 (File, InputStream/OutputStream, Reader/Writer)
- [ ] 反射 (Reflection)

### 1.5 集合框架 (Collections)
- [ ] `Collection` 与 `Map` 接口
- [ ] `List`: `ArrayList`, `LinkedList` 源码与对比
- [ ] `Set`: `HashSet`, `TreeSet` 源码与对比
- [ ] `Map`: `HashMap`, `ConcurrentHashMap`, `TreeMap` 源码与对比
- [ ] `Collections` 工具类

---

## 二、 Java 进阶核心

掌握了基础后，需要深入理解 Java 的底层机制，这是从“会用”到“精通”的关键一步。

### 2.1 并发编程 (Concurrency)
- [ ] 线程基础 (创建线程, 线程状态, `sleep`, `yield`, `join`)
- [ ] `synchronized` 关键字与锁优化
- [ ] `volatile` 关键字与 Java 内存模型 (JMM)
- [ ] `java.util.concurrent` (JUC) 包
    - [ ] `Lock` 接口 (`ReentrantLock`, `ReadWriteLock`)
    - [ ] 原子类 (`AtomicInteger`, `LongAdder`)
    - [ ] 线程池 (`ThreadPoolExecutor` 核心参数与原理)
    - [ ] 并发工具类 (`CountDownLatch`, `CyclicBarrier`, `Semaphore`)
- [ ] `ThreadLocal`
- [ ] `CompletableFuture` 与异步编程

### 2.2 JVM (Java Virtual Machine)
- [ ] JVM 内存结构 (堆, 栈, 方法区, 程序计数器)
- [ ] Java 对象创建与内存分配
- [ ] 垃圾回收 (GC)
    - [ ] 判断对象存活 (引用计数法, 可达性分析)
    - [ ] GC 算法 (标记-清除, 标记-复制, 标记-整理)
    - [ ] 主流垃圾收集器 (Serial, Parallel, CMS, G1, ZGC)
- [ ] 类加载机制 (加载, 链接, 初始化)与双亲委派模型
- [ ] JVM 性能调优与故障排查工具 (`jps`, `jstat`, `jmap`, `jstack`)

### 2.3 Java 新特性
- [ ] Java 8: Lambda 表达式, Stream API, `Optional`, 新日期时间 API
- [ ] Java 11: `var` 局部变量类型推断, 新 `String` API
- [ ] Java 17: Records, Sealed Classes, `switch` 表达式增强
- [ ] Java 21: 虚拟线程, 结构化并发, Record Patterns 