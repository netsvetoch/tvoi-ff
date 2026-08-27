<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

## Spec-driven workflow (OpenSpec)

- Non-trivial changes (new endpoint, DB schema change, new integration, multi-file feature): start with an OpenSpec proposal — create `openspec/changes/<change-name>/` with `proposal.md`, `tasks.md`, and spec deltas; confirm it with the user before implementing.
- Trivial changes (bugfix, typo, small refactor): implement directly, no proposal.
- Existing specs live in `openspec/specs/` — read them before proposing changes that touch the same domain; archived changes are in `openspec/changes/archive/`.
- While implementing an approved change, check off tasks in its `tasks.md`; when done and verified, move the change to `openspec/changes/archive/` and merge its deltas into `openspec/specs/`.
