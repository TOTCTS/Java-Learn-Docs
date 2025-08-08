# 慢查询分析与治理：采样、基线、热点 SQL 与闭环

![](/docs/public/assets/database/slow-query-governance-overview.svg)

---

## 核心讲解

- 目标：用数据驱动的方法识别慢查询与热点路径，形成“记录 → 分析 → 优化 → 验证 → 回归”的持续治理闭环。
- 关键手段：慢日志/性能视图、采样探针、基线与对比、自动化告警阈值与回归校验。

---

## 详细讲解

### 1. 采集与采样
- MySQL：slow query log（阈值/不使用索引）、`performance_schema`/`sys`、`pt-query-digest`。
- PostgreSQL：`pg_stat_statements`、`log_min_duration_statement`、自定义采样。
- 线上采样：按 QPS/延迟分布采样，保留绑定变量后的“标准化 SQL”。

### 2. 基线与热点 SQL
- 基线：关键事务/页面/接口的核心 SQL 集合，记录 p50/p95/p99、Rows Examined、Lock Time、内存与 I/O。
- 热点识别：TopN by 总耗时/调用次数/平均耗时/扫描行数；识别抖动与突变。

### 3. 根因分析方法
- 指标三角：延迟、扫描行数、返回行数；
- EXPLAIN + 实测行数对比，确认选择性与统计信息；
- 索引与 SQL 重写：覆盖、联合、SARGable；
- 事务与锁：等待链、死锁与重试；
- 资源瓶颈：I/O 队列、Buffer Pool 命中率、Checkpoint 抖动。

![](/docs/public/assets/database/slow-query-governance-loop.svg)

### 4. 治理闭环与自动化
- 发现：慢日志/告警/用户端 APM；
- 分析：聚合维度（接口、租户、版本）、SQL 归一化聚合；
- 优化：索引/SQL/缓存/读写分离/归档；
- 验证：压测/灰度/对比实验（A/B）；
- 回归：基线更新、阈值调整、回滚预案。

### 5. 常见陷阱
- 只看平均值不看分位；
- 只看执行时间不看扫描行数与返回行数；
- 忽视统计信息/直方图与参数嗅探；
- 忽视应用层 N+1/批量与分页策略；
- 只做手工优化缺乏基线与回归。

---

## 图表说明
- 慢查询治理总览：`/docs/public/assets/database/slow-query-governance-overview.svg`
- 治理闭环：`/docs/public/assets/database/slow-query-governance-loop.svg`

## 参考
- MySQL Performance Schema、Percona Toolkit、PostgreSQL Monitoring 指南
- SRE Workbook：以 SLO 为导向的性能治理 