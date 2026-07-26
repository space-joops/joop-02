import os
import subprocess

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

# 1. Get all git tracked files
result = subprocess.run("git ls-files", shell=True, capture_output=True, text=True)
files = result.stdout.strip().split('\n')

# 2. Replace content in files
for file in files:
    if not os.path.isfile(file): continue
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        continue
    
    new_content = content.replace('Jupsy', 'Joops').replace('jupsy', 'joops')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated content in {file}")

# 3. Rename files and directories using git mv
# We do this from longest path to shortest to avoid path invalidation
files_to_rename = []
for file in files:
    if 'jupsy' in file.lower():
        files_to_rename.append(file)

files_to_rename.sort(key=len, reverse=True)

for file in files_to_rename:
    new_file = file.replace('Jupsy', 'Joops').replace('jupsy', 'joops')
    new_dir = os.path.dirname(new_file)
    if new_dir and not os.path.exists(new_dir):
        os.makedirs(new_dir, exist_ok=True)
    run(f"git mv '{file}' '{new_file}'")

print("Done renaming!")
