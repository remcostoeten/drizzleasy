#!/bin/bash

# Drizzleasy Release Script
# This script creates a GitHub release and triggers npm publishing via GitHub Actions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Drizzleasy Release Script${NC}"
echo ""

# Get current version from package.json
CURRENT_VERSION=$(cd apps/drizzleasy && node -p "require('./package.json').version")
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "master" && "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${YELLOW}⚠️  Warning: You're on branch '$CURRENT_BRANCH', not master/main${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Release cancelled${NC}"
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected:${NC}"
    git status --short
    read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Release cancelled${NC}"
        exit 1
    fi
fi

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
if ! bun run test; then
    echo -e "${RED}❌ Tests failed! Aborting release.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tests passed!${NC}"

# Create and push tag
TAG_NAME="v${CURRENT_VERSION}"
echo -e "${BLUE}📦 Creating tag: ${TAG_NAME}${NC}"

# Check if tag already exists
if git tag -l | grep -q "^${TAG_NAME}$"; then
    echo -e "${YELLOW}⚠️  Tag ${TAG_NAME} already exists${NC}"
    read -p "Delete and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d "${TAG_NAME}"
        git push origin ":refs/tags/${TAG_NAME}" 2>/dev/null || true
    else
        echo -e "${RED}❌ Release cancelled${NC}"
        exit 1
    fi
fi

# Create the tag
git tag "${TAG_NAME}"

# Push the tag (this triggers GitHub Actions)
echo -e "${BLUE}🌐 Pushing tag to trigger release...${NC}"
git push origin "${TAG_NAME}"

echo ""
echo -e "${GREEN}🎉 Release triggered successfully!${NC}"
echo -e "${BLUE}📦 NPM: https://www.npmjs.com/package/@remcostoeten/drizzleasy/v/${CURRENT_VERSION}${NC}"
echo -e "${BLUE}🐙 GitHub: https://github.com/remcostoeten/drizzleasy/releases/tag/${TAG_NAME}${NC}"
echo ""
echo -e "${YELLOW}💡 Check GitHub Actions for release progress:${NC}"
echo -e "${BLUE}   https://github.com/remcostoeten/drizzleasy/actions${NC}"
