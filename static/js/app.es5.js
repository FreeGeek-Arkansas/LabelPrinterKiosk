"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
document.addEventListener('DOMContentLoaded', function () {
  var uploadFileBtn = document.getElementById('uploadFileBtn');
  var inventoryFileInput = document.getElementById('inventoryFile');
  var statusMessage = document.getElementById('statusMessage');
  var makerSearchInput = document.getElementById('makerSearchInput');
  var makerItemsList = document.getElementById('makerItemsList');
  var currentTemplateName = document.getElementById('currentTemplateName');
  var searchInput = document.getElementById('searchInput');
  var itemsList = document.getElementById('itemsList');
  var printBtn = document.getElementById('printBtn');
  var labelPreview = document.getElementById('labelPreview');
  var labelSizeSelect = document.getElementById('labelSize');
  var tabBtns = document.querySelectorAll('.sidebar-item');
  var tabPanes = document.querySelectorAll('.tab-pane');
  var savePrinterBtn = document.getElementById('savePrinterBtn');
  var testPrinterBtn = document.getElementById('testPrinterBtn');
  var printerIpInput = document.getElementById('printerIp');
  var printerStatus = document.getElementById('printerStatus');

  // Sidebar Elements
  var menuBtn = document.getElementById('menuBtn');
  var closeMenuBtn = document.getElementById('closeMenuBtn');
  var sidebar = document.getElementById('sidebar');
  var sidebarOverlay = document.getElementById('sidebarOverlay');
  var catalogItems = [];
  var selectedItem = null;
  var renderedImageCache = {};
  function clearRenderedCache() {
    renderedImageCache = {};
  }

  // Load saved printer config on start
  fetch('/api/config').then(function (r) {
    return r.json();
  }).then(function (data) {
    if (data.printer_ip) {
      printerIpInput.value = data.printer_ip;
    }
  })["catch"](function () {});

  // Load persisted inventory on start
  fetch('/api/items').then(function (r) {
    return r.json();
  }).then(function (data) {
    if (data.items && data.items.length > 0) {
      catalogItems = data.items;
      renderItems(catalogItems);
      if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);
    }
  })["catch"](function () {});

  // Sidebar Toggle Logic
  function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  }
  menuBtn.addEventListener('click', toggleSidebar);
  closeMenuBtn.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', toggleSidebar);

  // Tab Switching Logic
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabBtns.forEach(function (b) {
        return b.classList.remove('active');
      });
      tabPanes.forEach(function (p) {
        return p.classList.remove('active');
      });
      btn.classList.add('active');
      var target = document.getElementById(btn.dataset.tab);
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
  savePrinterBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var ip, response, data, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          ip = printerIpInput.value.trim();
          if (ip) {
            _context.n = 1;
            break;
          }
          showMsg(printerStatus, 'Please enter the printer IP address.', 'error');
          return _context.a(2);
        case 1:
          savePrinterBtn.disabled = true;
          _context.p = 2;
          _context.n = 3;
          return fetch('/api/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              printer_ip: ip
            })
          });
        case 3:
          response = _context.v;
          _context.n = 4;
          return response.json();
        case 4:
          data = _context.v;
          if (response.ok) {
            _context.n = 5;
            break;
          }
          throw new Error(data.error);
        case 5:
          showMsg(printerStatus, data.message, 'success');
          _context.n = 7;
          break;
        case 6:
          _context.p = 6;
          _t = _context.v;
          showMsg(printerStatus, "Error: ".concat(_t.message), 'error');
        case 7:
          _context.p = 7;
          savePrinterBtn.disabled = false;
          return _context.f(7);
        case 8:
          return _context.a(2);
      }
    }, _callee, null, [[2, 6, 7, 8]]);
  })));

  // Test Printer Connectivity
  if (testPrinterBtn) {
    testPrinterBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var response, data, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            testPrinterBtn.disabled = true;
            showMsg(printerStatus, 'Testing printer connectivity...', 'success');
            _context2.p = 1;
            _context2.n = 2;
            return fetch('/api/print/test', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
          case 2:
            response = _context2.v;
            _context2.n = 3;
            return response.json();
          case 3:
            data = _context2.v;
            if (response.ok) {
              showMsg(printerStatus, data.message, 'success');
            } else {
              showMsg(printerStatus, "Error: ".concat(data.error), 'error');
            }
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t2 = _context2.v;
            showMsg(printerStatus, "Connection Error: ".concat(_t2.message), 'error');
          case 5:
            _context2.p = 5;
            testPrinterBtn.disabled = false;
            return _context2.f(5);
          case 6:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 4, 5, 6]]);
    })));
  }
  labelSizeSelect.addEventListener('change', function () {
    if (selectedItem) {
      generateBarcode(selectedItem);
    }
  });
  uploadFileBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var file, formData, response, data, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          file = inventoryFileInput.files[0];
          if (file) {
            _context3.n = 1;
            break;
          }
          showMsg(statusMessage, 'Please select a CSV or Excel file to upload.', 'error');
          return _context3.a(2);
        case 1:
          showMsg(statusMessage, 'Uploading and parsing file...', 'success');
          uploadFileBtn.disabled = true;
          formData = new FormData();
          formData.append('file', file);
          _context3.p = 2;
          _context3.n = 3;
          return fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
        case 3:
          response = _context3.v;
          _context3.n = 4;
          return response.json();
        case 4:
          data = _context3.v;
          if (response.ok) {
            _context3.n = 5;
            break;
          }
          throw new Error(data.error || 'Failed to upload file');
        case 5:
          catalogItems = data.items;
          showMsg(statusMessage, "Loaded ".concat(catalogItems.length, " items."), 'success');
          renderItems(catalogItems);
          if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);

          // Auto-switch to Library tab
          document.querySelector('[data-tab="tab-items"]').click();
          _context3.n = 7;
          break;
        case 6:
          _context3.p = 6;
          _t3 = _context3.v;
          showMsg(statusMessage, _t3.message, 'error');
        case 7:
          _context3.p = 7;
          uploadFileBtn.disabled = false;
          return _context3.f(7);
        case 8:
          return _context3.a(2);
      }
    }, _callee3, null, [[2, 6, 7, 8]]);
  })));

  // Editor Font Size Sliders
  var nameFontSizeSlider = document.getElementById('nameFontSize');
  var nameFontVal = document.getElementById('nameFontVal');
  var skuFontSizeSlider = document.getElementById('skuFontSize');
  var skuFontVal = document.getElementById('skuFontVal');
  var priceFontSizeSlider = document.getElementById('priceFontSize');
  var priceFontVal = document.getElementById('priceFontVal');
  var barcodeScaleSlider = document.getElementById('barcodeScale');
  var barcodeScaleVal = document.getElementById('barcodeScaleVal');
  if (nameFontSizeSlider) {
    var bindSlider = function bindSlider(slider, valDisplay, elementId, isScale) {
      var update = function update() {
        valDisplay.textContent = slider.value;
        var el = document.getElementById(elementId);
        if (el) {
          if (isScale) {
            var scale = slider.value / 100;
            var x = el.getAttribute('data-x') || 0;
            var y = el.getAttribute('data-y') || 0;
            el.style.transform = "translate(".concat(x, "px, ").concat(y, "px) scale(").concat(scale, ")");
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
    };
    bindSlider(nameFontSizeSlider, nameFontVal, 'previewName', false);
    bindSlider(skuFontSizeSlider, skuFontVal, 'previewSku', false);
    if (priceFontSizeSlider) {
      bindSlider(priceFontSizeSlider, priceFontVal, 'previewPrice', false);
    }
    bindSlider(barcodeScaleSlider, barcodeScaleVal, 'previewBarcodeContainer', true);
    var customDisplayNameInput = document.getElementById('customDisplayName');
    if (customDisplayNameInput) {
      customDisplayNameInput.addEventListener('input', function (e) {
        var previewName = document.getElementById('previewName');
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
  var alignBtns = document.querySelectorAll('.align-btn');
  alignBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var activeEl = document.querySelector('.draggable-element.active');
      // Default to barcode if nothing is explicitly selected
      var targetEl = activeEl || document.getElementById('previewBarcodeContainer');
      if (!targetEl) return;
      var align = btn.dataset.align;
      var containerRect = labelPreview.getBoundingClientRect();
      var elRect = targetEl.getBoundingClientRect();
      var dx = 0;
      var dy = 0;
      if (align === 'left') {
        dx = containerRect.left + 10 - elRect.left;
      } else if (align === 'center') {
        var targetLeft = containerRect.left + (containerRect.width - elRect.width) / 2;
        dx = targetLeft - elRect.left;
      } else if (align === 'right') {
        var _targetLeft = containerRect.right - elRect.width - 10;
        dx = _targetLeft - elRect.left;
      } else if (align === 'top') {
        dy = containerRect.top + 10 - elRect.top;
      } else if (align === 'bottom') {
        dy = containerRect.bottom - elRect.height - 10 - elRect.top;
      }
      var currentX = parseFloat(targetEl.getAttribute('data-x')) || 0;
      var currentY = parseFloat(targetEl.getAttribute('data-y')) || 0;
      var scale = parseFloat(targetEl.getAttribute('data-scale')) || 1;
      var newX = currentX + dx;
      var newY = currentY + dy;
      targetEl.style.transform = "translate(".concat(newX, "px, ").concat(newY, "px) scale(").concat(scale, ")");
      targetEl.setAttribute('data-x', newX);
      targetEl.setAttribute('data-y', newY);
      clearRenderedCache();
    });
  });

  // Templates Logic
  var templateSelect = document.getElementById('templateSelect');
  var templateNameInput = document.getElementById('templateName');
  var saveTemplateBtn = document.getElementById('saveTemplateBtn');
  var loadTemplateBtn = document.getElementById('loadTemplateBtn');

  // Cart Logic Elements
  var addToCartBtn = document.getElementById('addToCartBtn');
  var printCartBtn = document.getElementById('printCartBtn');
  var cartItemsList = document.getElementById('cartItemsList');
  var cartCountBadge = document.getElementById('cartCountBadge');
  var cartToggleBtn = document.getElementById('cartToggleBtn');
  var closeCartBtn = document.getElementById('closeCartBtn');
  var cartSidebar = document.getElementById('cartSidebar');
  if (cartToggleBtn && cartSidebar) {
    cartToggleBtn.addEventListener('click', function () {
      cartSidebar.classList.toggle('open');
    });
  }
  if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener('click', function () {
      cartSidebar.classList.remove('open');
    });
  }
  var savedTemplates = {};
  var printCart = [];
  function updateCartUI() {
    if (!cartItemsList || !printCartBtn) return;
    var totalCount = printCart.reduce(function (sum, item) {
      return sum + (item.quantity || 1);
    }, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = totalCount;
    }
    printCartBtn.disabled = printCart.length === 0;
    var appContainer = document.querySelector('.app-container');
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
    printCart.forEach(function (item, index) {
      var el = document.createElement('div');
      el.className = 'menu-item';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'stretch';
      var infoDiv = document.createElement('div');
      infoDiv.className = 'menu-item-info';
      infoDiv.style.width = '100%';
      var nameEl = document.createElement('div');
      nameEl.className = 'menu-item-name';
      nameEl.textContent = item.name;
      nameEl.style.whiteSpace = 'normal';
      var skuEl = document.createElement('div');
      skuEl.className = 'menu-item-sku';
      skuEl.textContent = item.sku;
      infoDiv.appendChild(nameEl);
      infoDiv.appendChild(skuEl);
      var bottomRow = document.createElement('div');
      bottomRow.style.display = 'flex';
      bottomRow.style.justifyContent = 'space-between';
      bottomRow.style.alignItems = 'center';
      bottomRow.style.width = '100%';
      var imgDiv = document.createElement('div');
      imgDiv.className = 'menu-item-image';
      imgDiv.style.width = '120px';
      var img = document.createElement('img');
      img.src = item.image_data;
      img.style.width = '100%';
      img.style.objectFit = 'contain';
      imgDiv.appendChild(img);
      var actionDiv = document.createElement('div');
      actionDiv.className = 'menu-item-action';
      actionDiv.style.marginLeft = 'auto';

      // Quantity Controls container
      var qtyContainer = document.createElement('div');
      qtyContainer.style.display = 'flex';
      qtyContainer.style.alignItems = 'center';
      qtyContainer.style.gap = '0.25rem';
      qtyContainer.style.background = 'var(--background)';
      qtyContainer.style.borderRadius = '6px';
      qtyContainer.style.border = '1px solid var(--border)';
      qtyContainer.style.padding = '2px';
      var decBtn = document.createElement('button');
      decBtn.className = 'icon-btn';
      decBtn.style.padding = '2px 8px';
      decBtn.style.fontSize = '1rem';
      decBtn.innerHTML = '&minus;';
      decBtn.onclick = function (e) {
        e.stopPropagation();
        if (item.quantity > 1) {
          item.quantity--;
          updateCartUI();
        } else {
          printCart.splice(index, 1);
          updateCartUI();
        }
      };
      var qtyText = document.createElement('span');
      qtyText.style.fontFamily = 'monospace';
      qtyText.style.fontSize = '0.9rem';
      qtyText.style.minWidth = '20px';
      qtyText.style.textAlign = 'center';
      qtyText.style.fontWeight = '600';
      qtyText.textContent = item.quantity || 1;
      var incBtn = document.createElement('button');
      incBtn.className = 'icon-btn';
      incBtn.style.padding = '2px 8px';
      incBtn.style.fontSize = '1rem';
      incBtn.innerHTML = '&plus;';
      incBtn.onclick = function (e) {
        e.stopPropagation();
        item.quantity = (item.quantity || 1) + 1;
        updateCartUI();
      };
      qtyContainer.appendChild(decBtn);
      qtyContainer.appendChild(qtyText);
      qtyContainer.appendChild(incBtn);
      var removeBtn = document.createElement('button');
      removeBtn.className = 'icon-btn';
      removeBtn.style.color = '#ef4444';
      removeBtn.style.marginLeft = '0.5rem';
      removeBtn.innerHTML = '&times;';
      removeBtn.onclick = function (e) {
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
    addToCartBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      var elements, canvas, imageData, existingCartItem, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            if (selectedItem) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2);
          case 1:
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Adding...';
            _context4.p = 2;
            elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(function (el) {
              return el.style.border = 'none';
            });
            _context4.n = 3;
            return html2canvas(labelPreview, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false
            });
          case 3:
            canvas = _context4.v;
            elements.forEach(function (el) {
              return el.style.border = '';
            });
            imageData = canvas.toDataURL('image/png'); // If it already exists in the cart, update layout and increment quantity
            existingCartItem = printCart.find(function (c) {
              return c.sku === selectedItem.sku;
            });
            if (existingCartItem) {
              existingCartItem.image_data = imageData;
              existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
            } else {
              printCart.push({
                sku: selectedItem.sku,
                name: savedTemplates[selectedItem.sku] && savedTemplates[selectedItem.sku].name && savedTemplates[selectedItem.sku].name.text ? savedTemplates[selectedItem.sku].name.text : selectedItem.name,
                image_data: imageData,
                quantity: 1
              });
            }
            updateCartUI();
            addToCartBtn.textContent = 'Added!';
            setTimeout(function () {
              addToCartBtn.textContent = 'Add to Queue';
              addToCartBtn.disabled = false;
            }, 1500);
            _context4.n = 5;
            break;
          case 4:
            _context4.p = 4;
            _t4 = _context4.v;
            console.error(_t4);
            addToCartBtn.textContent = 'Error';
            addToCartBtn.disabled = false;
          case 5:
            return _context4.a(2);
        }
      }, _callee4, null, [[2, 4]]);
    })));
  }
  if (printCartBtn) {
    printCartBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            if (!(printCart.length === 0)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            printCartBtn.disabled = true;
            printCartBtn.textContent = 'Sending...';
            _context5.p = 2;
            _context5.n = 3;
            return executePrint({
              items: printCart,
              label_size: labelSizeSelect.value
            });
          case 3:
            printCart = [];
            updateCartUI();
            printCartBtn.textContent = 'Sent ✓';
            setTimeout(function () {
              printCartBtn.textContent = 'Print All';
            }, 2000);
            _context5.n = 5;
            break;
          case 4:
            _context5.p = 4;
            _t5 = _context5.v;
            alert("Print Error: ".concat(_t5.message));
            printCartBtn.textContent = 'Print All';
          case 5:
            _context5.p = 5;
            printCartBtn.disabled = printCart.length === 0;
            return _context5.f(5);
          case 6:
            return _context5.a(2);
        }
      }, _callee5, null, [[2, 4, 5, 6]]);
    })));
  }
  function loadTemplatesList() {
    fetch('/api/templates').then(function (r) {
      return r.json();
    }).then(function (data) {
      savedTemplates = data;
      if (catalogItems && catalogItems.length > 0) {
        renderItems(catalogItems);
        if (typeof renderMakerItems === 'function') renderMakerItems(catalogItems);
      }
    })["catch"](console.error);
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
    el.style.transform = "translate(".concat(layout.x, "px, ").concat(layout.y, "px)");
    if (layout.width) el.style.width = layout.width;
    if (layout.height) el.style.height = layout.height;
    if (layout.fontSize) el.style.fontSize = layout.fontSize;
    if (layout.text && el.id === 'previewName') {
      el.textContent = layout.text;
      var customNameInput = document.getElementById('customDisplayName');
      if (customNameInput) customNameInput.value = layout.text;
    }
    if (layout.scale) {
      el.style.transform = "translate(".concat(layout.x, "px, ").concat(layout.y, "px) scale(").concat(layout.scale, ")");
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
    saveTemplateBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
      var name, layout, response, _t6;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            if (selectedItem) {
              _context6.n = 1;
              break;
            }
            alert('Please select an item first');
            return _context6.a(2);
          case 1:
            name = selectedItem.sku;
            if (name) {
              _context6.n = 2;
              break;
            }
            return _context6.a(2);
          case 2:
            layout = {
              group: (document.getElementById('customGroupName') ? document.getElementById('customGroupName').value.trim() : '') || '',
              name: getElementLayout(document.getElementById('previewName')),
              barcode: getElementLayout(document.getElementById('previewBarcodeContainer')),
              sku: getElementLayout(document.getElementById('previewSku')),
              price: getElementLayout(document.getElementById('previewPrice'))
            };
            _context6.p = 3;
            _context6.n = 4;
            return fetch('/api/templates', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: name,
                layout: layout
              })
            });
          case 4:
            response = _context6.v;
            if (response.ok) {
              alert('Template saved for this item!');
              clearRenderedCache();
              loadTemplatesList();
              if (printBtn) printBtn.disabled = false;
              if (addToCartBtn) addToCartBtn.disabled = false;
            }
            _context6.n = 6;
            break;
          case 5:
            _context6.p = 5;
            _t6 = _context6.v;
            console.error('Failed to save template', _t6);
          case 6:
            return _context6.a(2);
        }
      }, _callee6, null, [[3, 5]]);
    })));
  }
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase();
      var filtered = catalogItems.filter(function (item) {
        return item.name.toLowerCase().includes(query) || item.sku && item.sku.toLowerCase().includes(query);
      });
      renderItems(filtered);
    });
  }
  if (makerSearchInput) {
    makerSearchInput.addEventListener('input', function (e) {
      var query = e.target.value.toLowerCase();
      var filtered = catalogItems.filter(function (item) {
        return item.name.toLowerCase().includes(query) || item.sku && item.sku.toLowerCase().includes(query);
      });
      if (typeof renderMakerItems === 'function') renderMakerItems(filtered);
    });
  }

  // Image cache on the client side to avoid redundant fetches
  var imageCache = {};
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
      container.innerHTML = "<div class=\"empty-state\">".concat(isReadyToPrint ? 'No ready-to-print items found. Make templates in the Template Maker.' : 'No items found.', "</div>");
      return;
    }
    var groups = {};
    items.forEach(function (item) {
      var templateGroup = savedTemplates[item.sku] ? savedTemplates[item.sku].group : undefined;
      var cat = templateGroup || categorizeItem(item.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    Object.keys(groups).sort().forEach(function (cat) {
      var groupDetails = document.createElement('details');
      groupDetails.className = 'category-group';
      // Auto open if few categories or if we are in ready to print
      if (Object.keys(groups).length <= 3 || isReadyToPrint) {
        groupDetails.open = true;
      }
      var summary = document.createElement('summary');
      summary.className = 'category-header';
      summary.innerHTML = "<span style=\"font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;\"><span class=\"details-icon\">\u25B6</span> ".concat(cat, "</span><span style=\"background:var(--primary); color:white; padding:2px 8px; border-radius:12px; font-size:0.8rem;\">").concat(groups[cat].length, "</span>");
      groupDetails.addEventListener('toggle', function () {
        var icon = summary.querySelector('.details-icon');
        if (icon) icon.textContent = groupDetails.open ? '▼' : '▶';
      });
      if (groupDetails.open) {
        var icon = summary.querySelector('.details-icon');
        if (icon) icon.textContent = '▼';
      }
      var groupContainer = document.createElement('div');
      groupContainer.className = 'items-list';
      groupContainer.style.display = 'block';
      groups[cat].forEach(function (item) {
        var itemEl = document.createElement('div');
        itemEl.className = 'menu-item';
        if (!item.sku) {
          itemEl.classList.add('disabled');
        } else {
          itemEl.addEventListener('click', function () {
            return isReadyToPrint ? quickPrint(item, itemEl) : selectItem(item, itemEl);
          });
        }
        var imgDiv = document.createElement('div');
        imgDiv.className = 'menu-item-image';
        imgDiv.dataset.query = item.name;
        if (imageCache[item.name]) {
          var img = document.createElement('img');
          img.src = imageCache[item.name];
          if (isReadyToPrint) img.alt = item.name;
          imgDiv.appendChild(img);
        } else if (imageCache[item.name] === null) {
          imgDiv.textContent = '—';
        } else {
          imgDiv.innerHTML = '<div class="img-loading"></div>';
          observer.observe(imgDiv);
        }
        var infoDiv = document.createElement('div');
        infoDiv.className = 'menu-item-info';
        var nameEl = document.createElement('div');
        nameEl.className = 'menu-item-name';
        nameEl.textContent = item.name;
        var skuEl = document.createElement('div');
        skuEl.className = 'menu-item-sku';
        var skuText = item.sku || 'No SKU';
        if (item.price) {
          skuText += " | ".concat(item.price);
        }
        skuEl.textContent = skuText;
        if (!isReadyToPrint && item.sku && savedTemplates[item.sku]) {
          var badge = document.createElement('span');
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
          var actionDiv = document.createElement('div');
          actionDiv.className = 'menu-item-action';
          var editBtn = document.createElement('button');
          editBtn.className = 'quick-btn btn-edit';
          editBtn.innerHTML = '✏️';
          editBtn.title = 'Edit Label';
          editBtn.onclick = function (e) {
            e.stopPropagation();
            selectItem(item, itemEl);
          };
          var addBtn = document.createElement('button');
          addBtn.className = 'quick-btn btn-add';
          addBtn.innerHTML = '➕';
          addBtn.title = 'Add to Print Queue';
          addBtn.onclick = /*#__PURE__*/function () {
            var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(e) {
              return _regenerator().w(function (_context7) {
                while (1) switch (_context7.n) {
                  case 0:
                    e.stopPropagation();
                    _context7.n = 1;
                    return quickAddToCart(item, addBtn);
                  case 1:
                    return _context7.a(2);
                }
              }, _callee7);
            }));
            return function (_x) {
              return _ref7.apply(this, arguments);
            };
          }();
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
    var printableItems = items.filter(function (item) {
      return item.sku && savedTemplates[item.sku];
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var imgDiv = entry.target;
          if (imgDiv.dataset.query) loadImage(imgDiv, imgDiv.dataset.query);
          observer.unobserve(imgDiv);
        }
      });
    }, {
      rootMargin: '200px'
    });
    renderGroupedItems(printableItems, itemsList, observer, true);
  }
  function renderMakerItems(items) {
    if (!makerItemsList) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var imgDiv = entry.target;
          if (imgDiv.dataset.query) loadImage(imgDiv, imgDiv.dataset.query);
          observer.unobserve(imgDiv);
        }
      });
    }, {
      rootMargin: '200px'
    });
    renderGroupedItems(items, makerItemsList, observer, false);
  }
  function loadImage(_x2, _x3) {
    return _loadImage.apply(this, arguments);
  }
  function _loadImage() {
    _loadImage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(imgDiv, query) {
      var response, data, img, _t0;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            _context1.p = 0;
            _context1.n = 1;
            return fetch("/api/image?q=".concat(encodeURIComponent(query)));
          case 1:
            response = _context1.v;
            _context1.n = 2;
            return response.json();
          case 2:
            data = _context1.v;
            if (data.url) {
              imageCache[query] = data.url;
              imgDiv.innerHTML = '';
              img = document.createElement('img');
              img.src = data.url;
              img.alt = query;
              img.onerror = function () {
                imgDiv.innerHTML = '—';
                imageCache[query] = null;
              };
              imgDiv.appendChild(img);
            } else {
              imageCache[query] = null;
              imgDiv.innerHTML = '—';
            }
            _context1.n = 4;
            break;
          case 3:
            _context1.p = 3;
            _t0 = _context1.v;
            imageCache[query] = null;
            imgDiv.innerHTML = '—';
          case 4:
            return _context1.a(2);
        }
      }, _callee1, null, [[0, 3]]);
    }));
    return _loadImage.apply(this, arguments);
  }
  function selectItem(item, element) {
    selectedItem = item;
    document.querySelectorAll('.menu-item').forEach(function (el) {
      return el.classList.remove('active');
    });
    if (element) {
      element.classList.add('active');
    }
    if (currentTemplateName) {
      currentTemplateName.textContent = item.name + ' (SKU: ' + item.sku + ')';
    }
    generateBarcode(item);
    var tabEl = document.querySelector('[data-tab="tab-template-maker"]');
    if (tabEl) tabEl.click();
  }
  function quickAddToCart(_x4, _x5) {
    return _quickAddToCart.apply(this, arguments);
  }
  function _quickAddToCart() {
    _quickAddToCart = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(item, btn) {
      var existingCartItem, _originalText, _originalText2, originalText, prevItem, elements, previewTab, wasHidden, canvas, imageData, _t1;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.p = _context10.n) {
          case 0:
            if (item.sku) {
              _context10.n = 1;
              break;
            }
            return _context10.a(2);
          case 1:
            // Check if the item already exists in the printCart queue
            existingCartItem = printCart.find(function (c) {
              return c.sku === item.sku;
            });
            if (!existingCartItem) {
              _context10.n = 2;
              break;
            }
            existingCartItem.quantity = (existingCartItem.quantity || 1) + 1;
            updateCartUI();

            // Flash checkmark without disabling the button
            _originalText = btn.dataset.originalText || btn.innerHTML;
            btn.dataset.originalText = _originalText;
            btn.innerHTML = '✓';
            setTimeout(function () {
              btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
            return _context10.a(2);
          case 2:
            if (!renderedImageCache[item.sku]) {
              _context10.n = 3;
              break;
            }
            printCart.push({
              sku: item.sku,
              name: savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text ? savedTemplates[item.sku].name.text : item.name,
              image_data: renderedImageCache[item.sku],
              quantity: 1
            });
            updateCartUI();

            // Flash checkmark without disabling the button
            _originalText2 = btn.dataset.originalText || btn.innerHTML;
            btn.dataset.originalText = _originalText2;
            btn.innerHTML = '✓';
            setTimeout(function () {
              btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
            return _context10.a(2);
          case 3:
            // Otherwise, run html2canvas
            originalText = btn.dataset.originalText || btn.innerHTML;
            btn.dataset.originalText = originalText;
            btn.innerHTML = '⌛';
            btn.disabled = true;
            _context10.p = 4;
            // Backup current selected item
            prevItem = selectedItem;
            selectedItem = item;

            // Generate barcode for this item temporarily in the preview
            generateBarcode(item);

            // Hide borders
            elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(function (el) {
              return el.style.border = 'none';
            });

            // To capture, labelPreview must be display: block
            previewTab = document.getElementById('tab-template-maker');
            wasHidden = window.getComputedStyle(previewTab).display === 'none';
            if (wasHidden) {
              previewTab.style.display = 'flex';
              previewTab.style.position = 'fixed';
              previewTab.style.top = '-9999px';
              previewTab.style.left = '-9999px';
              previewTab.style.visibility = 'visible';
            }
            _context10.n = 5;
            return html2canvas(labelPreview, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false
            });
          case 5:
            canvas = _context10.v;
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
            imageData = canvas.toDataURL('image/png');
            renderedImageCache[item.sku] = imageData; // Cache it!

            printCart.push({
              sku: item.sku,
              name: savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text ? savedTemplates[item.sku].name.text : item.name,
              image_data: imageData,
              quantity: 1
            });
            updateCartUI();
            btn.innerHTML = '✓';
            setTimeout(function () {
              btn.innerHTML = btn.dataset.originalText || '➕';
            }, 300);
            _context10.n = 7;
            break;
          case 6:
            _context10.p = 6;
            _t1 = _context10.v;
            console.error(_t1);
            btn.innerHTML = '❌';
            setTimeout(function () {
              btn.innerHTML = btn.dataset.originalText || '➕';
            }, 1000);
          case 7:
            _context10.p = 7;
            btn.disabled = false;
            return _context10.f(7);
          case 8:
            return _context10.a(2);
        }
      }, _callee10, null, [[4, 6, 7, 8]]);
    }));
    return _quickAddToCart.apply(this, arguments);
  }
  function quickPrint(_x6, _x7) {
    return _quickPrint.apply(this, arguments);
  }
  function _quickPrint() {
    _quickPrint = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(item, itemEl) {
      var overlay, prevItem, elements, previewTab, wasHidden, canvas, imageData, _t10;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.p = _context11.n) {
          case 0:
            if (item.sku) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            itemEl.style.position = 'relative';
            overlay = document.createElement('div');
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
            _context11.p = 2;
            prevItem = selectedItem;
            selectedItem = item;
            generateBarcode(item);
            elements = labelPreview.querySelectorAll('.draggable-element');
            elements.forEach(function (el) {
              return el.style.border = 'none';
            });
            previewTab = document.getElementById('tab-template-maker');
            wasHidden = window.getComputedStyle(previewTab).display === 'none';
            if (wasHidden) {
              previewTab.style.display = 'flex';
              previewTab.style.position = 'fixed';
              previewTab.style.top = '-9999px';
              previewTab.style.left = '-9999px';
              previewTab.style.visibility = 'visible';
            }
            _context11.n = 3;
            return html2canvas(labelPreview, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false
            });
          case 3:
            canvas = _context11.v;
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
            imageData = canvas.toDataURL('image/png');
            _context11.n = 4;
            return executePrint({
              items: [{
                sku: item.sku,
                name: savedTemplates[item.sku] && savedTemplates[item.sku].name && savedTemplates[item.sku].name.text ? savedTemplates[item.sku].name.text : item.name,
                image_data: imageData,
                quantity: 1
              }],
              label_size: labelSizeSelect.value
            });
          case 4:
            overlay.style.background = 'rgba(16, 185, 129, 0.15)';
            overlay.style.color = 'var(--success)';
            overlay.textContent = 'Sent Successfully! ✓';
            setTimeout(function () {
              overlay.remove();
            }, 1500);
            _context11.n = 6;
            break;
          case 5:
            _context11.p = 5;
            _t10 = _context11.v;
            console.error(_t10);
            overlay.style.background = 'rgba(239, 68, 68, 0.15)';
            overlay.style.color = '#ef4444';
            overlay.textContent = "Error: ".concat(_t10.message || 'Failed');
            setTimeout(function () {
              overlay.remove();
            }, 2500);
          case 6:
            return _context11.a(2);
        }
      }, _callee11, null, [[2, 5]]);
    }));
    return _quickPrint.apply(this, arguments);
  }
  function addHandles(el) {
    ['tl', 'tr', 'bl', 'br'].forEach(function (h) {
      var handle = document.createElement('div');
      handle.className = "resize-handle resize-handle-".concat(h);
      el.appendChild(handle);
    });
  }
  function generateBarcode(item) {
    var customNameInput = document.getElementById('customDisplayName');
    var customGroupInput = document.getElementById('customGroupName');
    if (savedTemplates[item.sku]) {
      if (customNameInput) customNameInput.value = savedTemplates[item.sku].name && savedTemplates[item.sku].name.text ? savedTemplates[item.sku].name.text : item.name;
      if (customGroupInput) customGroupInput.value = savedTemplates[item.sku].group || '';
    } else {
      if (customNameInput) customNameInput.value = item.name;
      if (customGroupInput) customGroupInput.value = '';
    }
    var nameEl = document.getElementById('previewName');
    var barcodeContainer = document.getElementById('previewBarcodeContainer');
    var skuEl = document.getElementById('previewSku');
    var priceEl = document.getElementById('previewPrice');
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
        var layout = savedTemplates[item.sku];
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
    var rect = labelPreview.getBoundingClientRect();
    var cx = (rect.width || 400) / 2;
    var cy = (rect.height || 125) / 2;
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
    nameEl.style.transform = "translate(".concat(cx - 90, "px, 10px)");
    barcodeContainer = document.createElement('div');
    barcodeContainer.className = 'draggable-element';
    barcodeContainer.id = 'previewBarcodeContainer';
    barcodeContainer.style.width = '200px';
    barcodeContainer.style.height = '50px';
    barcodeContainer.innerHTML = '<img id="previewBarcode" style="width:100%;height:100%; display:block; object-fit:fill;">';
    barcodeContainer.setAttribute('data-x', cx - 100);
    barcodeContainer.setAttribute('data-y', cy - 25);
    barcodeContainer.style.transform = "translate(".concat(cx - 100, "px, ").concat(cy - 25, "px)");
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
    skuEl.style.transform = "translate(".concat(cx - 60, "px, ").concat(cy + 35, "px)");
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
    priceEl.style.transform = "translate(".concat(cx + 90, "px, ").concat(cy - 10, "px)");
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
      var img = document.getElementById('previewBarcode');

      // Ensure container roughly matches original aspect ratio to start
      barcodeContainer.style.width = '180px';
      barcodeContainer.style.height = '40px';
      if (savedTemplates[item.sku]) {
        var _layout = savedTemplates[item.sku];
        applyElementLayout(document.getElementById('previewName'), _layout.name);
        applyElementLayout(document.getElementById('previewBarcodeContainer'), _layout.barcode);
        applyElementLayout(document.getElementById('previewSku'), _layout.sku);
        applyElementLayout(document.getElementById('previewPrice'), _layout.price);
        if (printBtn) printBtn.disabled = false;
        if (addToCartBtn) addToCartBtn.disabled = false;
      } else {
        if (printBtn) printBtn.disabled = true;
        if (addToCartBtn) addToCartBtn.disabled = true;
      }
    } catch (e) {
      console.error('Barcode generation error:', e);
      labelPreview.innerHTML = "<div style=\"color: #ef4444; padding: 1rem;\">Error generating barcode for SKU: ".concat(item.sku, "</div>");
      printBtn.disabled = true;
      if (addToCartBtn) addToCartBtn.disabled = true;
    }
  }

  // Initialize interact.js
  if (typeof interact !== 'undefined') {
    var snapModifier = interact.modifiers.snap({
      targets: [interact.createSnapGrid({
        x: 10,
        y: 10
      })],
      range: Infinity,
      relativePoints: [{
        x: 0,
        y: 0
      }]
    });
    var snapSizeModifier = interact.modifiers.snapSize({
      targets: [interact.createSnapGrid({
        x: 10,
        y: 10
      })]
    });
    interact('.draggable-element').draggable({
      modifiers: [snapModifier],
      listeners: {
        move: function move(event) {
          var target = event.target;
          var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
          var scale = target.getAttribute('data-scale') || 1;
          target.style.transform = "translate(".concat(x, "px, ").concat(y, "px) scale(").concat(scale, ")");
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
          clearRenderedCache();
        }
      }
    }).resizable({
      edges: {
        left: '.resize-handle-tl, .resize-handle-bl',
        right: '.resize-handle-tr, .resize-handle-br',
        bottom: '.resize-handle-bl, .resize-handle-br',
        top: '.resize-handle-tl, .resize-handle-tr'
      },
      modifiers: [snapSizeModifier],
      listeners: {
        move: function move(event) {
          var _event$target$dataset = event.target.dataset,
            x = _event$target$dataset.x,
            y = _event$target$dataset.y,
            scale = _event$target$dataset.scale;
          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;
          scale = scale || 1;
          Object.assign(event.target.style, {
            width: "".concat(event.rect.width, "px"),
            height: "".concat(event.rect.height, "px"),
            transform: "translate(".concat(x, "px, ").concat(y, "px) scale(").concat(scale, ")")
          });
          Object.assign(event.target.dataset, {
            x: x,
            y: y
          });
          if (event.target.id === 'previewName' || event.target.id === 'previewSku' || event.target.id === 'previewPrice') {
            event.target.style.fontSize = Math.max(10, event.rect.height * 0.7) + 'px';
          }
          clearRenderedCache();
        }
      }
    }).on('tap', function (event) {
      document.querySelectorAll('.draggable-element').forEach(function (el) {
        return el.classList.remove('active');
      });
      event.currentTarget.classList.add('active');
    });
    labelPreview.addEventListener('pointerdown', function (e) {
      if (e.target === labelPreview) {
        document.querySelectorAll('.draggable-element').forEach(function (el) {
          return el.classList.remove('active');
        });
      }
    });
  }

  // Direct print to network printer
  printBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    var elements, canvas, imageData, _t7;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          if (selectedItem) {
            _context8.n = 1;
            break;
          }
          return _context8.a(2);
        case 1:
          printBtn.disabled = true;
          printBtn.textContent = 'Rendering...';
          _context8.p = 2;
          // Temporarily hide borders for capture
          elements = labelPreview.querySelectorAll('.draggable-element');
          elements.forEach(function (el) {
            return el.style.border = 'none';
          });

          // Capture the preview as an image
          _context8.n = 3;
          return html2canvas(labelPreview, {
            scale: 2,
            // higher resolution
            backgroundColor: '#ffffff',
            logging: false
          });
        case 3:
          canvas = _context8.v;
          // Restore borders
          elements.forEach(function (el) {
            return el.style.border = '';
          });
          imageData = canvas.toDataURL('image/png');
          printBtn.textContent = 'Sending...';
          _context8.n = 4;
          return executePrint({
            items: [{
              sku: selectedItem.sku,
              name: selectedItem.name,
              image_data: imageData,
              quantity: 1
            }],
            label_size: labelSizeSelect.value
          });
        case 4:
          printBtn.textContent = 'Sent ✓';
          setTimeout(function () {
            printBtn.textContent = 'Print Now';
            printBtn.disabled = false;
          }, 2000);
          _context8.n = 6;
          break;
        case 5:
          _context8.p = 5;
          _t7 = _context8.v;
          console.error('Print error:', _t7);
          printBtn.textContent = 'Print Failed';
          alert("Print Error: ".concat(_t7.message));
          setTimeout(function () {
            printBtn.textContent = 'Print Now';
            printBtn.disabled = false;
          }, 2000);
        case 6:
          return _context8.a(2);
      }
    }, _callee8, null, [[2, 5]]);
  })));
  function showMsg(el, message, type) {
    el.textContent = message;
    el.className = "status-message status-".concat(type);
    if (type === 'success') {
      setTimeout(function () {
        el.textContent = '';
        el.className = 'status-message';
      }, 5000);
    }
  }

  // Background Scraper Controller
  var scraperStatusBadge = document.getElementById('scraperStatusBadge');
  var scrapeTotal = document.getElementById('scrapeTotal');
  var scrapeCached = document.getElementById('scrapeCached');
  var scrapeImages = document.getElementById('scrapeImages');
  var toggleScraperBtn = document.getElementById('toggleScraperBtn');
  var scraperRunning = false;
  function updateScraperStatus() {
    return _updateScraperStatus.apply(this, arguments);
  }
  function _updateScraperStatus() {
    _updateScraperStatus = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
      var response, data, _t11;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.p = _context12.n) {
          case 0:
            if (scraperStatusBadge) {
              _context12.n = 1;
              break;
            }
            return _context12.a(2);
          case 1:
            _context12.p = 1;
            _context12.n = 2;
            return fetch('/api/scrape/status');
          case 2:
            response = _context12.v;
            _context12.n = 3;
            return response.json();
          case 3:
            data = _context12.v;
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
            _context12.n = 5;
            break;
          case 4:
            _context12.p = 4;
            _t11 = _context12.v;
            console.error('Failed to get scraper status', _t11);
          case 5:
            return _context12.a(2);
        }
      }, _callee12, null, [[1, 4]]);
    }));
    return _updateScraperStatus.apply(this, arguments);
  }
  if (toggleScraperBtn) {
    toggleScraperBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
      var response, data, _t8;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.p = _context9.n) {
          case 0:
            toggleScraperBtn.disabled = true;
            _context9.p = 1;
            _context9.n = 2;
            return fetch('/api/scrape/toggle', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                enable: !scraperRunning
              })
            });
          case 2:
            response = _context9.v;
            _context9.n = 3;
            return response.json();
          case 3:
            data = _context9.v;
            scraperRunning = data.is_running;
            _context9.n = 4;
            return updateScraperStatus();
          case 4:
            _context9.n = 6;
            break;
          case 5:
            _context9.p = 5;
            _t8 = _context9.v;
            console.error(_t8);
          case 6:
            _context9.p = 6;
            toggleScraperBtn.disabled = false;
            return _context9.f(6);
          case 7:
            return _context9.a(2);
        }
      }, _callee9, null, [[1, 5, 6, 7]]);
    })));

    // Poll scraper status every 4 seconds when Settings tab is active
    setInterval(function () {
      var settingsTab = document.getElementById('tab-settings');
      if (settingsTab && settingsTab.classList.contains('active')) {
        updateScraperStatus();
      }
    }, 4000);

    // Initial load
    updateScraperStatus();
  }

  // Logs Tab Controller
  var logOutput = document.getElementById('logOutput');
  var refreshLogsBtn = document.getElementById('refreshLogsBtn');
  var clearLogsBtn = document.getElementById('clearLogsBtn');
  var firstLoadLogs = true;
  var usbDevice = null;
  function executePrint(_x8) {
    return _executePrint.apply(this, arguments);
  }
  function _executePrint() {
    _executePrint = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(payload) {
      var response, data, interfaceNumber, endpoint, binaryString, bytes, i, _t12, _t13;
      return _regenerator().w(function (_context13) {
        while (1) switch (_context13.p = _context13.n) {
          case 0:
            if (navigator.usb) {
              _context13.n = 1;
              break;
            }
            alert("CRITICAL ERROR: WebUSB is not available! This is required to print directly from the tablet.\n\nMake sure you are:\n1. Using the official Google Chrome app (not a third party browser).\n2. Accessing the app via 'http://localhost:5000' and NOT an IP address.");
            return _context13.a(2);
          case 1:
            payload.webusb = true;
            _context13.n = 2;
            return fetch('/api/print', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
          case 2:
            response = _context13.v;
            _context13.n = 3;
            return response.json();
          case 3:
            data = _context13.v;
            if (response.ok) {
              _context13.n = 4;
              break;
            }
            throw new Error(data.error || 'Print failed');
          case 4:
            if (!(navigator.usb && data.instructions)) {
              _context13.n = 17;
              break;
            }
            _context13.p = 5;
            if (usbDevice) {
              _context13.n = 7;
              break;
            }
            _context13.n = 6;
            return navigator.usb.requestDevice({
              filters: [{
                vendorId: 0x04f9
              }]
            });
          case 6:
            usbDevice = _context13.v;
          case 7:
            if (usbDevice.opened) {
              _context13.n = 8;
              break;
            }
            _context13.n = 8;
            return usbDevice.open();
          case 8:
            if (!(usbDevice.configuration === null)) {
              _context13.n = 9;
              break;
            }
            _context13.n = 9;
            return usbDevice.selectConfiguration(1);
          case 9:
            interfaceNumber = usbDevice.configuration.interfaces[0].interfaceNumber;
            _context13.p = 10;
            _context13.n = 11;
            return usbDevice.claimInterface(interfaceNumber);
          case 11:
            _context13.n = 13;
            break;
          case 12:
            _context13.p = 12;
            _t12 = _context13.v;
          case 13:
            endpoint = usbDevice.configuration.interfaces[0].alternate.endpoints.find(function (e) {
              return e.direction === 'out';
            });
            if (endpoint) {
              _context13.n = 14;
              break;
            }
            throw new Error("No OUT endpoint found on printer");
          case 14:
            binaryString = atob(data.instructions);
            bytes = new Uint8Array(binaryString.length);
            for (i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            _context13.n = 15;
            return usbDevice.transferOut(endpoint.endpointNumber, bytes);
          case 15:
            _context13.n = 17;
            break;
          case 16:
            _context13.p = 16;
            _t13 = _context13.v;
            console.error("WebUSB Print Error:", _t13);
            throw new Error("WebUSB Print failed: " + _t13.message);
          case 17:
            return _context13.a(2, data);
        }
      }, _callee13, null, [[10, 12], [5, 16]]);
    }));
    return _executePrint.apply(this, arguments);
  }
  function fetchLogs() {
    return _fetchLogs.apply(this, arguments);
  }
  function _fetchLogs() {
    _fetchLogs = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14() {
      var response, data, isAtBottom, _t14;
      return _regenerator().w(function (_context14) {
        while (1) switch (_context14.p = _context14.n) {
          case 0:
            if (logOutput) {
              _context14.n = 1;
              break;
            }
            return _context14.a(2);
          case 1:
            _context14.p = 1;
            _context14.n = 2;
            return fetch('/api/logs');
          case 2:
            response = _context14.v;
            _context14.n = 3;
            return response.json();
          case 3:
            data = _context14.v;
            if (data.logs) {
              // If user is already scrolled to bottom, or it's the first render, keep auto-scrolling
              isAtBottom = logOutput.scrollHeight - logOutput.clientHeight <= logOutput.scrollTop + 60;
              logOutput.textContent = data.logs.join('\\n');
              if (isAtBottom || firstLoadLogs) {
                logOutput.scrollTop = logOutput.scrollHeight;
                firstLoadLogs = false;
              }
            }
            _context14.n = 5;
            break;
          case 4:
            _context14.p = 4;
            _t14 = _context14.v;
            console.error('Failed to fetch logs', _t14);
          case 5:
            return _context14.a(2);
        }
      }, _callee14, null, [[1, 4]]);
    }));
    return _fetchLogs.apply(this, arguments);
  }
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', fetchLogs);
  }
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
      var _t9;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.p = _context0.n) {
          case 0:
            if (confirm('Are you sure you want to clear system logs?')) {
              _context0.n = 1;
              break;
            }
            return _context0.a(2);
          case 1:
            _context0.p = 1;
            _context0.n = 2;
            return fetch('/api/logs/clear', {
              method: 'POST'
            });
          case 2:
            _context0.n = 3;
            return fetchLogs();
          case 3:
            _context0.n = 5;
            break;
          case 4:
            _context0.p = 4;
            _t9 = _context0.v;
            console.error('Failed to clear logs', _t9);
          case 5:
            return _context0.a(2);
        }
      }, _callee0, null, [[1, 4]]);
    })));
  }

  // Set up a 2-second interval that polls logs ONLY when the logs tab is active
  setInterval(function () {
    var logsTab = document.getElementById('tab-logs');
    if (logsTab && logsTab.classList.contains('active')) {
      fetchLogs();
    }
  }, 2000);

  // Initial fetch when switching to the logs tab
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.tab === 'tab-logs') {
        firstLoadLogs = true;
        fetchLogs();
      }
    });
  });
});
