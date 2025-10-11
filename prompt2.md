# AGENT 2: Documentation & Peer Dependencies Guide

## Project Context

You are working on **drizzleasy** at `/home/remco-stoeten/projects/PACKAGES/drizzleasy`. This is a TypeScript library that provides ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

**Key Project Structure:**
- Monorepo with `apps/drizzleasy` (main package) and `apps/docs` (documentation)
- Built with Bun (exclusively), TypeScript 5.0+, and tsup for bundling  
- Exports: `/server` (server-side), `/client` (React hooks), `/cli` (command-line tools)
- Peer dependencies: `drizzle-orm ^0.44.0`, optional database drivers
- Published as `@remcostoeten/drizzleasy` on npm

**Core Functionality:**
- Auto-detects database providers: PostgreSQL (Neon, Vercel, local), Turso, SQLite
- Automatically loads schema from `drizzle.config.ts`
- Factory functions: `createFn()`, `readFn()`, `updateFn()`, `destroyFn()`
- Client-side optimistic updates with `useOptimisticCrud()` hook

## Documentation Guidelines (CRITICAL)

Follow these rules strictly:

### Content Guidelines
- Use Bun exclusively (never npm or yarn)
- No markdown files with feature recaps unless explicitly requested
- Clear, actionable instructions with concrete examples
- Include troubleshooting for common errors
- Cross-reference related documentation sections

### Style Guidelines  
- Use consistent formatting and structure
- Include code examples for every major concept
- Use `bun add` for all package installations
- Emphasize peer dependency requirements upfront
- Keep language clear and beginner-friendly

### No Recap Files
- Do not create recap or summary markdown files after completion
- Only create the documentation files specified in tasks

## Branch & Working Directory

**Branch:** `docs/peer-deps-and-setup-guide`  
**Base Directory:** `/home/remco-stoeten/projects/PACKAGES/drizzleasy`

## Problem Statement  

Users frequently encounter these issues:

1. **Driver confusion** - Don't know which database driver to install (Neon, Turso, SQLite, etc.)
2. **"Cannot find module" errors** - Missing peer dependencies cause cryptic errors
3. **Version conflicts** - `drizzle-orm` version mismatches
4. **Setup complexity** - No clear step-by-step getting started guide
5. **Import path confusion** - When to use `/server` vs `/client` vs default imports
6. **Missing troubleshooting** - No guidance for common Next.js/bundling issues

## Your Mission

Create comprehensive documentation that eliminates setup confusion and provides clear troubleshooting guidance for all common scenarios.

## Task 1: Create Database Drivers Guide

**File:** `DATABASES.md` (create in project root)

**Required sections:**

### Quick Reference Table
Create a clear matrix showing:
- Database type (Neon PostgreSQL, Turso, SQLite, etc.)
- Required driver package
- Exact `bun add` command
- Connection string format

### Detailed Setup Instructions
For each supported database:
- Installation commands
- Environment variable setup
- Connection string examples
- Complete working code example

### Common Error Solutions
- "Cannot find module '@neondatabase/serverless'" → Install driver
- "Cannot find module '@libsql/client'" → Install driver  
- "Module not found: Can't resolve 'better-sqlite3'" → Install driver
- Include copy-pasteable solutions

**Structure:**
```markdown
# Database Drivers Guide

## Quick Reference

| Database | Driver Package | Install Command |
|----------|----------------|-----------------|
| Neon PostgreSQL | `@neondatabase/serverless` | `bun add @neondatabase/serverless` |
| [etc...]

## Detailed Setup

### Neon PostgreSQL
[Complete setup with code examples]

### Turso (libSQL)  
[Complete setup with code examples]

[Continue for all supported databases...]

## Common Errors
[Error message → Solution pairs]
```

## Task 2: Create Comprehensive Troubleshooting Guide

**File:** `TROUBLESHOOTING.md` (create in project root)

**Required sections:**

### Installation Issues
- Peer dependency warnings and how to fix them
- Version conflicts and resolution steps
- Platform-specific issues (if any)

### Schema Loading Issues  
- "drizzle.config.ts not found" errors
- "No schema found" errors
- "Empty schema" errors
- Import failures and debugging steps

### Runtime Issues
- Next.js import path errors
- "Table does not exist" errors  
- Turbo/bundling issues
- Server vs client import confusion

### Next.js Specific Issues
- Dynamic import failures in Next.js 15
- Turbopack compatibility issues
- Server Action vs Client Component import patterns

**Include for each error:**
- Clear description of when it happens
- Exact error message users see
- Step-by-step solution
- Code examples showing correct approach

## Task 3: Create Quick Start Guide

**File:** `QUICK-START.md` (create in project root)

**Structure (step-by-step):**

### Prerequisites
- Bun version requirement
- Next.js version compatibility
- Database account setup (if needed)

### Step 1: Install Dependencies
```bash
# Show exact commands for drizzleasy + drizzle-orm + driver
```

### Step 2: Create Database Schema  
Complete example schema file with proper exports

### Step 3: Create Drizzle Config
Working `drizzle.config.ts` with all required fields

### Step 4: Push Schema to Database
```bash
bunx drizzle-kit push
```

### Step 5: Initialize Connection
Code example showing proper connection setup

### Step 6: Create Server Actions
Complete server action examples with proper imports

### Step 7: Use in Client Components (Optional)
Client-side optimistic update examples

**Requirements:**
- Every step must be copy-pasteable
- Include common pitfalls and how to avoid them
- Show file structure/organization
- Reference troubleshooting guide for issues

## Task 4: Update Main README

**File:** `README.md` (update existing)

**Changes needed:**

### Add Documentation Section (after badges)
```markdown
## 📚 Documentation

- [Quick Start Guide](./QUICK-START.md) - Get started in 5 minutes
- [Database Drivers](./DATABASES.md) - Which driver to install for your database  
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [Full Documentation](https://drizzleasy.vercel.app)
```

### Improve Installation Section
Add clear warning about peer dependencies:
```markdown
## Installation

⚠️ **Important**: Install database driver first

```bash
# 1. Install drizzleasy
bun add @remcostoeten/drizzleasy

# 2. Install Drizzle ORM (peer dependency)  
bun add drizzle-orm

# 3. Install database driver (choose one)
bun add @neondatabase/serverless  # Neon PostgreSQL
bun add @libsql/client            # Turso
bun add better-sqlite3            # SQLite
bun add pg                        # Local PostgreSQL
```

💡 **Not sure which driver?** See the [Database Drivers Guide](./DATABASES.md)
```

### Add Import Path Guidance
Clear section explaining when to use each import path:
- `@remcostoeten/drizzleasy/server` - For server actions and API routes
- `@remcostoeten/drizzleasy/client` - For client-side React hooks  
- `@remcostoeten/drizzleasy` - Default (includes client hooks and types)

## Task 5: Sync Package README

**File:** `apps/drizzleasy/README.md` (update to match root README)

Copy relevant sections from the main README to keep them synchronized. Focus on:
- Installation instructions  
- Basic usage examples
- Links to full documentation

## Task 6: Create Postinstall Helper (Optional)

**File:** `apps/drizzleasy/scripts/check-peer-deps.js` (create new)

Simple Node.js script that:
- Checks if `drizzle-orm` is installed
- Detects if at least one database driver is present
- Shows helpful warnings with installation commands
- References the database drivers guide

**Update package.json:**
```json
{
  "scripts": {
    "postinstall": "node scripts/check-peer-deps.js || true"
  }
}
```

## Testing & Verification

**Manual checks:**
```bash
# Navigate to project root
cd /home/remco-stoeten/projects/PACKAGES/drizzleasy

# Verify all markdown files render correctly
# Check in VS Code preview or GitHub preview

# Test all links work
grep -r "\[.*\](.*.md)" *.md

# Check for formatting consistency
prettier --check "*.md"

# Verify all commands are copy-pasteable
# Try following quick start guide step by step
```

## Success Criteria

- ✅ `DATABASES.md` created with comprehensive driver installation matrix
- ✅ `TROUBLESHOOTING.md` created covering all common errors with solutions
- ✅ `QUICK-START.md` created with step-by-step setup guide  
- ✅ `README.md` updated with documentation links and improved installation
- ✅ `apps/drizzleasy/README.md` synchronized with main README
- ✅ Postinstall helper script added (optional but recommended)
- ✅ All documentation is accurate, clear, and well-formatted
- ✅ Cross-references between documents work correctly
- ✅ Every code example is copy-pasteable and tested

## Files You Will Create/Modify

**New files:**
1. `DATABASES.md` - Database driver installation guide
2. `TROUBLESHOOTING.md` - Error solutions and debugging
3. `QUICK-START.md` - Step-by-step setup guide
4. `apps/drizzleasy/scripts/check-peer-deps.js` - Postinstall helper (optional)

**Updated files:**  
5. `README.md` - Add docs section, improve installation
6. `apps/drizzleasy/README.md` - Sync with main README  
7. `apps/drizzleasy/package.json` - Add postinstall script (optional)

## Important Notes

- Use Bun exclusively in all examples
- Keep language beginner-friendly but technically accurate
- Include troubleshooting for every major workflow
- Cross-reference related sections
- Test all commands before documenting them
- No recap files after completion

## Coordination with Agent 1

**Agent 1** is working on schema auto-loading improvements in parallel. They will provide:
- New error message formats for schema loading issues
- Manual schema override feature details

**Your coordination tasks:**
1. **Wait for Agent 1's error messages** before finalizing schema-related troubleshooting
2. **Reference Agent 1's manual override** in the troubleshooting guide
3. **Ask Agent 1** for final error message examples to document properly

**When Agent 1 completes their work:**
- Update `TROUBLESHOOTING.md` with their new error messages
- Add examples of the manual schema override option in `QUICK-START.md`
- Include schema override in `DATABASES.md` for complex setups

## Merge Strategy

Agent 1 should merge their changes first, then you should:
1. Rebase your branch on the latest main
2. Update documentation to reflect Agent 1's changes
3. Test that all examples still work
4. Merge your documentation improvements