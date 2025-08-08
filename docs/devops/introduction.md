# 工程化与 DevOps 技术体系概览

![](/docs/public/assets/devops/devops-overview.svg)

---

## 🎯 学习路径

### Phase 1: 代码与协作
- [ ] Git 分支模型：Git Flow / Trunk-Based
- [ ] 代码评审与规范化：Commit 规范、Lint、格式化

### Phase 2: CI/CD 流水线
- [ ] 构建与测试：Maven/Gradle、单测/集成测试
- [ ] 持续集成：Jenkins/GitHub Actions、制品库（Nexus/Artifactory）
- [ ] 持续交付与部署：滚动/蓝绿/金丝雀

### Phase 3: 容器化与编排
- [ ] Docker 镜像与多阶段构建
- [ ] Kubernetes 基础：Deployment/Service/Ingress/Helm
- [ ] 配置与密钥：ConfigMap/Secret

### Phase 4: 观测与运维
- [ ] 指标/日志/追踪：Prometheus/Grafana/ELK
- [ ] 告警与SLO：阈值、异常分位（p95/p99）
- [ ] 灰度与回滚：特性开关、回滚策略

### Phase 5: 基础设施即代码（可选）
- [ ] Terraform/Ansible 基础

---

## 💼 实践项目
- 项目 1：Jenkins 基于分支的自动化流水线（构建-测试-发布）
- 项目 2：K8s 上线 Java 服务（健康检查 + 滚动发布）
- 项目 3：可观测性落地（指标/日志/告警闭环）

---

## 📚 进阶学习资源
- Jenkins 文档：`https://www.jenkins.io/doc/`
- Docker 文档：`https://docs.docker.com/`
- Kubernetes 文档：`https://kubernetes.io/docs/`
- Prometheus 文档：`https://prometheus.io/docs/` 