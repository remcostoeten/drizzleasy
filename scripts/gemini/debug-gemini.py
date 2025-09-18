#!/usr/bin/env python3
"""
Debug Gemini API issues with detailed error reporting
"""

import os
import json
import urllib.request
import urllib.parse
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
    return env_vars

def test_gemini_detailed(api_key: str, model: str = "gemini-2.5-flash"):
    """Test Gemini API with detailed error reporting"""
    
    print(f"🔍 Testing API Key: {api_key[:8]}...{api_key[-4:]}")
    print(f"📡 Model: {model}")
    print(f"🌐 Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent")
    print()
    
    # Test 1: Basic request
    print("Test 1: Basic API call...")
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        
        data = {
            "contents": [{
                "parts": [{
                    "text": "Hello"
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 10,
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        print("✅ SUCCESS!")
        if 'candidates' in result and len(result['candidates']) > 0:
            response_text = result['candidates'][0]['parts'][0]['text'].strip()
            print(f"Response: {response_text}")
        
        if 'usageMetadata' in result:
            usage = result['usageMetadata']
            print(f"Tokens used: {usage.get('totalTokenCount', 'N/A')}")
        
        return True
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        print(f"❌ HTTP Error {e.code}")
        print(f"Response: {error_body}")
        
        # Parse error details
        try:
            error_json = json.loads(error_body)
            if 'error' in error_json:
                error_info = error_json['error']
                print(f"Error Code: {error_info.get('code', 'N/A')}")
                print(f"Error Message: {error_info.get('message', 'N/A')}")
                
                # Specific error handling
                message = error_info.get('message', '').lower()
                if 'api key' in message:
                    print("🔑 Issue: API key problem")
                    if 'not valid' in message:
                        print("   → Key format is invalid")
                    elif 'permission' in message:
                        print("   → Key lacks permissions")
                elif 'quota' in message or 'rate' in message:
                    print("⏱️  Issue: Rate limiting (but this might be misleading)")
                elif 'billing' in message:
                    print("💳 Issue: Billing not enabled")
                elif 'project' in message:
                    print("🏗️  Issue: Project configuration")
        except:
            pass
        
        return False
        
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def test_different_models(api_key: str):
    """Test different Gemini models to see which work"""
    
    models = [
        "gemini-2.5-pro",
        "gemini-2.5-flash"
    ]
    
    print("🧪 Testing different models...")
    print("=" * 40)
    
    working_models = []
    
    for model in models:
        print(f"\nTesting {model}...")
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            
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
            
            if 'candidates' in result and len(result['candidates']) > 0:
                print(f"✅ {model} - Working")
                working_models.append(model)
            else:
                print(f"⚠️  {model} - No response")
                
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"❌ {model} - Not available")
            elif e.code == 403:
                print(f"❌ {model} - Permission denied")
            else:
                print(f"❌ {model} - Error {e.code}")
        except Exception as e:
            print(f"❌ {model} - Connection error")
    
    print(f"\n📊 Working models: {len(working_models)}")
    for model in working_models:
        print(f"  ✅ {model}")
    
    return working_models

def check_api_key_format(api_key: str):
    """Check if API key format looks correct"""
    print("🔍 API Key Format Check:")
    print(f"Length: {len(api_key)} characters")
    print(f"Starts with: {api_key[:10]}...")
    print(f"Ends with: ...{api_key[-10:]}")
    
    if api_key.startswith('AIza'):
        print("✅ Format looks correct (starts with AIza)")
    else:
        print("❌ Format issue: Should start with 'AIza'")
    
    if len(api_key) >= 30:
        print("✅ Length looks reasonable")
    else:
        print("❌ Length issue: Too short")

def main():
    """Main diagnostic function"""
    print("🔧 Gemini API Diagnostic Tool")
    print("=" * 35)
    print()
    
    # Load environment
    env_vars = load_env()
    api_key = env_vars.get('GEMINI_KEY')
    
    if not api_key:
        print("❌ GEMINI_KEY not found in .env file")
        return
    
    # Check key format
    check_api_key_format(api_key)
    print()
    
    # Test basic functionality
    success = test_gemini_detailed(api_key)
    print()
    
    if not success:
        print("🔍 Testing alternative models...")
        working_models = test_different_models(api_key)
        
        if working_models:
            print(f"\n💡 In the .env file, set GEMINI_MODEL to one of these working models:")
            for model in working_models:
                print(f"    GEMINI_MODEL='{model}'")
        else:
            print("\n❌ No models are working. Possible issues:")
            print("   1. API key is invalid")
            print("   2. Billing not enabled in Google Cloud")
            print("   3. Generative Language API not enabled")
            print("   4. Project permissions issue")

if __name__ == "__main__":
    main()
