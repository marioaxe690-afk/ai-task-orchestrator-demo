import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

const files = {
  userInputCases: "data/userInputCases.json",
  intentLabels: "data/intentLabels.json",
  atomicTasks: "data/atomicTasks.json",
  compositeTaskTemplates: "data/compositeTaskTemplates.json",
  feedbackLoops: "data/feedbackLoops.json",
  demoScenarios: "data/demoScenarios.json"
};

const allowed = {
  inputType: new Set(["text", "image", "image_text"]),
  taskType: new Set([
    "simple_atomic_task",
    "complex_composite_task",
    "ambiguous_task",
    "emergency_task",
    "multimodal_task"
  ]),
  urgency: new Set(["low", "medium", "high"]),
  difficulty: new Set(["low", "medium", "high"])
};

const errors = [];
const warnings = [];

function addError(location, message) {
  errors.push(`${location}: ${message}`);
}

function addWarning(location, message) {
  warnings.push(`${location}: ${message}`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function readJson(label, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  try {
    const parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
    if (!Array.isArray(parsed)) {
      addError(label, "expected top-level JSON array");
      return [];
    }
    return parsed;
  } catch (error) {
    addError(label, `JSON parse failed: ${error.message}`);
    return [];
  }
}

function buildIdSet(label, records) {
  const ids = new Set();
  for (const [index, record] of records.entries()) {
    const location = `${label}[${index}].id`;
    if (!isNonEmptyString(record.id)) {
      addError(location, "expected a non-empty string");
      continue;
    }
    if (ids.has(record.id)) {
      addError(location, `duplicate id ${record.id}`);
    }
    ids.add(record.id);
  }
  return ids;
}

function requireString(record, location, field) {
  if (!isNonEmptyString(record[field])) {
    addError(`${location}.${field}`, "expected a non-empty string");
  }
}

function requireOptionalString(record, location, field) {
  if (record[field] !== undefined && !isNonEmptyString(record[field])) {
    addError(`${location}.${field}`, "expected a non-empty string when present");
  }
}

function requireEnum(record, location, field, enumSet) {
  if (!enumSet.has(record[field])) {
    addError(`${location}.${field}`, `expected one of ${Array.from(enumSet).join(", ")}`);
  }
}

function requirePositiveNumber(record, location, field) {
  if (!isPositiveNumber(record[field])) {
    addError(`${location}.${field}`, "expected a positive number");
  }
}

function requireStringArray(record, location, field) {
  if (!isStringArray(record[field])) {
    addError(`${location}.${field}`, "expected an array of strings");
  }
}

function requireNonEmptyStringArray(record, location, field) {
  if (!isNonEmptyStringArray(record[field])) {
    addError(`${location}.${field}`, "expected a non-empty array of non-empty strings");
  }
}

function checkIdRefs(location, ids, targetIds, targetLabel) {
  if (!Array.isArray(ids)) {
    return;
  }
  for (const id of ids) {
    if (!targetIds.has(id)) {
      addError(location, `unknown ${targetLabel} id ${id}`);
    }
  }
}

function checkOptionalIdRef(location, id, targetIds, targetLabel) {
  if (id === undefined) {
    return;
  }
  if (!isNonEmptyString(id)) {
    addError(location, "expected a non-empty string when present");
    return;
  }
  if (!targetIds.has(id)) {
    addError(location, `unknown ${targetLabel} id ${id}`);
  }
}

function checkImagePath(location, imagePath) {
  if (imagePath === undefined) {
    return;
  }
  if (!isNonEmptyString(imagePath)) {
    addError(location, "expected a non-empty string when present");
    return;
  }
  if (path.isAbsolute(imagePath) || imagePath.includes("..")) {
    addError(location, "must be a relative path inside the repository");
    return;
  }

  const resolved = path.resolve(repoRoot, imagePath);
  if (!resolved.startsWith(repoRoot + path.sep)) {
    addError(location, "must resolve inside the repository");
    return;
  }

  if (!existsSync(resolved)) {
    addWarning(location, `missing image asset ${imagePath}`);
  }
}

const data = Object.fromEntries(
  Object.entries(files).map(([label, relativePath]) => [label, readJson(label, relativePath)])
);

const ids = {
  userInputCases: buildIdSet("userInputCases", data.userInputCases),
  intentLabels: buildIdSet("intentLabels", data.intentLabels),
  atomicTasks: buildIdSet("atomicTasks", data.atomicTasks),
  compositeTaskTemplates: buildIdSet("compositeTaskTemplates", data.compositeTaskTemplates),
  feedbackLoops: buildIdSet("feedbackLoops", data.feedbackLoops),
  demoScenarios: buildIdSet("demoScenarios", data.demoScenarios)
};

for (const [index, record] of data.userInputCases.entries()) {
  const location = `userInputCases[${index}]`;
  for (const field of ["title", "userText", "expectedOutput"]) {
    if (field === "userText" && record.inputType === "image") {
      if (typeof record.userText !== "string") {
        addError(`${location}.userText`, "expected a string");
      }
      continue;
    }
    requireString(record, location, field);
  }
  requireEnum(record, location, "inputType", allowed.inputType);
  requireOptionalString(record, location, "imagePath");
  requireOptionalString(record, location, "subject");
  requireNonEmptyStringArray(record, location, "detectedIntentIds");
  requireEnum(record, location, "taskType", allowed.taskType);
  requireEnum(record, location, "urgency", allowed.urgency);
  if (typeof record.needsClarification !== "boolean") {
    addError(`${location}.needsClarification`, "expected a boolean");
  }
  checkIdRefs(`${location}.detectedIntentIds`, record.detectedIntentIds, ids.intentLabels, "intentLabels");
  checkOptionalIdRef(`${location}.recommendedTemplateId`, record.recommendedTemplateId, ids.compositeTaskTemplates, "compositeTaskTemplates");
  checkImagePath(`${location}.imagePath`, record.imagePath);
}

for (const [index, record] of data.intentLabels.entries()) {
  const location = `intentLabels[${index}]`;
  for (const field of ["name", "description"]) {
    requireString(record, location, field);
  }
}

for (const [index, record] of data.atomicTasks.entries()) {
  const location = `atomicTasks[${index}]`;
  for (const field of ["name", "description", "inputNeeded", "completionCriteria", "failureRisk"]) {
    requireString(record, location, field);
  }
  requireEnum(record, location, "difficulty", allowed.difficulty);
  requirePositiveNumber(record, location, "estimatedMinutes");
}

for (const [index, record] of data.compositeTaskTemplates.entries()) {
  const location = `compositeTaskTemplates[${index}]`;
  for (const field of ["name", "outputGoal"]) {
    requireString(record, location, field);
  }
  requireNonEmptyStringArray(record, location, "triggerConditions");
  requireNonEmptyStringArray(record, location, "atomicTaskIds");
  requirePositiveNumber(record, location, "estimatedTotalMinutes");
  requireEnum(record, location, "difficulty", allowed.difficulty);
  checkIdRefs(`${location}.atomicTaskIds`, record.atomicTaskIds, ids.atomicTasks, "atomicTasks");
}

for (const [index, record] of data.feedbackLoops.entries()) {
  const location = `feedbackLoops[${index}]`;
  for (const field of ["afterTaskId", "question", "positiveNextAction", "negativeNextAction"]) {
    requireString(record, location, field);
  }
  checkOptionalIdRef(`${location}.afterTaskId`, record.afterTaskId, ids.atomicTasks, "atomicTasks");
}

for (const [index, record] of data.demoScenarios.entries()) {
  const location = `demoScenarios[${index}]`;
  for (const field of ["title", "userInputCaseId", "demoHighlight"]) {
    requireString(record, location, field);
  }
  requireNonEmptyStringArray(record, location, "flow");
  checkOptionalIdRef(`${location}.userInputCaseId`, record.userInputCaseId, ids.userInputCases, "userInputCases");
}

const minimums = {
  userInputCases: 20,
  intentLabels: 12,
  atomicTasks: 20,
  compositeTaskTemplates: 8,
  feedbackLoops: 10,
  demoScenarios: 5
};

for (const [label, minimum] of Object.entries(minimums)) {
  if (data[label].length < minimum) {
    addError(label, `expected at least ${minimum} records, found ${data[label].length}`);
  }
}

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("✅ Data validation passed.");
