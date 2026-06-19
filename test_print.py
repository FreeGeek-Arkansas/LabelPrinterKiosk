from brother_ql.raster import BrotherQLRaster
from brother_ql.backends.helpers import send
from brother_ql.conversion import convert
from PIL import Image

qlr = BrotherQLRaster('QL-720NW')
img = Image.new('RGB', (165, 566), color='white')
instructions = convert(
    qlr=qlr,
    images=[img],
    label='17x54',
    rotate='auto',
    threshold=70.0,
    dither=False,
    compress=False,
    red=False,
    dpi_600=False,
    hq=True,
    cut=True,
)

try:
    send(instructions=instructions, printer_identifier='usb://0x04f9:0x2044', backend_identifier='pyusb', blocking=True)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
