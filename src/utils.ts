import { CString, ptr, type Pointer } from "bun:ffi";
import os from "os";
import path from "path";

/**
 * Convert a String to C-String.
 * @param {string} value
 * @returns a char[].
 */
export function toCString(value: string): CString {
  const u8_arr = new TextEncoder().encode(value + "\0");
  const str_ptr = ptr(u8_arr, 0);
  return new CString(str_ptr, 0, u8_arr.byteLength);
}

/**
 * convert array to a pointer.
 * @param {ArrayBuffer} array
 * @returns pointer
 */
export function arrayToPtr(array: NodeJS.TypedArray | ArrayBufferLike) {
  return ptr(array, 0);
}

export let lib_path = "";

const current_path = import.meta.dir;

switch (os.platform()) {
  case "linux":
    lib_path = path.join(current_path, "libs", "libwebui.so");
    break;

  case "win32":
    lib_path = path.join(current_path, "libs", "webui.dll");
    break;

  case "darwin":
    lib_path = path.join(current_path, "libs", "libwebui.dylib");
    break;

  default:
    console.log("sorry, not support current platform");
    process.exit(1);
}
