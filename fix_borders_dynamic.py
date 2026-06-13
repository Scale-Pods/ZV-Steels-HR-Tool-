
import sys

file_path = r'd:\AntiGrav Projects\HR\app\(dashboard)\exhibitions\campaign\[campaignName]\campaign-detail-client.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<TableCell key={key} className="px-4 py-3 min-w-[150px] max-w-[250px] whitespace-normal">' in line:
        lines[i] = line.replace('whitespace-normal">', 'whitespace-normal border-b border-border/60">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully updated")
