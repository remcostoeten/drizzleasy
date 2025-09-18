#!/usr/bin/env python3
"""
Simple Gemini API Key Validator
Tests GEMINI_KEY, GEMINI_KEY_SECONDARY, GEMINI_KEY_FALLBACK from root .env
"""

import os
import json
import urllib.request
from pathlib import Path

def load_env():
    """Load environment variables from root .env file"""
    dotenv_path = Path(__file__).parent.parent.parent / ".env"
    if not dotenv_path.exists():
        print(f"❌ .env file not found at: {dotenv_path}")
        return False
    
    print(f"📁 Loading .env from: {dotenv_path}")
    
    with open(dotenv_path, "r") as f:
        content = f.read()
    
    # Parse .env file handling multi-line values
    lines = content.split('\n')
    current_key = None
    current_value = []
    
    for line in lines:
        line = line.strip()
        
        # Skip comments and empty lines
        if line.startswith("#") or not line:
            continue
        
        # Check if this line starts a new key-value pair
        if "=" in line:
            # Save previous key-value if exists
            if current_key:
                value = ''.join(current_value).strip('"\'')
                os.environ[current_key] = value
                print(f"✅ Loaded {current_key}: {value[:20]}{'...' if len(value) > 20 else ''}")
            
            # Start new key-value pair
            key, _, value = line.partition("=")
            current_key = key.strip()
            current_value = [value.strip('"\'')]
        else:
            # Continuation of previous value (multi-line)
            if current_key:
                current_value.append(line.strip('"\''))
    
    # Don't forget the last key-value pair
    if current_key:
        value = ''.join(current_value).strip('"\'')
        os.environ[current_key] = value
        print(f"✅ Loaded {current_key}: {value[:20]}{'...' if len(value) > 20 else ''}")
    
    return True

def test_key(api_key: str) -> str:
    """Test a single API key, return status"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        data = {
            "contents": [{
                "parts": [{
                    "text": "Hi"
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 5,
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if 'candidates' in result:
            return "valid"
        else:
            return "ERR no response"
            
    except urllib.error.HTTPError as e:
        if e.code == 429:
            return "valid but rate limited"
        elif e.code == 403 or e.code == 400:
            return "ERR invalid key"
        else:
            return f"ERR {e.code}"
    except Exception:
        return "ERR connection failed"

def main():
    """Main function"""
    print("🔍 Gemini API Key Validator")
    print("=" * 50)
    print()
    
    # Load environment variables
    if not load_env():
        print("❌ Failed to load .env file. Exiting.")
        return
    
    print()
    print("🧪 Testing API Keys:")
    print("-" * 30)
    
    keys = [
        ("GEMINI_KEY", "KEY 1"),
        ("GEMINI_KEY_SECONDARY", "KEY 2"), 
        ("GEMINI_KEY_FALLBACK", "KEY 3")
    ]
    
    results = []
    
    for env_var, display_name in keys:
        api_key = os.getenv(env_var)
        if api_key:
            print(f"🔑 Testing {display_name} ({env_var})...")
            status = test_key(api_key)
            print(f"   {display_name}: {status}")
            results.append((display_name, status))
        else:
            print(f"❌ {display_name} ({env_var}): ERR not found")
            results.append((display_name, "ERR not found"))
    
    print()
    print("📊 Summary:")
    print("-" * 20)
    
    valid_count = 0
    for display_name, status in results:
        if status == "valid" or status == "valid but rate limited":
            print(f"✅ {display_name}: {status}")
            valid_count += 1
        else:
            print(f"❌ {display_name}: {status}")
    
    print()
    if valid_count > 0:
        print(f"🎉 {valid_count}/{len(results)} keys are working!")
    else:
        print("⚠️  No valid keys found. Check your .env file.")

if __name__ == "__main__":
    main()