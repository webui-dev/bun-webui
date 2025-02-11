/*
  WebUI Bun 2.5.1
  http://webui.me
  https://github.com/webui-dev/bun-webui
  Copyright (c) 2020-2025 Hassan Draga.
  Licensed under MIT License.
  All rights reserved.
  Canada.
*/

import { CString } from "bun:ffi";
import { loadLib } from "./lib.ts";
import {
  BindCallback,
  BindFileHandlerCallback,
  Datatypes,
  Usize,
  WebUIEvent,
  WebUILib,
} from "./types.ts";
import { fromCString, toCString, WebUIError } from "./utils.ts";

// Register windows to bind instance to WebUI.Event
const windows: Map<Usize, WebUI> = new Map();

// Global lib entry
let _lib: WebUILib;

// Bun Worker
// Since Bun is not fully thread-safe, making WebUI calling `.bind()` cause Bun to crash, so instead
// we should use workers with option `threadsafe: true`.
//
// This is how it work:
//  [UserFunction] --> [Bind] --> [Worker] -> [WebUI]
//  [WebUI] --> [Worker] --> [ffiWorker.onmessage] --> [UserFunction]

const ffiWorker = new Worker(new URL("./ffi_worker.ts", import.meta.url).href, { type: "module" });
const pendingResponses = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();
let callbackRegistry: BindCallback<any>[] = [];
let callbackFileHandlerRegistry: BindFileHandlerCallback<any>[] = [];
ffiWorker.onmessage = async (event: MessageEvent) => {
  const { id, action, result, error, data } = event.data;
  if (action === "invokeCallback") {
    const {
      callbackIndex,
      param_window,
      param_event_type,
      param_element,
      param_event_number,
      param_bind_id
    } = data;
    const callbackFn = callbackRegistry[callbackIndex];
    if (typeof callbackFn !== "undefined") {

      // Window
      const win = param_window;

      // Event Type
      const event_type =
        typeof param_event_type === "bigint"
          ? Number(param_event_type)
          : Math.trunc(param_event_type);

      // Element
      const element =
        param_element !== null
          ? new CString(param_element)
          : "";

      // Event Number
      const event_number =
        typeof param_event_number === "bigint"
          ? Number(param_event_number)
          : Math.trunc(param_event_number);

      // Bind ID
      const bind_id =
        typeof param_bind_id === "bigint"
          ? Number(param_bind_id)
          : Math.trunc(param_bind_id);
          
      // Arguments
      const args = {
        number: (index: number): number => {
          return Number(_lib.symbols.webui_interface_get_int_at(BigInt(win), BigInt(event_number), BigInt(index)));
        },
        string: (index: number): string => {
          return new CString(
            _lib.symbols.webui_interface_get_string_at(BigInt(win), BigInt(event_number), BigInt(index))
          );
        },
        boolean: (index: number): boolean => {
          return _lib.symbols.webui_interface_get_bool_at(BigInt(win), BigInt(event_number), BigInt(index));
        },
      };

      // Calling user callback
      const e: WebUIEvent = {
        window: windows.get(win)!,
        eventType: event_type,
        eventNumber: event_number,
        element: element,
        arg: args,
      };
      const result: string = (await callbackFn(e) as string) ?? '';

      // Set response back to WebUI
      _lib.symbols.webui_interface_set_response(
        BigInt(win),
        BigInt(event_number),
        toCString(result),
      );
    }
  } else if (action === "invokeFileHandler") {
    const {
      callbackIndex,
      windowId,
      param_url,
      param_length
    } = data;
    const callbackFileHandlerFn = callbackFileHandlerRegistry[callbackIndex];
    if (typeof callbackFileHandlerFn !== "undefined") {

      // Get URL as string
      const url_str :string = param_url !== null ? 
      new CString(param_url) : "";

      // Create URL Obj
      const url_obj :URL = new URL(url_str, "http://localhost");

      // Call the user callback
      const user_response: string|Uint8Array = await callbackFileHandlerFn(url_obj);

      // We can pass a local buffer to WebUI like this: 
      // `return user_response;` However, this may create 
      // a memory leak because WebUI cannot free it, or cause
      // memory corruption as Bun may free the buffer before 
      // WebUI uses it. Therefore, the solution is to create 
      // a safe WebUI buffer through WebUI API. This WebUI 
      // buffer will be automatically freed by WebUI later.
      const webui_ptr :number = _lib.symbols.webui_malloc(BigInt(user_response.length));

      // Copy data to C safe buffer
      if (typeof user_response === "string") {
        // copy `user_response` to `webui_ptr` as String data
        const cString = toCString(user_response);
        _lib.symbols.webui_memcpy(webui_ptr, cString, BigInt(cString.length));
      } else {
        // copy `user_response` to `webui_ptr` as Uint8Array data
        _lib.symbols.webui_memcpy(webui_ptr, user_response, BigInt(user_response.length));
      }

      // Send back the response
      _lib.symbols.webui_interface_set_response_file_handler(
        BigInt(windowId),
        webui_ptr,
        BigInt(user_response.length),
      );
    }
  } else if (id) {
    const pending = pendingResponses.get(id);
    if (pending) {
      if (error) pending.reject(error);
      else pending.resolve(result);
      pendingResponses.delete(id);
    }
  }
};

function postToWorker(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString();
    message.id = id;
    pendingResponses.set(id, { resolve, reject });
    ffiWorker.postMessage(message);
  });
}

// WebUI Class

export class WebUI {
  #window: Usize = 0;
  #lib: WebUILib;
  #isFileHandler: boolean = false;

  /**
   * Instantiate a new WebUI window.
   */
  constructor() {
    WebUI.init(); // Init lib if not already initialized
    this.#lib = _lib;
    this.#window = _lib.symbols.webui_new_window();
    windows.set(BigInt(this.#window), this);
  }

  /**
   * Set root folder for proper loading resources.
   */
  setRootFolder(rootFolder: string) {
    const status = this.#lib.symbols.webui_set_root_folder(
      BigInt(this.#window),
      toCString(rootFolder),
    );
    if (!status) {
      throw new WebUIError(`unable to set root folder`);
    }
  }

  /**
   * Show the window or update the UI with the new content.
   */
  async show(content: string) {
    const status = this.#lib.symbols.webui_show(
      BigInt(this.#window),
      toCString(content),
    );
    if (!this.#isFileHandler) {
      // Check if window is launched
      if (!status) {
        throw new WebUIError(`unable to start the browser`);
      }
      // Wait for window connection (max 30 seconds)
      for (let i = 0; i < 120; i++) {
        if (!this.isShown) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        } else {
          break;
        }
      }
      // Check if window is connected
      if (!this.isShown) {
        throw new WebUIError(`unable to connect to the browser`);
      }
    }
  }

  /**
   * Show the window or update the UI with new content using a specific browser.
   */
  async showBrowser(content: string, browser: WebUI.Browser) {
    const status = this.#lib.symbols.webui_show_browser(
      BigInt(this.#window),
      toCString(content),
      BigInt(browser),
    );
    if (!status) {
      throw new WebUIError(`unable to start the browser`);
    }
    for (let i = 0; i < 120; i++) {
      if (!this.isShown) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      } else {
        break;
      }
    }
    if (!this.isShown) {
      throw new WebUIError(`unable to connect to the browser`);
    }
  }

  /**
   * Checks if the window is currently running.
   */
  get isShown() {
    return this.#lib.symbols.webui_is_shown(BigInt(this.#window));
  }

  /**
   * Closes the current window.
   */
  close() {
    return this.#lib.symbols.webui_close(BigInt(this.#window));
  }

  /**
   * Execute a JavaScript string in the UI and return a Promise with the client response.
   */
  script(
    script: string,
    options?: {
      timeout?: number;
      bufferSize?: number;
    },
  ) {
    const bufferSize =
      options?.bufferSize && options.bufferSize > 0 ? options.bufferSize : 1024 * 1000;
    const buffer = new Uint8Array(bufferSize);
    const timeout = options?.timeout ?? 0;

    const status = this.#lib.symbols.webui_script(
      BigInt(this.#window),
      toCString(script),
      BigInt(timeout),
      buffer,
      BigInt(bufferSize),
    );

    const response = fromCString(buffer);

    if (status) {
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }

  /**
   * Execute a JavaScript string in the UI for a specific client.
   */
  scriptClient(
    e: WebUIEvent,
    script: string,
    options?: {
      timeout?: number;
      bufferSize?: number;
    },
  ) {
    const bufferSize =
      options?.bufferSize && options.bufferSize > 0 ? options.bufferSize : 1024 * 1000;
    const buffer = new Uint8Array(bufferSize);
    const timeout = options?.timeout ?? 0;

    const status = this.#lib.symbols.webui_interface_script_client(
      BigInt(this.#window),
      BigInt(e.eventNumber),
      toCString(script),
      BigInt(timeout),
      buffer,
      BigInt(bufferSize),
    );

    const response = fromCString(buffer);

    if (status) {
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }

  /**
   * Execute a JavaScript string in the UI without waiting for the result.
   */
  run(script: string) {
    this.#lib.symbols.webui_run(
      BigInt(this.#window),
      toCString(script),
    );
  }

  /**
   * Bind a callback function to an HTML element.
   */
  bind<T extends Datatypes | undefined | void>(
    id: string,
    callback: BindCallback<T>,
  ) {
    // Save the user callback function in the registry and obtain its index.
    const index = callbackRegistry.push(callback) - 1;
    // Send a message to the worker with callback index.
    postToWorker({
      action: "bind",
      data: {
        windowId: this.#window.toString(),
        elementId: id,
        callbackIndex: index,
      },
    }).catch((error) => {
      throw new WebUIError("Binding callback failed: " + error);
    });
  }

  /**
   * Sets a custom files handler to respond to HTTP requests.
   */
  setFileHandler(callback: (url: URL) => Promise<string | Uint8Array>) {
    // C: .show_wait_connection = false; // 0
    // Disable `.show()` auto waiting for window connection,
    // otherwise `.setFileHandler()` will be blocked.
    _lib.symbols.webui_set_config(BigInt(0), false);

    // C: .use_cookies = false; // 4
    // We need to disable WebUI Cookies because
    // user will use his own custom HTTP header
    // in `.setFileHandler()`.
    _lib.symbols.webui_set_config(BigInt(4), false);

    // Let `.show()` knows that the user is using `.setFileHandler()`
    // so no need to wait for window connection in `.show()`.
    this.#isFileHandler = true;

    // Save the user callback function in the registry and obtain its index.
    const index = callbackFileHandlerRegistry.push(callback) - 1;
    // Send a message to the worker with callback index.
    postToWorker({
      action: "setFileHandler",
      data: {
        windowId: this.#window.toString(),
        callbackIndex: index,
      },
    }).catch((error) => {
      throw new WebUIError("Setting file handler failed: " + error);
    });
  }

  /**
   * Sets the profile name and path for the current window.
   */
  setProfile(name: string, path: string) {
    return this.#lib.symbols.webui_set_profile(
      BigInt(this.#window),
      toCString(name),
      toCString(path),
    );
  }

  /**
   * Set the kiosk mode of a WebUI window.
   */
  setKiosk(status: boolean): void {
    this.#lib.symbols.webui_set_kiosk(BigInt(this.#window), status);
  }

  /**
   * Close a specific window and free all memory resources.
   */
  destroy(): void {
    this.#lib.symbols.webui_destroy(BigInt(this.#window));
  }

  /**
   * Set the default embedded HTML favicon.
   */
  setIcon(icon: string, iconType: string): void {
    this.#lib.symbols.webui_set_icon(
      BigInt(this.#window),
      toCString(icon),
      toCString(iconType),
    );
  }

  /**
   * Safely send raw data to the UI.
   */
  sendRaw(functionName: string, raw: Uint8Array): void {
    this.#lib.symbols.webui_send_raw(
      BigInt(this.#window),
      toCString(functionName),
      raw,
      BigInt(raw.length),
    );
  }

  /**
   * Set a window in hidden mode. Should be called before .show().
   */
  setHide(status: boolean): void {
    this.#lib.symbols.webui_set_hide(BigInt(this.#window), status);
  }

  /**
   * Set the window size.
   */
  setSize(width: number, height: number): void {
    this.#lib.symbols.webui_set_size(BigInt(this.#window), width, height);
  }

  /**
   * Set the window position.
   */
  setPosition(x: number, y: number): void {
    this.#lib.symbols.webui_set_position(BigInt(this.#window), x, y);
  }

  /**
   * Get the full current URL.
   */
  getUrl(): string {
    return new CString(
      this.#lib.symbols.webui_get_url(BigInt(this.#window))
    );
  }

  /**
   * Allow the window address to be accessible from a public network.
   */
  setPublic(status: boolean): void {
    this.#lib.symbols.webui_set_public(BigInt(this.#window), status);
  }

  /**
   * Navigate to a specific URL.
   */
  navigate(url: string): void {
    this.#lib.symbols.webui_navigate(BigInt(this.#window), toCString(url));
  }

  /**
   * Delete the web-browser local profile folder.
   */
  deleteProfile(): void {
    this.#lib.symbols.webui_delete_profile(BigInt(this.#window));
  }

  /**
   * Get the ID of the parent process.
   */
  getParentProcessId(): BigInt {
    return this.#lib.symbols.webui_get_parent_process_id(BigInt(this.#window));
  }

  /**
   * Get the ID of the last child process.
   */
  getChildProcessId(): number {
    return Number(this.#lib.symbols.webui_get_child_process_id(BigInt(this.#window)));
  }

  /**
   * Set a custom web-server network port to be used by WebUI.
   */
  setPort(port: number): boolean {
    return this.#lib.symbols.webui_set_port(BigInt(this.#window), BigInt(port));
  }

  /**
   * Choose between Bun and Node.js as runtime for .js and .ts files.
   */
  setRuntime(runtime: number): void {
    this.#lib.symbols.webui_set_runtime(BigInt(this.#window), BigInt(runtime));
  }

  /**
   * Get the recommended web browser ID to use.
   */
  getBestBrowser(): number {
    return Number(this.#lib.symbols.webui_get_best_browser(BigInt(this.#window)));
  }

  /**
   * Start only the web server and return the URL. No window will be shown.
   */
  startServer(content: string): string {
    return fromCString(
      this.#lib.symbols.webui_start_server(BigInt(this.#window), toCString(content))
    );
  }

  /**
   * Show a WebView window using embedded HTML or a file.
   */
  showWebView(content: string): boolean {
    return this.#lib.symbols.webui_show_wv(
      BigInt(this.#window),
      toCString(content),
    );
  }

  /**
   * Add a user-defined web browser's CLI parameters.
   */
  setCustomParameters(params: string): void {
    this.#lib.symbols.webui_set_custom_parameters(
      BigInt(this.#window),
      toCString(params),
    );
  }

  /**
   * Set high-contrast support for the window.
   */
  setHighContrast(status: boolean): void {
    this.#lib.symbols.webui_set_high_contrast(BigInt(this.#window), status);
  }

  /**
   * Set the window minimum size.
   */
  setMinimumSize(width: number, height: number): void {
    this.#lib.symbols.webui_set_minimum_size(BigInt(this.#window), width, height);
  }

  /**
   * Set the web browser proxy server to use.
   */
  setProxy(proxyServer: string): void {
    this.#lib.symbols.webui_set_proxy(
      BigInt(this.#window),
      toCString(proxyServer),
    );
  }

  // Static methods

  /**
   * Get OS high contrast preference.
   */
  static isHighContrast(): boolean {
    WebUI.init();
    return _lib.symbols.webui_is_high_contrast();
  }

  /**
   * Check if a web browser is installed.
   */
  static browserExist(browser: WebUI.Browser): boolean {
    WebUI.init();
    return _lib.symbols.webui_browser_exist(BigInt(browser));
  }

  /**
   * Set the web-server root folder path for all windows.
   */
  static setDefaultRootFolder(path: string): boolean {
    WebUI.init();
    return _lib.symbols.webui_set_default_root_folder(toCString(path));
  }

  /**
   * Open an URL in the native default web browser.
   */
  static openUrl(url: string): void {
    WebUI.init();
    _lib.symbols.webui_open_url(toCString(url));
  }

  /**
   * Get an available free network port.
   */
  static getFreePort(): number {
    WebUI.init();
    return Number(_lib.symbols.webui_get_free_port());
  }

  /**
   * Automatically refresh the window UI when any file in the root folder changes.
   */
  static setFolderMonitor(status: boolean): void {
    WebUI.init();
    _lib.symbols.webui_set_config(BigInt(2), status);
  }

  /**
   * Initialize the WebUI library if it's not already initialized.
   */
  private static init() {
    if (typeof _lib === "undefined") {
      _lib = loadLib();
      // Enable asynchronous responses for callbacks.
      _lib.symbols.webui_set_config(BigInt(5), true);
    }
  }

  /**
   * Close all opened windows and break WebUI.wait().
   */
  static exit() {
    WebUI.init();
    _lib.symbols.webui_exit();
  }

  /**
   * Set TLS certificate and private key.
   */
  static setTLSCertificate(certificatePem: string, privateKeyPem: string) {
    WebUI.init();
    const status = _lib.symbols.webui_set_tls_certificate(
      toCString(certificatePem),
      toCString(privateKeyPem),
    );
    if (!status) {
      throw new WebUIError(`unable to set certificate`);
    }
  }

  /**
   * Wait until all opened windows are closed.
   */
  static async wait() {
    WebUI.init();
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    while (1) {
      await sleep(100);
      if (!_lib.symbols.webui_interface_is_app_running()) {
        break;
      }
    }
  }

  /**
   * Allow multiple clients to connect to the same window.
   */
  static setMultiClient(allow: boolean): void {
    WebUI.init();
    _lib.symbols.webui_set_config(BigInt(3), allow);
  }

  /**
   * Delete all local web-browser profiles.
   */
  static deleteAllProfiles(): void {
    WebUI.init();
    _lib.symbols.webui_delete_all_profiles();
  }

  /**
   * Base64 encoding.
   */
  static encode(str: string): string {
    WebUI.init();
    return new CString(
      _lib.symbols.webui_encode(toCString(str))
    );
  }

  /**
   * Base64 decoding.
   */
  static decode(str: string): string {
    WebUI.init();
    return new CString(
      _lib.symbols.webui_decode(toCString(str))
    );
  }

  /**
   * Safely allocate memory using WebUI's memory management.
   */
  static malloc(size: number): any {
    WebUI.init();
    return _lib.symbols.webui_malloc(BigInt(size));
  }

  /**
   * Safely free a memory block allocated by WebUI.
   */
  static free(ptr: any): void {
    WebUI.init();
    _lib.symbols.webui_free(ptr);
  }

  /**
   * Set the maximum time (in seconds) to wait for the browser to start.
   */
  static setTimeout(second: number): void {
    WebUI.init();
    _lib.symbols.webui_set_timeout(BigInt(second));
  }

  /**
   * Clean all memory resources. WebUI is not usable after this call.
   */
  static clean() {
    WebUI.init();
    _lib.symbols.webui_clean();
  }

  static get version() {
    return "2.5.1";
  }
}

// Namespace for additional types and enums.
export namespace WebUI {
  export type Event = WebUIEvent;
  export enum Browser {
    NoBrowser = 0,
    AnyBrowser,
    Chrome,
    Firefox,
    Edge,
    Safari,
    Chromium,
    Opera,
    Brave,
    Vivaldi,
    Epic,
    Yandex,
    ChromiumBased,
  }
  export enum EventType {
    Disconnected = 0,
    Connected,
    MouseClick,
    Navigation,
    Callback,
  }
}
