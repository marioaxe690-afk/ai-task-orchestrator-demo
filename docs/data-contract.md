# Data Contract

The primary dataset is split across six JSON files under `data/`. Each file uses a top-level array.

## `userInputCases.json`

Mock user inputs and the orchestration classification attached to each input.

Required fields:

- `id`
- `title`
- `inputType`: `text`, `image`, or `image_text`
- `userText`
- `detectedIntentIds`
- `taskType`: `simple_atomic_task`, `complex_composite_task`, `ambiguous_task`, `emergency_task`, or `multimodal_task`
- `urgency`: `low`, `medium`, or `high`
- `needsClarification`
- `expectedOutput`

Optional fields:

- `imagePath`
- `subject`
- `recommendedTemplateId`

## `intentLabels.json`

Reusable intent labels.

Required fields:

- `id`
- `name`
- `description`

## `atomicTasks.json`

Small executable units for task decomposition.

Required fields:

- `id`
- `name`
- `description`
- `difficulty`: `low`, `medium`, or `high`
- `estimatedMinutes`
- `inputNeeded`
- `completionCriteria`
- `failureRisk`

## `compositeTaskTemplates.json`

Reusable task flows assembled from atomic task IDs.

Required fields:

- `id`
- `name`
- `triggerConditions`
- `atomicTaskIds`
- `estimatedTotalMinutes`
- `difficulty`
- `outputGoal`

## `feedbackLoops.json`

Questions and next actions that keep the flow adaptive.

Required fields:

- `id`
- `afterTaskId`
- `question`
- `positiveNextAction`
- `negativeNextAction`

## `demoScenarios.json`

Frontend-ready demo stories.

Required fields:

- `id`
- `title`
- `userInputCaseId`
- `flow`
- `demoHighlight`

## ID Relationships

- `demoScenarios.userInputCaseId` -> `userInputCases.id`
- `userInputCases.detectedIntentIds` -> `intentLabels.id`
- `userInputCases.recommendedTemplateId` -> `compositeTaskTemplates.id`
- `compositeTaskTemplates.atomicTaskIds` -> `atomicTasks.id`
- `feedbackLoops.afterTaskId` -> `atomicTasks.id`

Run `npm run validate:data` after every data edit.
