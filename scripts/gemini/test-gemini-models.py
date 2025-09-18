#!/usr/bin/env python3
"""
Test script to compare different Gemini models for changelog generation
"""

import os
import json
import urllib.request
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# ----------------------------
# Load .env from parent directory
# ----------------------------
def load_env():
    """Load environment variables from .env file"""
    dotenv_path = Path(__file__).parent.parent.parent / ".env"
    if dotenv_path.exists():
        print(f"Loading .env from: {dotenv_path}")
        with open(dotenv_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                # Remove quotes if present
                value = value.strip('"\'')
                os.environ[key.strip()] = value.strip()
        print("✅ .env file loaded")
    else:
        print(f"⚠️  No .env file found at: {dotenv_path}")

# Load environment variables
load_env()

def test_model(model_name: str, api_key: str) -> str:
    """Test a specific Gemini model"""
    
    system_prompt = """You are a technical changelog generator. Your job is to create a new changelog entry based on git commits and changes.

CRITICAL REQUIREMENTS:
1. Follow the EXACT format of the existing changelog - no emojis, no fluff, pure technical content
2. Use these sections ONLY: Added, Changed, Fixed, Removed
3. Each bullet point starts with "- " (dash + space)
4. Be concise and technical - focus on what changed, not why
5. Use backticks for code/technical terms
6. Date format: YYYY-MM-DD
7. No marketing language, no excitement, just facts

STYLE RULES:
- "Added" = new features, new files, new dependencies
- "Changed" = modifications to existing functionality
- "Fixed" = bug fixes, corrections
- "Removed" = deleted features, files, or functionality
- Use present tense for technical accuracy
- Keep entries short and specific
- Group related changes together

OUTPUT FORMAT:
```
## [VERSION] - DATE
### Added
- Item 1
- Item 2

### Changed
- Item 1

### Fixed
- Item 1

### Removed
- Item 1
```

Only include sections that have changes. If no changes for a section, omit it entirely."""

    user_prompt = """Create a changelog entry for version 0.2.0 based on these changes:

CURRENT CHANGELOG FORMAT:
```
## [0.1.0] - 2025-09-18
### Added
- Engines and `sideEffects` fields to `package.json`
- Optional `peerDependencies` for drivers; kept `glob` as a runtime dependency

### Changed
- Migrated to Bun
- Migrated to a Turbo monorepo (for future examples and docs)
- Rewrote README without LLM
- Build now via `tsup` (ESM + CJS + DTS)

### Fixed
- Tightened SQLite URL detection with env-specific cache keys
- Vitest mocks (20/20 tests passing)

### Removed
- `execute()` fire function
```

GIT COMMITS:
```
feat: add comprehensive CLI tool for release management
feat: implement Gemini AI changelog generation
fix: project-wide version replacement functionality
feat: add model selection for Gemini API calls
```

GIT DIFF (files changed):
```
A       drizzleasy-cli
M       README.md
M       package.json
A       scripts/test-gemini-models.py
```

Generate ONLY the new changelog entry for version 0.2.0 with today's date (2025-09-18). Match the existing style exactly - no emojis, no marketing language, just technical facts."""

    try:
        # Prepare request
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        data = {
            "contents": [{
                "parts": [{
                    "text": f"{system_prompt}\n\n{user_prompt}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 1,
                "topP": 0.8,
                "maxOutputTokens": 1500,
            }
        }
        
        # Make request
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if 'candidates' in result and len(result['candidates']) > 0:
            candidate = result['candidates'][0]
            
            # Check finish reason first
            finish_reason = candidate.get('finishReason', 'UNKNOWN')
            if finish_reason == 'MAX_TOKENS':
                generated_content = f"Response truncated (hit token limit: {finish_reason})"
            elif finish_reason == 'SAFETY':
                generated_content = f"Response blocked by safety filters: {finish_reason}"
            elif finish_reason == 'STOP':
                # Normal completion, try to extract text
                if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                    if 'text' in candidate['content']['parts'][0]:
                        generated_content = candidate['content']['parts'][0]['text'].strip()
                    else:
                        generated_content = "No text in response content"
                elif 'parts' in candidate and len(candidate['parts']) > 0:
                    if 'text' in candidate['parts'][0]:
                        generated_content = candidate['parts'][0]['text'].strip()
                    else:
                        generated_content = "No text in response parts"
                else:
                    generated_content = f"No text found (finish reason: {finish_reason})"
            else:
                generated_content = f"Unexpected finish reason: {finish_reason}"
            
            # Clean up the response (remove markdown code blocks if present)
            if generated_content.startswith('```'):
                lines = generated_content.split('\n')
                generated_content = '\n'.join(lines[1:-1])
            
            return generated_content
        else:
            return f"❌ No content generated by {model_name}"
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        return f"❌ API error for {model_name}: {error_body[:100]}..."
    except Exception as e:
        return f"❌ Error for {model_name}: {str(e)[:100]}..."

def test_model_parallel(model, api_key):
    """Wrapper function for parallel testing"""
    print(f"🚀 Starting {model}...")
    start_time = time.time()
    result = test_model(model, api_key)
    duration = time.time() - start_time
    print(f"✅ Completed {model} in {duration:.1f}s")
    return model, result

def main():
    """Test all available Gemini models in parallel"""
    
    # Get API key
    api_key = os.getenv('GEMINI_KEY')
    if not api_key:
        print("❌ GEMINI_KEY environment variable not set")
        return
    
    # Available models to test (verified via API)
    models = [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash"
    ]
    
    print("🧪 Testing Gemini Models for Changelog Generation (Parallel)")
    print("=" * 65)
    print(f"🚀 Running {len(models)} models in parallel...")
    print()
    
    results = {}
    start_time = time.time()
    
    # Run all models in parallel
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Submit all tasks
        future_to_model = {
            executor.submit(test_model_parallel, model, api_key): model 
            for model in models
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_model):
            model, result = future.result()
            results[model] = result
    
    total_duration = time.time() - start_time
    print()
    print(f"🎉 All {len(models)} models completed in {total_duration:.1f}s")
    print()
    
    # Display results
    print("📊 RESULTS COMPARISON")
    print("=" * 60)
    
    for model, result in results.items():
        print(f"\n🤖 {model}:")
        print("-" * 40)
        print(result)
        print()
    
    # Save results to file
    output_file = Path("tmp/gemini-model-comparison.txt")
    with open(output_file, 'w') as f:
        f.write("Gemini Model Comparison for Changelog Generation\n")
        f.write("=" * 60 + "\n\n")
        
        for model, result in results.items():
            f.write(f"Model: {model}\n")
            f.write("-" * 40 + "\n")
            f.write(result + "\n\n")
    
    print(f"💾 Results saved to: {output_file}")

if __name__ == "__main__":
    main()
