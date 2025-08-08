# 内存泄漏与内存溢出的诊断与解决

![](/docs/public/assets/java/jvm/memory-leak-oom-overview.svg)

---

## 核心讲解

- **本质定义**:
  - **内存泄漏 (Memory Leak)**: 不再需要的对象仍然被引用（可达），导致 GC 无法回收，进而持续占用内存。
  - **内存溢出 (OutOfMemoryError, OOM)**: 运行时内存需求超过可用内存上限（堆/元空间/直接内存/线程栈/本地内存等）。
- **核心价值**: 通过系统化诊断流程与度量（堆转储、GC 日志、NMT、直方图），快速定位泄漏根因与溢出来源，指导结构化治理与容量规划。
- **设计初衷**: 以“现象→范围→定位→根因→修复”的闭环流程，降低排障成本并防止复发。

---

## 详细讲解

### 1. 现象识别与分类
- **典型现象**:
  - 堆使用率持续上升且不回落（内存锯齿上移）；
  - Full GC 频繁且无法回收足够空间；
  - 抛出 OOM：`Java heap space`、`GC overhead limit exceeded`、`Metaspace`、`Direct buffer memory`、`unable to create new native thread` 等。
- **问题边界**:
  - 是“泄漏”还是“合理增长（容量不足）”？
  - 哪个内存池：新生代、老年代、元空间、直接内存、线程栈、本地内存？

### 2. OOM 类型与常见根因
- **Java Heap Space**: 长生命周期引用持有、缓存无界、集合增长未受控、对象爆量（一次性加载海量数据）。
- **GC Overhead Limit Exceeded**: GC 占用过高时间仍回收极少内存，常伴随泄漏或容量不足。
- **Metaspace**: 动态生成/加载类过多、类加载器泄漏（Web 容器热部署遗留）、反射/代理过量。
- **Direct Buffer Memory**: `ByteBuffer.allocateDirect` 过量、池未控、引用未释放导致 Cleaner 无法回收；`-XX:MaxDirectMemorySize` 太小。
- **Unable to create new native thread**: 线程数过多或系统级限制（ulimit/Windows 句柄），线程栈过大；线程池配置不当。
- **Native Memory**: JNI 分配/第三方库/压缩库/Netty 原生内存等未释放；可用 `NMT` 定位。

### 3. 高效诊断流程（建议标准作业）
- **A. 采集证据**
  - 启用堆转储：`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/path/heap.hprof`
  - 统一 GC 日志：JDK8 `-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log`；JDK9+ `-Xlog:gc*,safepoint,gc+heap=debug:gc.log:time,uptime,level,tags`
  - 启用本地内存跟踪（NMT）：`-XX:NativeMemoryTracking=detail`，运行时 `jcmd <pid> VM.native_memory summary`
- **B. 快速指认方向**
  - `jcmd <pid> GC.heap_info | GC.class_histogram`：观察对象类型与占用；
  - `jstat -gcutil <pid> 1s 20`：内存池利用率趋势；
  - `top/Task Manager + 容器监控`：进程 RSS、线程数。
- **C. 深入定位**
  - 分析 `heap dump`（MAT/YourKit/VisualVM）：查看 Dominator Tree、Retained Size、Path to GC Roots；
  - 关注“可疑根”：`ThreadLocal`、静态集合、缓存、监听器/回调、类加载器、连接池。
- **D. 判定与验证**
  - 复现与对照（压测/回放）；修复后二次基线对比（峰值、回收曲线、尾延迟）。

### 4. 高发泄漏场景与治理策略
- **静态集合/缓存无界**: 使用有界策略（LRU/LFU/Window TinyLFU）、基于容量/权重/TTL/TI 的淘汰；暴露指标并设置上限保护。
- **ThreadLocal 泄漏**: 线程池场景下线程复用导致 `ThreadLocalMap` 残留；务必在 `finally` 中 `remove()`，避免强引用持有大对象；使用 `InheritableThreadLocal` 谨慎。
- **监听器/回调未注销**: 使用弱引用或在生命周期结束时显式注销；事件总线/观察者模式建立统一注销流程。
- **连接/句柄未释放**: 数据库/HTTP/文件/NIO Channel 请放入 try-with-resources；池化资源设置租约与泄漏检测（如 Netty `ResourceLeakDetector`）。
- **类加载器泄漏**: Web 容器热部署、SPI/驱动未注销、线程未停止持有上下文 ClassLoader；在关闭阶段显式 `deregister`（JDBC 驱动、JUL Handler等）。
- **直接内存/Native 泄漏**: 控制 `MaxDirectMemorySize`，合理池化；对 JNI/本地库提供显式释放入口；使用 NMT 和 `-Dio.netty.leakDetection.level=paranoid` 监控。

### 5. 容量不足但非“泄漏”的场景（设计与实现改造）
- 大查询/批处理：分页/流式处理（cursor）、分批聚合、后移计算；
- 大对象/热路径临时对象过多：对象复用、逃逸分析友好写法、减少装箱与临时集合；
- 序列化/反序列化：按需字段、压缩/分片、零拷贝；
- 高并发峰值：背压、限流、隔离（线程池/队列/滑窗），合理堆与代际比例。

### 6. 生产实践考量
- **关键配置 (JVM)**:
  - `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=...`
  - `-Xlog:gc*,safepoint,gc+heap=debug`（JDK9+）或 JDK8 等价 GC 日志参数
  - `-XX:MaxDirectMemorySize=<size>` 控制直接内存上限
  - `-XX:NativeMemoryTracking=summary|detail` + `jcmd VM.native_memory`
  - 容器内：确保 `-Xmx` 与容器 `memory.limit` 一致并留给非堆/本地内存余量
- **监控指标**:
  - 堆/新生代/老年代/元空间使用率与增长趋势；
  - Full GC 次数、停顿分位（p95/p99）；Promotion 失败/分配失败；
  - 直接内存使用量、NMT 分类、线程数与平均线程栈大小；
  - 对象直方图热点类型与增长速率。
- **常见陷阱与解决方案**:
  - 仅靠 Full GC 手动触发掩盖问题 → 始终以证据链（dump/日志/指标）定位根因；
  - 只看对象数量不看 Retained Size → 优先分析保留大小与 GC Roots 路径；
  - 容量盲目加大 → 同步限流/背压与代码治理，避免更大的“缓慢泄漏”。

---

## 图表说明
- **概览图**：`/docs/public/assets/java/jvm/memory-leak-oom-overview.svg`
  - 分类：泄漏 vs 溢出；内/外堆与元空间；症状到证据链的映射。
- **诊断流程图**：`/docs/public/assets/java/jvm/memory-diagnosis-flow.svg`
  - 现象→采集→指认→定位→修复的闭环，含关键命令与日志信号。
- **Native/Direct 内存原理图**：`/docs/public/assets/java/jvm/native-memory-and-direct-buffer.svg`
  - DirectBuffer 分配/回收路径、Cleaner 触发、NMT 观察点与警戒线。

## 参考与延伸阅读
- [JVM 内存结构 (运行时数据区)](./jvm-memory-structure.md)
- [垃圾回收算法](./garbage-collection-algorithms.md)
- [垃圾收集器：Serial、Parallel、CMS、G1、ZGC](./garbage-collectors-comparison.md)
- OpenJDK & HotSpot 源码、MAT 文档、JEP: Unified JVM Logging 