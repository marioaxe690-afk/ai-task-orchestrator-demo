# Asset Guidelines

Use assets only to support static demo scenarios. Assets are optional fixtures for the orchestration demo; they are not the primary data source.

## Allowed

- Mock screenshots built from synthetic text and placeholder UI.
- Cropped or redrawn examples that contain no private information.
- SVG placeholders that make the scenario understandable without external services.

## Not Allowed

- Real private screenshots.
- Student names, IDs, school names, chat avatars, addresses, phone numbers, or
  account handles.
- API keys, tokens, cookies, session IDs, or private URLs.
- Screenshots copied from paid products without permission.

## Naming

Use stable lowercase filenames:

- `math-video-001.svg`
- `math-question-001.png`
- `task-board-overview.svg`

Prefer SVG for lightweight mock fixtures and PNG for rendered demo captures. If a JSON `imagePath` points to a file that does not exist yet, the validator reports a warning instead of failing.
