# Spring 技术体系概览

![](/docs/public/assets/spring/spring-overview.svg)

---

## 🎯 学习路径

### Phase 1: 核心与基础
- [ ] IoC/DI：Bean 定义、作用域、生命周期、后置处理器
- [ ] AOP：切点、通知、织入、代理（JDK/CGLIB）
- [ ] 资源与环境：`Environment`、配置属性绑定、`@ConfigurationProperties`
- [ ] 校验与类型转换：`Validator`、`ConversionService`

### Phase 2: Spring MVC 与 Web 基础
- [ ] 请求映射：`@Controller` / `@RestController`、`@RequestMapping`
- [ ] 参数解析与消息转换：`HandlerMethodArgumentResolver`、`HttpMessageConverter`
- [ ] 全局异常处理：`@ControllerAdvice`、`@ExceptionHandler`
- [ ] 过滤器与拦截器：`Filter`、`HandlerInterceptor`

### Phase 3: Spring Boot 工程化
- [ ] 自动装配：`spring.factories` / `AutoConfiguration`
- [ ] 外部化配置：多环境配置、Profile、`ApplicationContext`
- [ ] 健康检查与运维：Actuator、端点与指标
- [ ] 启动与生命周期：`ApplicationRunner` / `CommandLineRunner`

### Phase 4: 数据与事务
- [ ] 数据访问：`JdbcTemplate`、`MyBatis` 集成
- [ ] 事务模型：`@Transactional`、传播行为、隔离级别、回滚规则
- [ ] 连接池与监控：HikariCP 配置与指标

### Phase 5: Spring Cloud（可选深入）
- [ ] 注册与发现：Eureka/Nacos
- [ ] 配置中心：Apollo/Nacos Config
- [ ] 网关与限流：Spring Cloud Gateway/Resilience4j
- [ ] 链路追踪与观测：Sleuth/Zipkin/OpenTelemetry

---

## 💼 实践项目
- 项目 1：电商商品服务（REST + AOP 审计 + 事务）
- 项目 2：用户登录系统（安全、异常处理、校验）
- 项目 3：配置驱动的功能开关（外部化配置 + 条件装配）

---

## 📚 进阶学习资源
- Spring Framework 官方文档：`https://docs.spring.io/spring-framework/docs/current/reference/html/`
- Spring Boot 官方文档：`https://docs.spring.io/spring-boot/docs/current/reference/html/`
- Spring Guides：`https://spring.io/guides` 