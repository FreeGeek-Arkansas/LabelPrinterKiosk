#     .--------.
#    /        /|
#   /        / |  <-- "Quotes checker at your service!"
#  /________/  |
#  |        |  /
#  |________| /
import sys

with open('static/js/app.js') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    line = line.rstrip('\n')
    # Count occurrences of unescaped single quotes
    sq = 0
    dq = 0
    escape = False
    for char in line:
        if escape:
            escape = False
            continue
        if char == '\\':
            escape = True
        elif char == "'":
            if dq % 2 == 0: sq += 1
        elif char == '"':
            if sq % 2 == 0: dq += 1
    if sq % 2 != 0 or dq % 2 != 0:
        if '/*' not in line and '//' not in line and '`' not in line:
            print(f'Line {i+1} might have unclosed quote: {line}')
