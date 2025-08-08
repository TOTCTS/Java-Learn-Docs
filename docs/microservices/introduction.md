# 微服务生态技术体系概览

![](/docs/public/assets/microservices/microservices-overview.svg)

---

## 🎯 学习路径

### Phase 1: 微服务基础
- [ ] 服务拆分与边界：领域驱动设计（DDD）简要
- [ ] 通信方式：REST、gRPC、消息队列
- [ ] 配置与注册发现：Nacos/Eureka、配置中心

### Phase 2: 网关与治理
- [ ] API 网关：Spring Cloud Gateway
- [ ] 负载均衡与路由：Ribbon/Spring Cloud LoadBalancer
- [ ] 熔断、限流与重试：Resilience4j

### Phase 3: 观测与追踪
- [ ] 日志/指标/追踪：ELK/Prometheus/Grafana/Zipkin
- [ ] OpenTelemetry 接入与最佳实践

### Phase 4: 事务与一致性
- [ ] 分布式事务模式：Saga/TCC/Outbox
- [ ] 事件驱动架构与幂等性

### Phase 5: 进阶（可选）
- [ ] 服务网格：Istio/Linkerd 基础

---

## 💼 实践项目
- 项目 1：商品-订单-库存微服务（注册发现 + 网关 + 熔断）
- 项目 2：异步订单处理（消息队列 + 事件溯源 + 幂等）
- 项目 3：全链路观测（指标 + 日志 + 追踪接入）

---

## 📚 进阶学习资源
- Spring Cloud 官方文档：`https://spring.io/projects/spring-cloud`
- OpenTelemetry 文档：`https://opentelemetry.io/docs/`
- Istio 文档：`https://istio.io/latest/docs/` 