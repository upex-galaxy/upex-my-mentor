# Test Automation Engineering (TAE)

**KATA Framework** - Komponent Action Test Architecture

---

## AI Entry Point

**For AI agents**: Start here → **`KATA-AI-GUIDE.md`**

Quick orientation, critical rules, and task-based navigation.

**For implementing ATCs**: See **`.prompts/fase-12-test-automation/`**

---

## Directory Contents

### Reference Documentation

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `KATA-AI-GUIDE.md`        | **AI Entry Point** - Quick reference for AI agents |
| `kata-architecture.md`    | Architecture layers (TypeScript implementation)    |
| `automation-standards.md` | Code standards, naming, anti-patterns              |
| `api-setup-guide.md`      | OpenAPI integration and MCP setup                  |
| `test-data-management.md` | Test data strategies                               |
| `tms-integration.md`      | Jira/Xray integration                              |
| `ci-cd-integration.md`    | GitHub Actions pipelines                           |

### Conceptual Documentation

| File                        | Purpose                      |
| --------------------------- | ---------------------------- |
| `docs/kata-fundamentals.md` | KATA philosophy and concepts |

### Auto-Generated

| File                        | Purpose                   |
| --------------------------- | ------------------------- |
| `kata-manifest.json` (root) | Component and ATC catalog |

Generate with: `bun run kata:manifest`

---

## Quick Reference

### For AI Agents

1. Read `KATA-AI-GUIDE.md` for orientation
2. Follow `.prompts/fase-12-test-automation/` prompts for implementation
3. Run `bun run kata:manifest` to see existing components

### For QA Engineers

1. Read `kata-architecture.md` to understand KATA
2. Read `automation-standards.md` for coding rules
3. Follow `.prompts/fase-12-test-automation/` prompts to create components
4. Reference `tms-integration.md` for Jira setup
5. Reference `ci-cd-integration.md` for CI/CD

---

## References

- **AI Guide**: `KATA-AI-GUIDE.md`
- **AI Workflow**: `.prompts/fase-12-test-automation/`
- **Framework Setup**: `.prompts/kata-framework-setup.md`
- **Fundamentals**: `docs/kata-fundamentals.md` (conceptual reference only)
- **Component Catalog**: `kata-manifest.json` (run `bun run kata:manifest`)
