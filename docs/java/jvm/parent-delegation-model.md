# 双亲委派模型与自定义类加载器

![双亲委派模型工作流程](/docs/public/assets/java/jvm/parent-delegation-model-diagram.svg)

双亲委派模型是 Java 类加载机制的核心设计模式，它定义了类加载器之间的协作关系和加载顺序。这个模型不仅保证了 Java 平台的安全性和稳定性，也为复杂的应用场景提供了灵活的扩展机制。深入理解双亲委派模型，是掌握 Java 类加载机制、实现自定义类加载器的关键。

## 【核心讲解】

### 1. 什么是双亲委派模型？

**双亲委派模型 (Parent Delegation Model)** 是一种类加载的协作机制，它规定了类加载器之间的工作顺序：

- **向上委派**：当一个类加载器收到类加载请求时，它不会立即尝试加载，而是先将请求委派给父加载器
- **逐级委派**：这个委派过程会一直向上传递，直到到达最顶层的启动类加载器
- **向下尝试**：只有当父加载器无法完成加载时，子加载器才会尝试自己加载

### 2. 为什么需要双亲委派模型？

双亲委派模型解决了类加载中的三个核心问题：

**安全性保障**：
- 防止核心 Java API 被篡改或替换
- 确保 `java.lang.Object` 等基础类只能由启动类加载器加载
- 避免恶意代码通过自定义类加载器加载伪造的系统类

**类的唯一性**：
- 保证同一个类在 JVM 中只有一个 Class 对象
- 避免类的重复加载造成的内存浪费和类型冲突

**层次化管理**：
- 建立清晰的类加载层次结构
- 实现不同级别类库的有序管理
- 支持类的按需加载和动态扩展

---

## 【详细讲解】

### 双亲委派模型的工作机制

#### 核心工作流程

双亲委派模型的执行过程可以分为两个阶段：**委派阶段**和**加载阶段**。

```
1. 委派阶段 (向上委派)
   用户代码 → 应用类加载器 → 扩展类加载器 → 启动类加载器

2. 加载阶段 (向下尝试)
   启动类加载器 → 扩展类加载器 → 应用类加载器 → 用户代码
```

#### 详细执行步骤

**步骤 1：接收加载请求**
```java
// 应用代码请求加载一个类
Class<?> clazz = Class.forName("com.example.MyClass");
```

**步骤 2：检查缓存**
- 首先检查该类是否已经被当前类加载器加载过
- 如果已加载，直接返回缓存的 Class 对象
- 如果未加载，进入委派流程

**步骤 3：向上委派**
```java
// 伪代码：类加载器的委派逻辑
protected Class<?> loadClass(String name, boolean resolve) {
    // 检查是否已加载
    Class<?> c = findLoadedClass(name);
    if (c == null) {
        if (parent != null) {
            // 委派给父加载器
            c = parent.loadClass(name, false);
        } else {
            // 没有父加载器，委派给启动类加载器
            c = findBootstrapClassOrNull(name);
        }
        
        if (c == null) {
            // 父加载器无法加载，尝试自己加载
            c = findClass(name);
        }
    }
    return c;
}
```

**步骤 4：逐级尝试加载**
- 启动类加载器尝试从 `<JAVA_HOME>/lib` 加载
- 如果失败，扩展类加载器尝试从 `<JAVA_HOME>/lib/ext` 加载
- 如果仍失败，应用类加载器尝试从 `classpath` 加载
- 最后，自定义类加载器尝试从指定路径加载

#### 类加载器的父子关系

**重要概念**：类加载器之间的"父子关系"是通过**组合**实现的，而不是继承。

```java
public abstract class ClassLoader {
    // 父加载器是通过组合方式持有的
    private final ClassLoader parent;
    
    protected ClassLoader(ClassLoader parent) {
        this.parent = parent;
    }
    
    public final ClassLoader getParent() {
        return parent;
    }
}
```

**层次结构**：
```
启动类加载器 (Bootstrap ClassLoader)
    ↑ parent
扩展类加载器 (Extension ClassLoader)
    ↑ parent
应用类加载器 (Application ClassLoader)
    ↑ parent
自定义类加载器 (Custom ClassLoader)
```

### 双亲委派模型的实现源码分析

#### ClassLoader.loadClass() 方法

```java
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException {
    
    synchronized (getClassLoadingLock(name)) {
        // 1. 检查类是否已经加载
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            long t0 = System.nanoTime();
            try {
                if (parent != null) {
                    // 2. 委派给父加载器
                    c = parent.loadClass(name, false);
                } else {
                    // 3. 没有父加载器，委派给启动类加载器
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // 父加载器无法加载，不是异常情况
            }

            if (c == null) {
                // 4. 父加载器无法加载，尝试自己加载
                long t1 = System.nanoTime();
                c = findClass(name);
                
                // 记录加载统计信息
                sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                sun.misc.PerfCounter.getFindClasses().increment();
            }
        }
        
        if (resolve) {
            // 5. 如果需要，进行类的解析
            resolveClass(c);
        }
        return c;
    }
}
```

#### 关键方法说明

**findLoadedClass(String name)**：
- 检查指定名称的类是否已经被当前类加载器加载
- 返回已加载的 Class 对象，如果未加载则返回 null

**findClass(String name)**：
- 由子类实现的抽象方法
- 定义了类加载器的具体加载逻辑
- 通常需要重写此方法来实现自定义加载行为

**defineClass(byte[] b, int off, int len)**：
- 将字节数组转换为 Class 对象
- 这是类加载的核心方法，由 JVM 原生实现
- 只能被类加载器内部调用

### 双亲委派模型的优势与限制

#### 优势

**1. 安全性**：
```java
// 假设有恶意代码试图替换 String 类
public class String {
    // 恶意实现
    public void maliciousMethod() {
        // 恶意代码
    }
}
```
由于双亲委派模型，这个恶意的 `String` 类永远不会被加载，因为真正的 `java.lang.String` 已经被启动类加载器加载了。

**2. 避免重复加载**：
- 确保每个类只被加载一次
- 减少内存占用和加载时间
- 保持类的一致性

**3. 层次化管理**：
- 核心类库由启动类加载器管理
- 扩展功能由扩展类加载器管理
- 应用代码由应用类加载器管理

#### 限制

**1. 父加载器无法访问子加载器的类**：
```java
// 这种情况会导致 ClassNotFoundException
// 因为启动类加载器无法看到应用类加载器加载的类
public class BootstrapClassNeedsAppClass {
    // 启动类加载器加载的类无法直接使用应用类
    private MyApplicationClass appClass; // 编译错误
}
```

**2. 无法实现热替换**：
- 一旦类被加载，就无法在运行时替换
- 需要重启 JVM 才能加载新版本的类

**3. 限制了灵活性**：
- 某些复杂场景需要打破双亲委派模型
- 例如 OSGi、Spring Boot 等框架需要特殊的类加载机制

### 打破双亲委派模型的场景与方法

#### 需要打破的典型场景

**1. 热部署 (Hot Deployment)**
```java
// Web 应用服务器需要在运行时更新应用
public class WebAppClassLoader extends URLClassLoader {
    @Override
    public Class<?> loadClass(String name, boolean resolve) {
        // 优先从 Web 应用目录加载
        if (name.startsWith("com.myapp.")) {
            return findClass(name);
        }
        // 其他类遵循双亲委派
        return super.loadClass(name, resolve);
    }
}
```

**2. 版本隔离**
```java
// OSGi 框架需要支持同一个类的多个版本
public class OSGiClassLoader extends ClassLoader {
    @Override
    protected Class<?> loadClass(String name, boolean resolve) {
        // 首先检查自己的 Bundle
        Class<?> clazz = findOwnClass(name);
        if (clazz != null) {
            return clazz;
        }
        
        // 然后检查导入的包
        return loadFromImportedPackages(name);
    }
}
```

**3. SPI (Service Provider Interface) 机制**
```java
// JDBC 驱动加载是一个典型的打破双亲委派的例子
public class DriverManager {
    static {
        // 启动类加载器加载的 DriverManager 需要加载
        // 应用类加载器路径下的驱动实现类
        loadInitialDrivers();
    }
    
    private static void loadInitialDrivers() {
        // 使用线程上下文类加载器
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        ServiceLoader<Driver> loadedDrivers = ServiceLoader.load(Driver.class, cl);
        // ...
    }
}
```

#### 打破双亲委派的方法

**方法 1：重写 loadClass 方法**
```java
public class CustomClassLoader extends ClassLoader {
    @Override
    protected Class<?> loadClass(String name, boolean resolve) 
            throws ClassNotFoundException {
        
        // 对特定包名的类，不遵循双亲委派
        if (name.startsWith("com.custom.")) {
            Class<?> clazz = findLoadedClass(name);
            if (clazz == null) {
                clazz = findClass(name); // 直接自己加载
            }
            if (resolve) {
                resolveClass(clazz);
            }
            return clazz;
        }
        
        // 其他类遵循双亲委派
        return super.loadClass(name, resolve);
    }
}
```

**方法 2：使用线程上下文类加载器**
```java
public class ContextClassLoaderExample {
    public void loadServiceProvider() {
        // 获取线程上下文类加载器
        ClassLoader contextCL = Thread.currentThread().getContextClassLoader();
        
        try {
            // 使用上下文类加载器加载类
            Class<?> serviceClass = contextCL.loadClass("com.example.ServiceImpl");
            Object service = serviceClass.newInstance();
            
            // 使用服务
            invokeService(service);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**方法 3：自定义类加载器层次结构**
```java
public class ModularClassLoader extends ClassLoader {
    private List<ClassLoader> moduleLoaders;
    
    public ModularClassLoader(ClassLoader parent, List<ClassLoader> moduleLoaders) {
        super(parent);
        this.moduleLoaders = moduleLoaders;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // 在所有模块加载器中查找
        for (ClassLoader moduleLoader : moduleLoaders) {
            try {
                return moduleLoader.loadClass(name);
            } catch (ClassNotFoundException e) {
                // 继续查找下一个模块
            }
        }
        throw new ClassNotFoundException(name);
    }
}
```

### 自定义类加载器的设计与实现

#### 设计原则

**1. 明确加载范围**：
- 定义清楚自定义类加载器负责加载哪些类
- 避免与系统类加载器的职责重叠

**2. 选择合适的父加载器**：
- 通常选择应用类加载器作为父加载器
- 特殊情况下可以选择其他加载器或 null

**3. 实现正确的查找逻辑**：
- 重写 `findClass` 方法而不是 `loadClass` 方法（推荐）
- 或者谨慎地重写 `loadClass` 方法

#### 实现模板

```java
public class TemplateClassLoader extends ClassLoader {
    private String classPath;
    
    public TemplateClassLoader(String classPath) {
        super(); // 使用应用类加载器作为父加载器
        this.classPath = classPath;
    }
    
    public TemplateClassLoader(String classPath, ClassLoader parent) {
        super(parent); // 指定父加载器
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 1. 构造文件路径
            String fileName = name.replace('.', '/') + ".class";
            String fullPath = classPath + File.separator + fileName;
            
            // 2. 读取字节码
            byte[] classData = loadClassData(fullPath);
            
            // 3. 定义类
            return defineClass(name, classData, 0, classData.length);
        } catch (Exception e) {
            throw new ClassNotFoundException("Cannot load class: " + name, e);
        }
    }
    
    private byte[] loadClassData(String filePath) throws IOException {
        // 实现字节码读取逻辑
        try (FileInputStream fis = new FileInputStream(filePath);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
            return baos.toByteArray();
        }
    }
}
```

---

## 【案例分析】

### 案例 1：Tomcat 的类加载器架构

Tomcat 是打破双亲委派模型的典型案例，它为了实现 Web 应用的隔离和热部署，设计了复杂的类加载器体系。

#### Tomcat 的类加载策略

**WebAppClassLoader 的加载顺序**：
1. **先查找本地缓存**：检查类是否已经加载
2. **检查系统类**：对于 `java.*` 包的类，直接委派给父加载器
3. **查找 Web 应用**：在 `/WEB-INF/classes` 和 `/WEB-INF/lib` 中查找
4. **委派给父加载器**：如果本地找不到，才委派给父加载器
5. **抛出异常**：如果都找不到，抛出 `ClassNotFoundException`

#### 实现原理

```java
public class WebAppClassLoader extends URLClassLoader {
    
    @Override
    public Class<?> loadClass(String name, boolean resolve) 
            throws ClassNotFoundException {
        
        synchronized (getClassLoadingLock(name)) {
            Class<?> clazz = null;
            
            // 1. 检查本地缓存
            clazz = findLoadedClass(name);
            if (clazz != null) {
                if (resolve) resolveClass(clazz);
                return clazz;
            }
            
            // 2. 检查系统类（java.* 包）
            if (name.startsWith("java.")) {
                try {
                    clazz = system.loadClass(name);
                    if (clazz != null) {
                        if (resolve) resolveClass(clazz);
                        return clazz;
                    }
                } catch (ClassNotFoundException e) {
                    // 忽略，继续查找
                }
            }
            
            // 3. 在 Web 应用中查找
            boolean delegateLoad = delegate || filter(name);
            if (!delegateLoad) {
                try {
                    clazz = findClass(name);
                    if (clazz != null) {
                        if (resolve) resolveClass(clazz);
                        return clazz;
                    }
                } catch (ClassNotFoundException e) {
                    // 忽略，继续查找
                }
            }
            
            // 4. 委派给父加载器
            if (delegateLoad) {
                try {
                    clazz = Class.forName(name, false, parent);
                    if (clazz != null) {
                        if (resolve) resolveClass(clazz);
                        return clazz;
                    }
                } catch (ClassNotFoundException e) {
                    // 忽略，继续查找
                }
            }
            
            // 5. 再次尝试在 Web 应用中查找
            if (!delegateLoad) {
                try {
                    clazz = findClass(name);
                    if (clazz != null) {
                        if (resolve) resolveClass(clazz);
                        return clazz;
                    }
                } catch (ClassNotFoundException e) {
                    // 忽略
                }
            }
            
            throw new ClassNotFoundException(name);
        }
    }
}
```

#### 优势分析

**应用隔离**：
- 每个 Web 应用都有独立的类加载器
- 不同应用可以使用不同版本的同一个类库
- 避免了类库版本冲突

**热部署支持**：
- 可以在运行时替换整个 Web 应用的类加载器
- 实现应用的热部署和热卸载
- 提高开发和运维效率

### 案例 2：Spring Boot 的类加载机制

Spring Boot 通过自定义类加载器实现了 Fat JAR 的加载机制，支持将所有依赖打包到一个 JAR 文件中。

#### LaunchedURLClassLoader 的实现

```java
public class LaunchedURLClassLoader extends URLClassLoader {
    
    public LaunchedURLClassLoader(URL[] urls, ClassLoader parent) {
        super(urls, parent);
    }
    
    @Override
    protected Class<?> loadClass(String name, boolean resolve) 
            throws ClassNotFoundException {
        
        // 对于 org.springframework.boot.loader 包，使用特殊处理
        if (name.startsWith("org.springframework.boot.loader.")) {
            try {
                Class<?> result = findClass(name);
                if (resolve) {
                    resolveClass(result);
                }
                return result;
            } catch (ClassNotFoundException ex) {
                // 忽略，继续正常流程
            }
        }
        
        // 其他类遵循标准的双亲委派模型
        return super.loadClass(name, resolve);
    }
}
```

#### Fat JAR 的加载原理

**1. JAR 文件结构**：
```
my-app.jar
├── META-INF/
│   └── MANIFEST.MF
├── BOOT-INF/
│   ├── classes/          # 应用代码
│   └── lib/              # 依赖 JAR 文件
└── org/springframework/boot/loader/  # Spring Boot 加载器
```

**2. 启动流程**：
```java
public class JarLauncher extends ExecutableArchiveLauncher {
    
    public static void main(String[] args) throws Exception {
        new JarLauncher().launch(args);
    }
    
    @Override
    protected void launch(String[] args) throws Exception {
        // 1. 创建自定义类加载器
        ClassLoader classLoader = createClassLoader(getClassPathArchives());
        
        // 2. 设置线程上下文类加载器
        Thread.currentThread().setContextClassLoader(classLoader);
        
        // 3. 加载并启动主类
        launch(args, getMainClass(), classLoader);
    }
}
```

---

## 【核心代码片段】

### 线程上下文类加载器的使用

```java
public class ThreadContextClassLoaderExample {
    
    public void useContextClassLoader() {
        // 保存原始的上下文类加载器
        ClassLoader originalCL = Thread.currentThread().getContextClassLoader();
        
        try {
            // 创建自定义类加载器
            CustomClassLoader customCL = new CustomClassLoader("/custom/path");
            
            // 设置为线程上下文类加载器
            Thread.currentThread().setContextClassLoader(customCL);
            
            // 使用 SPI 机制加载服务
            ServiceLoader<MyService> services = ServiceLoader.load(MyService.class);
            for (MyService service : services) {
                service.doSomething();
            }
            
        } finally {
            // 恢复原始的上下文类加载器
            Thread.currentThread().setContextClassLoader(originalCL);
        }
    }
}
```

### 实现加密类加载器

```java
public class EncryptedClassLoader extends ClassLoader {
    private String classPath;
    private String encryptionKey;
    
    public EncryptedClassLoader(String classPath, String encryptionKey) {
        super();
        this.classPath = classPath;
        this.encryptionKey = encryptionKey;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 1. 构造加密文件路径
            String fileName = name.replace('.', '/') + ".encrypted";
            String fullPath = classPath + File.separator + fileName;
            
            // 2. 读取加密的字节码
            byte[] encryptedData = loadEncryptedClassData(fullPath);
            
            // 3. 解密字节码
            byte[] classData = decrypt(encryptedData, encryptionKey);
            
            // 4. 定义类
            return defineClass(name, classData, 0, classData.length);
        } catch (Exception e) {
            throw new ClassNotFoundException("Cannot load encrypted class: " + name, e);
        }
    }
    
    private byte[] loadEncryptedClassData(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
            return baos.toByteArray();
        }
    }
    
    private byte[] decrypt(byte[] encryptedData, String key) {
        // 实现解密逻辑
        // 这里使用简单的 XOR 加密作为示例
        byte[] keyBytes = key.getBytes();
        byte[] decryptedData = new byte[encryptedData.length];
        
        for (int i = 0; i < encryptedData.length; i++) {
            decryptedData[i] = (byte) (encryptedData[i] ^ keyBytes[i % keyBytes.length]);
        }
        
        return decryptedData;
    }
}
```

### 实现模块化类加载器

```java
public class ModuleClassLoader extends ClassLoader {
    private Map<String, ClassLoader> moduleLoaders;
    private Set<String> exportedPackages;
    
    public ModuleClassLoader(ClassLoader parent) {
        super(parent);
        this.moduleLoaders = new HashMap<>();
        this.exportedPackages = new HashSet<>();
    }
    
    public void addModule(String moduleName, ClassLoader moduleLoader, Set<String> exports) {
        moduleLoaders.put(moduleName, moduleLoader);
        exportedPackages.addAll(exports);
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        String packageName = getPackageName(name);
        
        // 检查包是否被导出
        if (!exportedPackages.contains(packageName)) {
            throw new ClassNotFoundException("Package " + packageName + " is not exported");
        }
        
        // 在所有模块中查找
        for (Map.Entry<String, ClassLoader> entry : moduleLoaders.entrySet()) {
            try {
                return entry.getValue().loadClass(name);
            } catch (ClassNotFoundException e) {
                // 继续查找下一个模块
            }
        }
        
        throw new ClassNotFoundException(name);
    }
    
    private String getPackageName(String className) {
        int lastDotIndex = className.lastIndexOf('.');
        return lastDotIndex == -1 ? "" : className.substring(0, lastDotIndex);
    }
}
```

通过深入理解双亲委派模型的原理和实现，我们可以更好地设计和实现自定义类加载器，满足复杂应用场景的需求，同时保持系统的安全性和稳定性。 