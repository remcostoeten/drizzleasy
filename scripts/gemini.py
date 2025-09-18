#!/usr/bin/env python3
"""
Interactive Gemini Scripts Manager
Provides a unified interface to execute all individual Gemini scripts
"""

import os
import sys
import subprocess
from pathlib import Path

# Color codes for beautiful terminal output
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Regular colors
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

def run_script(script_name: str, description: str = "") -> bool:
    """Run a Gemini script and return success status"""
    script_path = Path(__file__).parent / "gemini" / script_name
    
    if not script_path.exists():
        print_colored(f"❌ Script not found: {script_path}", Colors.BRIGHT_RED)
        return False
    
    print_colored(f"🚀 Running: {script_name}", Colors.BRIGHT_CYAN, bold=True)
    if description:
        print_colored(f"   {description}", Colors.DIM)
    print_colored("─" * 60, Colors.DIM)
    print()
    
    try:
        # Run the script
        result = subprocess.run([sys.executable, str(script_path)], 
                              cwd=Path(__file__).parent.parent,
                              check=False)
        
        print()
        print_colored("─" * 60, Colors.DIM)
        
        if result.returncode == 0:
            print_colored(f"✅ {script_name} completed successfully", Colors.BRIGHT_GREEN)
            return True
        else:
            print_colored(f"❌ {script_name} failed with exit code {result.returncode}", Colors.BRIGHT_RED)
            return False
            
    except KeyboardInterrupt:
        print()
        print_colored("⚠️  Script interrupted by user", Colors.BRIGHT_YELLOW)
        return False
    except Exception as e:
        print_colored(f"❌ Error running {script_name}: {str(e)}", Colors.BRIGHT_RED)
        return False

def show_header():
    """Display the main header"""
    print()
    print_colored("╔══════════════════════════════════════════════════════════════════╗", Colors.BRIGHT_BLUE, bold=True)
    print_colored("║                                                                  ║", Colors.BRIGHT_BLUE, bold=True)
    print_colored("║  🤖 Gemini Scripts Manager - Interactive Tool Suite            ║", Colors.BRIGHT_CYAN, bold=True)
    print_colored("║                                                                  ║", Colors.BRIGHT_BLUE, bold=True)
    print_colored("╚══════════════════════════════════════════════════════════════════╝", Colors.BRIGHT_BLUE, bold=True)
    print()

def show_menu():
    """Display the main menu"""
    print_colored("📋 Available Scripts:", Colors.BRIGHT_YELLOW, bold=True)
    print()
    
    scripts = [
        ("1", "test-gemini-key.py", "🧪 Quick Key Validation", 
         "Fast validation of all API keys in .env file"),
        ("2", "debug-gemini.py", "🔍 Debug API Issues", 
         "Detailed debugging tool for API connection problems"),
        ("3", "test-models.py", "🎯 Model Testing Suite", 
         "Interactive testing of different Gemini models with changelog generation"),
        ("4", "test-gemini-models.py", "📊 Model Comparison", 
         "Compare all available Gemini models for changelog generation"),
    ]
    
    for num, script, title, desc in scripts:
        print_colored(f"  [{num}] {title}", Colors.BRIGHT_WHITE, bold=True)
        print_colored(f"      {desc}", Colors.DIM)
        print()
    
    print_colored("  [5] 🚀 Run All Scripts", Colors.BRIGHT_MAGENTA, bold=True)
    print_colored("      Execute all scripts in sequence", Colors.DIM)
    print()
    
    print_colored("  [0] 👋 Exit", Colors.DIM)
    print()

def run_all_scripts():
    """Run all scripts in sequence"""
    scripts = [
        ("test-gemini-key.py", "Quick validation of API keys"),
        ("debug-gemini.py", "Detailed API diagnostics"),
        ("test-models.py", "Model testing suite"),
        ("test-gemini-models.py", "Model comparison")
    ]
    
    print_colored("🚀 Running All Gemini Scripts", Colors.BRIGHT_MAGENTA, bold=True)
    print_colored("═" * 40, Colors.BRIGHT_BLUE)
    print()
    
    results = []
    
    for script, description in scripts:
        success = run_script(script, description)
        results.append((script, success))
        
        if not success:
            print()
            choice = input(f"{Colors.BRIGHT_YELLOW}Continue with remaining scripts? (Y/n): {Colors.RESET}").strip().lower()
            if choice == 'n':
                break
        
        print()
        print_colored("═" * 60, Colors.DIM)
        print()
    
    # Summary
    print_colored("📊 Execution Summary:", Colors.BRIGHT_CYAN, bold=True)
    print_colored("─" * 25, Colors.CYAN)
    
    for script, success in results:
        status = "✅ Success" if success else "❌ Failed"
        color = Colors.BRIGHT_GREEN if success else Colors.BRIGHT_RED
        print_colored(f"  {script:<25} {status}", color)
    
    successful = sum(1 for _, success in results if success)
    total = len(results)
    print()
    print_colored(f"Total: {successful}/{total} scripts completed successfully", 
                 Colors.BRIGHT_GREEN if successful == total else Colors.BRIGHT_YELLOW)

def check_environment():
    """Check if the environment is properly set up"""
    issues = []
    
    # Check if .env file exists
    env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        issues.append("❌ .env file not found in project root")
    
    # Check if gemini directory exists
    gemini_dir = Path(__file__).parent / "gemini"
    if not gemini_dir.exists():
        issues.append("❌ scripts/gemini/ directory not found")
    
    # Check if individual scripts exist
    required_scripts = [
        "test-gemini-key.py", 
        "debug-gemini.py",
        "test-models.py",
        "test-gemini-models.py"
    ]
    
    for script in required_scripts:
        script_path = gemini_dir / script
        if not script_path.exists():
            issues.append(f"❌ Missing script: {script}")
    
    if issues:
        print_colored("⚠️  Environment Issues Detected:", Colors.BRIGHT_YELLOW, bold=True)
        for issue in issues:
            print_colored(f"   {issue}", Colors.BRIGHT_RED)
        print()
        return False
    
    print_colored("✅ Environment check passed", Colors.BRIGHT_GREEN)
    return True

def main():
    """Main interactive loop"""
    # Check environment first
    if not check_environment():
        print_colored("Please fix the environment issues before continuing.", Colors.BRIGHT_YELLOW)
        return
    
    while True:
        show_header()
        show_menu()
        
        choice = input(f"{Colors.BRIGHT_CYAN}Select option (0-5): {Colors.RESET}").strip()
        print()
        
        if choice == "0":
            print_colored("👋 Goodbye!", Colors.BRIGHT_YELLOW, bold=True)
            break
        elif choice == "1":
            run_script("test-gemini-key.py", "Quick validation of API keys")
        elif choice == "2":
            run_script("debug-gemini.py", "Detailed API diagnostics")
        elif choice == "3":
            run_script("test-models.py", "Interactive model testing")
        elif choice == "4":
            run_script("test-gemini-models.py", "Model comparison for changelog generation")
        elif choice == "5":
            run_all_scripts()
        else:
            print_colored("❌ Invalid option. Please select 0-5.", Colors.BRIGHT_RED)
        
        if choice != "0":
            print()
            input(f"{Colors.DIM}Press Enter to continue...{Colors.RESET}")
            print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print_colored("👋 Interrupted by user. Goodbye!", Colors.BRIGHT_YELLOW)
        sys.exit(0)