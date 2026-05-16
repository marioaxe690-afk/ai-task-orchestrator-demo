import userInputCases from "../data/userInputCases.json";
import intentLabels from "../data/intentLabels.json";
import atomicTasks from "../data/atomicTasks.json";
import compositeTaskTemplates from "../data/compositeTaskTemplates.json";
import feedbackLoops from "../data/feedbackLoops.json";
import demoScenarios from "../data/demoScenarios.json";

const scenario = demoScenarios[0];

const userInputCase = userInputCases.find((item) => item.id === scenario.userInputCaseId);

if (!userInputCase) {
  throw new Error(`Missing user input case: ${scenario.userInputCaseId}`);
}

const detectedIntents = userInputCase.detectedIntentIds.map((intentId) => {
  const intent = intentLabels.find((item) => item.id === intentId);
  if (!intent) {
    throw new Error(`Missing intent label: ${intentId}`);
  }
  return intent;
});

const recommendedTemplate = userInputCase.recommendedTemplateId
  ? compositeTaskTemplates.find((item) => item.id === userInputCase.recommendedTemplateId)
  : undefined;

if (userInputCase.recommendedTemplateId && !recommendedTemplate) {
  throw new Error(`Missing composite task template: ${userInputCase.recommendedTemplateId}`);
}

const templateTasks = recommendedTemplate
  ? recommendedTemplate.atomicTaskIds.map((taskId) => {
      const task = atomicTasks.find((item) => item.id === taskId);
      if (!task) {
        throw new Error(`Missing atomic task: ${taskId}`);
      }
      return task;
    })
  : [];

const templateTaskIds = new Set(templateTasks.map((task) => task.id));

const relatedFeedbackLoops = feedbackLoops.filter((loop) =>
  templateTaskIds.has(loop.afterTaskId)
);

export const assembledDemo = {
  scenario,
  userInputCase,
  detectedIntents,
  recommendedTemplate,
  templateTasks,
  relatedFeedbackLoops
};
