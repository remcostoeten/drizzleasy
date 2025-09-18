# Drizzleasy CLI

Beautiful, minimal CLI for database management.

## Quick Start

```bash
# Interactive CLI (default)
bun run cli

# Same as above
bun run cli --seed

# Show help
bun run cli --help

# Force rebuild and run
bun run cli:fresh
```

## Features

- 🎨 **Beautiful colors** - No emojis, clean ANSI colors
- ⚡ **Smart building** - Only rebuilds when needed
- 🎯 **Simple commands** - Just `bun run cli`
- 🔮 **Future ready** - Extensible for more commands
- 🛡️ **Robust** - Handles non-TTY environments gracefully

## Current Commands

### 1. Clear Database

- Automatically detects database provider (PostgreSQL, Turso, SQLite)
- Provides appropriate clearing instructions
- Safe operation with clear warnings

### 2. Generate and Push Schema

- Automatically detects database provider
- Provides correct `drizzle-kit push` command
- Guides users through schema deployment

### 3. Generate Random Schema + Push

- 5 different schema templates (E-commerce, Blog, CRM, Social Media, Task Management)
- Complete SQL schemas with relationships and constraints
- Ready-to-use database structures
- Clear instructions for deployment

### 4. View Tables

- Auto-detects database provider (PostgreSQL, Turso, SQLite)
- Shows provider-specific SQL queries for viewing tables
- Includes table structure and row count queries
- Manual setup instructions for unknown providers

### 5. Help & Documentation

- Comprehensive help with examples
- Database support information
- Troubleshooting guide

## Architecture

```
apps/drizzleasy/src/cli/
├── index.ts              # Main CLI entry
├── cli-manager.ts        # Command routing
├── commands/
│   ├── cli-command.ts    # Main CLI command
│   ├── clear-database.ts # Database operations
│   ├── generate-schema.ts # Schema generation
│   ├── generate-and-push.ts # Schema push operations
│   └── view-tables.ts    # Table viewing utilities
├── ui/
│   ├── colors.ts         # ANSI color utilities
│   ├── intro-screen.ts   # Branded intro
│   ├── interactive-menu.ts # fzf-style menu
│   └── help-screen.ts    # Help documentation
└── types/
    └── cli-types.ts      # Simple types
```

## Adding New Commands

1. Create command in `commands/`
2. Add to CLI config in `index.ts`
3. Support `--command` flag automatically

## Performance

- **Zero dependencies** - Pure ANSI colors
- **Smart caching** - Only builds when source changes
- **Lightweight** - ~17KB bundled size
- **Non-TTY safe** - Works in CI/CD environments
