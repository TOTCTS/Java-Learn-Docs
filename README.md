# Java 全栈学习文档

这是一份涵盖 Java 核心、主流框架、数据库、中间件及 DevOps 的学习笔记，旨在构建一个结构化、易于查阅和持续更新的知识库。

本项目使用 [VitePress](https://vitepress.dev/) 进行构建。

## 在线访问

- [**Java 技术总览**](./docs/overview.md)

## 快速开始

1.  **克隆项目**
    ```bash
    git clone <your-repository-url>
    cd java-learn-docs
    ```

2.  **安装依赖**
    确保你已经安装了 [Node.js](https://nodejs.org/) (推荐 v18+)。
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    此命令会启动一个本地开发服务器，地址通常为 `http://localhost:5173`。
    ```bash
    npm run docs:dev
    ```

## 主要命令

- `npm run docs:dev`: 启动本地开发服务器并实时预览。
- `npm run docs:build`: 构建静态网站文件至 `.vitepress/dist` 目录。
- `npm run docs:preview`: 在本地预览构建后的网站。
