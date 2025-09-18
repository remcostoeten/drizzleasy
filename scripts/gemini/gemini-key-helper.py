#!/usr/bin/env python3
"""
Gemini API Key Helper
- Guide through key creation process
- Validate existing keys
- Set up .env file
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import webbrowser
from pathlib import Path

def load_env():
    """Load environment variables from .env file"""
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
    return env_vars, dotenv_path

def save_env(env_vars: dict, dotenv_path: Path):
    """Save environment variables to .env file"""
    with open(dotenv_path, "w") as f:
        f.write("# Gemini API Keys\n")
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")

def test_api_key(api_key: str) -> tuple[bool, str]:
    """Test if an API key is valid"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        data = {
            "contents": [{
                "parts": [{
                    "text": "Say 'API key is working' in one sentence."
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 20,
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if 'candidates' in result and len(result['candidates']) > 0:
            response_text = result['candidates'][0]['parts'][0]['text'].strip()
            return True, response_text
        else:
            return False, "No response generated"
            
    except urllib.error.HTTPError as e:
        if e.code == 400:
            return False, "Invalid API key format"
        elif e.code == 403:
            return False, "API key denied - check permissions"
        elif e.code == 429:
            return False, "Rate limited - key might be valid"
        else:
            return False, f"HTTP {e.code} error"
    except Exception as e:
        return False, f"Connection error: {str(e)[:50]}..."

def print_colored(text: str, color: str = '\033[0m'):
    """Print colored text"""
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'cyan': '\033[96m',
        'white': '\033[97m',
        'bold': '\033[1m',
        'reset': '\033[0m'
    }
    print(f"{colors.get(color, '')}{text}{colors['reset']}")

def open_browser(url: str):
    """Open URL in browser"""
    try:
        webbrowser.open(url)
        return True
    except:
        return False

def guide_key_creation():
    """Guide user through API key creation"""
    print_colored("🔑 Gemini API Key Creation Guide", 'bold')
    print_colored("=" * 40, 'blue')
    print()
    
    print_colored("Step 1: Open Google AI Studio", 'cyan')
    url = "https://aistudio.google.com/"
    print(f"URL: {url}")
    
    if input("Open in browser? (y/N): ").lower() == 'y':
        if open_browser(url):
            print_colored("✅ Browser opened", 'green')
        else:
            print_colored("⚠️  Please open the URL manually", 'yellow')
    
    print()
    print_colored("Step 2: Get API Key", 'cyan')
    print("1. Click 'Get API key' in the left sidebar")
    print("2. Click 'Create API key'")
    print("3. Select a Google Cloud project (or create new)")
    print("4. Copy the generated API key")
    print("   - Should start with 'AIza'")
    print("   - Keep it secret!")
    
    print()
    print_colored("Step 3: Enable APIs (if needed)", 'cyan')
    print("If you get permission errors:")
    print("1. Go to Google Cloud Console")
    print("2. Enable 'Generative Language API'")
    
    print()
    input("Press Enter when you have your API key...")

def interactive_key_setup():
    """Interactive API key setup"""
    env_vars, dotenv_path = load_env()
    
    print_colored("🔧 API Key Setup", 'bold')
    print_colored("=" * 20, 'blue')
    print()
    
    # Check existing keys
    existing_keys = {
        'GEMINI_KEY': env_vars.get('GEMINI_KEY'),
        'GEMINI_KEY_SECONDARY': env_vars.get('GEMINI_KEY_SECONDARY'),
        'GEMINI_KEY_FALLBACK': env_vars.get('GEMINI_KEY_FALLBACK')
    }
    
    print("Current keys in .env:")
    for key_name, key_value in existing_keys.items():
        if key_value:
            masked = key_value[:8] + '...' + key_value[-4:] if len(key_value) > 12 else key_value[:6] + '...'
            print(f"  {key_name}: {masked}")
        else:
            print(f"  {key_name}: Not set")
    
    print()
    
    # Add/update keys
    for key_name in ['GEMINI_KEY', 'GEMINI_KEY_SECONDARY', 'GEMINI_KEY_FALLBACK']:
        current_key = existing_keys.get(key_name)
        
        if current_key:
            print(f"Update {key_name}? Current: {current_key[:8]}... (y/N): ", end="")
            if input().lower() != 'y':
                continue
        
        new_key = input(f"Enter {key_name} (or press Enter to skip): ").strip()
        
        if new_key:
            if not new_key.startswith('AIza'):
                print_colored("⚠️  Warning: Key doesn't start with 'AIza'", 'yellow')
            
            print("Testing key...", end=" ")
            is_valid, message = test_api_key(new_key)
            
            if is_valid:
                print_colored("✅ Valid!", 'green')
                print(f"Response: {message}")
                env_vars[key_name] = new_key
            else:
                print_colored(f"❌ Invalid: {message}", 'red')
                if input("Save anyway? (y/N): ").lower() == 'y':
                    env_vars[key_name] = new_key
        
        print()
    
    # Save to .env
    if input("Save changes to .env file? (Y/n): ").lower() != 'n':
        save_env(env_vars, dotenv_path)
        print_colored(f"✅ Saved to {dotenv_path}", 'green')

def validate_existing_keys():
    """Validate all existing API keys"""
    env_vars, _ = load_env()
    
    print_colored("🧪 Validating Existing Keys", 'bold')
    print_colored("=" * 30, 'blue')
    print()
    
    keys_to_test = ['GEMINI_KEY', 'GEMINI_KEY_SECONDARY', 'GEMINI_KEY_FALLBACK']
    
    for key_name in keys_to_test:
        api_key = env_vars.get(key_name)
        if not api_key:
            print(f"{key_name}: Not set")
            continue
        
        masked = api_key[:8] + '...' + api_key[-4:] if len(api_key) > 12 else api_key[:6] + '...'
        print(f"{key_name} ({masked}): ", end="")
        
        is_valid, message = test_api_key(api_key)
        
        if is_valid:
            print_colored(f"✅ Valid - {message}", 'green')
        else:
            print_colored(f"❌ Invalid - {message}", 'red')

def show_menu():
    """Show main menu"""
    print_colored("🔑 Gemini API Key Helper", 'bold')
    print_colored("=" * 25, 'blue')
    print()
    print("1. Guide: How to create API keys")
    print("2. Interactive: Set up API keys")
    print("3. Validate: Test existing keys")
    print("4. Exit")
    print()

def main():
    """Main menu loop"""
    while True:
        show_menu()
        choice = input("Select option (1-4): ").strip()
        print()
        
        if choice == '1':
            guide_key_creation()
        elif choice == '2':
            interactive_key_setup()
        elif choice == '3':
            validate_existing_keys()
        elif choice == '4':
            print_colored("👋 Goodbye!", 'cyan')
            break
        else:
            print_colored("❌ Invalid choice", 'red')
        
        print()
        input("Press Enter to continue...")
        print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    main()
