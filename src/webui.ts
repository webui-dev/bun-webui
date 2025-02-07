/*
  WebUI Bun 2.5.0
  http://webui.me
  https://github.com/webui-dev/bun-webui
  Copyright (c) 2020-2025 Hassan Draga.
  Licensed under MIT License.
  All rights reserved.
  Canada.
*/

import { dlopen, JSCallback } from "bun:ffi";
import { loadLib } from "./lib.ts";
import {
  BindCallback,
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
    // Create the callback using Bun's JSCallback API.
    const callbackResource = new JSCallback(
      (
        param_window: number | bigint,
        param_event_type: number | bigint,
        param_element: any,
        param_event_number: number | bigint,
        param_bind_id: number | bigint,
      ) => {
        console.log("*** Bun Callback Worked ! ***");

        // TODO: Uncomment this section after fixing Bun callback issue

        // const win = param_window;
        // const event_type =
        //   typeof param_event_type === "bigint"
        //     ? Number(param_event_type)
        //     : Math.trunc(param_event_type);
        // const element =
        //   param_element !== null
        //     ? new Bun.UnsafePointerView(param_element).getCString()
        //     : "";
        // const event_number =
        //   typeof param_event_number === "bigint"
        //     ? Number(param_event_number)
        //     : Math.trunc(param_event_number);
        // const bind_id =
        //   typeof param_bind_id === "bigint"
        //     ? Number(param_bind_id)
        //     : Math.trunc(param_bind_id);

        // const args = {
        //   number: (index: number): number => {
        //     return Number(this.#lib.symbols.webui_interface_get_int_at(BigInt(win), BigInt(event_number), BigInt(index)));
        //   },
        //   string: (index: number): string => {
        //     return new Bun.UnsafePointerView(
        //       this.#lib.symbols.webui_interface_get_string_at(BigInt(win), BigInt(event_number), BigInt(index))
        //     ).getCString();
        //   },
        //   boolean: (index: number): boolean => {
        //     return this.#lib.symbols.webui_interface_get_bool_at(BigInt(win), BigInt(event_number), BigInt(index));
        //   },
        // };

        // const e: WebUIEvent = {
        //   window: windows.get(win)!,
        //   eventType: event_type,
        //   eventNumber: event_number,
        //   element: element,
        //   arg: args,
        // };

        // const result: string = (callback(e) as string) ?? "";
        // this.#lib.symbols.webui_interface_set_response(
        //   BigInt(this.#window),
        //   BigInt(event_number),
        //   toCString(result),
        // );
      },
      {
        returns: "void",
        args: ["usize", "usize", "pointer", "usize", "usize"],
      },
    );
    // Pass the callback pointer to WebUI.
    this.#lib.symbols.webui_interface_bind(
      BigInt(this.#window),
      toCString(id),
      callbackResource,
    );
  }

  /**
   * Sets a custom files handler to respond to HTTP requests.
   */
  setFileHandler(callback: (url: URL) => string | Uint8Array) {
    // Disable auto waiting for window connection.
    _lib.symbols.webui_set_config(BigInt(0), false);
    // Disable WebUI cookies.
    _lib.symbols.webui_set_config(BigInt(4), false);
    // Mark that a custom file handler is in use.
    this.#isFileHandler = true;

    const callbackResource = new JSCallback(
      (param_url: any, param_length: any) => {
        const url_str: string =
          param_url !== null
            ? new Bun.UnsafePointerView(param_url).getCString()
            : "";
        const url_obj: URL = new URL(url_str, "http://localhost");
        const user_response: string | Uint8Array = callback(url_obj);

        const webui_buffer: any = _lib.symbols.webui_malloc(BigInt(user_response.length));

        if (typeof user_response === "string") {
          const cString = toCString(user_response);
          const webui_buffer_ref = new Uint8Array(
            Bun.UnsafePointerView.getArrayBuffer(webui_buffer, cString.byteLength)
          );
          webui_buffer_ref.set(new Uint8Array(cString));
        } else {
          const webui_buffer_ref = new Uint8Array(
            Bun.UnsafePointerView.getArrayBuffer(webui_buffer, user_response.byteLength)
          );
          webui_buffer_ref.set(user_response);
        }

        this.#lib.symbols.webui_interface_set_response_file_handler(
          BigInt(this.#window),
          webui_buffer,
          BigInt(user_response.length),
        );
        return webui_buffer;
      },
      {
        returns: "pointer",
        args: ["pointer", "pointer"],
      },
    );
    // Pass the callback pointer to WebUI.
    this.#lib.symbols.webui_set_file_handler(
      BigInt(this.#window),
      callbackResource,
    );
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
    return new Bun.UnsafePointerView(
      this.#lib.symbols.webui_get_url(BigInt(this.#window))
    ).getCString();
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
    return new Bun.UnsafePointerView(
      _lib.symbols.webui_encode(toCString(str))
    ).getCString();
  }

  /**
   * Base64 decoding.
   */
  static decode(str: string): string {
    WebUI.init();
    return new Bun.UnsafePointerView(
      _lib.symbols.webui_decode(toCString(str))
    ).getCString();
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
    return "2.5.0";
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
