# Project Guidelines

Ruckit is an MV3 browser extension: Angular settings/popup UI in `src/app/`, content and background scripts in `src/extension/`. Read [ai/README.md](../ai/README.md) and [ai/docs/PROJECT_GUIDE.md](../ai/docs/PROJECT_GUIDE.md) first. E2E tests are described in [e2e/README.md](../e2e/README.md).

## Readability

Code is read far more often than it is written, by the owner and by AI assistants coming back to it months later without today's context. Write for that reader.

- **Names must say what a thing is now.** When behaviour changes, rename the code that describes it (enum members, variables, functions, classes, files, test names). Never leave an old name and explain it with a comment, e.g. after merging phrases into keywords, `BlackListRestrictionType.Keywords` became `KeywordsAndPhrases`.
- **Only persisted values keep their old names.** Storage keys and stored values (`blk`, `'keyword'`, …) are user data; renaming them loses data unless a migration is added. Rename the code identifier and keep the stored value.
- Prefer names that explain intent over short or generic ones (`isTurnedOn`, `legacyPhrases`, not `flag`, `data2`).
- Keep functions small and single-purpose; extract a well-named helper instead of commenting a block.
- Comments explain *why* (a non-obvious rule, a browser quirk, a YouTube workaround), not *what* the code does.
- When a change makes an existing name, comment or doc misleading, fix it in the same change, and mention any rename you did not make and why.
