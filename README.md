# ai-task-orchestrator-demo

这是一个 AI 黑客松 / AI 交流比赛项目的静态 Demo 数据仓库，用来展示“AI 任务编排 / 任务拆解”的数据结构。

当前仓库不是前端项目、不是后端项目、不是数据库服务，也不接真实 AI API。它只提供一组可被前端、演示脚本或 prompt 测试直接读取的静态 JSON 数据。

## 项目是什么

项目模拟一个学习场景下的 AI 任务编排器：

```text
用户输入 -> 意图识别 -> 任务类型判断 -> 任务拆解 -> 难度时间评估 -> 反馈闭环
```

典型输入可能是截图、混乱文字或截图加文字。系统关注的不是“把数学题做出来”这一件事，而是先判断用户真实需求、紧急程度、是否需要追问，以及复杂任务应该拆成哪些可执行元任务。

## 为什么这不是数学题库

仓库里的很多例子使用数学学习场景，是因为“临考、截图、不会、计划太满”非常适合展示任务编排能力。

但本仓库不收集普通数学题、不维护题库答案，也不提供标准解题数据库。核心资产是：

- 用户输入类型和真实意图
- 任务是简单元任务还是复杂组合任务
- 是否需要追问
- 元任务拆解、难度、耗时、完成标准和失败风险
- 用户完成或没完成后的反馈调整

## 六个核心 JSON

主数据入口是以下 6 个文件：

- `data/userInputCases.json`：用户输入案例，包含输入类型、用户原话、图片路径、意图、任务类型、紧急程度、是否追问和期望输出。
- `data/intentLabels.json`：可复用意图标签，例如识别内容、理解知识点、解题、临考救急、制定计划、反馈调整。
- `data/atomicTasks.json`：任务编排中的元任务，包含难度、预计分钟数、输入需求、完成标准和失败风险。
- `data/compositeTaskTemplates.json`：组合任务模板，由多个 `atomicTaskIds` 组成。
- `data/feedbackLoops.json`：某个元任务完成后要问什么，以及完成 / 未完成时下一步怎么调整。
- `data/demoScenarios.json`：可直接给前端 Demo 使用的完整流程脚本。

`data/demo-cases.json` 只保留为 legacy 初始数据快照，不是主数据入口。新前端和新文档都应该读取上面的 6 个 JSON。

## 前端如何读取

前端可以直接 import 6 个 JSON，然后按 ID 组装展示数据：

1. 从 `demoScenarios` 选择一个 Demo。
2. 用 `demoScenario.userInputCaseId` 找到 `userInputCases`。
3. 用 `userInputCase.detectedIntentIds` 找到 `intentLabels`。
4. 用 `userInputCase.recommendedTemplateId` 找到 `compositeTaskTemplates`。
5. 用 `compositeTaskTemplate.atomicTaskIds` 找到 `atomicTasks`。
6. 用 `feedbackLoops.afterTaskId` 找到相关反馈闭环。

完整示例见：

- `docs/frontend-integration.md`
- `docs/frontend-data-example.ts`

## 校验数据

运行：

```bash
npm run validate:data
```

校验脚本会检查：

- 6 个核心 JSON 是否存在且可解析
- 每个数组对象 `id` 是否唯一
- 必填字段、枚举值和正数时间是否合法
- 所有跨文件 ID 关系是否完整
- `detectedIntentIds`、`atomicTaskIds`、`flow` 是否为非空数组
- `imagePath` 指向缺失图片时只输出 warning，不直接失败

通过时输出：

```text
✅ Data validation passed.
```

失败时输出：

```text
❌ Data validation failed.
```

并列出文件、对象 id 和错误原因。

## 当前阶段边界

当前阶段只维护静态 Demo 数据：

- 不创建前端项目
- 不创建后端项目
- 不接数据库
- 不接真实 AI API
- 不上传 API Key
- 不上传真实隐私截图
- 不把项目改成普通数学题库
