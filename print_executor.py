#!/usr/bin/env python3
import sys
import ctypes
import traceback

def main():
    if len(sys.argv) < 4:
        print("Usage: print_executor.py <print_job.bin> <device_path> <fd>")
        sys.exit(1)
        
    job_file = sys.argv[1]
    device_path = sys.argv[2]
    fd = int(sys.argv[3])
    
    with open(job_file, 'rb') as f:
        instructions = f.read()
        
    try:
        import usb.backend.libusb1
        backend = usb.backend.libusb1.get_backend()
        if not backend:
            print("No libusb1 backend found.")
            sys.exit(1)
            
        libusb = backend.lib
        
        # Define libusb_wrap_sys_device
        libusb.libusb_wrap_sys_device.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.POINTER(ctypes.c_void_p)]
        libusb.libusb_wrap_sys_device.restype = ctypes.c_int
        
        dev_handle = ctypes.c_void_p()
        res = libusb.libusb_wrap_sys_device(backend.ctx, fd, ctypes.byref(dev_handle))
        if res != 0:
            print(f"Failed wrap_sys_device: {res}")
            sys.exit(1)
            
        # Define claim and release
        libusb.libusb_claim_interface.argtypes = [ctypes.c_void_p, ctypes.c_int]
        libusb.libusb_claim_interface(dev_handle, 0)
        
        libusb.libusb_release_interface.argtypes = [ctypes.c_void_p, ctypes.c_int]
        
        # Define bulk_transfer
        libusb.libusb_bulk_transfer.argtypes = [ctypes.c_void_p, ctypes.c_ubyte, ctypes.c_void_p, ctypes.c_int, ctypes.POINTER(ctypes.c_int), ctypes.c_uint]
        libusb.libusb_bulk_transfer.restype = ctypes.c_int
        
        actual_length = ctypes.c_int()
        data_buffer = ctypes.create_string_buffer(instructions)
        
        success = False
        # Try common OUT endpoints (0x01 to 0x06)
        for ep in [0x01, 0x02, 0x03, 0x04, 0x05, 0x06]:
            res = libusb.libusb_bulk_transfer(dev_handle, ep, data_buffer, len(instructions), ctypes.byref(actual_length), 5000)
            if res == 0:
                print(f"Success! Sent {actual_length.value} bytes on EP {ep}")
                success = True
                break
            elif res == -9: # LIBUSB_ERROR_PIPE
                pass # Not the right endpoint, continue trying
            elif res == -1: # LIBUSB_ERROR_IO
                pass 
                
        libusb.libusb_release_interface(dev_handle, 0)
        
        if not success:
            print("Failed to send bulk transfer on any OUT endpoint.")
            sys.exit(1)
            
    except Exception as e:
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
