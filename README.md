# ai-task-orchestrator-demo

AI task orchestrator demo data repository.

This repository is a structured static database for demonstrating how an AI assistant can turn messy student input into an executable task flow. It is data-first: there is no frontend app, no backend service, no login, no database server, and no real AI API integration in the current stage.

## What This Project Is

The repo models the orchestration layer behind a study assistant:

```text
User input -> Intent detection -> Task type judgment -> Task decomposition -> Difficulty and time estimate -> Feedback loop
```

The dataset is designed for frontend demos, product walkthroughs, prompt testing, and static UI prototypes that need realistic orchestration data without connecting to private users or live services.

## Why This Is Not a Math Question Bank

Although many examples use math-learning situations, this project does not store a catalog of math problems or official solutions. The core asset is the decision process around user input: whether the request is ambiguous, urgent, multimodal, simple, or complex, and which atomic tasks should happen next.

Math appears only as a familiar scenario for showing task orchestration.

## Core Data Files

The current primary dataset is split across six JSON files:

- `data/userInputCases.json` - mock user inputs, detected intents, urgency, clarification needs, and expected outputs.
- `data/intentLabels.json` - reusable intent labels used by the input cases.
- `data/atomicTasks.json` - small executable task units with difficulty, time estimate, completion criteria, and failure risk.
- `data/compositeTaskTemplates.json` - reusable task templates assembled from atomic task IDs.
- `data/feedbackLoops.json` - follow-up questions and next actions after specific atomic tasks.
- `data/demoScenarios.json` - frontend-ready demo flows that connect input cases to the orchestration story.

`data/demo-cases.json` is kept only as a legacy snapshot from the initial simplified setup. New consumers should read the six files above.

## Frontend Usage

A frontend can import the six JSON files directly, then assemble a display model by resolving IDs:

1. Pick a `demoScenarios` record.
2. Resolve `demoScenario.userInputCaseId` into `userInputCases`.
3. Resolve `userInputCase.detectedIntentIds` into `intentLabels`.
4. Resolve `userInputCase.recommendedTemplateId` into `compositeTaskTemplates`.
5. Resolve `compositeTaskTemplate.atomicTaskIds` into `atomicTasks`.
6. Resolve `feedbackLoops.afterTaskId` against the selected atomic tasks.

See `docs/frontend-integration.md` and `docs/frontend-data-example.ts` for a concrete assembly example.

## Validate Data

Run:

```bash
npm run validate:data
```

The validator checks JSON parsing, required fields, unique IDs, enum values, positive time estimates, non-empty demo flows, and all cross-file ID relationships. Missing `imagePath` assets are warnings, not fatal errors, so frontend teams can wire placeholder images later.

## Current Stage

This repo currently ships static demo data only. It should not be expanded into a backend, database-backed service, frontend project, or real AI integration unless that scope is opened explicitly.
