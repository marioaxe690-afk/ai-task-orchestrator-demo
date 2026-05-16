import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

const coreFiles = {
  userInputCases: "data/userInputCases.json",
  intentLabels: "data/intentLabels.json",
  atomicTasks: "data/atomicTasks.json",
  compositeTaskTemplates: "data/compositeTaskTemplates.json",
  feedbackLoops: "data/feedbackLoops.json",
  demoScenarios: "data/demoScenarios.json"
};

const minimumCounts = {
  userInputCases: 24,
  intentLabels: 14,
  atomicTasks: 24,
  compositeTaskTemplates: 9,
  feedbackLoops: 12,
  demoScenarios: 6
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

function formatObject(record, index) {
  const id = typeof record?.id === "string" && record.id.trim() ? record.id : `index ${index}`;
  return id;
}

function addError(file, record, index, reason) {
  errors.push({
    file,
    objectId: record ? formatObject(record, index) : "-",
    reason
  });
}

function addWarning(file, record, index, reason) {
  warnings.push({
    file,
    objectId: record ? formatObject(record, index) : "-",
    reason
  });
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function readJson(label, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  if (!existsSync(absolutePath)) {
    addError(relativePath, null, 0, "core JSON file is missing");
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
    if (!Array.isArray(parsed)) {
      addError(relativePath, null, 0, "top-level JSON value must be an array");
      return [];
    }
    return parsed;
  } catch (error) {
    addError(relativePath, null, 0, `JSON parse failed: ${error.message}`);
    return [];
  }
}

function buildIdSet(label, records) {
  const ids = new Set();
  const file = coreFiles[label];

  records.forEach((record, index) => {
    if (!isObject(record)) {
      addError(file, record, index, "record must be an object");
      return;
    }

    if (!isNonEmptyString(record.id)) {
      addError(file, record, index, "id is required and must be a non-empty string");
      return;
    }

    if (ids.has(record.id)) {
      addError(file, record, index, `duplicate id '${record.id}'`);
      return;
    }

    ids.add(record.id);
  });

  return ids;
}

function requireString(file, record, index, field) {
  if (!isNonEmptyString(record[field])) {
    addError(file, record, index, `${field} is required and must be a non-empty string`);
  }
}

function requireStringValue(file, record, index, field) {
  if (typeof record[field] !== "string") {
    addError(file, record, index, `${field} is required and must be a string`);
  }
}

function requireOptionalString(file, record, index, field) {
  if (record[field] !== undefined && !isNonEmptyString(record[field])) {
    addError(file, record, index, `${field} must be a non-empty string when present`);
  }
}

function requireEnum(file, record, index, field, enumSet) {
  if (!enumSet.has(record[field])) {
    addError(file, record, index, `${field} must be one of: ${Array.from(enumSet).join(", ")}`);
  }
}

function requireBoolean(file, record, index, field) {
  if (typeof record[field] !== "boolean") {
    addError(file, record, index, `${field} is required and must be a boolean`);
  }
}

function requirePositiveNumber(file, record, index, field) {
  if (!isPositiveNumber(record[field])) {
    addError(file, record, index, `${field} is required and must be a positive number`);
  }
}

function requireNonEmptyStringArray(file, record, index, field) {
  if (!isNonEmptyStringArray(record[field])) {
    addError(file, record, index, `${field} is required and must be a non-empty array of strings`);
  }
}

function checkArrayReferences(file, record, index, field, targetIds, targetName) {
  if (!Array.isArray(record[field])) {
    return;
  }

  record[field].forEach((id) => {
    if (!targetIds.has(id)) {
      addError(file, record, index, `${field} references unknown ${targetName} id '${id}'`);
    }
  });
}

function checkOptionalReference(file, record, index, field, targetIds, targetName) {
  const value = record[field];
  if (value === undefined) {
    return;
  }

  if (!isNonEmptyString(value)) {
    addError(file, record, index, `${field} must be a non-empty string when present`);
    return;
  }

  if (!targetIds.has(value)) {
    addError(file, record, index, `${field} references unknown ${targetName} id '${value}'`);
  }
}

function checkImagePath(file, record, index) {
  const imagePath = record.imagePath;
  if (imagePath === undefined) {
    return;
  }

  if (!isNonEmptyString(imagePath)) {
    addError(file, record, index, "imagePath must be a non-empty string when present");
    return;
  }

  if (/^[a-zA-Z]:[\\/]/.test(imagePath) || imagePath.startsWith("\\\\")) {
    addError(file, record, index, "imagePath must be repository-relative or frontend-root-relative");
    return;
  }

  const repositoryPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  if (repositoryPath.split(/[\\/]/).includes("..")) {
    addError(file, record, index, "imagePath must not contain parent directory segments");
    return;
  }

  const resolved = path.resolve(repoRoot, repositoryPath);
  if (!resolved.startsWith(repoRoot + path.sep)) {
    addError(file, record, index, "imagePath must resolve inside the repository");
    return;
  }

  if (!existsSync(resolved)) {
    addWarning(file, record, index, `imagePath target does not exist: ${imagePath}`);
  }
}

const data = Object.fromEntries(
  Object.entries(coreFiles).map(([label, relativePath]) => [label, readJson(label, relativePath)])
);

const ids = Object.fromEntries(
  Object.keys(coreFiles).map((label) => [label, buildIdSet(label, data[label])])
);

Object.entries(minimumCounts).forEach(([label, minimum]) => {
  if (data[label].length < minimum) {
    addError(coreFiles[label], null, 0, `expected at least ${minimum} records, found ${data[label].length}`);
  }
});

data.userInputCases.forEach((record, index) => {
  const file = coreFiles.userInputCases;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "title");
  requireEnum(file, record, index, "inputType", allowed.inputType);
  requireStringValue(file, record, index, "userText");
  requireOptionalString(file, record, index, "subject");
  requireNonEmptyStringArray(file, record, index, "detectedIntentIds");
  requireEnum(file, record, index, "taskType", allowed.taskType);
  requireEnum(file, record, index, "urgency", allowed.urgency);
  requireBoolean(file, record, index, "needsClarification");
  requireOptionalString(file, record, index, "recommendedTemplateId");
  requireString(file, record, index, "expectedOutput");
  checkArrayReferences(file, record, index, "detectedIntentIds", ids.intentLabels, "intentLabels");
  checkOptionalReference(file, record, index, "recommendedTemplateId", ids.compositeTaskTemplates, "compositeTaskTemplates");
  checkImagePath(file, record, index);
});

data.intentLabels.forEach((record, index) => {
  const file = coreFiles.intentLabels;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "name");
  requireString(file, record, index, "description");
});

data.atomicTasks.forEach((record, index) => {
  const file = coreFiles.atomicTasks;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "name");
  requireString(file, record, index, "description");
  requireEnum(file, record, index, "difficulty", allowed.difficulty);
  requirePositiveNumber(file, record, index, "estimatedMinutes");
  requireString(file, record, index, "inputNeeded");
  requireString(file, record, index, "completionCriteria");
  requireString(file, record, index, "failureRisk");
});

data.compositeTaskTemplates.forEach((record, index) => {
  const file = coreFiles.compositeTaskTemplates;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "name");
  requireNonEmptyStringArray(file, record, index, "triggerConditions");
  requireNonEmptyStringArray(file, record, index, "atomicTaskIds");
  requirePositiveNumber(file, record, index, "estimatedTotalMinutes");
  requireEnum(file, record, index, "difficulty", allowed.difficulty);
  requireString(file, record, index, "outputGoal");
  checkArrayReferences(file, record, index, "atomicTaskIds", ids.atomicTasks, "atomicTasks");
});

data.feedbackLoops.forEach((record, index) => {
  const file = coreFiles.feedbackLoops;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "afterTaskId");
  requireString(file, record, index, "question");
  requireString(file, record, index, "positiveNextAction");
  requireString(file, record, index, "negativeNextAction");
  checkOptionalReference(file, record, index, "afterTaskId", ids.atomicTasks, "atomicTasks");
});

data.demoScenarios.forEach((record, index) => {
  const file = coreFiles.demoScenarios;
  if (!isObject(record)) {
    return;
  }

  requireString(file, record, index, "id");
  requireString(file, record, index, "title");
  requireString(file, record, index, "userInputCaseId");
  requireNonEmptyStringArray(file, record, index, "flow");
  requireString(file, record, index, "demoHighlight");
  checkOptionalReference(file, record, index, "userInputCaseId", ids.userInputCases, "userInputCases");
});

warnings.forEach((warning) => {
  console.warn(`Warning: ${warning.file} | ${warning.objectId} | ${warning.reason}`);
});

if (errors.length > 0) {
  console.error("❌ Data validation failed.");
  errors.forEach((error) => {
    console.error(`- ${error.file} | ${error.objectId} | ${error.reason}`);
  });
  process.exit(1);
}

console.log("✅ Data validation passed.");
