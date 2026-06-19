#     _______
#    |  ...  |  <-- "Beep Boop, patching Javascript!"
#    |_______|
#      |   |
#      |   |
import re
import os

app_js_path = '/home/barrett/dev/PrinterQR/static/js/app.js'
with open(app_js_path, 'r') as f:
    content = f.read()

# 1. Top variables
content = content.replace("const statusMessage = document.getElementById('statusMessage');",
    "const statusMessage = document.getElementById('statusMessage');\n    const makerSearchInput = document.getElementById('makerSearchInput');\n    const makerItemsList = document.getElementById('makerItemsList');\n    const currentTemplateName = document.getElementById('currentTemplateName');")

# 2. Add renderMakerItems to initial fetch
content = content.replace("renderItems(catalogItems);", "renderItems(catalogItems);\n                if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);")

# 3. loadTemplatesList
content = content.replace("""    function loadTemplatesList() {
        fetch('/api/templates')
            .then(r => r.json())
            .then(data => {
                savedTemplates = data;
                if(templateSelect) {
                    templateSelect.innerHTML = '<option value="">-- Select Template --</option>';
                    Object.keys(data).forEach(name => {
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        templateSelect.appendChild(opt);
                    });
                }
            })
            .catch(console.error);
    }""", """    function loadTemplatesList() {
        fetch('/api/templates')
            .then(r => r.json())
            .then(data => {
                savedTemplates = data;
                if (catalogItems && catalogItems.length > 0) {
                    renderItems(catalogItems);
                    if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);
                }
            })
            .catch(console.error);
    }""")

# 4. saveTemplateBtn logic and loadTemplateBtn
save_logic = """    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', async () => {
            const name = templateNameInput.value.trim();
            if (!name) {
                alert('Please enter a template name');
                return;
            }

            const layout = {
                name: getElementLayout(document.getElementById('previewName')),
                barcode: getElementLayout(document.getElementById('previewBarcodeContainer')),
                sku: getElementLayout(document.getElementById('previewSku')),
                price: getElementLayout(document.getElementById('previewPrice'))
            };

            try {
                const response = await fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, layout })
                });
                if (response.ok) {
                    alert('Template saved!');
                    templateNameInput.value = '';
                    loadTemplatesList();
                }
            } catch (e) {
                console.error('Failed to save template', e);
            }
        });
    }

    if (loadTemplateBtn) {
        loadTemplateBtn.addEventListener('click', () => {
            const name = templateSelect.value;
            if (!name || !savedTemplates[name]) return;
            const layout = savedTemplates[name];
            
            applyElementLayout(document.getElementById('previewName'), layout.name);
            applyElementLayout(document.getElementById('previewBarcodeContainer'), layout.barcode);
            applyElementLayout(document.getElementById('previewSku'), layout.sku);
            applyElementLayout(document.getElementById('previewPrice'), layout.price);
            clearRenderedCache();
        });
    }"""

new_save_logic = """    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', async () => {
            if (!selectedItem) {
                alert('Please select an item first');
                return;
            }
            const name = selectedItem.sku;
            if (!name) return;

            const layout = {
                name: getElementLayout(document.getElementById('previewName')),
                barcode: getElementLayout(document.getElementById('previewBarcodeContainer')),
                sku: getElementLayout(document.getElementById('previewSku')),
                price: getElementLayout(document.getElementById('previewPrice'))
            };

            try {
                const response = await fetch('/api/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, layout })
                });
                if (response.ok) {
                    alert('Template saved for this item!');
                    loadTemplatesList();
                    if (printBtn) printBtn.disabled = false;
                    if (addToCartBtn) addToCartBtn.disabled = false;
                }
            } catch (e) {
                console.error('Failed to save template', e);
            }
        });
    }"""

content = content.replace(save_logic, new_save_logic)

# 5. searchInputs
search_logic = """    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = catalogItems.filter(item => 
            item.name.toLowerCase().includes(query) || 
            (item.sku && item.sku.toLowerCase().includes(query))
        );
        renderItems(filtered);
    });"""

new_search_logic = """    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = catalogItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.sku && item.sku.toLowerCase().includes(query))
            );
            renderItems(filtered);
        });
    }

    if (makerSearchInput) {
        makerSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = catalogItems.filter(item => 
                item.name.toLowerCase().includes(query) || 
                (item.sku && item.sku.toLowerCase().includes(query))
            );
            if (typeof renderMakerItems === 'function') renderMakerItems(filtered);
        });
    }"""

content = content.replace(search_logic, new_search_logic)


# 6. renderItems and selectItem
content = content.replace("const filtered = catalogItems.filter(", "const filtered = catalogItems.filter(") # dummy match
content = re.sub(r'function renderItems\(items\) \{.*?itemsList\.innerHTML = \'\';', """function renderItems(items) {
        if (!itemsList) return;
        itemsList.innerHTML = '';
        const printableItems = items.filter(item => item.sku && savedTemplates[item.sku]);
        items = printableItems;""", content, flags=re.DOTALL)

content = content.replace('itemsList.innerHTML = `<div class="empty-state">No items found.</div>`;', 'itemsList.innerHTML = `<div class="empty-state">No ready-to-print items found. Make templates in the Template Maker.</div>`;')


# 7. add renderMakerItems after renderItems
# Find the end of renderItems
end_render_idx = content.find('async function loadImage')
if end_render_idx != -1:
    maker_items_code = """
    function renderMakerItems(items) {
        if (!makerItemsList) return;
        makerItemsList.innerHTML = '';
        
        if (items.length === 0) {
            makerItemsList.innerHTML = `<div class="empty-state">No items found.</div>`;
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgDiv = entry.target;
                    const query = imgDiv.dataset.query;
                    if (query) {
                        loadImage(imgDiv, query);
                    }
                    observer.unobserve(imgDiv);
                }
            });
        }, { rootMargin: '200px' });

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'menu-item';
            if (!item.sku) {
                itemEl.classList.add('disabled');
            } else {
                itemEl.addEventListener('click', () => selectItem(item, itemEl));
            }
            
            const imgDiv = document.createElement('div');
            imgDiv.className = 'menu-item-image';
            imgDiv.dataset.query = item.name;
            
            if (imageCache[item.name]) {
                const img = document.createElement('img');
                img.src = imageCache[item.name];
                imgDiv.appendChild(img);
            } else if (imageCache[item.name] === null) {
                imgDiv.textContent = '—';
            } else {
                imgDiv.innerHTML = '<div class="img-loading"></div>';
                observer.observe(imgDiv);
            }
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'menu-item-info';
            
            const nameEl = document.createElement('div');
            nameEl.className = 'menu-item-name';
            nameEl.textContent = item.name;
            
            const skuEl = document.createElement('div');
            skuEl.className = 'menu-item-sku';
            skuEl.textContent = item.sku ? item.sku : 'No SKU';
            
            // Show badge if template exists
            if (item.sku && savedTemplates[item.sku]) {
                const badge = document.createElement('span');
                badge.textContent = ' ✓ (Ready)';
                badge.style.color = 'var(--success)';
                badge.style.fontWeight = 'bold';
                skuEl.appendChild(badge);
            }
            
            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(skuEl);
            
            itemEl.appendChild(imgDiv);
            itemEl.appendChild(infoDiv);
            makerItemsList.appendChild(itemEl);
        });
    }

"""
    content = content[:end_render_idx] + maker_items_code + content[end_render_idx:]


# 8. selectItem
select_logic = """    function selectItem(item, element) {
        selectedItem = item;
        
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }

        generateBarcode(item);
        
        // Auto-switch to Preview tab
        document.querySelector('[data-tab="tab-preview"]').click();
    }"""

new_select_logic = """    function selectItem(item, element) {
        selectedItem = item;
        
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        if (element) {
            element.classList.add('active');
        }
        
        if (currentTemplateName) {
            currentTemplateName.textContent = item.name + ' (SKU: ' + item.sku + ')';
        }

        generateBarcode(item);
        
        const tabEl = document.querySelector('[data-tab="tab-template-maker"]');
        if (tabEl) tabEl.click();
    }"""

content = content.replace(select_logic, new_select_logic)


# 9. generateBarcode
# Find the end of generateBarcode try catch block
# We want to replace the part setting printBtn.disabled
gen_logic = """            printBtn.disabled = false;
            if (addToCartBtn) addToCartBtn.disabled = false;
        } catch (e) {"""

new_gen_logic = """            if (savedTemplates[item.sku]) {
                const layout = savedTemplates[item.sku];
                applyElementLayout(document.getElementById('previewName'), layout.name);
                applyElementLayout(document.getElementById('previewBarcodeContainer'), layout.barcode);
                applyElementLayout(document.getElementById('previewSku'), layout.sku);
                applyElementLayout(document.getElementById('previewPrice'), layout.price);
                if (printBtn) printBtn.disabled = false;
                if (addToCartBtn) addToCartBtn.disabled = false;
            } else {
                if (printBtn) printBtn.disabled = true;
                if (addToCartBtn) addToCartBtn.disabled = true;
            }
        } catch (e) {"""

content = content.replace(gen_logic, new_gen_logic)


with open(app_js_path, 'w') as f:
    f.write(content)
print("Updated app.js")
