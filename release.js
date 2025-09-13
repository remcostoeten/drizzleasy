#!/usr/bin/env node

const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')

const packagePath = path.join(__dirname, './crud-builder')
const packageJson = JSON.parse(readFileSync(path.join(packagePath, 'package.json'), 'utf8'))
const version = packageJson.version

console.log(`🚀 Releasing drizzleasy v${version}`)

try {
  // Build and test
  console.log('📦 Building...')
  execSync('npm run build', { cwd: packagePath, stdio: 'inherit' })
  
  console.log('🧪 Testing...')
  execSync('npm run test', { cwd: packagePath, stdio: 'inherit' })
  
  // Publish to npm
  console.log('📤 Publishing to npm...')
  execSync('npm publish', { cwd: packagePath, stdio: 'inherit' })
  
  // Create git tag and push
  console.log('🏷️ Creating git tag...')
  execSync(`git tag v${version}`, { stdio: 'inherit' })
  execSync(`git push origin v${version}`, { stdio: 'inherit' })
  
  console.log(`✅ Successfully released v${version}!`)
  console.log(`📦 npm: https://www.npmjs.com/package/drizzleasy`)
  console.log(`🏷️ GitHub: https://github.com/remcostoeten/drizzleasy/releases/tag/v${version}`)
  
} catch (error) {
  console.error('❌ Release failed:', error.message)
  process.exit(1)
}