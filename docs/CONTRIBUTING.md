# Contributing

Thanks for wanting to contribute to Cinema Plot. This guide explains how to contribute and what we expect.

Workflow

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make changes, run tests and linters
4. Commit and push

```bash
git add .
git commit -m "Describe change"
git push origin feature/your-feature
```

5. Open a Pull Request

Guidelines

- Follow Next.js and React best practices with TypeScript.
- Keep changes small and focused.
- Add tests for new functionality.
- Run `npm run lint` and `npm run type-check`.
- Use the Context API pattern for global state when appropriate.

Support

- Create an issue for larger discussions or proposals.
- Use PRs for code changes and assign reviewers.

### Feature & task conventions

- For larger features, follow the existing convention: first describe the feature in detail (see `FEATURES.md` for examples and the `tasks.md/` folder for feature-specific markdown files). The feature description should include rationale, UX/behavior, API or data shape, and implementation notes.
- After the feature description is added, create the tasks that implement the feature. Use the same structure as the existing `tasks.md/TASKS.md` entries: concise, actionable tasks that map to the feature steps.
- For simpler work that isn't a full feature (bugfixes, small improvements, docs, chores), add the item directly to `tasks.md/TASKS.md` first, following the same task structure used there.

- This helps reviewers and maintainers understand scope and priority, and keeps planning and implementation organised.

### Opening issues

- Creating an issue on GitHub as the starting point of your contribution is very much appreciated. Issues are a great place to discuss scope, get feedback, and ensure work isn't duplicated before a PR or tasks are created.
