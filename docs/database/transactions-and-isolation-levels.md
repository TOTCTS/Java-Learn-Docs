# 事务与隔离级别：ACID、MVCC、锁（行锁/表锁/意向锁）

![](/docs/public/assets/database/transactions-and-isolation-overview.svg)

---

## 核心讲解

- 本质定义：事务保证一组读写操作以原子方式提交或回滚；隔离级别定义并发下各事务彼此可见性的强度；MVCC 通过多版本与快照读，使大部分读取不与写入互斥。
- 核心价值：在高并发与故障场景下维持数据正确性与可恢复性，以最低必要的锁定范围换取吞吐与延迟的平衡。
- 设计要点：
  - ACID：原子性（Undo）、一致性（约束与协议）、隔离性（锁 + MVCC）、持久性（Redo/WAL）。
  - 并发现象：脏读、不可重复读、幻读、丢失更新。
  - 锁模型：S/X 锁与 IS/IX/SIX 意向锁；行锁（记录/间隙/Next‑Key）与表锁的协同。

---

## 详细讲解

### 1. 概念边界与交互模式
- 读类型：
  - 快照读（一致性读）：基于读视图返回历史可见版本，不加行锁。
  - 当前读（加锁读）：`SELECT ... FOR UPDATE|FOR SHARE`，基于最新版本并获取相应行/间隙锁。
- 写类型：`INSERT/UPDATE/DELETE` 在行级别加 X 锁，并可能触发行间隙或 Next‑Key 锁以维持范围约束。
- 典型交互：点查（点等值）/范围查询、加锁读取后更新、批量写入与去重（约束/UPSERT）。

### 2. ACID 与日志（Undo/Redo, WAL, Checkpoint）
- 原子性：Undo 记录旧值，失败回滚时按版本链逆序恢复。
- 一致性：约束（PK/UK/FK）、触发器、应用层不变式与隔离协议共同保证。
- 隔离性：两阶段锁（2PL）与 MVCC 协同控制读写冲突与可见性。
- 持久性：Redo/WAL 顺序写与刷盘；崩溃恢复流程“先重做、后回滚”。

![](/docs/public/assets/database/mvcc-and-undo-redo.svg)

### 3. MVCC 工作机制（InnoDB 与 PostgreSQL 对照）
- InnoDB：
  - 行含隐藏列（事务号与回滚指针），Undo 形成版本链；快照读使用读视图过滤不可见版本。
  - RC：每条语句生成读视图；RR：事务开始时生成读视图，防不可重复读；对范围写使用 Next‑Key 锁抑制插入幻影。
- PostgreSQL：
  - 元组携带 `xmin/xmax`；旧版本由 VACUUM 清理；Serializable 采用可串行化快照隔离（SSI）与谓词锁避免幻影。
- 工程启示：读多写少以 RC/RR + 索引优化为主；强一致写冲突采用加锁读或更高隔离。

### 4. 隔离级别与并发现象
- Read Uncommitted（RU）：允许脏读、不可重复读与幻读。
- Read Committed（RC）：禁止脏读；仍可能不可重复读与幻读。
- Repeatable Read（RR）：禁止脏读与不可重复读；幻读需通过范围锁/谓词锁抑制（不同引擎策略不同）。
- Serializable：效果等价串行；可能需要重试，吞吐最低。
- 业务映射：
  - OLTP 常用 RC/RR；
  - 严格不变式（如账户余额一致性）可结合显式加锁或提升到 Serializable。

![](/docs/public/assets/database/isolation-levels-phenomena.svg)

### 5. 锁模型与范围控制
- 锁种类：
  - 表级：IS/IX/SIX 用于与行锁快速判定兼容性；自增与元数据锁用于序列与 DDL 保护（实现相关）。
  - 行级：记录锁、间隙锁、Next‑Key 锁（记录 + 相邻间隙）。
- 冲突直觉：S 与 X 互斥；意向锁与行锁不直接冲突，但与对立表锁冲突；范围查询在 RR 下为避免插入幻影会扩大锁定区间。
- 重要细节：
  - 非索引条件的范围操作往往退化为更广的锁（甚至接近表扫）。
  - 合理的联合索引可显著缩小锁范围与等待链长度。

![](/docs/public/assets/database/locks-and-intention-locks.svg)

### 6. 常见并发问题与改写策略
- 丢失更新：
  - 悲观控制：加锁读（`FOR UPDATE`）后更新。
  - 乐观控制：版本号或时间戳比对（失败重试）。
- 幻读：
  - MySQL/InnoDB：RR + Next‑Key 锁保护范围写；
  - PostgreSQL：Serializable + 谓词锁或重试机制。
- 去重与幂等：采用唯一约束 + UPSERT，避免显式大范围加锁。
- 队列/热点：`SKIP LOCKED`/`NOWAIT`（版本支持时）减少等待链与惊群。

### 7. 设计与调优清单
- 首选 RC/RR 并配合合适索引；必要时显式加锁而非盲目提升隔离级别。
- 范围写使用加锁读；保证过滤条件完全命中索引，缩小锁边界。
- 缩短事务长度：避免事务中等待外部 I/O；大批量拆分成可回滚的小批。
- 以约束驱动一致性：唯一约束/检查约束替代应用层大范围“探测 + 锁”。
- 观察执行计划与等待事件：确认是否发生全表/范围锁扩散与长链阻塞。

---

## 生产实践考量

### 关键配置
- MySQL/InnoDB：
  - `transaction_isolation`（`READ-COMMITTED`/`REPEATABLE-READ`/`SERIALIZABLE`）。
  - `innodb_lock_wait_timeout`（锁等待超时）、`innodb_deadlock_detect`（检测器开关）、`innodb_autoinc_lock_mode`（自增并发）。
  - `binlog_format`（STATEMENT/ROW/MIXED）与复制一致性相关。
- PostgreSQL：
  - 默认 RC；可设 RR/Serializable；
  - `deadlock_timeout`、`max_standby_streaming_delay`、`hot_standby` 等影响等待与只读从库行为。

### 监控指标
- MySQL：`INNODB_TRX`、`INNODB_LOCKS`、`INNODB_LOCK_WAITS`、`SHOW ENGINE INNODB STATUS`、Performance Schema 等待事件。
- PostgreSQL：`pg_stat_activity`、`pg_locks`、`pg_stat_statements`、`pg_stat_io`/`pg_stat_bgwriter`。
- 侧重点：锁等待时长与链路深度、死锁频率、回滚率、长事务分布、临时/回滚段增长。

### 常见陷阱与解决方案
- 非索引范围更新导致锁扩散：为过滤列建立合适索引或改写查询。
- 长事务拖慢清理：限制超时时长，分批提交，定期 ANALYZE/VACUUM（或监控 Undo/Purge 进度）。
- 盲目提升隔离级别：优先采用显式加锁 + 约束/UPSERT；仅在必要时启用 Serializable 并做好重试。
- 自增热点与争用：`innodb_autoinc_lock_mode=2`、批量写合并、散列主键或雪花/序列方案。

---

## 图表说明
- 概览图：`/docs/public/assets/database/transactions-and-isolation-overview.svg`
- MVCC 与日志：`/docs/public/assets/database/mvcc-and-undo-redo.svg`
- 隔离级别与并发现象：`/docs/public/assets/database/isolation-levels-phenomena.svg`
- 锁与意向锁：`/docs/public/assets/database/locks-and-intention-locks.svg`

## 参考与延伸阅读
- MySQL 8.0 Reference Manual（InnoDB Transactions & Locking）
- PostgreSQL Official Docs（MVCC, Concurrency Control, Serializable）
- Designing Data‑Intensive Applications（Transactions & Isolation） 