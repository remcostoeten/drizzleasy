# Release Process

This document explains how to create releases for Drizzleasy, which includes both npm publishing and GitHub releases.

## Overview

Drizzleasy uses GitHub Actions to automate the release process. When you push a tag, it automatically:
1. Builds the package
2. Runs tests
3. Publishes to npm
4. Creates a GitHub release

## Release Methods

### Method 1: Interactive Release CLI (Recommended)

```bash
# Full interactive release management
bun run release
```

This opens the Python-based release CLI with options for:
- Version management
- Changelog generation (with AI)
- Release publishing
- Documentation updates

### Method 2: Simple Release Script

```bash
# Quick release with current version
bun run release:simple
```

This script:
- Runs tests
- Creates a git tag
- Pushes the tag (triggers GitHub Actions)
- Provides release URLs

### Method 3: Manual Release

```bash
# 1. Update version in apps/drizzleasy/package.json
# 2. Create and push tag
git tag v1.0.0
git push origin v1.0.0
```

## Prerequisites

### NPM Token
You need an NPM token with publish permissions:

1. Go to [npmjs.com](https://www.npmjs.com) → Account Settings → Access Tokens
2. Create a new token with "Automation" type
3. Add it to GitHub Secrets as `NPM_TOKEN`

### GitHub Permissions
The GitHub Actions workflow needs:
- `contents: write` - to create releases
- `id-token: write` - for npm provenance

## Release Workflow

When you push a tag (e.g., `v1.0.0`), GitHub Actions will:

1. **Checkout** the repository
2. **Setup Bun** (version 1.2.15)
3. **Install dependencies** with frozen lockfile
4. **Build** the package
5. **Run tests** to ensure quality
6. **Extract version** from the tag
7. **Verify** package.json version matches tag
8. **Publish to npm** with provenance
9. **Create GitHub release** with auto-generated notes
10. **Notify** on success

## Version Management

### Semantic Versioning
Drizzleasy follows [semver](https://semver.org/):
- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes (backward compatible)

### Version Updates
The release CLI can automatically update versions across:
- `apps/drizzleasy/package.json`
- `package.json`
- `README.md`
- `CHANGELOG.md`

## Changelog Generation

The release CLI includes AI-powered changelog generation using Gemini:
- Analyzes git commits and changes
- Generates technical changelog entries
- Follows consistent format
- Supports multiple API keys for reliability

## Troubleshooting

### Version Already Exists
If a version already exists on npm:
```bash
# Check existing versions
npm view @remcostoeten/drizzleasy versions --json

# Unpublish (if needed - use carefully!)
npm unpublish @remcostoeten/drizzleasy@1.0.0
```

### Failed Release
If GitHub Actions fails:
1. Check the [Actions tab](https://github.com/remcostoeten/drizzleasy/actions)
2. Review error logs
3. Fix issues and re-run or create new tag

### Local Publishing (Not Recommended)
For testing only:
```bash
cd apps/drizzleasy
bun publish --dry-run  # Test without publishing
bun publish            # Actually publish (bypasses GitHub Actions)
```

## Release URLs

After a successful release:
- **NPM**: https://www.npmjs.com/package/@remcostoeten/drizzleasy
- **GitHub**: https://github.com/remcostoeten/drizzleasy/releases
- **Actions**: https://github.com/remcostoeten/drizzleasy/actions

## Best Practices

1. **Always test locally** before releasing
2. **Use the interactive CLI** for complex releases
3. **Keep changelog updated** with meaningful entries
4. **Tag from master/main** branch
5. **Verify GitHub Actions** completed successfully
6. **Test the published package** after release

## Emergency Procedures

### Revert a Release
```bash
# Use the release CLI
bun run release
# Select option 7: Revert npm version and tag
```

### Manual Cleanup
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Unpublish from npm (if needed)
npm unpublish @remcostoeten/drizzleasy@1.0.0
```
