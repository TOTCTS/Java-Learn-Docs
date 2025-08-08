# SQL 基础：查询、连接、子查询、聚合与窗口函数

![](/docs/public/assets/database/sql-basics-overview.svg)

---

## 核心讲解

- 本质定义：SQL 以声明式方式描述“要什么”而非“怎么做”，由优化器将查询映射为执行计划（连接/过滤/排序/聚合）。
- 核心价值：通过正确的谓词与连接语义，最小化数据量与中间结果；用窗口函数在不折叠行的前提下计算排名、累计与分组统计。
- 关键概念：执行顺序、连接类型与连接条件、子查询形态、聚合与窗口的区别、NULL 三值逻辑。

---

## 详细讲解

### 1. 执行顺序与列计算
- 逻辑顺序：`FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT`。
- 投影与别名：`SELECT` 阶段才可引用别名；`WHERE` 不可依赖 `SELECT` 别名。
- 列与表达式：避免在可索引列上包裹函数导致非 SARGable。

![](/docs/public/assets/database/query-execution-order.svg)

### 2. 连接语义与使用场景
- 连接类型：INNER、LEFT/RIGHT、FULL、CROSS；半连接/反连接可由 `EXISTS/NOT EXISTS` 表达。
- 连接条件：等值连接优先；范围/不等连接需评估行数膨胀与排序代价。
- 常见误区：在 `ON` 与 `WHERE` 混用过滤导致结果集变化；多表连接缺失驱动表索引。

![](/docs/public/assets/database/joins-taxonomy.svg)

### 3. 子查询形态与改写
- 标量/行/表子查询；相关子查询按外层行重复执行。
- 改写策略：
  - 相关子查询 → JOIN 或 `EXISTS`；
  - `IN` 大集合 → 半连接或临时表；
  - 聚合子查询 → 先聚合再 JOIN，减少数据面。

### 4. 聚合与分组
- `GROUP BY` 折叠行；`HAVING` 对分组后进行过滤。
- 多列聚合：先投影维度，再进行聚合，确保仅保留必要列。
- 扩展：`ROLLUP/CUBE/GROUPING SETS`（引擎支持时）。

### 5. 窗口函数（不折叠行的聚合）
- 基础语义：`func(...) OVER (PARTITION BY ... ORDER BY ... [FRAME])`。
- 常用场景：排名（`ROW_NUMBER`/`RANK`）、累计/滚动（`SUM` with frames）、分组内 TopN。
- 框架（Frame）：`RANGE`/`ROWS`，起止边界影响性能与结果。

![](/docs/public/assets/database/aggregation-vs-window.svg)

### 6. NULL 与三值逻辑
- `NULL` 不等于任何值；`=` 比较为 `UNKNOWN`；用 `IS [NOT] NULL` 判断。
- 聚合时 `COUNT(col)` 不计 NULL；`COUNT(*)` 计行数。
- NULL‑safe 比较与排序规则差异需按引擎验证。

### 7. 排序与分页
- `ORDER BY` 必须配合明确列顺序与方向；避免 `ORDER BY RAND()`。
- 分页：`OFFSET` 越大越慢；优先键集分页（基于上次游标）。

### 8. 设计与检查清单
- 避免 `SELECT *`；仅投影必要列。
- 将过滤与连接条件写成可索引谓词（SARGable）。
- 先聚合后连接以减小数据面；或先连接后聚合以保持语义正确。
- 充分利用窗口函数减少子查询与自连接。

---

## 生产实践考量

### 可维护性与安全
- 命名：统一列别名与驼峰/下划线规范；公共 CTE 命名清晰。
- 防御：限制大 `OFFSET`，对全表扫描/笛卡尔积加入审计与告警；在关键业务禁用危险语句模式。
- 兼容：注意不同引擎的函数/语义差异（NULL 排序、窗口帧实现）。

### 性能基线
- 语句模板化与参数化；避免拼接 SQL；开启查询缓存并观察命中率（取决于引擎）。
- 通过 `EXPLAIN` 与统计信息校准连接顺序与行数估计。

---

## 图表说明
- 概览图：`/docs/public/assets/database/sql-basics-overview.svg`
- 执行顺序：`/docs/public/assets/database/query-execution-order.svg`
- 连接分类：`/docs/public/assets/database/joins-taxonomy.svg`
- 聚合 vs 窗口：`/docs/public/assets/database/aggregation-vs-window.svg`

## 参考与延伸阅读
- MySQL & PostgreSQL 官方文档（SQL Language）
- Use The Index, Luke!（SARGable 与查询改写）
- SQL Performance Explained 