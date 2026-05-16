# Maintenance Notes

## Add a New Input Case

1. Add the user-facing case to `data/userInputCases.json`.
2. Reuse existing intent labels when possible.
3. Reference an existing template through `recommendedTemplateId` when the case has a known flow.
4. Put any mock image under `assets/screenshots/`.
5. Run `npm run validate:data`.

## Add a New Template

1. Add or reuse atomic tasks in `data/atomicTasks.json`.
2. Add the template to `data/compositeTaskTemplates.json`.
3. Make sure every `atomicTaskIds` value resolves to an existing atomic task.
4. Add feedback loops only when the task needs a visible next-step decision.

## Review Checklist

- The record uses mock-only data.
- The case does not turn the repository into a math problem bank.
- IDs are stable, unique, and kebab-case.
- Cross-file IDs resolve without breaks.
- Missing image assets are acceptable only as temporary placeholders.
- The validator passes before commit.
