# Intent Detection Prompt

Classify the user's request into one or more intent labels from the static demo dataset.

Steps:

1. Read the user text and note whether an image is present.
2. Decide whether the request is clear enough to execute.
3. Select intent IDs that best match the request.
4. Mark urgency from explicit time pressure.
5. Do not infer private facts or hidden image details.

Return:

- `detectedIntentIds`
- `taskType`
- `urgency`
- `needsClarification`
- short rationale
