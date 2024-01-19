import { CString, ptr, type Pointer } from "bun:ffi";

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
export function arrayToPtr(array: ArrayBuffer) {
  return ptr(array, 0);
}
