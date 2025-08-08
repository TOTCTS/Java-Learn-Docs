# 索引结构与策略：B+Tree、覆盖/前缀/联合索引、选择性与回表

![](/docs/public/assets/database/bptree-index-architecture.svg)

---

## 核心讲解

- 本质定义：索引是对数据记录的有序组织与快速定位结构。在 InnoDB 中，主流为 B+Tree 索引（聚簇/二级），通过树形有序结构实现对范围/等值查询、排序与前缀匹配的高效支持。
- 核心价值：显著降低 I/O 与比较次数；通过“覆盖索引”避免回表；利用“联合索引 + 左前缀”覆盖多列过滤/排序；用“高选择性列”提升过滤效率。
- 关键权衡：写入成本（维护索引）、空间开销、选择性与访问模式匹配、范围条件对索引利用的影响。

---

## 详细讲解

### 1. B+Tree 索引结构与 InnoDB 特性
- 聚簇索引（Clustered Index）
  - 主键索引即数据组织本身，叶子节点存储整行记录。
  - 二级索引叶子节点存储“二级键 + 主键值”，命中后可能需要“回表”到聚簇索引取整行。
- B+Tree 特征
  - 所有数据只在叶子节点；非叶节点存放“键 + 指针”；叶子间有链表便于范围扫描。
  - InnoDB 页（page）默认 16KB，分支因子较高，树高通常 2–4 层。
- 访问路径与成本模型（近似认知）
  - 点查：代价 ≈ 树高 h 的随机 I/O（h≈3），若回表再加 h；命中缓冲池时为内存访问。
  - 范围扫：自定位到首个叶子后，顺链表顺序读取，跨页可能触发顺序 I/O 和预读。
  - 写入：插入/更新涉及页分裂、重平衡与二级索引维护，放大写成本与空间碎片。

### 2. 覆盖索引（Index-Only）与回表
- 覆盖索引：查询所需列“均被同一索引包含”（键列或包含列），直接从索引叶子返回，无需回表。
- 回表：二级索引命中后，用叶子上的主键回到聚簇索引取整行，增加随机 I/O。
- 实务要点
  - 高频读路径优先“覆盖”：将高选择性过滤列 + 必要返回列组合到同一索引。
  - 谨慎扩宽列数：每增加一列提升覆盖概率，但显著增加写入与空间成本。
  - 观察执行计划：`Extra` 中 `Using index` 多为覆盖；`Using where` 结合 `Using index condition` 表示存在服务器端过滤与索引条件下推（版本相关）。

![](/docs/public/assets/database/covering-index-vs-back-to-table.svg)

### 3. 联合索引与左前缀法则
- 左前缀法则：索引有序性以“从左到右”的列序为准。
  - 能利用连续前缀列进行等值/范围匹配（例：索引 (a,b,c) 可用于 a、(a,b)、(a,b,c)）。
  - 遇到首个“范围条件（>, <, BETWEEN, LIKE 'xxx%')”后，其后的列通常无法继续利用有序性。
- 列序设计原则
  - 过滤选择性高的列靠前；结合排序/分组需求（ORDER BY/GROUP BY 与索引列序和值方向一致可避免外部排序）。
  - 避免把低选择性且常位于范围条件的列置于前部。
  - 注意可空列、不同排序方向或表达式会打断有序性利用（具体取决于版本与引擎特性）。

![](/docs/public/assets/database/composite-index-leftmost-prefix.svg)

### 4. 前缀索引与 LIKE 模式
- 前缀索引（Prefix Index）：对长字符串只索引前 N 个字符，平衡空间与选择性。
  - 选择 N 的经验：使 `distinct(left(col,N))/rows` 接近目标选择性（例如 ≥0.9），再与空间/写入成本权衡。
  - 前缀索引对排序与覆盖的帮助有限（可能无法完全替代完整列索引）。
- LIKE 模式：`LIKE 'abc%'` 可走索引；`LIKE '%abc'` 或 `'%abc%'` 无法利用 B+Tree 有序性（考虑倒排/函数/表达式索引或外部搜索引擎）。
- 注意字符集与排序规则（collation）对比较与索引长度的影响。

### 5. 选择性（基数）与代价估算
- 选择性：`distinct(列或列组) / 总行数`，越接近 1 越好；直接影响过滤效率与访问路径决策。
- 基数（Cardinality）：优化器依赖统计信息进行代价估算与路径选择。
- 统计与直方图（以 MySQL 8.0 为例）
  - 持久化统计：保持统计稳定，结合 `ANALYZE TABLE` 定期刷新。
  - 直方图可改进非索引列或倾斜分布的选择性估计（`UPDATE HISTOGRAM`）。
- 简化成本直觉：点查≈h 次随机访问；范围扫≈定位代价 + 线性扫描代价；回表≈额外 h。

![](/docs/public/assets/database/selectivity-and-cardinality.svg)

### 6. 可利用索引（SARGable）与常见陷阱
- SARGable 条件：`col = ?`、`BETWEEN`、`IN`、`LIKE 'xxx%'`、可转化为“范围/等值”的条件。
- 非 SARGable：`FUNCTION(col)`、`col + 1 = ?`、`CAST(col)`、隐式类型转换（如字符串与数值比较）。
- 典型问题
  - 隐式转换导致全表扫描：例如 `WHERE col_varchar = 123`。
  - `OR` 混合不同列过滤使索引难以利用（可改写为 `UNION ALL` 或评估 Index Merge）。
  - 表达式/函数在列上：考虑可用版本的表达式/函数索引（MySQL 8.0+ 支持表达式索引；PostgreSQL 支持函数索引）。

### 7. 排序/分组与索引
- 当 `ORDER BY`/`GROUP BY` 列序与联合索引完全一致，且中间无“表达式/方向不一致/可空打断”，可实现“索引顺序扫描”，避免外部排序（filesort）。
- 升降序混合：较新版本支持降序索引；跨版本与引擎差异需验证（注意方向一致性）。
- 等值过滤 + 排序：常见模式为 `(eq...)+ORDER BY`，将排序列紧随高选择性等值列能显著降低回表与排序开销。

### 8. 设计与调优清单（实践导向）
- 明确“高频查询模板”，围绕模板设计覆盖索引。
- 高选择性过滤列靠前；与排序/分组强相关的列纳入联合索引，并对齐方向。
- 避免函数/隐式转换、前导通配的 LIKE；长文本/长字符串优先考虑前缀索引或专用引擎（全文/ES）。
- 审核 `EXPLAIN`：访问类型（`const/eq_ref/ref/range/index`）、行数估计、`Extra`（`Using index`/`Using filesort`/`Using temporary` 等）。
- 建立索引基线与治理：周期性审计新增/冗余/冲突索引，评估写放大与空间成本。

---

## 生产实践考量

### 关键配置（以 MySQL/InnoDB 为主）
- `innodb_stats_persistent=ON`：持久化统计信息，降低执行计划抖动。
- `innodb_stats_auto_recalc` 与采样页数：控制统计刷新时机与精度（权衡负载）。
- `ANALYZE TABLE`：大批量数据变更后主动刷新统计信息。
- 直方图（8.0+）：对数据分布极不均衡的列使用 `ANALYZE TABLE ... UPDATE HISTOGRAM` 精准估算选择性。
- 表达式/函数索引（8.0+）：对不可改写的函数条件考虑表达式索引。

### 监控指标（可作为效果与健康度信号）
- Handler 系列：`Handler_read_key`（按键命中）、`Handler_read_rnd_next`（顺序/扫描倾向）。
- InnoDB 缓冲池：`Innodb_buffer_pool_reads`（物理读）、`Innodb_buffer_pool_read_requests`（逻辑读）。
- 临时文件与排序：`Created_tmp_disk_tables`、`Sort_merge_passes`（外部排序与磁盘压力）。
- 执行计划分布：采样 `EXPLAIN` 与慢日志中访问类型占比（`ALL`/`range`/`ref`）。

### 常见陷阱与解决方案
- 低选择性列建索引导致收益低：合并到联合索引或移除。
- 列序不当：将高选择性等值列靠前，排序列紧随其后；避免范围列过早出现。
- 前缀索引过短：选择性不足；过长：空间与写入成本高。通过抽样评估 N。
- 类型与排序规则不一致：统一数据类型与 collation，避免隐式转换。
- 过多索引：写放大与优化器迷惑。保留服务于关键查询模板的必要索引。

---

## 图表说明
- B+Tree 索引结构：`/docs/public/assets/database/bptree-index-architecture.svg`
- 覆盖索引 vs 回表：`/docs/public/assets/database/covering-index-vs-back-to-table.svg`
- 联合索引与左前缀：`/docs/public/assets/database/composite-index-leftmost-prefix.svg`
- 选择性与基数：`/docs/public/assets/database/selectivity-and-cardinality.svg`

## 参考与延伸阅读
- MySQL InnoDB 索引与存储结构（官方手册）
- PostgreSQL 索引类型与代价估算（官方手册）
- 高性能 MySQL、Use The Index, Luke! 