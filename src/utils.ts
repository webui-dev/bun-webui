// Bun WebUI
// Utilities

import { promises as fs } from "fs";
import { spawn } from "bun";

// The WebUI core version to download
const WebUICoreVersion = "2.5.0-beta.3";

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
 * Download a file from the Internet and save it to the destination.
 */
async function downloadFile(url: string, dest: string) {
  const res = await fetch(url);
  const fileData = new Uint8Array(await res.arrayBuffer());
  await fs.writeFile(dest, fileData);
}

/**
 * Run a system command.
 */
async function runCommand(cmd: string, args: string[]): Promise<void> {
  const process = Bun.spawn({
    cmd: [cmd, ...args],
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(`Command "${cmd}" failed with exit code ${exitCode}`);
  }
}

/**
 * Create a directory. Uses recursive mkdir.
 */
async function createDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Copy a file from srcPath to destPath, overwriting if necessary.
 */
async function copyFileOverwrite(srcPath: string, destPath: string) {
  try {
    await fs.rm(destPath);
  } catch (error) {
    if ((error as any).code !== "ENOENT") {
      throw error;
    }
  }
  await fs.copyFile(srcPath, destPath);
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
    }
    if (directory.startsWith("/")) {
      // Remove first '/'
      directory = directory.slice(1);
    }
    // Replace all forward slashes with backslashes for Windows paths
    directory = directory.replaceAll("/", "\\");
  }
  const pathSeparator = isWindows ? "\\" : "/";
  const lastIndex = directory.lastIndexOf(pathSeparator);
  directory = directory.substring(0, lastIndex + 1);
  if (directory === "") {
    return "." + pathSeparator;
  }
  if (directory.startsWith("/x/")) {
    return "." + pathSeparator + directory.slice(1).replace(/\//g, pathSeparator);
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
  const cacheDir = joinPath(currentModulePath, "cache");
  const fileName = `webui-${os}-${cc}-${arch}`;
  const fileUrl = `${baseUrl}${fileName}.zip`;
  const outputDir = joinPath(currentModulePath, fileName);

  // Create cache directory
  await createDirectory(cacheDir);

  // Download the archive
  const zipPath = joinPath(cacheDir, `${fileName}.zip`);
  await downloadFile(fileUrl, zipPath);

  // Extract the archive
  if (process.platform === "win32") {
    await runCommand("tar", ["-xf", zipPath, "-C", cacheDir]);
  } else {
    await runCommand("unzip", ["-o", "-q", zipPath, "-d", cacheDir]);
  }

  // Copy library
  const libFile = process.platform === "win32" ? `webui-2.${ext}` : `libwebui-2.${ext}`;
  await createDirectory(outputDir);
  await copyFileOverwrite(joinPath(cacheDir, fileName, libFile), joinPath(outputDir, libFile));

  // Remove cache directory
  await fs.rm(cacheDir, { recursive: true, force: true });
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

export class WebUIError extends Error {}
