import { CString, ptr } from "bun:ffi";
/**
 * Convert a String to C-String.
 * @param {string} value
 * @returns a char[].
 */
export function toCString(value: string): CString {
  const u8_arr = new TextEncoder().encode(value + "\0");
  const str_ptr = ptr(u8_arr);
  return new CString(str_ptr);
}
