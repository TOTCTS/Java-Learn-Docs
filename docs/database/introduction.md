# 数据存储技术体系概览

![](/docs/public/assets/database/database-overview.svg)

---

## 🎯 学习路径

### Phase 1: 关系型数据库基础
- [x] [数据建模与范式：ER、范式与反范式、主外键与约束](./data-modeling-and-normalization.md)
- [x] [SQL 基础：查询、连接、子查询、聚合与窗口函数](./sql-basics-select-join-subquery-aggregation-window.md)
- [x] [事务与隔离级别：ACID、MVCC、锁（行锁/表锁/意向锁）](./transactions-and-isolation-levels.md)
- [ ] 常用对象：视图、索引、存储过程、触发器（何时用/何时不用）

### Phase 2: 性能与索引
- [x] [索引结构与策略：B+Tree、覆盖/前缀/联合索引、选择性与回表](./index-structures-and-strategies.md)
- [x] [查询优化：执行计划、统计信息、谓词下推、SQL 重写](./query-optimization-explain-and-statistics.md)
- [x] [慢查询分析与治理：采样、基线、热点 SQL 与闭环](./slow-query-analysis-and-governance.md)

### Phase 3: 事务与高可用（MySQL/PG）
- [ ] 日志与恢复：Redo/Undo、WAL、Checkpoint
- [ ] 复制与容灾：主从复制、半同步、延迟复制
- [ ] 读写分离与容量扩展（概念）：连接路由、一致性权衡

### Phase 4: NoSQL 与缓存
- [ ] Redis：数据结构、持久化（AOF/RDB）、过期与淘汰策略
- [ ] 缓存模式：Cache Aside / Read Through / Write Back
- [ ] 一致性与稳定性：穿透/击穿/雪崩防护、双写一致性
- [ ] MongoDB：文档模型、索引与聚合管道

### Phase 5: 搜索与检索
- [ ] Elasticsearch：倒排索引、分片与副本、映射与分词
- [ ] 聚合与排序：相关性、评分与分页策略
- [ ] 生命周期管理（ILM）与冷热分层

---

## 💼 实践项目
- 项目 1：订单系统数据建模与查询优化（MySQL/PG 执行计划与索引）
- 项目 2：高并发缓存设计（Redis + 一致性与限流）
- 项目 3：商品搜索服务（Elasticsearch + 聚合与高亮）

---

## 📚 进阶学习资源
- MySQL 官方文档：`https://dev.mysql.com/doc/`
- PostgreSQL 官方文档：`https://www.postgresql.org/docs/`
- Redis 官方文档：`https://redis.io/docs/`
- Elasticsearch 官方文档：`https://www.elastic.co/guide/` 