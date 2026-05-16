# Demo Case Template

Use this template when drafting a new record for `data/demo-cases.json`.

```json
{
  "id": "case-short-kebab-name",
  "title": "Short display title",
  "locale": "en-US",
  "scenario": "What the user is trying to accomplish.",
  "status": "draft",
  "input": {
    "sourceType": "text",
    "userMessage": "Mock user request.",
    "imagePath": null,
    "constraints": ["Constraint one."]
  },
  "classification": {
    "domain": "productivity",
    "intent": "planning",
    "confidence": 0.8,
    "riskLevel": "low"
  },
  "orchestration": {
    "summary": "One sentence plan summary.",
    "tasks": []
  },
  "responsePreview": "Short expected response preview.",
  "tags": ["planning"]
}
```
