document.addEventListener('DOMContentLoaded', () => {
    const uploadFileBtn = document.getElementById('uploadFileBtn');
    const inventoryFileInput = document.getElementById('inventoryFile');
    const statusMessage = document.getElementById('statusMessage');
    const makerSearchInput = document.getElementById('makerSearchInput');
    const makerItemsList = document.getElementById('makerItemsList');
    const currentTemplateName = document.getElementById('currentTemplateName');
    const searchInput = document.getElementById('searchInput');
    const itemsList = document.getElementById('itemsList');
    const printBtn = document.getElementById('printBtn');
    const labelPreview = document.getElementById('labelPreview');
    const labelSizeSelect = document.getElementById('labelSize');
    const tabBtns = document.querySelectorAll('.sidebar-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const savePrinterBtn = document.getElementById('savePrinterBtn');
    const testPrinterBtn = document.getElementById('testPrinterBtn');
    const printerIpInput = document.getElementById('printerIp');
    const printerStatus = document.getElementById('printerStatus');
    
    // Sidebar Elements
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    let catalogItems = [];
    let selectedItem = null;
    let renderedImageCache = {};

    function clearRenderedCache() {
        renderedImageCache = {};
    }

    // Load saved printer config on start
    fetch('/api/config')
        .then(r => r.json())
        .then(data => {
            if (data.printer_ip) {
                printerIpInput.value = data.printer_ip;
            }
        })
        .catch(() => {});

    // Load persisted inventory on start
    fetch('/api/items')
        .then(r => r.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                catalogItems = data.items;
                renderItems(catalogItems);
                if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);
            }
        })
        .catch(() => {});

    // Sidebar Toggle Logic
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    }
    menuBtn.addEventListener('click', toggleSidebar);
    closeMenuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) {
                target.classList.add('active');
            }
            // Close sidebar on mobile when navigating
            if (sidebar.classList.contains('open')) {
                toggleSidebar();
            }
        });
    });


    // Save Printer Settings
    savePrinterBtn.addEventListener('click', async () => {
        const ip = printerIpInput.value.trim();
        if (!ip) {
            showMsg(printerStatus, 'Please enter the printer IP address.', 'error');
            return;
        }
        savePrinterBtn.disabled = true;
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printer_ip: ip })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showMsg(printerStatus, data.message, 'success');
        } catch (error) {
            showMsg(printerStatus, `Error: ${error.message}`, 'error');
        } finally {
            savePrinterBtn.disabled = false;
        }
    });

    // Test Printer Connectivity
    if (testPrinterBtn) {
        testPrinterBtn.addEventListener('click', async () => {
            testPrinterBtn.disabled = true;
            showMsg(printerStatus, 'Testing printer connectivity...', 'success');
            try {
                const response = await fetch('/api/print/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (response.ok) {
                    showMsg(printerStatus, data.message, 'success');
                } else {
                    showMsg(printerStatus, `Error: ${data.error}`, 'error');
                }
            } catch (error) {
                showMsg(printerStatus, `Connection Error: ${error.message}`, 'error');
            } finally {
                testPrinterBtn.disabled = false;
            }
        });
    }

    labelSizeSelect.addEventListener('change', () => {
        if (selectedItem) {
            generateBarcode(selectedItem);
        }
    });
    
    uploadFileBtn.addEventListener('click', async () => {
        const file = inventoryFileInput.files[0];
        if (!file) {
            showMsg(statusMessage, 'Please select a CSV or Excel file to upload.', 'error');
            return;
        }
        
        showMsg(statusMessage, 'Uploading and parsing file...', 'success');
        uploadFileBtn.disabled = true;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload file');
            }

            catalogItems = data.items;
            showMsg(statusMessage, `Loaded ${catalogItems.length} items.`, 'success');
            renderItems(catalogItems);
                if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);
            
            // Auto-switch to Library tab
            document.querySelector('[data-tab="tab-items"]').click();
        } catch (error) {
            showMsg(statusMessage, error.message, 'error');
        } finally {
            uploadFileBtn.disabled = false;
        }
    });

    // Editor Font Size Sliders
    const nameFontSizeSlider = document.getElementById('nameFontSize');
    const nameFontVal = document.getElementById('nameFontVal');
    const skuFontSizeSlider = document.getElementById('skuFontSize');
    const skuFontVal = document.getElementById('skuFontVal');
    const priceFontSizeSlider = document.getElementById('priceFontSize');
    const priceFontVal = document.getElementById('priceFontVal');
    const barcodeScaleSlider = document.getElementById('barcodeScale');
    const barcodeScaleVal = document.getElementById('barcodeScaleVal');

    if (nameFontSizeSlider) {
        function bindSlider(slider, valDisplay, elementId, isScale) {
            const update = () => {
                valDisplay.textContent = slider.value;
                const el = document.getElementById(elementId);
                if (el) {
                    if (isScale) {
                        const scale = slider.value / 100;
                        const x = el.getAttribute('data-x') || 0;
                        const y = el.getAttribute('data-y') || 0;
                        el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
                        el.setAttribute('data-scale', scale);
                    } else {
                        el.style.fontSize = slider.value + 'px';
                        el.style.width = 'auto';
                        el.style.height = 'auto';
                        el.style.whiteSpace = 'nowrap';
                    }
                }
                clearRenderedCache();
            };
            slider.addEventListener('input', update);
            slider.addEventListener('change', update);
        }

        bindSlider(nameFontSizeSlider, nameFontVal, 'previewName', false);
        bindSlider(skuFontSizeSlider, skuFontVal, 'previewSku', false);
        if (priceFontSizeSlider) {
            bindSlider(priceFontSizeSlider, priceFontVal, 'previewPrice', false);
        }
        bindSlider(barcodeScaleSlider, barcodeScaleVal, 'previewBarcodeContainer', true);

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

    }

    // Alignment Tools Logic
    const alignBtns = document.querySelectorAll('.align-btn');
    alignBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeEl = document.querySelector('.draggable-element.active');
            // Default to barcode if nothing is explicitly selected
            const targetEl = activeEl || document.getElementById('previewBarcodeContainer');
            if (!targetEl) return;
            
            const align = btn.dataset.align;
            const containerRect = labelPreview.getBoundingClientRect();
            const elRect = targetEl.getBoundingClientRect();
            
            let dx = 0;
            let dy = 0;
            if (align === 'left') {
                dx = (containerRect.left + 10) - elRect.left;
            } else if (align === 'center') {
                const targetLeft = containerRect.left + (containerRect.width - elRect.width) / 2;
                dx = targetLeft - elRect.left;
            } else if (align === 'right') {
                const targetLeft = containerRect.right - elRect.width - 10;
                dx = targetLeft - elRect.left;
            } else if (align === 'top') {
                dy = (containerRect.top + 10) - elRect.top;
            } else if (align === 'bottom') {
                dy = (containerRect.bottom - elRect.height - 10) - elRect.top;
            }
            
            const currentX = parseFloat(targetEl.getAttribute('data-x')) || 0;
            const currentY = parseFloat(targetEl.getAttribute('data-y')) || 0;
            const scale = parseFloat(targetEl.getAttribute('data-scale')) || 1;
            
            const newX = currentX + dx;
            const newY = currentY + dy;
            
            targetEl.style.transform = `translate(${newX}px, ${newY}px) scale(${scale})`;
            targetEl.setAttribute('data-x', newX);
            targetEl.setAttribute('data-y', newY);
            clearRenderedCache();
        });
    });

    // Templates Logic
    const templateSelect = document.getElementById('templateSelect');
    const templateNameInput = document.getElementById('templateName');
    const saveTemplateBtn = document.getElementById('saveTemplateBtn');
    const loadTemplateBtn = document.getElementById('loadTemplateBtn');
    
    // Cart Logic Elements
    const addToCartBtn = document.getElementById('addToCartBtn');
    const printCartBtn = document.getElementById('printCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartToggleBtn && cartSidebar) {
        cartToggleBtn.addEventListener('click', () => {
            cartSidebar.classList.toggle('open');
        });
    }
    if (closeCartBtn && cartSidebar) {
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
    }
    
    let savedTemplates = {};
    let printCart = [];

    function updateCartUI() {
        if (!cartItemsList || !printCartBtn) return;
        
        const totalCount = printCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (cartCountBadge) {
            cartCountBadge.textContent = totalCount;
        }
        printCartBtn.disabled = printCart.length === 0;

        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            if (printCart.length === 0) {
                appContainer.classList.add('cart-hidden');
            } else {
                appContainer.classList.remove('cart-hidden');
            }
        }

        cartItemsList.innerHTML = '';
        if (printCart.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-state">Queue is empty</div>';
            return;
        }

        printCart.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'menu-item';
            
            el.style.flexDirection = 'column';
            el.style.alignItems = 'stretch';
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'menu-item-info';
            infoDiv.style.width = '100%';
            
            const nameEl = document.createElement('div');
            nameEl.className = 'menu-item-name';
            nameEl.textContent = item.name;
            nameEl.style.whiteSpace = 'normal';
            
            const skuEl = document.createElement('div');
            skuEl.className = 'menu-item-sku';
            skuEl.textContent = item.sku;

            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(skuEl);

            const bottomRow = document.createElement('div');
            bottomRow.style.display = 'flex';
            bottomRow.style.justifyContent = 'space-between';
            bottomRow.style.alignItems = 'center';
            bottomRow.style.width = '100%';

            const imgDiv = document.createElement('div');
            imgDiv.className = 'menu-item-image';
            imgDiv.style.width = '120px';
            const img = document.createElement('img');
            img.src = item.image_data;
            img.style.width = '100%';
            img.style.objectFit = 'contain';
            imgDiv.appendChild(img);

            const actionDiv = document.createElement('div');
            actionDiv.className = 'menu-item-action';
            actionDiv.style.marginLeft = 'auto';
            
            // Quantity Controls container
            const qtyContainer = document.createElement('div');
            qtyContainer.style.display = 'flex';
            qtyContainer.style.alignItems = 'center';
            qtyContainer.style.gap = '0.25rem';
            qtyContainer.style.background = 'var(--background)';
            qtyContainer.style.borderRadius = '6px';
            qtyContainer.style.border = '1px solid var(--border)';
            qtyContainer.style.padding = '2px';
            
            const decBtn = document.createElement('button');
            decBtn.className = 'icon-btn';
            decBtn.style.padding = '2px 8px';
            decBtn.style.fontSize = '1rem';
            decBtn.innerHTML = '&minus;';
            decBtn.onclick = (e) => {
                e.stopPropagation();
                if (item.quantity > 1) {
                    item.quantity--;
                    updateCartUI();
                } else {
                    printCart.splice(index, 1);
                    updateCartUI();
                }
            };
            
            const qtyText = document.createElement('span');
            qtyText.style.fontFamily = 'monospace';
            qtyText.style.fontSize = '0.9rem';
            qtyText.style.minWidth = '20px';
            qtyText.style.textAlign = 'center';
            qtyText.style.fontWeight = '600';
            qtyText.textContent = item.quantity || 1;
            
            const incBtn = document.createElement('button');
            incBtn.className = 'icon-btn';
            incBtn.style.padding = '2px 8px';
            incBtn.style.fontSize = '1rem';
            incBtn.innerHTML = '&plus;';
            incBtn.onclick = (e) => {
                e.stopPropagation();
                item.quantity = (item.quantity || 1) + 1;
                updateCartUI();
            };
            
            qtyContainer.appendChild(decBtn);
            qtyContainer.appendChild(qtyText);
            qtyContainer.appendChild(incBtn);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'icon-btn';
            removeBtn.style.color = '#ef4444';
            removeBtn.style.marginLeft = '0.5rem';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                printCart.splice(index, 1);
                updateCartUI();
            };
            
            actionDiv.appendChild(qtyContainer);
            actionDiv.appendChild(removeBtn);

            bottomRow.appendChild(imgDiv);
            bottomRow.appendChild(actionDiv);

            el.appendChild(infoDiv);
            el.appendChild(bottomRow);
            cartItemsList.appendChild(el);
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            if (!selectedItem) return;
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Adding...';

            try {
                const elements = labelPreview.querySelectorAll('.draggable-element');
                elements.forEach(el => el.style.border = 'none');
                
                const canvas = await html2canvas(labelPreview, {
                    scale: 2, backgroundColor: '#ffffff', logging: false
                });
                
                elements.forEach(el => el.style.border = '');

                const imageData = canvas.toDataURL('image/png');
                
                // If it already exists in the cart, update layout and increment quantity
                const existingCartItem = printCart.find(c => c.sku === selectedItem.sku);
                if (existingCartItem) {
                    existingCartItem.image_data = imageData;
                    existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
                } else {
                    printCart.push({
                        sku: selectedItem.sku,
                        name: (savedTemplates[selectedItem.sku] && savedTemplates[selectedItem.sku].name && savedTemplates[selectedItem.sku].name.text) ? savedTemplates[selectedItem.sku].name.text : selectedItem.name,
                        image_data: imageData,
                        quantity: 1
                    });
                }
                
                updateCartUI();
                addToCartBtn.textContent = 'Added!';
                setTimeout(() => {
                    addToCartBtn.textContent = 'Add to Queue';
                    addToCartBtn.disabled = false;
                }, 1500);

            } catch (e) {
                console.error(e);
                addToCartBtn.textContent = 'Error';
                addToCartBtn.disabled = false;
            }
        });
    }

    if (printCartBtn) {
        printCartBtn.addEventListener('click', async () => {
            if (printCart.length === 0) return;
            printCartBtn.disabled = true;
            printCartBtn.textContent = 'Sending...';

            try {
                await executePrint({
                    items: printCart,
                    label_size: labelSizeSelect.value
                });

                printCart = [];
                updateCartUI();
                printCartBtn.textContent = 'Sent ✓';
                setTimeout(() => {
                    printCartBtn.textContent = 'Print All';
                }, 2000);
            } catch (error) {
                alert(`Print Error: ${error.message}`);
                printCartBtn.textContent = 'Print All';
            } finally {
                printCartBtn.disabled = printCart.length === 0;
            }
        });
    }

    function loadTemplatesList() {
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
    }

    loadTemplatesList();
    updateCartUI();

    function getElementLayout(el) {
        if (!el) return null;
        return {
            x: parseFloat(el.getAttribute('data-x')) || 0,
            y: parseFloat(el.getAttribute('data-y')) || 0,
            scale: parseFloat(el.getAttribute('data-scale')) || 1,
            width: el.style.width,
            height: el.style.height,
            fontSize: el.style.fontSize,
            text: el.textContent
        };
    }

    function applyElementLayout(el, layout) {
        if (!el || !layout) return;
        el.setAttribute('data-x', layout.x);
        el.setAttribute('data-y', layout.y);
        el.style.transform = `translate(${layout.x}px, ${layout.y}px)`;
        if (layout.width) el.style.width = layout.width;
        if (layout.height) el.style.height = layout.height;
        if (layout.fontSize) el.style.fontSize = layout.fontSize;
        if (layout.text && el.id === 'previewName') {
            el.textContent = layout.text;
            const customNameInput = document.getElementById('customDisplayName');
            if (customNameInput) customNameInput.value = layout.text;
        }
        if (layout.scale) {
            el.style.transform = `translate(${layout.x}px, ${layout.y}px) scale(${layout.scale})`;
            el.setAttribute('data-scale', layout.scale);
            if (el.id === 'previewBarcodeContainer' && barcodeScaleSlider) {
                barcodeScaleSlider.value = layout.scale * 100;
                barcodeScaleVal.textContent = layout.scale * 100;
            }
        }
        if (el.id === 'previewName' && layout.fontSize && nameFontSizeSlider) {
            nameFontSizeSlider.value = parseInt(layout.fontSize);
            nameFontVal.textContent = parseInt(layout.fontSize);
        }
        if (el.id === 'previewSku' && layout.fontSize && skuFontSizeSlider) {
            skuFontSizeSlider.value = parseInt(layout.fontSize);
            skuFontVal.textContent = parseInt(layout.fontSize);
        }
        if (el.id === 'previewPrice' && layout.fontSize && priceFontSizeSlider) {
            priceFontSizeSlider.value = parseInt(layout.fontSize);
            priceFontVal.textContent = parseInt(layout.fontSize);
        }
    }

    if (saveTemplateBtn) {
        saveTemplateBtn.addEventListener('click', async () => {
            if (!selectedItem) {
                alert('Please select an item first');
                return;
            }
            const name = selectedItem.sku;
            if (!name) return;

            const layout = {
                group: (document.getElementById('customGroupName') ? document.getElementById('customGroupName').value.trim() : '') || '',
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
                    clearRenderedCache();
                    loadTemplatesList();
                    if (printBtn) printBtn.disabled = false;
                    if (addToCartBtn) addToCartBtn.disabled = false;
                }
            } catch (e) {
                console.error('Failed to save template', e);
            }
        });
    }

    if (searchInput) {
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
    }

    // Image cache on the client side to avoid redundant fetches
    const imageCache = {};

    function categorizeItem(name) {
        name = name.toLowerCase();
        if (/(router|switch|access point|modem|gateway|hub|wi-fi|wifi)/.test(name)) return "Networking & Routers";
        if (/(laptop|macbook|chromebook|thinkpad)/.test(name)) return "Laptops";
        if (/(desktop|pc|imac|mac mini|tower|all in one|all-in-one)/.test(name)) return "Desktops & Macs";
        if (/(cable|adapter|splitter|cord|connector|aux|hdmi|usb|vga|dvi)/.test(name)) return "Cables & Adapters";
        if (/(motherboard|cpu|ram|psu|power supply|gpu|graphics card|drive|hdd|ssd|memory|processor)/.test(name)) return "Components";
        if (/(speaker|headphone|earbud|receiver|amp|audio|video|player|tv|monitor|display|screen|camera)/.test(name)) return "A/V & Displays";
        if (/(printer|scanner|ink|toner)/.test(name)) return "Printers & Scanners";
        return "Miscellaneous";
    }

    function renderGroupedItems(items, container, observer, isReadyToPrint) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = `<div class="empty-state">${isReadyToPrint ? 'No ready-to-print items found. Make templates in the Template Maker.' : 'No items found.'}</div>`;
            return;
        }

        const groups = {};
        items.forEach(item => {
            const templateGroup = savedTemplates[item.sku] ? savedTemplates[item.sku].group : undefined;
            const cat = templateGroup || categorizeItem(item.name);
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        Object.keys(groups).sort().forEach(cat => {
            const groupDetails = document.createElement('details');
            groupDetails.className = 'category-group';
            // Auto open if few categories or if we are in ready to print
            if (Object.keys(groups).length <= 3 || isReadyToPrint) {
                groupDetails.open = true;
            }

            const summary = document.createElement('summary');
            summary.className = 'category-header';
            summary.innerHTML = `<span style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;"><span class="details-icon">▶</span> ${cat}</span><span style="background:var(--primary); color:white; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${groups[cat].length}</span>`;
            
            groupDetails.addEventListener('toggle', () => {
                const icon = summary.querySelector('.details-icon');
                if (icon) icon.textContent = groupDetails.open ? '▼' : '▶';
            });
            if (groupDetails.open) {
                const icon = summary.querySelector('.details-icon');
                if (icon) icon.textContent = '▼';
            }

            const groupContainer = document.createElement('div');
            groupContainer.className = 'items-list';
            groupContainer.style.display = 'block';

            groups[cat].forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'menu-item';
                if (!item.sku) {
                    itemEl.classList.add('disabled');
                } else {
                    itemEl.addEventListener('click', () => isReadyToPrint ? quickPrint(item, itemEl) : selectItem(item, itemEl));
                }
                
                const imgDiv = document.createElement('div');
                imgDiv.className = 'menu-item-image';
                imgDiv.dataset.query = item.name;
                
                if (imageCache[item.name]) {
                    const img = document.createElement('img');
                    img.src = imageCache[item.name];
                    if (isReadyToPrint) img.alt = item.name;
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
                let skuText = item.sku || 'No SKU';
                if (item.price) {
                    skuText += ` | ${item.price}`;
                }
                skuEl.textContent = skuText;
                
                if (!isReadyToPrint && item.sku && savedTemplates[item.sku]) {
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

                if (isReadyToPrint) {
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'menu-item-action';
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'quick-btn btn-edit';
                    editBtn.innerHTML = '✏️';
                    editBtn.title = 'Edit Label';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        selectItem(item, itemEl);
                    };

                    const addBtn = document.createElement('button');
                    addBtn.className = 'quick-btn btn-add';
                    addBtn.innerHTML = '➕';
                    addBtn.title = 'Add to Print Queue';
                    addBtn.onclick = async (e) => {
                        e.stopPropagation();
                        await quickAddToCart(item, addBtn);
                    };
                    
                    actionDiv.appendChild(editBtn);
                    actionDiv.appendChild(addBtn);
                    itemEl.appendChild(actionDiv);
                }

                groupContainer.appendChild(itemEl);
            });

            groupDetails.appendChild(summary);
            groupDetails.appendChild(groupContainer);
            container.appendChild(groupDetails);
        });
    }

    function renderItems(items) {
        if (!itemsList) return;
        const printableItems = items.filter(item => item.sku && savedTemplates[item.sku]);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgDiv = entry.target;
                    if (imgDiv.dataset.query) loadImage(imgDiv, imgDiv.dataset.query);
                    observer.unobserve(imgDiv);
                }
            });
        }, { rootMargin: '200px' });
        renderGroupedItems(printableItems, itemsList, observer, true);
    }

    function renderMakerItems(items) {
        if (!makerItemsList) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgDiv = entry.target;
                    if (imgDiv.dataset.query) loadImage(imgDiv, imgDiv.dataset.query);
                    observer.unobserve(imgDiv);
                }
            });
        }, { rootMargin: '200px' });
        renderGroupedItems(items, makerItemsList, observer, false);
    }

async function loadImage(imgDiv, query) {
        try {
            const response = await fetch(`/api/image?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.url) {
                imageCache[query] = data.url;
                imgDiv.innerHTML = '';
                const img = document.createElement('img');
                img.src = data.url;
                img.alt = query;
                img.onerror = () => {
                    imgDiv.innerHTML = '—';
                    imageCache[query] = null;
                };
                imgDiv.appendChild(img);
            } else {
                imageCache[query] = null;
                imgDiv.innerHTML = '—';
            }
        } catch (e) {
            imageCache[query] = null;
            imgDiv.innerHTML = '—';
        }
    }

    function selectItem(item, element) {
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
    }

    async function quickAddToCart(item, btn) {
        if (!item.sku) return;

        // Check if the item already exists in the printCart queue
        const existingCartItem = printCart.find(c => c.sku === item.sku);
        if (existingCartItem) {
            existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
            updateCartUI();
            
            // Flash checkmark without disabling the button
            const originalText = btn.dataset.originalText || btn.innerHTML;
            btn.dataset.originalText = originalText;
            btn.innerHTML = '✓';
            setTimeout(() => {
                btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
            return;
        }

        // If it's already in our cache, add it instantly
        if (renderedImageCache[item.sku]) {
            printCart.push({
                sku: item.sku,
                name: (savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text) ? savedTemplates[item.sku].name.text : item.name,
                image_data: renderedImageCache[item.sku],
                quantity: 1
            });
            updateCartUI();
            
            // Flash checkmark without disabling the button
            const originalText = btn.dataset.originalText || btn.innerHTML;
            btn.dataset.originalText = originalText;
            btn.innerHTML = '✓';
            setTimeout(() => {
                btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
            return;
        }

        // Otherwise, run html2canvas
        const originalText = btn.dataset.originalText || btn.innerHTML;
        btn.dataset.originalText = originalText;
        btn.innerHTML = '⌛';
        btn.disabled = true;

        try {
            // Backup current selected item
            const prevItem = selectedItem;
            selectedItem = item;

            // Generate barcode for this item temporarily in the preview
            generateBarcode(item);

            // Hide borders
            const elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(el => el.style.border = 'none');
            
            // To capture, labelPreview must be display: block
            const previewTab = document.getElementById('tab-template-maker');
            const wasHidden = window.getComputedStyle(previewTab).display === 'none';
            if (wasHidden) {
                previewTab.style.display = 'flex';
                previewTab.style.position = 'fixed';
                previewTab.style.top = '-9999px';
                previewTab.style.left = '-9999px';
                previewTab.style.visibility = 'visible';
            }

            const canvas = await html2canvas(labelPreview, {
                scale: 2, backgroundColor: '#ffffff', logging: false
            });

            if (wasHidden) {
                previewTab.style.display = '';
                previewTab.style.position = '';
                previewTab.style.top = '';
                previewTab.style.left = '';
                previewTab.style.visibility = '';
            }

            // Restore previous item if any
            if (prevItem && prevItem !== item) {
                selectedItem = prevItem;
                generateBarcode(prevItem);
            }

            const imageData = canvas.toDataURL('image/png');
            renderedImageCache[item.sku] = imageData; // Cache it!

            printCart.push({
                sku: item.sku,
                name: (savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text) ? savedTemplates[item.sku].name.text : item.name,
                image_data: imageData,
                quantity: 1
            });
            
            updateCartUI();
            
            btn.innerHTML = '✓';
            setTimeout(() => {
                btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
        } catch (e) {
            console.error(e);
            btn.innerHTML = '❌';
            setTimeout(() => {
                btn.innerHTML = btn.dataset.originalText || '➕';
            }, 1000);
        } finally {
            btn.disabled = false;
        }
    }

    async function quickPrint(item, itemEl) {
        if (!item.sku) return;
        
        itemEl.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(59, 130, 246, 0.15)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.fontWeight = '600';
        overlay.style.color = 'var(--primary)';
        overlay.style.fontSize = '0.9rem';
        overlay.style.backdropFilter = 'blur(1px)';
        overlay.textContent = 'Sending to printer... 🖨️';
        itemEl.appendChild(overlay);

        try {
            const prevItem = selectedItem;
            selectedItem = item;

            generateBarcode(item);

            const elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(el => el.style.border = 'none');
            
            const previewTab = document.getElementById('tab-template-maker');
            const wasHidden = window.getComputedStyle(previewTab).display === 'none';
            if (wasHidden) {
                previewTab.style.display = 'flex';
                previewTab.style.position = 'fixed';
                previewTab.style.top = '-9999px';
                previewTab.style.left = '-9999px';
                previewTab.style.visibility = 'visible';
            }

            const canvas = await html2canvas(labelPreview, {
                scale: 2, backgroundColor: '#ffffff', logging: false
            });

            if (wasHidden) {
                previewTab.style.display = '';
                previewTab.style.position = '';
                previewTab.style.top = '';
                previewTab.style.left = '';
                previewTab.style.visibility = '';
            }

            if (prevItem && prevItem !== item) {
                selectedItem = prevItem;
                generateBarcode(prevItem);
            }

            const imageData = canvas.toDataURL('image/png');

            await executePrint({
                items: [{
                    sku: item.sku,
                    name: (savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text) ? savedTemplates[item.sku].name.text : item.name,
                    image_data: imageData,
                    quantity: 1
                }],
                label_size: labelSizeSelect.value
            });

            overlay.style.background = 'rgba(16, 185, 129, 0.15)';
            overlay.style.color = 'var(--success)';
            overlay.textContent = 'Sent Successfully! ✓';
            setTimeout(() => {
                overlay.remove();
            }, 1500);

        } catch (error) {
            console.error(error);
            overlay.style.background = 'rgba(239, 68, 68, 0.15)';
            overlay.style.color = '#ef4444';
            overlay.textContent = `Error: ${error.message || 'Failed'}`;
            setTimeout(() => {
                overlay.remove();
            }, 2500);
        }
    }

    function addHandles(el) {
        ['tl', 'tr', 'bl', 'br'].forEach(h => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-handle-${h}`;
            el.appendChild(handle);
        });
    }

    function generateBarcode(item) {
        const customNameInput = document.getElementById('customDisplayName');
        const customGroupInput = document.getElementById('customGroupName');
        
        if (savedTemplates[item.sku]) {
            if (customNameInput) customNameInput.value = (savedTemplates[item.sku].name && savedTemplates[item.sku].name.text) ? savedTemplates[item.sku].name.text : item.name;
            if (customGroupInput) customGroupInput.value = savedTemplates[item.sku].group || '';
        } else {
            if (customNameInput) customNameInput.value = item.name;
            if (customGroupInput) customGroupInput.value = '';
        }
        
        let nameEl = document.getElementById('previewName');
        let barcodeContainer = document.getElementById('previewBarcodeContainer');
        let skuEl = document.getElementById('previewSku');
        let priceEl = document.getElementById('previewPrice');

        if (nameEl && barcodeContainer && skuEl && priceEl) {
            nameEl.textContent = item.name;
            skuEl.textContent = 'SKU: ' + (item.sku || '');
            priceEl.textContent = item.price || '';
            try {
                JsBarcode('#previewBarcode', item.sku, {
                    format: "CODE128",
                    width: 2,
                    height: 50,
                    displayValue: false,
                    margin: 0
                });
            } catch (e) {
                console.error('Barcode generation error:', e);
            }
            if (savedTemplates[item.sku]) {
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
            return;
        }

        labelPreview.innerHTML = ''; // clear

        // Start from center of the approx 400x125 labelPreview
        const rect = labelPreview.getBoundingClientRect();
        const cx = (rect.width || 400) / 2;
        const cy = (rect.height || 125) / 2;

        nameEl = document.createElement('div');
        nameEl.className = 'draggable-element';
        nameEl.id = 'previewName';
        nameEl.style.fontWeight = '700';
        nameEl.style.fontSize = '18px';
        nameEl.style.width = '180px';
        nameEl.style.height = '24px';
        nameEl.style.display = 'flex';
        nameEl.style.alignItems = 'center';
        nameEl.style.justifyContent = 'center';
        nameEl.textContent = item.name;
        nameEl.setAttribute('data-x', cx - 90);
        nameEl.setAttribute('data-y', 10);
        nameEl.style.transform = `translate(${cx - 90}px, 10px)`;

        barcodeContainer = document.createElement('div');
        barcodeContainer.className = 'draggable-element';
        barcodeContainer.id = 'previewBarcodeContainer';
        barcodeContainer.style.width = '200px';
        barcodeContainer.style.height = '50px';
        barcodeContainer.innerHTML = '<img id="previewBarcode" style="width:100%;height:100%; display:block; object-fit:fill;">';
        barcodeContainer.setAttribute('data-x', cx - 100);
        barcodeContainer.setAttribute('data-y', cy - 25);
        barcodeContainer.style.transform = `translate(${cx - 100}px, ${cy - 25}px)`;

        skuEl = document.createElement('div');
        skuEl.className = 'draggable-element';
        skuEl.id = 'previewSku';
        skuEl.style.fontFamily = 'monospace';
        skuEl.style.fontSize = '14px';
        skuEl.style.width = '120px';
        skuEl.style.height = '20px';
        skuEl.style.display = 'flex';
        skuEl.style.alignItems = 'center';
        skuEl.style.justifyContent = 'center';
        skuEl.style.backgroundColor = '#ffffff'; // White fill behind text
        skuEl.textContent = 'SKU: ' + item.sku;
        skuEl.setAttribute('data-x', cx - 60);
        skuEl.setAttribute('data-y', cy + 35);
        skuEl.style.transform = `translate(${cx - 60}px, ${cy + 35}px)`;

        priceEl = document.createElement('div');
        priceEl.className = 'draggable-element';
        priceEl.id = 'previewPrice';
        priceEl.style.fontWeight = '700';
        priceEl.style.fontSize = '14px';
        priceEl.style.width = '80px';
        priceEl.style.height = '20px';
        priceEl.style.display = 'flex';
        priceEl.style.alignItems = 'center';
        priceEl.style.justifyContent = 'center';
        priceEl.style.backgroundColor = '#ffffff'; // White fill behind text
        priceEl.textContent = item.price || '';
        priceEl.setAttribute('data-x', cx + 90);
        priceEl.setAttribute('data-y', cy - 10);
        priceEl.style.transform = `translate(${cx + 90}px, ${cy - 10}px)`;

        labelPreview.appendChild(nameEl);
        labelPreview.appendChild(barcodeContainer);
        labelPreview.appendChild(skuEl);
        labelPreview.appendChild(priceEl);

        addHandles(nameEl);
        addHandles(barcodeContainer);
        addHandles(skuEl);
        addHandles(priceEl);

        try {
            JsBarcode('#previewBarcode', item.sku, {
                format: "CODE128",
                lineColor: "#000",
                width: 1.5,
                height: 40,
                displayValue: false,
                margin: 0
            });
            
            // For img tags, JsBarcode sets src to base64. 
            // We can optionally read its naturalWidth/Height but img + object-fit:fill handles scaling perfectly.
            const img = document.getElementById('previewBarcode');
            
            // Ensure container roughly matches original aspect ratio to start
            barcodeContainer.style.width = '180px';
            barcodeContainer.style.height = '40px';

            if (savedTemplates[item.sku]) {
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
        } catch (e) {
            console.error('Barcode generation error:', e);
            labelPreview.innerHTML = `<div style="color: #ef4444; padding: 1rem;">Error generating barcode for SKU: ${item.sku}</div>`;
            printBtn.disabled = true;
            if (addToCartBtn) addToCartBtn.disabled = true;
        }
    }

    // Initialize interact.js
    if (typeof interact !== 'undefined') {
        const snapModifier = interact.modifiers.snap({
            targets: [
                interact.createSnapGrid({ x: 10, y: 10 })
            ],
            range: Infinity,
            relativePoints: [ { x: 0, y: 0 } ]
        });

        const snapSizeModifier = interact.modifiers.snapSize({
            targets: [
                interact.createSnapGrid({ x: 10, y: 10 })
            ],
        });

        interact('.draggable-element')
            .draggable({
                modifiers: [snapModifier],
                listeners: {
                    move(event) {
                        const target = event.target;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                        const scale = target.getAttribute('data-scale') || 1;
                        
                        target.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                        clearRenderedCache();
                    }
                }
            })
            .resizable({
                edges: { left: '.resize-handle-tl, .resize-handle-bl', right: '.resize-handle-tr, .resize-handle-br', bottom: '.resize-handle-bl, .resize-handle-br', top: '.resize-handle-tl, .resize-handle-tr' },
                modifiers: [snapSizeModifier],
                listeners: {
                    move(event) {
                        let { x, y, scale } = event.target.dataset;
                        x = (parseFloat(x) || 0) + event.deltaRect.left;
                        y = (parseFloat(y) || 0) + event.deltaRect.top;
                        scale = scale || 1;

                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            transform: `translate(${x}px, ${y}px) scale(${scale})`
                        });

                        Object.assign(event.target.dataset, { x, y });

                        if (event.target.id === 'previewName' || event.target.id === 'previewSku' || event.target.id === 'previewPrice') {
                            event.target.style.fontSize = Math.max(10, event.rect.height * 0.7) + 'px';
                        }
                        clearRenderedCache();
                    }
                }
            })
            .on('tap', function (event) {
                document.querySelectorAll('.draggable-element').forEach(el => el.classList.remove('active'));
                event.currentTarget.classList.add('active');
            });

        labelPreview.addEventListener('pointerdown', (e) => {
            if (e.target === labelPreview) {
                document.querySelectorAll('.draggable-element').forEach(el => el.classList.remove('active'));
            }
        });
    }

    // Direct print to network printer
    printBtn.addEventListener('click', async () => {
        if (!selectedItem) return;

        printBtn.disabled = true;
        printBtn.textContent = 'Rendering...';

        try {
            // Temporarily hide borders for capture
            const elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(el => el.style.border = 'none');

            // Capture the preview as an image
            const canvas = await html2canvas(labelPreview, {
                scale: 2, // higher resolution
                backgroundColor: '#ffffff',
                logging: false
            });

            // Restore borders
            elements.forEach(el => el.style.border = '');

            const imageData = canvas.toDataURL('image/png');
            printBtn.textContent = 'Sending...';

            await executePrint({
                items: [{
                    sku: selectedItem.sku,
                    name: selectedItem.name,
                    image_data: imageData,
                    quantity: 1
                }],
                label_size: labelSizeSelect.value
            });

            printBtn.textContent = 'Sent ✓';
            setTimeout(() => {
                printBtn.textContent = 'Print Now';
                printBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error('Print error:', error);
            printBtn.textContent = 'Print Failed';
            alert(`Print Error: ${error.message}`);
            setTimeout(() => {
                printBtn.textContent = 'Print Now';
                printBtn.disabled = false;
            }, 2000);
        }
    });

    function showMsg(el, message, type) {
        el.textContent = message;
        el.className = `status-message status-${type}`;
        if (type === 'success') {
            setTimeout(() => {
                el.textContent = '';
                el.className = 'status-message';
            }, 5000);
        }
    }

    // Background Scraper Controller
    const scraperStatusBadge = document.getElementById('scraperStatusBadge');
    const scrapeTotal = document.getElementById('scrapeTotal');
    const scrapeCached = document.getElementById('scrapeCached');
    const scrapeImages = document.getElementById('scrapeImages');
    const toggleScraperBtn = document.getElementById('toggleScraperBtn');
    
    let scraperRunning = false;

    async function updateScraperStatus() {
        if (!scraperStatusBadge) return;
        try {
            const response = await fetch('/api/scrape/status');
            const data = await response.json();
            
            scrapeTotal.textContent = data.total_names;
            scrapeCached.textContent = data.cached_names;
            scrapeImages.textContent = data.successful_images;
            
            scraperRunning = data.is_running;
            if (scraperRunning) {
                scraperStatusBadge.textContent = 'Active';
                scraperStatusBadge.style.background = 'var(--success)';
                toggleScraperBtn.textContent = 'Pause Scraper';
            } else {
                scraperStatusBadge.textContent = 'Paused';
                scraperStatusBadge.style.background = 'var(--text-muted)';
                toggleScraperBtn.textContent = 'Start Scraper';
            }
        } catch (e) {
            console.error('Failed to get scraper status', e);
        }
    }

    if (toggleScraperBtn) {
        toggleScraperBtn.addEventListener('click', async () => {
            toggleScraperBtn.disabled = true;
            try {
                const response = await fetch('/api/scrape/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enable: !scraperRunning })
                });
                const data = await response.json();
                scraperRunning = data.is_running;
                await updateScraperStatus();
            } catch (e) {
                console.error(e);
            } finally {
                toggleScraperBtn.disabled = false;
            }
        });

        // Poll scraper status every 4 seconds when Settings tab is active
        setInterval(() => {
            const settingsTab = document.getElementById('tab-settings');
            if (settingsTab && settingsTab.classList.contains('active')) {
                updateScraperStatus();
            }
        }, 4000);

        // Initial load
        updateScraperStatus();
    }

    // Logs Tab Controller
    const logOutput = document.getElementById('logOutput');
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    let firstLoadLogs = true;
    let usbDevice = null;

    async function executePrint(payload) {
        if (!navigator.usb) {
            alert("CRITICAL ERROR: WebUSB is not available! This is required to print directly from the tablet.\n\nMake sure you are:\n1. Using the official Google Chrome app (not a third party browser).\n2. Accessing the app via 'http://localhost:5000' and NOT an IP address.");
            return;
        }
        payload.webusb = true;

        const response = await fetch('/api/print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Print failed');
        }

        if (navigator.usb && data.instructions) {
            try {
                if (!usbDevice) {
                    usbDevice = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x04f9 }] });
                }
                if (!usbDevice.opened) {
                    await usbDevice.open();
                }
                if (usbDevice.configuration === null) {
                    await usbDevice.selectConfiguration(1);
                }
                
                const interfaceNumber = usbDevice.configuration.interfaces[0].interfaceNumber;
                try {
                    await usbDevice.claimInterface(interfaceNumber);
                } catch(e) {}
                
                const endpoint = usbDevice.configuration.interfaces[0].alternate.endpoints.find(e => e.direction === 'out');
                if (!endpoint) throw new Error("No OUT endpoint found on printer");

                const binaryString = atob(data.instructions);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                await usbDevice.transferOut(endpoint.endpointNumber, bytes);
            } catch (err) {
                console.error("WebUSB Print Error:", err);
                throw new Error("WebUSB Print failed: " + err.message);
            }
        }
        return data;
    }

    async function fetchLogs() {
        if (!logOutput) return;
        try {
            const response = await fetch('/api/logs');
            const data = await response.json();
            if (data.logs) {
                // If user is already scrolled to bottom, or it's the first render, keep auto-scrolling
                const isAtBottom = logOutput.scrollHeight - logOutput.clientHeight <= logOutput.scrollTop + 60;
                logOutput.textContent = data.logs.join('\\n');
                if (isAtBottom || firstLoadLogs) {
                    logOutput.scrollTop = logOutput.scrollHeight;
                    firstLoadLogs = false;
                }
            }
        } catch (e) {
            console.error('Failed to fetch logs', e);
        }
    }

    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', fetchLogs);
    }

    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to clear system logs?')) return;
            try {
                await fetch('/api/logs/clear', { method: 'POST' });
                await fetchLogs();
            } catch (e) {
                console.error('Failed to clear logs', e);
            }
        });
    }

    // Set up a 2-second interval that polls logs ONLY when the logs tab is active
    setInterval(() => {
        const logsTab = document.getElementById('tab-logs');
        if (logsTab && logsTab.classList.contains('active')) {
            fetchLogs();
        }
    }, 2000);

    // Initial fetch when switching to the logs tab
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'tab-logs') {
                firstLoadLogs = true;
                fetchLogs();
            }
        });
    });
});
