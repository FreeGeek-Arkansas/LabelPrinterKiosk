#   /\_/\  
#  ( o.o ) <-- "Meow, loading imports..."
#   > ^ <
import os
import io
import csv
import json
import openpyxl
import threading
import time
import datetime
from flask import Flask, request, jsonify, render_template
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)

# In-memory log storage (limited to 200 lines)
app_logs = []

def add_log(message, level="INFO"):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    log_entry = f"[{timestamp}] [{level}] {message}"
    app_logs.append(log_entry)
    if len(app_logs) > 200:
        app_logs.pop(0)
    print(log_entry)


# Persistence paths
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(DATA_DIR, 'config.json')
INVENTORY_FILE = os.path.join(DATA_DIR, 'inventory.json')
TEMPLATES_FILE = os.path.join(DATA_DIR, 'templates.json')

# Brother QL-720NW default settings
PRINTER_MODEL = 'QL-720NW'

IMAGE_CACHE_FILE = os.path.join(DATA_DIR, 'image_cache.json')

def load_image_cache():
    if os.path.exists(IMAGE_CACHE_FILE):
        try:
            with open(IMAGE_CACHE_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {}

def save_image_cache(cache):
    with open(IMAGE_CACHE_FILE, 'w') as f:
        json.dump(cache, f)

image_cache = load_image_cache()

import re

#   _   _
#  (.)_(.)  <-- "I am the Query Janitor, sweeping up bad chars!"
#  (   _ )
#   \___/
def sanitize_query(name):
    q = name.strip()
    
    # 1. Extract variation parentheticals if they specify router/motherboard variations
    match = re.search(r'\((Wifi\s+\d+.*?)\)', q, re.IGNORECASE)
    if match:
        return match.group(1)
        
    # 2. Remove price tags like "$30 " at the start
    q = re.sub(r'^\$\d+\s*', '', q)
    
    # 3. Remove "*as is*", "as-is", etc.
    q = re.sub(r'\*as\s+is\*', '', q, flags=re.IGNORECASE)
    q = re.sub(r'\bas\s+is\b', '', q, flags=re.IGNORECASE)
    
    # 4. Remove generic/description parentheticals
    q = re.sub(r'\((various prices|condition description required|starts\s+at.*?|no\s+barcode|Geek\s+Gift|custom\s+priced?|describe\s+type|single\s+band|red,\s*white.*?|detachable\s+cables|old\s+silver-tipped.*?|no\s+warranty|no\s+battery.*?|keyboard/mouse/monitor.*?|only\s+\d+\s+rows.*?)\)', '', q, flags=re.IGNORECASE)
    
    # 5. Remove leading/trailing non-alphanumeric except space/quotes
    q = q.strip('*-+ ,#_')
    
    # 6. Clean double spaces
    q = re.sub(r'\s+', ' ', q).strip()
    
    return q

crawler_running = False
crawler_thread = None

#  / \ / \
# ( o _ o ) <-- "I'm the web crawler spider! I fetch images!"
#  \ / \ /
def fetch_image_fallback(query):
    import urllib.request, urllib.parse, json
    search_url = "https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" + urllib.parse.quote(query) + "&gsrlimit=1&prop=pageimages&pithumbsize=400&format=json"
    req = urllib.request.Request(search_url, headers={'User-Agent': 'PrinterQR/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            if pages:
                page = list(pages.values())[0]
                return page.get('thumbnail', {}).get('source')
    except Exception as e:
        add_log(f"[Crawler] Wikipedia API error: {e}", "WARNING")
    return None

def run_image_crawler():
    global crawler_running, image_cache
    add_log("[Crawler] Background image crawler thread started.")
    crawler_running = True
    
    while crawler_running:
        # Load latest inventory
        items = load_inventory()
        if not items:
            time.sleep(5)
            continue
            
        # Find unique names that don't have a cache entry
        uncached_queries = []
        for item in items:
            name = item.get('name')
            if name and name not in image_cache:
                uncached_queries.append(name)
                
        if not uncached_queries:
            time.sleep(10)
            continue
            
        # Take the first uncached item and clean it
        name = uncached_queries[0]
        query = sanitize_query(name)
        
        add_log(f"[Crawler] Searching Wikipedia: '{query}' (original: '{name}')")
        
        try:
            url = fetch_image_fallback(query)
            if url:
                image_cache[name] = url
                add_log(f"[Crawler] Found image: {url}")
            else:
                image_cache[name] = None
                add_log("[Crawler] No image found.")
        except Exception as e:
            add_log(f"[Crawler] Error: {e}", "ERROR")
            time.sleep(10)
                
        # Save cache to disk
        save_image_cache(image_cache)
        
        # Throttling delay (2.5 seconds)
        time.sleep(2.5)

    add_log("[Crawler] Background image crawler thread stopped.")

# Start background crawler automatically on main worker boot
if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
    crawler_running = True
    crawler_thread = threading.Thread(target=run_image_crawler, daemon=True)
    crawler_thread.start()

def load_config():
    """Load printer config from disk."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {"printer_ip": ""}

def save_config(config):
    """Save printer config to disk."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f)

#   ____
#  /____\
#  |    |  <-- "Box of inventory items incoming!"
#  |____|
def load_inventory():
    """Load inventory items from disk."""
    if os.path.exists(INVENTORY_FILE):
        try:
            with open(INVENTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return []

def save_inventory(items):
    """Save inventory items to disk."""
    with open(INVENTORY_FILE, 'w') as f:
        json.dump(items, f)

def load_templates():
    if os.path.exists(TEMPLATES_FILE):
        try:
            with open(TEMPLATES_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {}

def save_templates(templates):
    with open(TEMPLATES_FILE, 'w') as f:
        json.dump(templates, f)

@app.route('/')
def index():
    return render_template('index.html')

#      /^\ 
#     /   \     *    <-- "Casting spell to fetch image!"
#    /___\_\   /
#   ( o . o ) /
#    \  _  / /
#     \_-_/ /
@app.route('/api/image', methods=['GET'])
def get_image():
    """Search for a product image by item name."""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"url": None})
    
    # Check cache first
    if query in image_cache:
        return jsonify({"url": image_cache[query]})
    
    clean_query = sanitize_query(query)
    add_log(f"[API] Searching on-the-fly: '{clean_query}' (original: '{query}')")
    
    try:
        url = fetch_image_fallback(clean_query)
        if url:
            image_cache[query] = url
            save_image_cache(image_cache)
            return jsonify({"url": url})
        
        image_cache[query] = None
        save_image_cache(image_cache)
        return jsonify({"url": None})
    except Exception as e:
        add_log(f"[API] Image search error for '{clean_query}': {e}", "ERROR")
        image_cache[query] = None
        save_image_cache(image_cache)
        return jsonify({"url": None})

@app.route('/api/scrape/status', methods=['GET'])
def scrape_status():
    items = load_inventory()
    total_items = len(items)
    
    unique_names = set(item.get('name') for item in items if item.get('name'))
    total_names = len(unique_names)
    
    cached_names = len(image_cache)
    successful_images = sum(1 for url in image_cache.values() if url is not None)
    
    return jsonify({
        "total_items": total_items,
        "total_names": total_names,
        "cached_names": cached_names,
        "successful_images": successful_images,
        "is_running": crawler_running
    })

@app.route('/api/scrape/toggle', methods=['POST'])
def scrape_toggle():
    global crawler_running, crawler_thread
    data = request.json or {}
    enable = data.get('enable', True)
    
    if enable:
        if not crawler_running:
            crawler_running = True
            crawler_thread = threading.Thread(target=run_image_crawler, daemon=True)
            crawler_thread.start()
            add_log("Background scraper started manually via API.")
            return jsonify({"message": "Scraper started", "is_running": True})
        else:
            return jsonify({"message": "Scraper already running", "is_running": True})
    else:
        crawler_running = False
        add_log("Background scraper stop requested manually via API.")
        return jsonify({"message": "Scraper stop requested", "is_running": False})

@app.route('/api/config', methods=['POST'])
def update_config():
    data = request.get_json()
    printer_ip = data.get('printer_ip', '').strip()
    if not printer_ip:
        return jsonify({"error": "Printer IP is required"}), 400
    config = load_config()
    config['printer_ip'] = printer_ip
    save_config(config)
    add_log(f"Printer IP configuration updated to {printer_ip}")
    return jsonify({"message": f"Printer configured at {printer_ip}"})

@app.route('/api/config', methods=['GET'])
def get_config():
    config = load_config()
    return jsonify(config)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    return jsonify({"logs": app_logs})

@app.route('/api/logs/clear', methods=['POST'])
def clear_logs():
    global app_logs
    app_logs = []
    add_log("Logs cleared", "INFO")
    return jsonify({"message": "Logs cleared", "logs": app_logs})

@app.route('/api/items', methods=['GET'])
def get_items():
    items = load_inventory()
    return jsonify({'items': items})

@app.route('/api/templates', methods=['GET'])
def api_get_templates():
    return jsonify(load_templates())

@app.route('/api/templates', methods=['POST'])
def api_save_template():
    data = request.json
    name = data.get('name')
    layout = data.get('layout')
    if not name or not layout:
        return jsonify({'error': 'Name and layout required'}), 400
    
    templates = load_templates()
    templates[name] = layout
    save_templates(templates)
    return jsonify({'message': 'Template saved', 'templates': templates})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # Parse the file into a list of dictionaries (rows)
        rows = []
        if file.filename.endswith('.csv'):
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_input = csv.reader(stream)
            headers = next(csv_input, [])
            for row in csv_input:
                row_dict = {}
                for i, header in enumerate(headers):
                    if i < len(row):
                        row_dict[str(header).strip().lower()] = row[i]
                rows.append(row_dict)
            columns = [str(c).strip().lower() for c in headers]

        elif file.filename.endswith(('.xls', '.xlsx')):
            import openpyxl
            wb = openpyxl.load_workbook(file, data_only=True)
            sheet = wb.active
            data = sheet.values
            headers = next(data, [])
            columns = [str(c).strip().lower() for c in headers]
            for row in data:
                row_dict = {}
                for i, header in enumerate(headers):
                    if i < len(row):
                        row_dict[str(header).strip().lower()] = row[i]
                rows.append(row_dict)
        else:
            return jsonify({"error": "Invalid file format. Please upload CSV or Excel."}), 400

        # Square exports use "Item Name" and "SKU" columns
        name_col = next((col for col in columns if col == 'item name'), None)
        if not name_col:
            name_col = next((col for col in columns if 'name' in col and 'item' in col), None)
        if not name_col:
            name_col = next((col for col in columns if 'name' in col), None)
            
        sku_col = next((col for col in columns if col == 'sku'), None)
        if not sku_col:
            sku_col = next((col for col in columns if 'sku' in col), None)

        price_col = next((col for col in columns if col == 'price'), None)
        if not price_col:
            price_col = next((col for col in columns if 'price' in col), None)

        variation_col = next((col for col in columns if col == 'variation name'), None)
        if not variation_col:
            variation_col = next((col for col in columns if 'variation' in col), None)
        
        if not name_col or not sku_col:
            available = ', '.join(columns[:10])
            return jsonify({"error": f"Could not find 'Item Name' or 'SKU' columns. Found: {available}..."}), 400
            
        items = []
        for index, row in enumerate(rows):
            sku = str(row.get(sku_col, '')).strip()
            name = str(row.get(name_col, '')).strip() or 'Unknown'
            
            # Check for variation name
            variation = ''
            if variation_col:
                val = row.get(variation_col)
                if val is not None and str(val).strip() != '':
                    val_str = str(val).strip()
                    if val_str.lower() != 'regular':
                        variation = val_str
            
            if variation:
                name = f"{name} ({variation})"
            
            # Skip empty SKUs or nan
            if sku and sku.lower() != 'nan':
                price = ''
                if price_col:
                    val = row.get(price_col)
                    if val is not None and str(val).strip() != '':
                        val_str = str(val).strip()
                        try:
                            price_num = float(val_str)
                            price = f"${price_num:.2f}"
                        except ValueError:
                            price = val_str.capitalize()
                items.append({
                    'id': str(index),
                    'name': name,
                    'sku': sku,
                    'price': price
                })
        # Save to disk for persistence
        save_inventory(items)
        add_log(f"Uploaded inventory file successfully. Imported {len(items)} items.")
        return jsonify({"items": items})
        
    except Exception as e:
        add_log(f"Error parsing uploaded file: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/test_printer', methods=['GET'])
def test_printer():
    global PRINTER_IP
    if PRINTER_IP:
        import socket
        try:
            with socket.create_connection((PRINTER_IP, 9100), timeout=3):
                pass
            add_log(f"Connection test SUCCESS: Reached Brother printer at {PRINTER_IP}:9100")
            return jsonify({"message": f"Successfully connected to printer at {PRINTER_IP}"})
        except Exception as e:
            add_log(f"Connection test FAILED: Could not reach {PRINTER_IP}:9100 - {e}", "ERROR")
            return jsonify({"error": f"Network printer not reachable at {PRINTER_IP}. Error: {e}"}), 400

    try:
        import usb.core
        dev = usb.core.find(idVendor=0x04f9)
        if dev is None:
            add_log("Connection test FAILED: No Brother USB printer found.", "ERROR")
            return jsonify({"error": "No Brother USB printer found. Check USB connection or power."}), 400
            
        add_log(f"Connection test SUCCESS: Found Brother USB printer (idProduct: {hex(dev.idProduct)}).")
        return jsonify({"message": f"Successfully found Brother USB printer."})
    except Exception as e:
        add_log(f"Connection test ERROR: {e}", "ERROR")
        return jsonify({"error": str(e)}), 500

#  *BOOM*
#   \ | /
#  -- O --   <-- "PRINTING LABELS AT LIGHTNING SPEED!"
#   / | \
@app.route('/api/print', methods=['POST'])
def print_label():
    global PRINTER_IP
    data = request.get_json()
    label_size = data.get('label_size', 'dk1204')
    
    if data.get('webusb'):
        printer_url = "usb://0x04f9:0x2049" # Dummy URL, not used for webusb
        backend = "webusb"
    elif PRINTER_IP:
        printer_url = f"tcp://{PRINTER_IP}:9100"
        backend = "network"
    else:
        # Fallback to pure Termux USB routing since WebUSB and Network failed
        import subprocess
        try:
            # List devices
            out = subprocess.check_output(["termux-usb", "-l"]).decode('utf-8').strip()
            devices = [line for line in out.split('\n') if line.startswith('/dev/bus/usb/')]
            if not devices:
                return jsonify({"error": "No USB devices found using termux-usb. Ensure printer is plugged in."}), 400
            
            # Request permissions (pops up on Android if needed)
            device_path = devices[-1] # Usually the last plugged device
            subprocess.run(["termux-usb", "-r", device_path], check=False)
            
            printer_url = device_path
            backend = "termux_usb"
        except FileNotFoundError:
            return jsonify({"error": "termux-usb not installed. Please run 'pkg install termux-api' and install the Termux:API app."}), 500
        except Exception as e:
            return jsonify({"error": f"Termux USB setup error: {e}"}), 500

    import base64

    try:
        from brother_ql.raster import BrotherQLRaster
        from brother_ql.backends.helpers import send
        from brother_ql.conversion import convert
        import barcode
        from barcode.writer import ImageWriter
    except ImportError:
        return jsonify({"error": "brother_ql or python-barcode not installed on server."}), 500

    # Map label_size to brother_ql label name
    label_map = {
        'dk1204': '17x54',
        'dk1209': '29x62',
        'dk1201': '29x90',
        'dk2205': '62',
    }
    label_name = label_map.get(label_size, '17x54')

    try:
        items = data.get('items')
        if not items:
            # Fallback for single item (legacy support)
            if data.get('image_data'):
                items = [data]
            else:
                add_log("Print failed: No items provided in request.", "ERROR")
                return jsonify({"error": "No items provided"}), 400

        total_qty = sum(int(item.get('quantity', 1)) for item in items)
        add_log(f"Preparing to print {total_qty} label(s) total ({len(items)} unique item(s)) on size {label_size} ({label_name})...")
        images_to_print = []
        for item in items:
            image_data = item.get('image_data')
            if not image_data: continue
            
            quantity = int(item.get('quantity', 1))
            if quantity < 1:
                quantity = 1

            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
            label_img = Image.open(io.BytesIO(image_bytes))
            # Save raw image for troubleshooting
            try:
                debug_img_path = os.path.join(DATA_DIR, 'last_print_image.png')
                label_img.save(debug_img_path)
                add_log(f"Saved debug print image to {debug_img_path} (size: {label_img.size})")
            except Exception as ex:
                add_log(f"Failed to save debug image: {ex}", "WARNING")
                
            if label_img.mode != 'RGB':
                label_img = label_img.convert('RGB')
                
            # Resize and rotate to exactly match expected printer dimensions
            try:
                from brother_ql.devicedependent import label_type_specs
                specs = label_type_specs.get(label_name)
                if specs:
                    expected_w, expected_h = specs['dots_printable']
                    if expected_h != 0:  # Die-cut label
                        # Frontend canvas is landscape (wide). Printer expects portrait (tall).
                        if label_img.width > label_img.height and expected_w < expected_h:
                            label_img = label_img.transpose(Image.ROTATE_270) # Name at top
                        label_img = label_img.resize((expected_w, expected_h), Image.LANCZOS)
                    else:
                        # Continuous roll
                        if label_img.width > label_img.height and expected_w > 0:
                            label_img = label_img.transpose(Image.ROTATE_270)
                        # scale height proportionally
                        ratio = expected_w / float(label_img.width)
                        new_h = int(label_img.height * ratio)
                        label_img = label_img.resize((expected_w, new_h), Image.LANCZOS)
            except Exception as e:
                add_log(f"Warning: Could not resize to specs: {e}", "WARNING")
                
            for _ in range(quantity):
                images_to_print.append(label_img)

        if not images_to_print:
            add_log("Print failed: No valid images found after decoding.", "ERROR")
            return jsonify({"error": "No valid images found"}), 400

        add_log(f"Sending print job with {len(images_to_print)} label(s) to {PRINTER_MODEL} via USB...")
        # Convert to brother_ql raster and send
        qlr = BrotherQLRaster(PRINTER_MODEL)
        instructions = convert(
            qlr=qlr,
            images=images_to_print,
            label=label_name,
            rotate='auto',
            threshold=70.0,
            dither=False,
            compress=False,
            red=False,
            dpi_600=False,
            hq=True,
            cut=True,
        )

        if data.get('webusb'):
            add_log(f"Returning {len(images_to_print)} labels as raw instructions for WebUSB frontend.")
            import base64
            b64_instructions = base64.b64encode(instructions).decode('utf-8')
            return jsonify({
                "message": f"Generated WebUSB payload for {len(images_to_print)} labels",
                "instructions": b64_instructions
            })

        if backend == "termux_usb":
            import tempfile, subprocess
            with tempfile.NamedTemporaryFile(delete=False, suffix='.bin') as tmp:
                tmp.write(instructions)
                tmp_path = tmp.name
                
            add_log(f"Executing Termux USB print transfer for {printer_url}...")
            wrapper_path = os.path.join(os.path.dirname(__file__), "print_wrapper.sh")
            res = subprocess.run(["termux-usb", "-e", f"{wrapper_path} {tmp_path}", printer_url], capture_output=True)
            
            # Clean up the temp instructions file
            os.remove(tmp_path)
            
            if res.returncode != 0:
                err_msg = res.stderr.decode('utf-8') if res.stderr else res.stdout.decode('utf-8')
                raise Exception(f"termux-usb execution failed: {err_msg}")
            
            out_msg = res.stdout.decode('utf-8')
            if "Success" not in out_msg:
                raise Exception(f"USB script failed: {out_msg}")
        else:
            try:
                from brother_ql.backends.helpers import send
                add_log(f"Sending via backend: {backend} to {printer_url}")
                send(instructions=instructions, printer_identifier=printer_url, backend_identifier=backend, blocking=True)
            except Exception as backend_err:
                add_log(f"Print error ({backend}): {backend_err}", "ERROR")
                raise backend_err

        success_msg = f"Successfully sent {len(images_to_print)} labels to {PRINTER_MODEL} via USB"
        add_log(success_msg)
        return jsonify({"message": success_msg})

    except Exception as e:
        add_log(f"Print job failed with error: {e}", "ERROR")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

#        .--.
#       |o_o |   <-- "I'm keeping the server running!"
#       |:_/ |
#      //   \ \
if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
