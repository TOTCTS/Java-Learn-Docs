# Java 内存模型 (JMM) 深度解读

<img src="/docs/public/assets/java/concurrent/jmm-overview.svg" alt="Java 内存模型概览图" style="max-width: 800px; margin: 0 auto; display: block;"/>

## 【核心讲解】

**本质定义**: Java 内存模型（Java Memory Model, JMM）是一套语言层面的规范，它**屏蔽了各种硬件和操作系统的内存访问差异**，定义了 Java 程序中各种变量（实例字段、静态字段和构成数组对象的元素，但不包括局部变量与方法参数）的访问规则，即在虚拟机中将变量存储到内存和从内存中取出变量这样的底层细节。

**核心价值**: JMM 的核心价值在于解决并发编程中的三大问题：**原子性（Atomicity）**、**可见性（Visibility）**和**有序性（Ordering）**。在多线程环境中，如果没有 JMM 的规范，开发者将不得不面对由于 CPU 缓存、指令重排序等底层优化带来的各种不可预期的“诡异”结果。JMM 通过定义一套清晰的规则（如 `happens-before` 原则），为开发者提供了一个稳定、一致的内存视图，使得并发程序的行为变得可预测。

**设计初衷**: JMM 并非一个真实存在的物理区域，而是一个抽象概念。其设计初衷是在保证程序正确性的前提下，尽可能地让编译器和处理器进行优化，以提升程序性能。它试图在“开发者想要的强内存一致性”和“处理器追求的高性能”之间找到一个平衡点。

## 【详细讲解】

要理解 JMM，首先要明白它与物理硬件内存架构的关系。

### JMM 与硬件内存架构

在现代计算机中，CPU 的运算速度远超主内存（RAM）的读写速度。为了弥补这个鸿沟，CPU 内部引入了多级高速缓存（Cache）。这导致了以下问题：

1.  **缓存一致性问题**: 每个 CPU核心都有自己的缓存，同一份数据可能在多个缓存中存在副本。当一个核心修改了数据，如何保证其他核心能看到最新的值？这就是可见性问题的根源。
2.  **指令重排序问题**: 为了提升性能，处理器和编译器可能会对输入的代码进行乱序执行优化，只要单线程内的最终结果不变即可。但在多线程环境中，这种重排序可能会导致逻辑错误，这是有序性问题的根源。

JMM 正是为了解决这些问题而生的。它规定：
-   所有变量都存储在**主内存（Main Memory）**中，这是一个所有线程共享的区域。
-   每条线程都有自己的**工作内存（Working Memory）**，它保存了该线程使用的变量的主内存副本。
-   线程对变量的所有操作（读取、赋值等）都**必须在工作内存中进行**，不能直接读写主内存中的变量。
-   不同线程之间也无法直接访问对方工作内存中的变量，线程间变量值的传递均需要通过主内存来完成。

这个“工作内存”是 JMM 的一个抽象概念，它涵盖了缓存、写缓冲区、寄存器等。

### 并发三大特性与 JMM

#### 1. 原子性 (Atomicity)
指一个或多个操作，要么全部执行且执行的过程不会被任何因素打断，要么就都不执行。

-   **基本类型原子性**: JMM 保证了对基本数据类型（`int`, `short`, `byte`, `boolean`, `char`, `float`）的读写操作是原子的。对于 `long` 和 `double` 这两个 64 位的数据类型，规范允许虚拟机将其读写操作划分为两次 32 位的操作，但大多数现代商用 JVM（如 HotSpot）都实现了对 `long` 和 `double` 的原子性读写。
-   **`synchronized` 保证**: 对于更大范围的原子性（如 `i++` 或方法调用），JMM 提供了 `synchronized` 关键字。被 `synchronized` 包裹的代码块是原子的，在执行期间不会被其他线程打断。

#### 2. 可见性 (Visibility)
指当一个线程修改了共享变量的值，其他线程能够立即得知这个修改。

-   **`volatile`**: 使用 `volatile` 关键字修饰的变量，当一个线程修改了它的值，JMM 会强制将新值立即刷新到主内存。同时，当其他线程需要读取该变量时，会强制从主内存重新读取，从而保证了可见性。
-   **`synchronized`**: 当一个线程释放锁时，JMM 会把该线程在同步块内对共享变量的修改刷新到主内存。当另一个线程获取锁时，会清空工作内存，从主内存加载共享变量的最新值。
-   **`final`**: 被 `final` 修饰的字段在构造函数中一旦初始化完成，并且构造函数没有把 `this` 引用传递出去，那么在其他线程中就能看见 `final` 字段的值。

#### 3. 有序性 (Ordering)
即程序执行的顺序按照代码的先后顺序执行。

-   **指令重排序**: 编译器和处理器通常会对指令做重排序。在单线程内，这不会影响最终结果。但在多线程中，可能会出现问题。
-   **`volatile`**: `volatile` 关键字本身就包含了禁止指令重排序的语义，它通过插入**内存屏障**（Memory Barrier）来实现。
-   **`synchronized`**: `synchronized` 同样保证有序性。一个变量在同一个锁中只能被一个线程访问，所以无论如何重排序，单线程内的执行结果不会变，也就保证了线程间的有序性。

### Happens-Before 原则

JMM 定义了 `happens-before` 原则，它是判断数据是否存在竞争、线程是否安全的主要依据。`happens-before` 原则阐述了操作之间的内存可见性。如果两个操作之间存在 `happens-before` 关系，那么前一个操作的结果将对后一个操作可见。

主要规则如下：
1.  **程序次序规则 (Program Order Rule)**: 在一个线程内，按照程序代码顺序，书写在前面的操作 `happens-before` 于书写在后面的操作。
2.  **管程锁定规则 (Monitor Lock Rule)**: 一个 `unlock` 操作 `happens-before` 于后面对**同一个锁**的 `lock` 操作。
3.  **volatile 变量规则 (Volatile Variable Rule)**: 对一个 `volatile` 变量的写操作 `happens-before` 于后面对这个变量的读操作。
4.  **线程启动规则 (Thread Start Rule)**: `Thread` 对象的 `start()` 方法 `happens-before` 于此线程的每一个动作。
5.  **线程终止规则 (Thread Termination Rule)**: 线程中的所有操作都 `happens-before` 于对此线程的终止检测（如 `Thread.join()`）。
6.  **线程中断规则 (Thread Interruption Rule)**: 对线程 `interrupt()` 方法的调用 `happens-before` 于被中断线程的代码检测到中断事件的发生。
7.  **对象终结规则 (Finalizer Rule)**: 一个对象的初始化完成 `happens-before` 于它的 `finalize()` 方法的开始。
8.  **传递性 (Transitivity)**: 如果操作 A `happens-before` 操作 B，操作 B `happens-before` 操作 C，那么可以得出操作 A `happens-before` 操作 C。

## 【案例分析】

一个经典的因指令重排序导致问题的案例是**双重检查锁定（Double-Checked Locking, DCL）**单例模式。

```java
public class Singleton {
    // 使用 volatile 禁止指令重排序
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) { // 第一次检查
            synchronized (Singleton.class) {
                if (instance == null) { // 第二次检查
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**问题分析**:
在 `instance = new Singleton()` 这行代码中，一个对象的创建在 JVM 层面大致可以分为三步：
1.  分配对象的内存空间。
2.  初始化对象（执行构造函数）。
3.  将 `instance` 引用指向分配的内存地址。

如果没有 `volatile`，由于指令重排序，这三步的顺序可能变成 1 -> 3 -> 2。

**错误场景**:
1.  线程 A 进入 `synchronized` 代码块，执行 `instance = new Singleton()`。
2.  发生了指令重排序，JVM 先执行了第 1 步（分配内存）和第 3 步（设置引用），此时 `instance` 已经不为 `null`，但对象还未初始化。
3.  此时线程 B 调用 `getInstance()`，在第一次检查时发现 `instance` 不为 `null`，于是直接返回了这个**尚未完全初始化**的 `instance` 对象。
4.  线程 B 使用这个对象，就可能引发各种不可预知的错误。

**解决方案**:
给 `instance` 变量加上 `volatile` 关键字。`volatile` 的一个重要作用就是禁止指令重排序，它会确保对象的创建过程严格按照 1 -> 2 -> 3 的顺序执行，从而避免了 DCL 失效的问题。

## 【代码示例】

下面的代码演示了 `volatile` 是如何保证可见性的。

```java
public class VisibilityTest {
    // 如果没有 volatile，子线程可能永远无法结束
    private static volatile boolean running = true;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            System.out.println("子线程启动...");
            while (running) {
                // 空循环，让子线程有机会从主内存读取 running 的值
                // 如果这里有 synchronized 或其他 I/O 操作，也可能碰巧解决可见性问题
            }
            System.out.println("子线程结束。");
        }).start();

        // 确保子线程已经启动并进入循环
        Thread.sleep(1000);

        System.out.println("主线程将 running 设置为 false");
        running = false;
    }
}
```
**代码解读**:
1.  主线程和子线程共享一个 `running` 变量。
2.  子线程在一个 `while` 循环中检查 `running` 的值。
3.  主线程在 1 秒后将 `running` 设置为 `false`。
4.  **如果 `running` 没有被 `volatile` 修饰**: 子线程可能会将 `running` 的初始值 `true` 缓存到自己的工作内存中。即使主线程修改了主内存中的 `running`，子线程也可能因为一直读取自己的缓存而永远无法看到这个变化，导致循环无法停止。
5.  **当 `running` 被 `volatile` 修饰后**: 主线程对 `running` 的修改会立即刷新到主内存，并且让所有缓存了该变量的线程工作内存失效。子线程在下一次循环判断时，必须从主内存重新读取 `running` 的最新值 `false`，从而保证了循环能够正常结束。 