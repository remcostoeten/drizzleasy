#!/usr/bin/env python3
"""
Gemini Model Testing Script
Interactive testing of different Gemini models with changelog generation
"""

import os
import sys
import json
import time
import urllib.request
import argparse
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Color codes for beautiful terminal output
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Regular colors
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Bright colors
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'

def print_colored(text: str, color: str = Colors.WHITE, bold: bool = False, dim: bool = False) -> None:
    """Print colored text to terminal"""
    style = ""
    if bold:
        style += Colors.BOLD
    if dim:
        style += Colors.DIM
    print(f"{style}{color}{text}{Colors.RESET}")

# Available models (verified via API)
MODELS = [
    "gemini-2.5-pro",
    "gemini-2.5-flash"
]

def load_env():
    """Load environment variables from root .env file"""
    dotenv_path = Path(__file__).parent.parent.parent / ".env"
    env_vars = {}
    if dotenv_path.exists():
        with open(dotenv_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                value = value.strip('"\'')
                env_vars[key.strip()] = value.strip()
                os.environ[key.strip()] = value.strip()
    return env_vars

def save_env(env_vars: dict):
    """Save environment variables to .env file"""
    dotenv_path = Path(__file__).parent.parent.parent / ".env"
    with open(dotenv_path, "w") as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")

def get_changelog_prompt():
    """Get the changelog generation prompt with dummy data"""
    return """You are a technical changelog generator. Create a changelog entry based on git commits.

REQUIREMENTS:
- Use sections: Added, Changed, Fixed, Removed
- Be concise and technical
- Use backticks for code terms
- No emojis or marketing language

DUMMY GIT DATA:
```
feat: add comprehensive CLI tool for release management  
feat: implement Gemini AI changelog generation
fix: project-wide version replacement functionality
feat: add model selection for Gemini API calls
```

Generate a changelog entry for version 0.2.0 with date 2025-09-18."""

def test_model(model_name: str, api_key: str) -> dict:
    """Test a specific model and return results"""
    prompt = get_changelog_prompt()
    
    start_time = time.time()
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1000,
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        duration = time.time() - start_time
        
        if 'candidates' in result and len(result['candidates']) > 0:
            candidate = result['candidates'][0]
            
            # Check finish reason first
            finish_reason = candidate.get('finishReason', 'UNKNOWN')
            if finish_reason == 'MAX_TOKENS':
                output_text = f"Response truncated (hit token limit: {finish_reason})"
            elif finish_reason == 'SAFETY':
                output_text = f"Response blocked by safety filters: {finish_reason}"
            elif finish_reason == 'STOP':
                # Normal completion, try to extract text
                if 'content' in candidate and 'parts' in candidate['content'] and len(candidate['content']['parts']) > 0:
                    if 'text' in candidate['content']['parts'][0]:
                        output_text = candidate['content']['parts'][0]['text'].strip()
                    else:
                        output_text = "No text in response content"
                elif 'parts' in candidate and len(candidate['parts']) > 0:
                    if 'text' in candidate['parts'][0]:
                        output_text = candidate['parts'][0]['text'].strip()
                    else:
                        output_text = "No text in response parts"
                else:
                    output_text = f"No text found (finish reason: {finish_reason})"
            else:
                output_text = f"Unexpected finish reason: {finish_reason}"
            
            # Get token usage
            usage = result.get('usageMetadata', {})
            input_tokens = usage.get('promptTokenCount', 0)
            output_tokens = usage.get('candidatesTokenCount', 0)
            
            return {
                'success': True,
                'output': output_text,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'duration': duration,
                'error': None
            }
        else:
            return {
                'success': False,
                'error': 'No candidates in response',
                'duration': duration
            }
            
    except urllib.error.HTTPError as e:
        duration = time.time() - start_time
        error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        return {
            'success': False,
            'error': f"HTTP {e.code}: {error_body[:100]}...",
            'duration': duration
        }
    except Exception as e:
        duration = time.time() - start_time
        return {
            'success': False,
            'error': str(e)[:100],
            'duration': duration
        }

def format_duration(seconds: float) -> str:
    """Format duration for display"""
    if seconds < 1:
        return f"{int(seconds * 1000)}ms"
    else:
        return f"{seconds:.1f}s"

def save_output(model_name: str, result: dict):
    """Save test output to file"""
    # Ensure tmp directory exists
    tmp_dir = Path(__file__).parent.parent.parent / "tmp"
    tmp_dir.mkdir(exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{model_name}-test-{timestamp}.txt"
    filepath = tmp_dir / filename
    
    # Write output
    with open(filepath, "w") as f:
        f.write(f"{model_name.upper()} TEST\n")
        if result['success']:
            f.write(f"Input: {result['input_tokens']} tokens\n")
            f.write(f"Output: {result['output_tokens']} tokens\n")
        f.write(f"Duration: {format_duration(result['duration'])}\n")
        f.write("_" * 50 + "\n")
        if result['success']:
            f.write(result['output'])
        else:
            f.write(f"ERROR: {result['error']}")
        f.write("\n" + "_" * 50 + "\n")
    
    return filepath

def print_result(model_name: str, result: dict):
    """Print formatted result"""
    print_colored(f"🤖 {model_name.upper()} TEST", Colors.BRIGHT_BLUE, bold=True)
    if result['success']:
        print_colored(f"📊 Input: {result['input_tokens']} tokens", Colors.CYAN)
        print_colored(f"📤 Output: {result['output_tokens']} tokens", Colors.CYAN)
    print_colored(f"⏱️  Duration: {format_duration(result['duration'])}", Colors.YELLOW)
    print_colored("─" * 50, Colors.DIM)
    if result['success']:
        print_colored(result['output'], Colors.WHITE)
    else:
        print_colored(f"❌ ERROR: {result['error']}", Colors.BRIGHT_RED)
    print_colored("─" * 50, Colors.DIM)
    print()

def test_model_parallel_wrapper(model, api_key):
    """Wrapper function for parallel testing"""
    print_colored(f"🚀 Starting {model}...", Colors.BRIGHT_CYAN)
    start_time = time.time()
    result = test_model(model, api_key)
    duration = time.time() - start_time
    print_colored(f"✅ Completed {model} in {duration:.1f}s", Colors.BRIGHT_GREEN)
    return model, result

def run_test(models: list, api_key: str, parallel: bool = True):
    """Run tests for specified models (optionally in parallel)"""
    results = []
    
    if parallel and len(models) > 1:
        print_colored(f"🚀 Running {len(models)} models in parallel...", Colors.BRIGHT_MAGENTA, bold=True)
        print()
        
        start_time = time.time()
        
        # Run all models in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Submit all tasks
            future_to_model = {
                executor.submit(test_model_parallel_wrapper, model, api_key): model 
                for model in models
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_model):
                model, result = future.result()
                results.append((model, result))
        
        total_duration = time.time() - start_time
        print()
        print_colored(f"🎉 All {len(models)} models completed in {total_duration:.1f}s", Colors.BRIGHT_GREEN, bold=True)
        print()
        
        # Print all results
        for model, result in results:
            print_result(model, result)
            filepath = save_output(model, result)
            print_colored(f"💾 Saved to: {filepath}", Colors.GREEN)
            print()
    else:
        # Sequential execution (original behavior)
        for model in models:
            print_colored(f"🧪 Testing {model}...", Colors.BRIGHT_CYAN)
            result = test_model(model, api_key)
            results.append((model, result))
            
            # Print result
            print_result(model, result)
            
            # Save to file
            filepath = save_output(model, result)
            print_colored(f"💾 Saved to: {filepath}", Colors.GREEN)
            print()
    
    return results

def get_current_model():
    """Get current default model from .env"""
    env_vars = load_env()
    return env_vars.get('GEMINI_MODEL', 'Not set')

def update_default_model():
    """Interactive model selection to update .env"""
    print_colored("🎯 Available models:", Colors.BRIGHT_YELLOW, bold=True)
    for i, model in enumerate(MODELS, 1):
        print_colored(f"  [{i}] {model}", Colors.BRIGHT_WHITE)
    
    while True:
        try:
            print()
            choice = input(f"{Colors.BRIGHT_CYAN}Select model (1-{len(MODELS)}): {Colors.RESET}").strip()
            idx = int(choice) - 1
            if 0 <= idx < len(MODELS):
                selected_model = MODELS[idx]
                
                # Update .env
                env_vars = load_env()
                env_vars['GEMINI_MODEL'] = selected_model
                save_env(env_vars)
                
                print_colored(f"✅ Updated GEMINI_MODEL to: {selected_model}", Colors.BRIGHT_GREEN)
                return
            else:
                print_colored("❌ Invalid selection", Colors.BRIGHT_RED)
        except (ValueError, KeyboardInterrupt):
            print_colored("❌ Invalid input", Colors.BRIGHT_RED)
            return

def select_models() -> list:
    """Interactive model selection"""
    print_colored("🎯 Select models to test:", Colors.BRIGHT_YELLOW, bold=True)
    for i, model in enumerate(MODELS, 1):
        print_colored(f"  [{i}] {model}", Colors.BRIGHT_WHITE)
    
    print()
    print_colored("💡 Enter model numbers separated by spaces (e.g., 1 3 5):", Colors.CYAN)
    print_colored("   Or press Enter for all models", Colors.DIM)
    
    choice = input(f"{Colors.BRIGHT_CYAN}Selection: {Colors.RESET}").strip()
    
    if not choice:
        return MODELS
    
    try:
        indices = [int(x) - 1 for x in choice.split()]
        selected = [MODELS[i] for i in indices if 0 <= i < len(MODELS)]
        if selected:
            return selected
        else:
            print_colored("❌ No valid selections", Colors.BRIGHT_RED)
            return []
    except ValueError:
        print_colored("❌ Invalid input", Colors.BRIGHT_RED)
        return []

def interactive_menu():
    """Interactive menu mode"""
    while True:
        print()
        print_colored("╔══════════════════════════════════════════════════════════╗", Colors.BRIGHT_BLUE, bold=True)
        print_colored("║                                                          ║", Colors.BRIGHT_BLUE, bold=True)
        print_colored("║  🤖 Gemini Model Testing Suite                         ║", Colors.BRIGHT_CYAN, bold=True)
        print_colored("║                                                          ║", Colors.BRIGHT_BLUE, bold=True)
        print_colored("╚══════════════════════════════════════════════════════════╝", Colors.BRIGHT_BLUE, bold=True)
        print()
        
        print_colored("📋 Available Options:", Colors.BRIGHT_YELLOW, bold=True)
        print_colored("  [1] 🚀 Run default model", Colors.BRIGHT_WHITE)
        print_colored("  [2] 👁️  View current default model", Colors.BRIGHT_WHITE)
        print_colored("  [3] ⚙️  Update default model", Colors.BRIGHT_WHITE)
        print_colored("  [4] 🎯 Run test with specific model(s)", Colors.BRIGHT_WHITE)
        print_colored("  [5] 🌟 Run tests with all models (parallel)", Colors.BRIGHT_WHITE)
        print_colored("  [6] 🐌 Run tests with all models (sequential)", Colors.BRIGHT_WHITE)
        print_colored("  [0] 👋 Exit", Colors.DIM)
        
        print()
        choice = input(f"{Colors.BRIGHT_CYAN}Select option: {Colors.RESET}").strip()
        
        if choice == "0":
            print_colored("👋 Goodbye!", Colors.BRIGHT_YELLOW)
            break
        elif choice == "1":
            current_model = get_current_model()
            if current_model == "Not set":
                print_colored("❌ No default model set. Use option [3] to set one.", Colors.BRIGHT_RED)
            else:
                api_key = os.getenv('GEMINI_KEY')
                if not api_key:
                    print_colored("❌ GEMINI_KEY not found in .env", Colors.BRIGHT_RED)
                else:
                    print_colored(f"🚀 Running default model: {current_model}", Colors.BRIGHT_GREEN)
                    run_test([current_model], api_key)
        elif choice == "2":
            current_model = get_current_model()
            if current_model == "Not set":
                print_colored("⚠️  Current default model: Not set", Colors.BRIGHT_YELLOW)
            else:
                print_colored(f"✅ Current default model: {current_model}", Colors.BRIGHT_GREEN)
        elif choice == "3":
            update_default_model()
        elif choice == "4":
            selected_models = select_models()
            if selected_models:
                api_key = os.getenv('GEMINI_KEY')
                if not api_key:
                    print_colored("❌ GEMINI_KEY not found in .env", Colors.BRIGHT_RED)
                else:
                    print_colored(f"🎯 Running {len(selected_models)} selected model(s)", Colors.BRIGHT_GREEN)
                    run_test(selected_models, api_key)
        elif choice == "5":
            api_key = os.getenv('GEMINI_KEY')
            if not api_key:
                print_colored("❌ GEMINI_KEY not found in .env", Colors.BRIGHT_RED)
            else:
                print_colored(f"🌟 Running all {len(MODELS)} models in parallel", Colors.BRIGHT_GREEN)
                run_test(MODELS, api_key, parallel=True)
        elif choice == "6":
            api_key = os.getenv('GEMINI_KEY')
            if not api_key:
                print_colored("❌ GEMINI_KEY not found in .env", Colors.BRIGHT_RED)
            else:
                print_colored(f"🐌 Running all {len(MODELS)} models sequentially", Colors.BRIGHT_GREEN)
                run_test(MODELS, api_key, parallel=False)
        else:
            print_colored("❌ Invalid option", Colors.BRIGHT_RED)

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Test Gemini models")
    parser.add_argument("-i", "--interactive", action="store_true", help="Interactive menu mode")
    parser.add_argument("-a", "--all", action="store_true", help="Run tests with all models")
    parser.add_argument("-p", "--parallel", action="store_true", help="Run tests in parallel (default for --all)")
    parser.add_argument("-s", "--sequential", action="store_true", help="Run tests sequentially")
    
    args = parser.parse_args()
    
    # Load environment
    load_env()
    
    # Get API key
    api_key = os.getenv('GEMINI_KEY')
    if not api_key:
        print_colored("❌ GEMINI_KEY not found in .env file", Colors.BRIGHT_RED)
        sys.exit(1)
    
    if args.interactive:
        interactive_menu()
    elif args.all:
        parallel = not args.sequential  # Default to parallel unless --sequential is specified
        if parallel:
            print_colored(f"🌟 Running all {len(MODELS)} models in parallel", Colors.BRIGHT_GREEN)
        else:
            print_colored(f"🐌 Running all {len(MODELS)} models sequentially", Colors.BRIGHT_GREEN)
        run_test(MODELS, api_key, parallel=parallel)
    else:
        # Default mode - run with current model
        current_model = os.getenv('GEMINI_MODEL')
        if not current_model:
            print_colored("⚠️  GEMINI_MODEL not set in .env. Using gemini-2.5-flash as default.", Colors.BRIGHT_YELLOW)
            current_model = "gemini-2.5-flash"
        
        print_colored(f"🚀 Running model: {current_model}", Colors.BRIGHT_GREEN)
        run_test([current_model], api_key, parallel=False)  # Single model doesn't need parallel

if __name__ == "__main__":
    main()
