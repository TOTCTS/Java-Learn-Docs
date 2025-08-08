# 查询优化：执行计划、统计信息、谓词下推与 SQL 重写

![](/docs/public/assets/database/explain-plan-and-statistics.svg)

---

## 核心讲解

- 本质：查询优化器根据统计信息选择代价最低的访问路径与联接顺序。良好的统计信息与可索引的谓词是高效计划的前提。
- 目标：将高成本的全表扫描、外部排序与临时表降为索引顺序扫描、索引覆盖、流式联接。
- 方法：解释计划（EXPLAIN/JOIN ORDER）、更新统计、谓词下推与 SARGable 重写、必要时索引与 SQL 模式协同改造。

---

## 详细讲解

### 1. 执行计划要点（以 MySQL 为例）
- 关键列含义：
  - `id`：子查询/派生表执行顺序；`select_type`：SIMPLE/PRIMARY/DERIVED 等。
  - `type`（访问类型，越靠右越差）：`system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`。
  - `key`/`key_len`/`ref`：使用索引与匹配方式；`rows`：估算行数；`filtered%`：过滤比率。
  - `Extra`：是否 `Using index`（覆盖）、`Using where`、`Using filesort`、`Using temporary`、`range checked for each record` 等警示。
- 观察策略：
  - 优先避免 `ALL/index` 与 `Using filesort/temporary`；
  - 关注 `rows*filtered` 的乘积，评估真实访问行数与 I/O；
  - 多表联接看联接顺序、驱动表选择与联接条件是否可用索引。

### 2. 统计信息与代价估算
- 统计信息：基数（Cardinality）、直方图、样本采集策略；影响访问路径与联接顺序。
- 更新策略：
  - MySQL：`ANALYZE TABLE`、`innodb_stats_persistent`；必要时启用直方图（MySQL 8+ `CREATE HISTOGRAM`）。
  - PostgreSQL：`ANALYZE`、调整 `default_statistics_target` 与采样频率。
- 失真应对：
  - 倾斜分布下建立直方图或分区；
  - 绑定/提示（慎用）：MySQL Hints、PG planner hints 扩展。

![](/docs/public/assets/database/predicate-pushdown-and-rewrite.svg)

### 3. 谓词下推与 SARGable 重写
- 谓词下推：尽量在存储层/被驱动表尽早过滤，减少上层传输与联接数据量。
- SARGable 重写示例：
  - `WHERE DATE(col)=?` → `WHERE col >= ? AND col < ?`；
  - `WHERE col+1=?` → `WHERE col=?-1`；
  - 避免隐式类型转换：`col_varchar='123'`（而非与数字比较）。
- LIKE 与范围：尽量 `LIKE 'xxx%'` 或改用倒排/全文索引；前导通配会导致全表扫描。

### 4. 排序/分组与临时表
- 让 `ORDER BY/ GROUP BY` 与索引序一致，避免 `Using filesort/temporary`；
- 方向一致与空值位置会影响是否可用索引；必要时使用降序索引（看版本支持）。

### 5. 典型优化路径
- 确认基线 SQL → EXPLAIN + 采样实际行数 → 索引与 SQL 协同改造（覆盖/联合/前缀）→ 统计信息校准 → 复测延迟与资源使用。

---

## 图表说明
- 执行计划与统计信息关键项：`/docs/public/assets/database/explain-plan-and-statistics.svg`
- 谓词下推与 SARGable 重写：`/docs/public/assets/database/predicate-pushdown-and-rewrite.svg`

## 参考
- MySQL 8.0 Reference Manual（Optimizer, Histograms）
- PostgreSQL 16 Docs（Query Planning, Statistics） 