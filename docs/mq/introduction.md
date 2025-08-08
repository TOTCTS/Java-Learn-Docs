# 消息队列 (MQ) 技术体系概览

![](/docs/public/assets/mq/mq-overview.svg)

---

## 🎯 学习路径

### Phase 1: 基础与模型
- [ ] 消息模型：队列 vs 发布/订阅，推/拉模型
- [ ] 投递语义：At-most-once / At-least-once / Exactly-once
- [ ] 顺序性与幂等性：键控分区、去重键、幂等策略

### Phase 2: Kafka 核心
- [ ] 主题/分区/副本与 ISR、控制器与主从选举
- [ ] 生产者：`acks`、重试、批量/压缩、幂等生产者、事务性消息
- [ ] 消费者：消费组、再均衡、位移提交（同步/异步/事务性）、协作再均衡
- [ ] 存储与保留：日志段、索引、压缩（log compaction）

### Phase 3: RocketMQ 核心
- [ ] 架构组件：NameServer / Broker / Producer / Consumer
- [ ] 存储结构：CommitLog / ConsumeQueue / IndexFile，刷盘与复制
- [ ] 顺序与事务：顺序消息、半消息与事务回查（事务消息）
- [ ] 延迟与定时：固定延迟等级、定时/延迟消息
- [ ] 订阅与模式：集群消费/广播消费、Tag/Key 路由
- [ ] 可靠性：重试、死信队列（DLQ）、ACK 机制、流控与限速

### Phase 4: RabbitMQ 核心
- [ ] 交换机/队列/绑定：Direct/Fanout/Topic/Headers
- [ ] 确认机制：Publisher Confirm、Nack/Requeue
- [ ] 路由与延迟：死信队列（DLQ/DLX）、TTL、延迟消息

### Phase 5: 可靠性与一致性
- [ ] 重试与补偿：幂等键、去重表、延迟重投、最大重试与隔离
- [ ] 事务与最终一致：Outbox 模式、CDC（Debezium）、本地事务 + 事件
- [ ] 有界背压：生产与消费速率匹配、限流与熔断、位移滞后监控

### Phase 6: 观测与调优
- [ ] 指标与监控：吞吐、滞后、积压、失败率、压缩比
- [ ] 关键配置调优：批量/压缩/IO/Page Cache、网络与内存
- [ ] Schema 治理：Avro/Schema Registry、Proto、演进策略

---

## 💼 实践项目
- 项目 1：订单事件总线（Kafka + Outbox + CDC）
- 项目 2：延迟重试与死信处理（RabbitMQ DLX）
- 项目 3：Exactly-once 语义的账务流水（幂等 + 事务性生产/消费）

---

## 📚 进阶学习资源
- Apache Kafka 文档：`https://kafka.apache.org/documentation/`
- RabbitMQ 文档：`https://www.rabbitmq.com/documentation.html`
- Apache RocketMQ 文档：`https://rocketmq.apache.org/docs/`
- Debezium 文档：`https://debezium.io/documentation/` 