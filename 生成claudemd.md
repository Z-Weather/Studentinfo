请仔细阅读并分析 `repopack-output.xml` 文件（这是我项目的全量代码快照）。

基于对这份快照的深度理解，请为我生成一份 `CLAUDE.md` 文件。这份文件将作为你未来协助我开发的核心记忆库。

请严格按照以下结构生成内容：

1.  **Commands (常用命令)**
    * 根据 package.json 或配置文件，提取启动 (dev)、构建 (build)、Lint 等命令。
    * **重要规则**：请务必在该部分用粗体备注：**"Testing is handled manually by the user. Do not run tests automatically."** (测试由用户手动进行，不要自动运行测试)。

2.  **Tech Stack (技术栈)**
    * 列出主要框架、UI 库、状态管理、数据库/ORM 工具等。

3.  **Project Structure (架构分析)**
    * 基于快照中的文件分布，解释主要目录（如 `/src`, `/components`, `/api` 等）的职责。
    * 指出核心业务逻辑通常位于何处。

4.  **Code Style & Conventions (代码风格与规范)**
    * 这是最重要的一点。请“模仿”快照中的现有代码：
    * 命名风格（驼峰 vs 蛇形？）
    * 组件写法（Class vs Functional？）
    * 类型定义（TypeScript 类型是集中管理还是分散？）
    * 是否使用特定的工具库（如 lodash, date-fns）？

**输出要求**：
请直接输出 Markdown 代码块。在我检查无误后，我会让你将其保存为 `CLAUDE.md`。