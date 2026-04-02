// Bun WebUI
// Utilities

import { promises as fs } from "fs";
import { homedir } from "os";
import { resolve } from "path";
import AdmZip from "adm-zip";

// The WebUI core version to download
// const WebUICoreVersion = "2.5.0-beta.3";

/**
 * Combine paths using the OS-specific separator.
 * Replaces multiple separators with a single one.
 */
function joinPath(...segments: string[]): string {
  const isWindows = process.platform === "win32";
  const separator = isWindows ? "\\" : "/";
  const joinedPath = segments.join(separator).replace(/[\/\\]+/g, separator);
  return joinedPath;
}

/**
 * Create a directory. Uses recursive mkdir.
 */
async function createDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Get current module full folder path.
 */
export const currentModulePath = (() => {
  let directory = new URL(import.meta.url).pathname;
  const isWindows = process.platform === "win32";
  if (isWindows) {
    if (directory.startsWith("/B:/%7EBUN/") && directory.endsWith(".exe")) {
      directory = Bun.pathToFileURL("./dist.exe").pathname;
      //Handling special characters
      directory = decodeURIComponent(directory);
    }
    if (directory.startsWith("/")) {
      // Remove first '/'
      directory = directory.slice(1);
    }
    // Replace all forward slashes with backslashes for Windows paths
    directory = directory.replaceAll("/", "\\");
  }

  // hacky fix for EACCESS when being used in a single-file-executable in Bun
  if (directory.includes("$bunfs")) {
    // Redirect to a fallback directory'
    directory = resolve(homedir(), ".bun-webui");
    try {
      createDirectory(directory)
    } catch {/* it probably already exists. */ }
  }

  const pathSeparator = isWindows ? "\\" : "/";
  const lastIndex = directory.lastIndexOf(pathSeparator);

  // Remove any trailing part after the last path separator
  directory = directory.substring(0, lastIndex + 1);

  if (directory === "") {
    return `.${pathSeparator}`;
  }

  if (directory.startsWith("/x/")) {
    return `.${pathSeparator}${directory.slice(1).replace(/\//g, pathSeparator)}`;
  }

  return directory;
})();

/**
 * Check if a file exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Download the core WebUI library.
 */
export async function downloadCoreLibrary() {
  // Base URL
  // const baseUrl = `https://github.com/webui-dev/webui/releases/download/${WebUICoreVersion}/`;
  const baseUrl = `https://github.com/webui-dev/webui/releases/download/nightly/`;
  // Detect OS
  let os: string, cc: string, ext: string;
  if (process.platform === "darwin") {
    os = "macos";
    cc = "clang";
    ext = "dylib";
  } else if (process.platform === "win32") {
    os = "windows";
    cc = "msvc";
    ext = "dll";
  } else {
    os = "linux";
    cc = "gcc";
    ext = "so";
  }
  // Detect Architecture
  const archMap: Record<string, string> = {
    "x86": "x86",
    "x64": "x64",
    "arm": "arm",
    "arm64": "arm64",
  };
  const arch = archMap[process.arch];
  if (!arch) {
    console.error(`Error: Unsupported architecture '${process.arch}'`);
    return;
  }

  // Construct file name and download URL
  const fileName = `webui-${os}-${cc}-${arch}`;
  const fileUrl = `${baseUrl}${fileName}.zip`;
  const outputDir = joinPath(currentModulePath, fileName);
  const libFile = process.platform === "win32" ? `webui-2.${ext}` : `libwebui-2.${ext}`;

  // Download the archive into memory
  const res = await fetch(fileUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  // Extract only the library file directly to outputDir
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry(`${fileName}/${libFile}`);
  if (!entry) {
    throw new Error(`Library not found in archive: ${fileName}/${libFile}`);
  }
  await createDirectory(outputDir);
  zip.extractEntryTo(entry, outputDir, false, true);
}

/**
 * Convert a string to a C-style string (null-terminated).
 */
export function toCString(value: string): Uint8Array {
  return new TextEncoder().encode(value + "\0");
}

/**
 * Convert a C-style string (Uint8Array) to a JavaScript string.
 */
export function fromCString(value: Uint8Array): string {
  const end = value.findIndex((byte) => byte === 0x00);
  return new TextDecoder().decode(value.slice(0, end));
}

export class WebUIError extends Error { }
