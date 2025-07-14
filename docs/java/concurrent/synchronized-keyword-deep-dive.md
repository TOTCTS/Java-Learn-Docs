# `synchronized` 关键字深度解析：从偏向锁到重量级锁的优化演进

![synchronized 锁升级机制](/docs/public/assets/java/concurrent/synchronized-lock-upgrade.svg)

## 【核心讲解】

`synchronized` 是 Java 中最基础也是最重要的同步机制，它通过**互斥锁 (Mutex)**的方式保证同一时刻只有一个线程能够访问被同步的代码块或方法。其本质是在 JVM 层面实现的**对象锁机制**，每个 Java 对象都可以作为锁来使用。

### 核心价值与设计初衷

`synchronized` 解决的**根本问题**是**并发访问共享资源时的数据竞争**。在多线程环境下，如果多个线程同时修改同一个共享变量，可能导致数据不一致、丢失更新等并发安全问题。`synchronized` 通过**临界区保护**的方式，确保共享资源的访问是**原子性**的。

设计初衷体现在两个方面：
1. **简单性**：提供声明式的同步机制，开发者只需添加 `synchronized` 关键字即可实现线程安全
2. **性能平衡**：在保证正确性的前提下，通过锁优化技术（偏向锁、轻量级锁、重量级锁）平衡性能开销

### 关键特征

- **可重入性**：同一线程可以多次获取同一把锁，避免死锁
- **可见性保证**：基于 Java 内存模型的 happens-before 原则，确保共享变量的修改对其他线程可见
- **自适应优化**：JVM 会根据锁的竞争情况自动选择最优的锁实现策略

---

## 【详细讲解】

### 1. `synchronized` 的使用形式与锁对象

#### 1.1 同步方法

```java
// 实例方法同步 - 锁对象是 this
public synchronized void instanceMethod() {
    // 临界区代码
}

// 静态方法同步 - 锁对象是 Class 对象
public static synchronized void staticMethod() {
    // 临界区代码
}
```

#### 1.2 同步代码块

```java
// 指定锁对象
public void method() {
    synchronized (lockObject) {
        // 临界区代码
    }
}

// 类锁
public void method() {
    synchronized (MyClass.class) {
        // 临界区代码
    }
}
```

### 2. 对象头与锁信息存储

在 HotSpot JVM 中，每个 Java 对象都有一个**对象头 (Object Header)**，其中包含**Mark Word** 和**类型指针**。Mark Word 是锁优化的核心，它会根据锁的状态动态改变存储内容。

#### Mark Word 的状态变化

| 锁状态 | 25bit | 4bit | 1bit是否偏向锁 | 2bit锁标志位 |
|--------|-------|------|---------------|-------------|
| 无锁 | 对象的hashCode | 对象分代年龄 | 0 | 01 |
| 偏向锁 | 线程ID | Epoch | 1 | 01 |
| 轻量级锁 | 指向栈中锁记录的指针 | | | 00 |
| 重量级锁 | 指向互斥量(重量级锁)的指针 | | | 10 |
| GC标记 | 空 | | | 11 |

### 3. 锁升级机制：从偏向锁到重量级锁

JVM 采用**锁升级**策略来平衡性能和正确性。锁的升级是**单向的**，即只能从低级别锁升级到高级别锁，不能降级。

#### 3.1 偏向锁 (Biased Locking)

**设计理念**：大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得。偏向锁的目的是在只有一个线程执行同步块时消除同步原语。

**工作机制**：
1. **偏向锁获取**：当线程首次访问同步块时，JVM 将对象头的 Mark Word 设置为偏向模式，并将线程 ID 存储在 Mark Word 中
2. **偏向锁验证**：后续该线程再次进入同步块时，只需检查 Mark Word 中的线程 ID 是否为当前线程
3. **无需 CAS 操作**：如果是同一线程，直接执行同步块，无需任何同步操作

**性能优势**：
- **零开销**：偏向锁状态下，同一线程的重复加锁操作几乎没有性能开销
- **适用场景**：单线程或少量线程交替访问的场景

**偏向锁撤销**：
- **其他线程尝试获取锁**：当有其他线程尝试获取偏向锁时，需要撤销偏向锁
- **撤销过程**：需要等待全局安全点 (Global Safe Point)，暂停拥有偏向锁的线程，检查该线程是否还在执行同步块

#### 3.2 轻量级锁 (Lightweight Locking)

**设计理念**：在没有多线程竞争的前提下，减少传统的重量级锁使用操作系统互斥量产生的性能消耗。

**工作机制**：
1. **锁记录创建**：JVM 在当前线程的栈帧中创建锁记录 (Lock Record)
2. **CAS 操作**：使用 CAS 操作尝试将对象的 Mark Word 更新为指向锁记录的指针
3. **成功获取**：如果更新成功，该线程就拥有了该对象的锁
4. **失败处理**：如果更新失败，说明存在竞争，锁升级为重量级锁

**性能特点**：
- **适用场景**：线程交替执行同步块的场景
- **开销**：比偏向锁稍高，但比重量级锁低得多
- **CAS 开销**：需要进行 CAS 操作，在高竞争场景下可能导致大量自旋

#### 3.3 重量级锁 (Heavyweight Locking)

**设计理念**：在高竞争场景下，使用操作系统级别的互斥量来实现同步，确保正确性。

**工作机制**：
1. **Monitor 对象**：每个 Java 对象都关联一个 Monitor 对象
2. **操作系统互斥量**：使用操作系统提供的 mutex 和 condition variable
3. **线程阻塞**：无法获取锁的线程会被阻塞，进入等待队列
4. **唤醒机制**：锁释放时，唤醒等待队列中的线程

**性能特点**：
- **系统调用开销**：涉及用户态和内核态的切换
- **线程调度开销**：线程的阻塞和唤醒需要操作系统调度器参与
- **适用场景**：高竞争、长时间持有锁的场景

### 4. 锁优化技术

#### 4.1 自适应自旋锁 (Adaptive Spinning)

**原理**：在升级为重量级锁之前，让线程进行自旋等待，避免线程阻塞和唤醒的开销。

**自适应机制**：
- **历史成功率**：根据历史上在同一个锁上的自旋成功率来决定自旋时间
- **动态调整**：如果自旋很少成功，那么以后就减少自旋时间；如果自旋经常成功，就增加自旋时间

#### 4.2 锁消除 (Lock Elimination)

**原理**：JIT 编译器通过逃逸分析，如果判断一段代码中，堆上的所有数据都不会逃逸出去从而被其他线程访问到，就可以把它们当作栈上数据对待，认为它们是线程私有的，同步加锁就无须进行。

#### 4.3 锁粗化 (Lock Coarsening)

**原理**：如果虚拟机探测到有一串零碎的操作都对同一个对象加锁，将会把加锁的范围扩展（粗化）到整个操作序列的外部。

### 5. 内存语义与 happens-before 关系

`synchronized` 不仅提供互斥性，还提供内存可见性保证：

1. **锁获取**：具有与 `volatile` 读相同的内存语义
2. **锁释放**：具有与 `volatile` 写相同的内存语义
3. **happens-before 关系**：对一个锁的解锁 happens-before 随后对这个锁的加锁

### 6. 与其他同步机制的对比

| 特性 | synchronized | ReentrantLock | volatile |
|------|--------------|---------------|----------|
| 互斥性 | ✓ | ✓ | ✗ |
| 可见性 | ✓ | ✓ | ✓ |
| 原子性 | ✓ | ✓ | ✗ |
| 可重入 | ✓ | ✓ | N/A |
| 可中断 | ✗ | ✓ | N/A |
| 公平性 | ✗ | 可选 | N/A |
| 条件变量 | ✗ | ✓ | N/A |
| 性能 | JVM优化 | 略低 | 最高 |

---

## 【案例分析】

### 案例：高并发计数器的锁优化过程

考虑一个简单的计数器场景，展示 `synchronized` 锁升级的完整过程：

```java
public class Counter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

#### 场景 1：单线程访问 - 偏向锁优化

**初始状态**：对象创建后，Mark Word 处于无锁状态。

**首次加锁**：
1. 线程 A 调用 `increment()` 方法
2. JVM 检测到无竞争，将锁偏向线程 A
3. Mark Word 存储线程 A 的 ID，锁标志位设置为 01，偏向锁标志设置为 1

**后续访问**：
- 线程 A 再次调用 `increment()` 或 `getCount()`
- 只需检查 Mark Word 中的线程 ID
- 无需任何 CAS 操作，性能开销极小

#### 场景 2：轻微竞争 - 轻量级锁

**竞争出现**：线程 B 尝试获取锁

**偏向锁撤销**：
1. JVM 在全局安全点暂停线程 A
2. 检查线程 A 是否还在执行同步块
3. 撤销偏向锁，升级为轻量级锁

**轻量级锁获取**：
1. 线程 B 在栈帧中创建锁记录
2. 使用 CAS 操作尝试将 Mark Word 指向锁记录
3. 成功则获取锁，失败则自旋等待

#### 场景 3：激烈竞争 - 重量级锁

**高竞争场景**：多个线程同时访问计数器

**升级触发**：
- 轻量级锁的 CAS 操作失败次数过多
- 自旋等待超过阈值
- 系统判断升级为重量级锁更有效

**重量级锁机制**：
1. 创建 Monitor 对象
2. 无法获取锁的线程进入等待队列
3. 锁释放时唤醒等待线程
4. 涉及操作系统级别的线程调度

### 性能分析

在不同竞争程度下的性能表现：

| 竞争程度 | 锁类型 | 相对性能 | 适用场景 |
|----------|--------|----------|----------|
| 无竞争 | 偏向锁 | 100% | 单线程或串行访问 |
| 轻微竞争 | 轻量级锁 | 85% | 线程交替访问 |
| 中等竞争 | 轻量级锁 + 自旋 | 60% | 短时间持锁 |
| 激烈竞争 | 重量级锁 | 30% | 长时间持锁或高并发 |

---

## 【核心代码片段】

### 锁升级过程的关键逻辑

```java
// 简化的锁获取逻辑
public void acquireLock(Object obj) {
    // 1. 检查偏向锁
    if (isBiasedToCurrentThread(obj)) {
        // 偏向锁快速路径
        return;
    }
    
    // 2. 尝试轻量级锁
    if (tryLightweightLock(obj)) {
        return;
    }
    
    // 3. 升级为重量级锁
    acquireHeavyweightLock(obj);
}

private boolean tryLightweightLock(Object obj) {
    // 在栈帧中创建锁记录
    LockRecord lockRecord = currentThread().createLockRecord();
    
    // CAS 操作尝试获取锁
    return compareAndSwapMarkWord(obj, lockRecord);
}
```

### 同步块的内存屏障效果

```java
public class MemoryVisibilityExample {
    private boolean flag = false;
    private int value = 0;
    
    public synchronized void writer() {
        value = 42;      // 1. 写入共享变量
        flag = true;     // 2. 设置标志位
        // 3. synchronized 退出时插入 StoreLoad 屏障
    }
    
    public synchronized void reader() {
        // 4. synchronized 进入时插入 LoadLoad 屏障
        if (flag) {      // 5. 读取标志位
            // 6. 保证能看到 value = 42 的修改
            assert value == 42;
        }
    }
}
```

---

## 【生产实践考量】

### 1. 性能调优参数

#### JVM 参数配置

```bash
# 禁用偏向锁（在高竞争场景下）
-XX:-UseBiasedLocking

# 调整偏向锁延迟启动时间
-XX:BiasedLockingStartupDelay=0

# 调整自旋次数
-XX:PreBlockSpin=10
```

#### 监控指标

- **锁竞争率**：通过 JProfiler 或 JConsole 监控
- **线程阻塞时间**：使用 `-XX:+PrintGCApplicationStoppedTime`
- **锁升级频率**：通过 `-XX:+TraceBiasedLocking` 跟踪

### 2. 常见性能陷阱

#### 陷阱 1：过度同步

```java
// 问题：对整个方法加锁
public synchronized void processLargeData(List<Data> dataList) {
    // 大量计算逻辑
    for (Data data : dataList) {
        // 耗时操作
        processData(data);
    }
}

// 优化：缩小同步范围
public void processLargeData(List<Data> dataList) {
    for (Data data : dataList) {
        processData(data);
        
        synchronized (this) {
            // 只对必要的共享状态修改加锁
            updateSharedState(data);
        }
    }
}
```

#### 陷阱 2：锁粒度过粗

```java
// 问题：使用类锁
public static synchronized void updateUserInfo(User user) {
    // 所有用户信息更新都会串行化
}

// 优化：使用实例锁或更细粒度的锁
public void updateUserInfo(User user) {
    synchronized (user) {
        // 只对特定用户加锁
    }
}
```

### 3. 故障排查指南

#### 死锁检测

```java
// 使用 ThreadMXBean 检测死锁
ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
long[] deadlockedThreads = threadBean.findDeadlockedThreads();
if (deadlockedThreads != null) {
    ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
    // 分析死锁信息
}
```

#### 锁竞争分析

```bash
# 使用 jstack 分析线程状态
jstack <pid> | grep -A 10 -B 10 "waiting for monitor entry"

# 使用 JProfiler 分析锁竞争热点
# 关注 "Monitor Usage" 和 "Thread States" 视图
```

### 4. 最佳实践建议

1. **锁粒度优化**：尽可能缩小同步范围，只对必要的共享状态加锁
2. **避免锁嵌套**：防止死锁，如果必须嵌套，保证锁的获取顺序一致
3. **考虑读写分离**：对于读多写少的场景，考虑使用 `ReadWriteLock`
4. **监控锁竞争**：在生产环境中持续监控锁的竞争情况
5. **合理选择同步机制**：根据具体场景选择 `synchronized`、`ReentrantLock` 或无锁算法

---

**相关阅读**：
- [Java 内存模型 (JMM) 深度解读](./jmm-deep-dive.md)
- [`volatile` 关键字深度解析](./volatile-keyword-deep-dive.md)
- [线程的创建、状态与生命周期](./thread-lifecycle-and-states.md)

**下一步**：深入学习 `ReentrantLock` 与 `ReadWriteLock` 的高级特性和应用场景。 