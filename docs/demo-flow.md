# Demo Flow

下面是核心 Demo“数学视频截图临考救急”的完整闭环。

## 1. 用户输入

用户上传数学视频截图，并输入：

```text
明天就要考数学了，这个还没看懂。
```

对应数据：

- `demoScenarios.id`: `scenario-exam-rescue`
- `userInputCases.id`: `case-math-video-exam-rescue`
- `imagePath`: `/assets/screenshots/math-video-001.svg`

## 2. 意图识别

系统不直接解题，而是先识别意图：

- `intent_exam_rescue`: 临考救急
- `intent_review_plan`: 制定计划
- `intent_multimodal_understanding`: 多模态理解

## 3. 任务类型判断

该输入被判定为：

- `taskType`: `emergency_task`
- `urgency`: `high`
- `needsClarification`: `false`

原因是用户已给出考试时间压力和学习对象，系统可以先生成最小可执行方案。

## 4. 任务拆解

推荐模板：

- `template-exam-rescue`: 临考数学冲刺任务

核心元任务：

- 提取题目文字
- 判断用户目标
- 判断紧急程度
- 提取知识点
- 判断学习优先级
- 压缩任务范围
- 时间盒安排
- 创建反馈节点

## 5. 难度时间评估

模板难度为 `high`，因为它同时包含截图理解、临考压缩和复习计划。

每个元任务都有 `estimatedMinutes`，前端可以展示分段耗时，也可以汇总为总计划时间。

## 6. 反馈闭环

在时间盒计划后触发反馈：

```text
这个时间安排会不会太满？
```

如果用户回答“可以”，进入第一段复习任务。

如果用户回答“太满”，系统进入压缩调整：

- 降低解释难度
- 删除低收益任务
- 缩短练习数量
- 重新安排时间盒
- 再次确认新计划是否可接受

这个闭环展示了本仓库的核心：AI 不只是输出一次答案，而是根据用户反馈调整下一步。
