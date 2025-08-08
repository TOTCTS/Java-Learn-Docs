# 线程池：ThreadPoolExecutor 与 ForkJoinPool 深度解析

![](/docs/public/assets/java/concurrent/threadpool-executor-and-forkjoinpool-overview.svg)

---

## 核心讲解

- **本质定义**: 线程池是对线程资源的复用与调度框架，提供有界的任务排队、受控的并发度以及任务执行生命周期管理。`ThreadPoolExecutor` 面向通用任务的吞吐与资源控制，`ForkJoinPool` 面向分治计算的工作窃取并行模型。
- **核心价值**: 将线程创建/销毁的高成本与不可控并发转化为可配置的容量、队列与拒绝策略，提升吞吐、降低抖动并避免资源枯竭；在 CPU 密集型分治任务中通过工作窃取最大化处理器利用率。
- **设计初衷**: 面向服务器端与计算密集场景的稳定性与可预测性（背压、隔离、限流），以及在细粒度任务切分下的负载均衡（工作窃取）。

---

## 详细讲解

### 1. ThreadPoolExecutor 架构与运行机制
![](/docs/public/assets/java/concurrent/threadpoolexecutor-task-lifecycle.svg)

- **关键组件**:
  - **corePoolSize / maximumPoolSize**: 基础并发度与上限；核心线程可长期存活，超出部分按 `keepAliveTime` 回收。
  - **keepAliveTime**: 非核心线程空闲回收阈值；可开启 `allowCoreThreadTimeOut` 使核心线程也受控回收。
  - **workQueue**: 任务缓冲区，影响扩容策略与背压表现（见下节队列策略）。
  - **threadFactory**: 线程命名、优先级与守护属性定制，便于监控与排障。
  - **RejectedExecutionHandler**: 拒绝策略，决定超载时的系统行为与背压路径。
- **执行流程（概念）**: `submit` → 入队或扩容 → `Worker` 竞争任务 → `runWorker` 循环取任务执行 → 空闲回收/池关闭。
- **生命周期控制**:
  - `shutdown`（有序停止）: 停止接收新任务，处理完队列后退出。
  - `shutdownNow`（强制停止）: 尝试中断正在执行的任务并返回未执行任务。
  - `awaitTermination` 与 `isTerminated` 用于停止过程的可观测性与协调。
- **背压与隔离**: 通过有界队列与合理 `maximumPoolSize` 对上游施加背压；将不同业务流量隔离至不同池以避免级联拥塞。

### 2. 队列策略与影响
- **SynchronousQueue（无容量直通）**: 无法保存任务，提交即触发扩容或交给空闲线程；适合低延迟、弹性扩容、请求速率接近并发度的场景。
- **LinkedBlockingQueue（链表无界或有界）**: 无界可能隐藏背压导致内存膨胀；强烈建议配置“合理上限”的有界队列以稳定延迟与内存。
- **ArrayBlockingQueue（定长数组）**: 有界、内存可预测，适合稳定吞吐与延迟目标。
- **PriorityBlockingQueue**: 基于优先级调度，注意任务可比性与长尾饿死风险。
- 选择要点: 队列容量越大，延迟越可控但峰值并发扩张受限；容量越小，延迟更低但更易触发拒绝或扩容。

### 3. 拒绝策略（超载行为）
- **AbortPolicy**: 抛出异常，显式暴露超载；适用于必须限制流量的关键路径。
- **CallerRunsPolicy**: 由提交线程执行，天然背压上游；适合同步 RPC 或批处理。
- **DiscardOldestPolicy**: 丢弃队列头最旧任务再尝试入队；可能破坏任务时序约束。
- **DiscardPolicy**: 静默丢弃；仅适合可丢弃的低价值异步任务。

### 4. 并发度与容量估算（经验法）
- **CPU 密集**: 线程数 ≈ 核心数 或 核心数 ± 1。
- **IO/阻塞型**: 线程数 ≈ 核心数 × (1 + 阻塞因子)，其中阻塞因子可用 \(W/C\) 近似：
  - \(N_{threads} \approx N_{cores} \times U_{cpu} \times (1 + W/C)\)
  - 结合指标观测校准：CPU 利用率、任务延迟分位、队列长度、拒绝率。

### 5. 线程与任务的生命周期
- **Worker 生命周期**: 创建→运行→空闲→回收；中断响应取决于任务是否正确处理中断标志。
- **任务可观测性**: `getActiveCount`、`getPoolSize`、`getQueue().size()`、`getCompletedTaskCount()`、`largestPoolSize`、`taskCount`。
- **取消与清理**: 优先使用可中断阻塞（如 `poll(timeout)`），启用 `setRemoveOnCancelPolicy(true)` 降低取消任务的队列遗留。

### 6. 常见风险与反模式
- 无界队列 + 大量入队 → 内存膨胀/OOM；
- 将长阻塞任务放入默认 `commonPool`（详见下文）导致系统性饥饿；
- 忽视线程命名与监控，难以定位热点与死锁；
- 任务持有大对象生命周期过长，触发 GC 压力与尾延迟；
- `ThreadLocal` 未清理导致跨请求数据泄漏；
- 异常吞掉（未上报监控/日志），形成“黑洞”任务。

---

### 7. ForkJoinPool 工作窃取模型
![](/docs/public/assets/java/concurrent/forkjoinpool-work-stealing-sequence.svg)

- **目标与场景**: 面向分治（divide-and-conquer）任务，将任务递归拆分为较小子任务并在多核上并行；适合 CPU 密集、子任务短小且可并行的计算。
- **核心机制**:
  - 每个工作线程维护双端队列（Deque）：本地 LIFO 执行提高局部性；
  - 空闲线程从他人的队列“窃取”（通常从队列头部），均衡负载；
  - 任务类型为 `ForkJoinTask`（`RecursiveTask<V>`/`RecursiveAction`）。
- **重要特性**:
  - `commonPool` 全局共享，默认并行度约等于 CPU 核数（可由系统属性调节）。
  - 对阻塞敏感：若存在阻塞，使用 `ForkJoinPool.ManagedBlocker` 以协助补充工作线程。
  - 支持“静默”就绪检测（quiescence）与“异步模式”（`asyncMode`）。
- **使用禁忌**:
  - 不宜执行长时间阻塞 IO；
  - 避免在 `ForkJoinPool` 内再次阻塞等待 `join` 导致线程饥饿；
  - 任务拆分粒度不宜过大或过小，应结合阈值进行启发式切分。

### 8. CompletableFuture 与线程池
- 默认使用 `ForkJoinPool.commonPool` 作为异步执行器；
- 在 IO 或受限资源场景中，显式提供自定义 `Executor`（隔离、限流、背压）；
- 统一命名与指标上报，避免“暗池”难以观测。

### 9. 生产实践考量
- **关键配置**:
  - 为 TPE 配置“有界队列 + 明确拒绝策略 + 线程命名规则”；
  - 将不同业务域隔离到不同池（隔离故障域与调优维度）；
  - 为 FJP 的分治任务设定合适的“阈值/最小切分粒度”。
- **监控指标**:
  - 池内并发度（activeCount/poolSize/largestPoolSize）、队列长度、拒绝次数；
  - 任务延迟与执行时长分位（p95/p99）、超时率；
  - GC 指标与堆/代际压力（大对象持有与突发分配）；
  - FJP 窃取次数、任务递归深度、commonPool 饥饿告警。
- **常见陷阱与解决方案**:
  - 无界队列导致 OOM → 改为有界并设定 CallerRuns 形成背压；
  - CPU 满载但吞吐不升 → 检查任务阻塞比例，拆分 IO 与计算线程池；
  - CompletableFuture 默认共用 commonPool → 为关键链路提供专用执行器；
  - 取消/超时不生效 → 确保任务正确处理中断并使用可中断阻塞方法。

### 10. ThreadPoolExecutor vs ForkJoinPool（结构化对比）
- **任务模型**:
  - TPE: 任意 `Runnable/Callable`，面向通用调度；
  - FJP: `ForkJoinTask` 分治递归，短小计算优先。
- **调度结构**:
  - TPE: 共享队列 + 动态扩容；
  - FJP: 每线程本地双端队列 + 工作窃取。
- **背压与拒绝**:
  - TPE: 有界队列 + 拒绝策略；
  - FJP: 无显式拒绝，倾向通过切分与窃取吸收负载（易受阻塞影响）。
- **适用场景**:
  - TPE: 服务端请求处理、IO 混合、需要明确背压/隔离的场景；
  - FJP: 计算密集、可并行分治算法（归并、快速、遍历等）。

---

## 图表说明
- **概览图**：`/docs/public/assets/java/concurrent/threadpool-executor-and-forkjoinpool-overview.svg`
  - 左侧展示 TPE 的并发度、队列、拒绝策略与背压路径；右侧展示 FJP 的本地 Deque、工作窃取与阻塞管理。
- **TPE 任务生命周期**：`/docs/public/assets/java/concurrent/threadpoolexecutor-task-lifecycle.svg`
  - 覆盖提交→入队/扩容→执行→完成/拒绝分支、CallerRuns 背压、取消/超时清理、keepAlive 回收与关闭流程。
- **FJP 工作窃时时序**：`/docs/public/assets/java/concurrent/forkjoinpool-work-stealing-sequence.svg`
  - 覆盖 fork/split 阈值、从头部窃取、join 协作、ManagedBlocker 阻塞补偿与 quiescence。

## 参考与延伸阅读
- [Java 内存模型 (JMM) 深度解读](./jmm-deep-dive.md)
- [`ReentrantLock` 与 `ReadWriteLock`：公平锁与非公平锁](./reentrantlock-and-readwritelock-deep-dive.md)
- [`StampedLock`：乐观读锁的性能优势](./stampedlock-optimistic-read-performance.md)
- 《Java 并发编程实战》、OpenJDK 源码与文档（`java.util.concurrent`） 