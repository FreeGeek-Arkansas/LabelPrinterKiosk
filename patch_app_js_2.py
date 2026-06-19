import re

app_js_path = '/home/barrett/dev/PrinterQR/static/js/app.js'
with open(app_js_path, 'r') as f:
    content = f.read()

# 1. bindSlider fix
content = content.replace("                        el.style.fontSize = slider.value + 'px';\\n                    }", 
                          "                        el.style.fontSize = slider.value + 'px';\\n                        el.style.width = 'auto';\\n                        el.style.height = 'auto';\\n                        el.style.whiteSpace = 'nowrap';\\n                    }")

# 2. getElementLayout fix
content = content.replace("            fontSize: el.style.fontSize\\n        };", 
                          "            fontSize: el.style.fontSize,\\n            text: el.textContent\\n        };")

# 3. applyElementLayout fix
content = content.replace("        if (layout.fontSize) el.style.fontSize = layout.fontSize;", 
                          "        if (layout.fontSize) el.style.fontSize = layout.fontSize;\\n        if (layout.text && el.id === 'previewName') {\\n            el.textContent = layout.text;\\n            const customNameInput = document.getElementById('customDisplayName');\\n            if (customNameInput) customNameInput.value = layout.text;\\n        }")

# 4. Custom Display Name event listener
# Insert it after the sliders setup
sliders_end = "bindSlider(barcodeScaleSlider, barcodeScaleVal, 'previewBarcodeContainer', true);"
custom_name_logic = """
    const customDisplayNameInput = document.getElementById('customDisplayName');
    if (customDisplayNameInput) {
        customDisplayNameInput.addEventListener('input', (e) => {
            const previewName = document.getElementById('previewName');
            if (previewName) {
                previewName.textContent = e.target.value;
                previewName.style.width = 'auto';
                previewName.style.height = 'auto';
                clearRenderedCache();
            }
        });
    }
"""
if custom_name_logic not in content:
    content = content.replace(sliders_end, sliders_end + "\\n" + custom_name_logic)

# 5. Reset Custom Display Name input when generating barcode
gen_barcode_start = "    function generateBarcode(item) {"
gen_barcode_reset = """    function generateBarcode(item) {
        const customNameInput = document.getElementById('customDisplayName');
        if (customNameInput) customNameInput.value = item.name;"""
content = content.replace(gen_barcode_start, gen_barcode_reset)

with open(app_js_path, 'w') as f:
    f.write(content)

print("Patch applied to app.js")
