# 数据建模与范式：ER、范式与反范式、主外键与约束

![](/docs/public/assets/database/data-modeling-overview.svg)

---

## 核心讲解

- 本质定义：关系型数据建模以实体（Entity）、属性（Attribute）与关系（Relationship）描述业务语义，并用键与约束将语义落实为可验证的数据结构。
- 核心价值：通过规范化（范式）消除冗余与更新异常，通过必要的反范式控制读路径成本；以键/约束确保不变式在数据库层强制成立。
- 关键权衡：规范化降低冗余但增加连接成本；反范式降低读时延但引入一致性维护开销。

---

## 详细讲解

### 1. ER 模型与关系映射
- 实体与标识符：自然键（如身份证号）与代理键（自增、UUID、雪花 ID）。
- 关系类型：1:1、1:N、N:M（N:M 通常拆解为连接表并以复合唯一约束定义基数）。
- 弱实体与组合标识：依赖父实体标识存在时，采用复合主键或代理键 + 唯一约束。
- 名称与层次：清晰命名、限定词前缀（如 `order_item`）、避免复义字段。

### 2. 范式体系与更新异常
- 1NF：列原子化；避免数组/多值字段破坏可检索性。
- 2NF：消除非主属性对主键的部分依赖（尤其在复合键下）。
- 3NF/BCNF：非主属性不依赖于其他非主属性；消除传递依赖与函数依赖异常。
- 更新异常：插入/删除/更新时引入不一致的典型场景与规避方式（拆表、唯一约束）。

![](/docs/public/assets/database/normalization-vs-denormalization.svg)

### 3. 反范式策略与适用条件
- 常见手段：冗余维度（如用户名快照）、预聚合列（计数/金额）、物化视图/汇总表。
- 触发条件：高 QPS 读、多表连接热点、频繁聚合、分页/排序热点。
- 一致性维护：
  - 同步路径：触发器、约束 + 事务内多表更新。
  - 异步路径：事件驱动补偿、周期对账；明确延迟一致性窗口。
- 风险控制：提供回填任务与校验脚本；关键不变式仍应由约束守护。

### 4. 键与约束体系
- 主键（PK）与候选键：单列主键 vs 复合主键；代理键优先于不稳定自然键。
- 唯一约束（UK）：防止重复数据；支持 UPSERT 幂等写。
- 外键（FK）与参照动作：`CASCADE/RESTRICT/SET NULL/SET DEFAULT`；为 FK 列建立索引以避免父删/子查的表扫。
- 检查约束（CHECK）、NOT NULL、DEFAULT：尽量下沉至数据库层，避免仅靠应用逻辑。

![](/docs/public/assets/database/keys-and-constraints.svg)

### 5. 结构设计与查询映射
- 连接图谱：绘制核心表的 JOIN 路径，确认是否存在“星型/雪花”中心表与维表策略。
- 访问模式驱动：
  - 点查/范围：索引首选（左前缀 + 覆盖列）。
  - 统计/聚合：预聚合或物化视图；避免超大跨度的实时聚合。
  - 分页/排序：键集分页优于 `OFFSET`；按需求设计复合索引。

### 6. 设计与评审清单
- 约束是否能在数据库层表达并被启用？
- 主键/唯一键是否稳定且可扩展？复合键是否必要？
- 外键是否建立配套索引？参照动作是否与业务语义一致？
- 哪些表/列采用反范式？一致性如何保障与回填？
- 高频查询是否得到联合索引与覆盖支持？

---

## 生产实践考量

### 变更与版本控制
- 采用迁移工具（Liquibase/Flyway）管理 DDL；以增量脚本与回滚脚本明确变更路径。
- 大表变更：在线变更（PT-OSC/gh-ost/pg_repack），窗口期与回退方案预案。

### 约束与数据治理
- 优先启用 NOT NULL/PK/UK/CHECK；对 FK 在批量导入阶段可临时禁用并在导入后校验与开启。
- 建立数据字典（表/列/约束）与血缘图，支持影响分析与治理闭环。

---

## 图表说明
- 建模概览：`/docs/public/assets/database/data-modeling-overview.svg`
- 范式 vs 反范式：`/docs/public/assets/database/normalization-vs-denormalization.svg`
- 键与约束：`/docs/public/assets/database/keys-and-constraints.svg`

## 参考与延伸阅读
- Database System Concepts / The Relational Model
- MySQL & PostgreSQL 官方文档（Constraints & Foreign Keys）
- Designing Data‑Intensive Applications（Data Modeling） 