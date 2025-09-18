# Drizzleasy Monorepo

Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

## Structure

```
├── apps/
│   ├── drizzleasy/     # Main npm package
│   ├── docs/          # Fumadocs documentation site
│   └── examples/      # Next.js example applications
├── packages/          # Shared packages (if needed)
└── turbo.json        # Turborepo configuration
```

## Getting Started

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Start development
bun run dev
```

## Apps

- **drizzleasy**: Main npm package with CRUD operations
- **docs**: Documentation site built with Fumadocs
- **examples**: Next.js example applications

## Development

This monorepo uses [Turborepo](https://turbo.build/) for build orchestration and [Bun](https://bun.sh/) as the package manager.

### Available Scripts

- `bun run build` - Build all packages
- `bun run dev` - Start development servers
- `bun run test` - Run tests across all packages
- `bun run lint` - Lint all packages
- `bun run clean` - Clean build artifacts
