import {
  Event,
  webui,
  BindCallback,
  SetFileHandlerCallbak,
  Browsers,
  Runtimes,
  InterfaceBindCallback,
} from "./types";
import { arrayToPtr, toCString } from "./utils";

// Max windows, servers and threads
const WEBUI_MAX_IDS = 256;

const windows: Map<number, WebUI> = new Map();

export class WebUI {
  private _handle: number;

  get handle() {
    return this._handle;
  }

  /**
   *
   * initialize a new WebUI window.
   *
   * @returns WebUI instance.
   * @example
   * ```ts
   * const myWindow = new WebUI();
   * ```
   */
  constructor();

  /**
   *
   * initialize a new WebUI window.
   *
   * @param number window handle id
   * @returns WebUI instance.
   * @example
   * ```ts
   * const myWindow = new WebUI(1);
   * ```
   */
  constructor(handle: number);

  constructor(arg?: number) {
    if (typeof arg === "number") {
      if (arg <= 0 || arg >= WEBUI_MAX_IDS) {
        // TODO: this should be error handle
      }
      const handle = webui.webui_new_window_id(arg);
      this._handle = Number(handle);
    } else {
      const handle = webui.webui_new_window();
      this._handle = Number(handle);
    }
    windows.set(this._handle, this);
  }

  /**
   *
   * get a valid window id.
   *
   * @returns window is.
   * @example
   * ```ts
   * const id = WebUI.getNewWindowsID();
   * ```
   */
  static getNewWindowsID(): number {
    const n = webui.webui_get_new_window_id();
    return Number(n);
  }

  /**
   *
   * Bind a specific html element click event with a function.
   * Empty element means all events.
   *
   * @param element The HTML ID
   * @param BindCallback callback
   * @return Returns a unique bind ID.
   * @example
   * ```ts
   * const bind_id = myWindow.bind("myID", callback);
   * ```
   */
  bind(element: string, callback: BindCallback): number {
    const cstring = toCString(element);

    const bind_id = webui.webui_bind(this._handle, cstring.ptr, callback.ptr);
    return Number(bind_id);
  }

  /**
   *
   * Show a window using embedded HTML, or a file.
   * If the window is already open, it will be refreshed.
   *
   * @param string The HTML, URL, Or a local file
   * @return Returns True if showing the window is successed.
   * @example
   * ```ts
   * const is_successed = myWindow1.show("<html>...</html>");
   * const is_successed = myWindow2.show("index.html");
   * const is_successed = myWindow3.show("http://...");
   * ```
   */
  show(content: string): boolean {
    const tmp_content = toCString(content);
    return webui.webui_show(this._handle, tmp_content.ptr);
  }

  /**
   *
   * Same as `show()`. But using a specific web browser
   *
   * @param string The HTML, URL, Or a local file
   * @param Browsers The web browser to be used
   * @return Returns True if showing the window is successed.
   * @example
   * ```ts
   * const is_successed = myWindow1.show("<html>...</html>", Browsers.Chrome);
   * const is_successed = myWindow2.show("index.html", Browsers.Chrome);
   * const is_successed = myWindow3.show("http://...", Browsers.Chrome);
   * ```
   */
  showBrowser(content: string, browser: Browsers): boolean {
    const tmp_content = toCString(content);
    return webui.webui_show_browser(this._handle, tmp_content.ptr, browser);
  }

  /**
   *
   * Set the window in Kiosk mode (Full screen)
   *
   * @param boolean status True or False
   * @example
   * ```ts
   * myWindow.setKiosk(true);
   * ```
   */
  setKiosk(status: boolean) {
    webui.webui_set_kiosk(this._handle, status);
  }

  /**
   *
   * Wait until all opened windows get closed.
   *
   * @example
   * ```ts
   * myWindow.wait();
   * ```
   */
  static wait() {
    webui.webui_wait();
  }

  /**
   *
   * Close a specific window only. The window object will still exist.
   *
   * @example
   * ```ts
   * myWindow.close();
   * ```
   */
  close() {
    webui.webui_close(this._handle);
  }

  /**
   *
   * Close a specific window and free all memory resources.
   *
   * @example
   * ```ts
   * myWindow.destory();
   * ```
   */
  destory() {
    webui.webui_destroy(this._handle);
  }

  /**
   *
   * Close all open windows. `wait()` will return (Break).
   *
   * @example
   * ```ts
   * WebUI.exit();
   * ```
   */
  static exit() {
    webui.webui_exit();
  }

  /**
   *
   * Set the web-server root folder path for a specific window.
   *
   * @param string The local folder full path
   * @return Returns True if setting root floader is successed.
   * @example
   * ```ts
   * myWindow.setRootFolder("/home/Foo/Bar/");
   * ```
   */
  setRootFolder(path: string) {
    const tmp_path = toCString(path);
    return webui.webui_set_root_folder(this._handle, tmp_path.ptr);
  }

  /**
   *
   * Set the web-server root folder path for all windows.
   * Should be used before `show()`.
   *
   * @param string The local folder full path
   * @return Returns True if setting default root floader is successed.
   * @example
   * ```ts
   * WebUI.exit();
   * ```
   */
  static setDefaultRootFolder(path: string) {
    const tmp_path = toCString(path);
    return webui.webui_set_default_root_folder(tmp_path.ptr);
  }

  /**
   *
   * Close all open windows. `wait()` will return (Break).
   *
   * @param SetFileHandlerCallbak callback for the file handler
   * @example
   * ```ts
   * myWindow.setFileHandler(callback);
   * ```
   */
  setFileHandler(callback: SetFileHandlerCallbak) {
    webui.webui_set_file_handler(this._handle, callback.ptr);
  }

  /**
   *
   * Check if the window is still running.
   *
   * @return Returns True if the window is running.
   * @example
   * ```ts
   * const val = myWindow.isShown();
   * ```
   */
  isShown(): boolean {
    return webui.webui_is_shown(this._handle);
  }

  /**
   *
   * Set the maximum time in seconds to wait for the browser to start.
   *
   * @example
   * ```ts
   * WebUI.setTimeout(5);
   * ```
   */
  static setTimeout(second: number) {
    webui.webui_set_timeout(second);
  }

  /**
   *
   * Set the default embedded HTML favicon.
   *
   * @param icon The icon as string: `<svg>...</svg>`
   * @param icon_type The icon type: `image/svg+xml`
   * @example
   * ```ts
   * myWindow.setIcon("<svg>...</svg>", "image/svg+xml");
   * ```
   */
  setIcon(icon: string, icon_type: string) {
    // TODO: this should support file u8array
    const tmp_icon = toCString(icon);
    const tmp_icon_type = toCString(icon_type);

    webui.webui_set_icon(this._handle, tmp_icon.ptr, tmp_icon_type.ptr);
  }

  /**
   *
   * Base64 encoding. Use this to safely send text based data to the UI.
   *
   * @param string The string to encode
   * @returns string
   *
   * @example
   * ```ts
   * WebUI.encode("Hello");
   * ```
   *
   */
  static encode(val: string) {
    const tmp_val = toCString(val);
    const res = webui.webui_encode(tmp_val.ptr);
    if (res.ptr != 0) {
      return res.toString();
    }
    // TODO: res.ptr maybe null
  }

  /**
   *
   * Base64 decoding. Use this to safely decode received Base64 text from the UI.
   *
   * @param string The string to decode
   * @returns string
   *
   * @example
   * ```ts
   * WebUI.decode("SGVsbG8=");
   * ```
   *
   */
  static decode(val: string) {
    const tmp_val = toCString(val);
    const res = webui.webui_decode(tmp_val.ptr);
    if (res.ptr != 0) {
      return res.toString();
    }
    // TODO: res.ptr maybe null
  }

  // TODO: whether we should adapt free and malloc?

  /**
   *
   * Safely send raw data to the UI.
   *
   * @param string the function name
   * @param raw The raw data buffer
   * @example
   * ```ts
   * myWindow.sendRaw("myJavascriptFunction", myBuffer);
   * ```
   */
  sendRaw(functionName: string, raw: ArrayBuffer) {
    const tmp_functionName = toCString(functionName);
    const ptr = arrayToPtr(raw);
    webui.webui_send_raw(
      this._handle,
      tmp_functionName.ptr,
      ptr,
      raw.byteLength,
    );
  }

  /**
   *
   * Set a window in hidden mode. Should be called before `show()`.
   * @param status - True to hide, false to show.
   * @example
   * ```ts
   * myWindow.setHide(true);
   * ```
   */
  setHide(status: boolean) {
    webui.webui_set_hide(this._handle, status);
  }

  /**
   *
   * Set the window size.
   *
   * @param width - The width of the window.
   * @param height - The height of the window.
   * @example
   * ```ts
   * myWindow.setSize(800, 600);
   * ```
   */
  setSize(width: number, height: number) {
    if (width >= 0 && height >= 0) {
      webui.webui_set_size(this._handle, width, height);
    } else {
      // TODO: maybe should throw an error
    }
  }

  /**
   * Set the window position.
   *
   * @param x - The x-coordinate of the window.
   * @param y - The y-coordinate of the window.
   * @example
   * ```ts
   * myWindow.setPosition(100, 100);
   * ```
   */
  setPosition(x: number, y: number) {
    if (x >= 0 && y >= 0) {
      webui.webui_set_position(this._handle, x, y);
    } else {
      // TODO: maybe should throw an error
    }
  }

  /**
   *
   * Set the web browser profile to use.
   * An empty `name` and `path` means the default user profile.
   *
   * @param name The web browser profile name
   * @param path The web browser profile full path
   * @example
   * ```ts
   * myWindow.setProfile("Bar", "/Home/Foo/Bar");
   * ```
   */
  setProfile(name: string, path: string) {
    const tmp_name = toCString(name);
    const tmp_path = toCString(path);
    webui.webui_set_profile(this._handle, tmp_name.ptr, tmp_path.ptr);
  }

  /**
   *
   * Set the web browser proxy_server to use.
   * Need to be called before `show()`.
   *
   * @param proxy_server The web browser proxy_server
   * @example
   * ```ts
   * myWindow.setProxy("http://127.0.0.1:8888");
   * ```
   */
  setProxy(proxy_server: string) {
    const tmp_proxy_server = toCString(proxy_server);
    webui.webui_set_proxy(this._handle, tmp_proxy_server.ptr);
  }

  /**
   *
   * Get the full current URL.
   *
   * @returns Returns the full URL string
   * @example
   * ```ts
   * const url = myWindow.getUrl();
   * ```
   */
  getUrl() {
    const res = webui.webui_get_url(this._handle);
    return res.toString();
  }

  /**
   *
   * Allow a specific window address to be accessible from a public network.
   *
   * @param status True or False
   * @example
   * ```ts
   * myWindow.setPublic(true);
   * ```
   */
  setPublic(status: boolean) {
    webui.webui_set_public(this._handle, status);
  }

  /**
   *
   * Navigate to a specific URL.
   *
   * @param url Full HTTP URL
   * @example
   * ```ts
   * myWindow.navigate("http://domain.com");
   * ```
   */
  navigate(url: string) {
    const tmp_url = toCString(url);
    webui.webui_navigate(this._handle, tmp_url.ptr);
  }

  /**
   *
   * Free all memory resources. Should be called only at the end.
   *
   * @example
   * ```ts
   * WebUI.wait();
   * WebUI.clean();
   * ```
   */
  static clean() {
    webui.webui_clean();
  }

  /**
   *
   * Delete all local web-browser profiles folder.
   * It should called at the end.
   *
   * @example
   * ```ts
   * WebUI.wait();
   * WebUI.deleteAllProfiles();
   * WebUI.clean();
   * ```
   */
  static deleteAllProfiles() {
    webui.webui_delete_all_profiles();
  }

  /**
   *
   * Delete a specific window web-browser local folder profile.
   *
   * @example
   * ```ts
   * WebUI.wait();
   * myWindow.deleteProfile();
   * WebUI.clean();
   * ```
   * @note This can break functionality of other windows if using the same web-browser.
   */
  deleteProfile() {
    webui.webui_delete_profile(this._handle);
  }

  /**
   *
   * Get the ID of the parent process.
   * The web browser may re-create another new process.
   *
   * @return Returns the the parent process id as integer
   * @example
   * ```ts
   * const id = myWindow.getParentProcessID();
   * ```
   */
  getParentProcessID(): number {
    const res = webui.webui_get_parent_process_id(this._handle);
    return Number(res);
  }

  /**
   *
   * Get the ID of the last child process.
   * The web browser may re-create another new process.
   *
   * @return Returns the the child process id as integer
   * @example
   * ```ts
   * const id = myWindow.getChildProcessID();
   * ```
   */
  getChildProcessID(): number {
    const res = webui.webui_get_child_process_id(this._handle);
    return Number(res);
  }

  /**
   *
   * Set a custom web-server network port to be used by WebUI.
   * This can be useful to determine the HTTP link of `webui.js` in case
   * you are trying to use WebUI with an external web-server like NGNIX
   *
   * @param port The web-server network port WebUI should use
   * @return Returns True if the port is free and usable by WebUI
   * ```ts
   * const result = myWindow.setPort(8080);
   * ```
   */
  setPort(port: number): boolean {
    return webui.webui_set_port(this._handle, port);
  }

  /**
   * Set the SSL/TLS certificate and the private key content, both in PEM
   * format. This works only with `webui-2-secure` library. If set empty WebUI
   * will generate a self-signed certificate.
   *
   * @param certificate_pem The SSL/TLS certificate content in PEM format
   * @param private_key_pem The private key content in PEM format
   *
   * @return Returns True if the certificate and the key are valid.
   *
   * @example
   * ```
   * let ret =WebUI.setTlsCertificate("-----BEGINCERTIFICATE-----\n...",
   * "-----BEGIN PRIVATE KEY-----\n...");
   * ```
   */
  static setTlsCertificate<T extends ArrayBuffer | string>(
    certificate_pem: T,
    private_key_pem: T,
  ) {
    if (
      certificate_pem instanceof ArrayBuffer &&
      private_key_pem instanceof ArrayBuffer
    ) {
      const tmp_certificate_pem = arrayToPtr(certificate_pem);
      const tmp_private_key_pem = arrayToPtr(private_key_pem);
      return webui.webui_set_tls_certificate(
        tmp_certificate_pem,
        tmp_private_key_pem,
      );
    }

    const tmp_certificate_pem = toCString(certificate_pem as string);
    const tmp_private_key_pem = toCString(private_key_pem as string);
    return webui.webui_set_tls_certificate(
      tmp_certificate_pem.ptr,
      tmp_private_key_pem.ptr,
    );
  }

  /**
   *
   * Run JavaScript without waiting for the response.
   *
   * @param script The JavaScript to be run
   * @example
   * ```ts
   * myWindow.run("alert('Hello');");
   * ```
   */
  run(script: string) {
    const tmp_script = toCString(script);
    webui.webui_run(this._handle, tmp_script.ptr);
  }

  /**
   *
   * Run JavaScript and get the response back.
   * Make sure your local buffer can hold the response.
   *
   * @param script The JavaScript to be run
   * @param timeout The execution timeout
   * @param buffer The local buffer to hold the response
   * @example
   * ```ts
   * const is_successed = myWindow.script("return 4 + 6;", 0, myBuffer);
   * ```
   */
  script(script: string, timeout: number, buffer: Uint8Array): boolean {
    const tmp_script = toCString(script);
    const tmp_arr = arrayToPtr(buffer);
    return webui.webui_script(
      this._handle,
      tmp_script.ptr,
      timeout,
      tmp_arr,
      buffer.byteLength,
    );
  }

  /**
   *
   * Chose between Deno and Nodejs as runtime for .js and .ts files.
   *
   * @param runtime Deno | Nodejs
   *
   * @example
   * ```ts
   * myWindow.setRuntime(Runtimes.Deno);
   * ```
   */
  setRuntime(runtime: Runtimes) {
    webui.webui_set_runtime(this._handle, runtime);
  }

  /**
   *
   * Get an argument as integer at a specific index
   *
   * @param Event
   * @param index The argument position starting from 0
   * @return Returns argument as integer
   * @example
   * ```ts
   * const arg = WebUI.getIntAt(e, 0);
   * ```
   */
  static getIntAt(e: Event, index: number): number {
    const res = webui.webui_get_int_at(e.ptr, index);
    return Number(res);
  }

  /**
   *
   * Get the first argument as integer
   *
   * @param Event
   * @return Returns argument as integer
   * @example
   * ```ts
   * const arg = WebUI.getInt(e);
   * ```
   */
  static getInt(e: Event) {
    return webui.webui_get_int(e.ptr);
  }

  /**
   *
   * Get an argument as string at a specific index
   *
   * @param Event
   * @param index The argument position starting from 0
   * @return Returns argument as string
   * @example
   * ```ts
   * const arg = WebUI.getStringAt(e, 0);
   * ```
   */
  static getStringAt(e: Event, index: number): string {
    const res = webui.webui_get_string_at(e.ptr, index);
    return res.toString();
  }

  /**
   *
   * Get the first argument as string
   *
   * @param Event
   * @return Returns argument as string
   * @example
   * ```ts
   * const arg = WebUI.getString(e);
   * ```
   */
  static getString(e: Event): string {
    const res = webui.webui_get_string(e.ptr);
    return res.toString();
  }

  /**
   *
   * Get an argument as boolean at a specific index
   *
   * @param Event
   * @param index The argument position starting from 0
   * @return Returns argument as boolean
   * @example
   * ```ts
   * const arg = WebUI.getBoolAt(e, 0);
   * ```
   */
  static getBoolAt(e: Event, index: number): boolean {
    return webui.webui_get_bool_at(e.ptr, index);
  }

  /**
   *
   * Get the first argument as boolean
   *
   * @param Event
   * @return Returns argument as boolean
   * @example
   * ```ts
   * const arg = WebUI.getBool(e, 0);
   * ```
   */
  static getBool(e: Event): boolean {
    return webui.webui_get_bool(e.ptr);
  }

  /**
   *
   * Get the size in bytes of an argument at a specific index
   *
   * @param Event
   * @param index The argument position starting from 0
   * @return Returns size in bytes
   * @example
   * ```ts
   * const size = WebUI.getSizeAt(e, 0);
   * ```
   */
  static getSizeAt(e: Event, index: number): number {
    const res = webui.webui_get_size_at(e.ptr, index);
    return Number(res);
  }

  /**
   *
   * Get size in bytes of the first argument
   *
   * @param Event
   * @return Returns size in bytes
   * @example
   * ```ts
   * const size = WebUI.getSize(e);
   * ```
   */
  static getSize(e: Event): number {
    const res = webui.webui_get_size(e.ptr);
    return Number(res);
  }

  /**
   *
   * Return the response to JavaScript as integer
   *
   * @param e Event
   * @param number The integer to be send to JavaScript
   * @example
   * ```ts
   * WebUI.returnInt(e, 123);
   * ```
   */
  static returnInt(e: Event, number: number | bigint) {
    webui.webui_return_int(e.ptr, number);
  }

  /**
   *
   * Return the response to JavaScript as string
   *
   * @param e Event
   * @param str The string to be send to JavaScript
   * @example
   * ```ts
   * WebUI.returnString(e, "666");
   * ```
   */
  static returnString(e: Event, str: string) {
    const tmp_str = toCString(str);
    webui.webui_return_string(e.ptr, tmp_str.ptr);
  }

  /**
   *
   * Return the response to JavaScript as boolean
   *
   * @param e Event
   * @param bool The boolean to be send to JavaScript
   * @example
   * ```ts
   * WebUI.returnString(e, "666");
   * ```
   */
  static returnBool(e: Event, bool: boolean) {
    webui.webui_return_bool(e.ptr, bool);
  }

  /**
   *
   * Bind a specific HTML element click event with a function. Empty element means all events.
   *
   * @param element The element ID
   * @param callback
   * @return Returns unique bind ID
   * @example
   * ```
   * myWindow.interfaceBind("myID", myCallback);
   * ```
   */
  interfaceBind(element: string, callback: InterfaceBindCallback): number {
    const tmp_element = toCString(element);
    const res = webui.webui_interface_bind(
      this._handle,
      tmp_element.ptr,
      callback.ptr,
    );
    return Number(res);
  }

  /**
   *
   * When using `interfaceBind()`, you may need this function to easily set a response.
   *
   * @param event_number The event number
   * @param response The response as string to be send to JavaScript
   * @example
   * ```
   * myWindow.interfaceSetResponse(e.event_number, "Response...");
   * ```
   */
  interfaceSetResponse(event_number: number, response: string) {
    const tmp_response = toCString(response);
    webui.webui_interface_set_response(
      this._handle,
      event_number,
      tmp_response.ptr,
    );
  }

  /**
   *
   * Check if the app still running.
   *
   * @return Returns True if app is running
   *
   * @example
   * ```ts
   * const status = WebUI.interfaceIsAppRunning();
   * ```
   */
  static interfaceIsAppRunning(): boolean {
    return webui.webui_interface_is_app_running();
  }

  /**
   *
   * Get a unique window ID.
   *
   * @return Returns the unique window ID as integer
   * @example
   * ```
   * const id = myWindow.InterfaceGetWindowID();
   * ```
   */
  InterfaceGetWindowID(): number {
    const res = webui.webui_interface_get_window_id(this._handle);
    return Number(res);
  }

  /**
   *
   * Get an argument as string at a specific index.
   *
   * @param event_number The event number
   * @param index The argument position
   * @return Returns argument as string
   * @example
   * ```
   * const str = myWindow.InterfaceGetStringAt(e.event_number, 0);
   * ```
   */
  InterfaceGetStringAt(event_number: number, index: number): string {
    const res = webui.webui_interface_get_string_at(
      this._handle,
      event_number,
      index,
    );
    return res.toString();
  }

  /**
   *
   * Get an argument as integer at a specific index.
   *
   * @param event_number The event number
   * @param index The argument position
   * @return Returns argument as integer
   * @example
   * ```
   * const res = myWindow.InterfaceGetIntAt(e.event_number, 0);
   * ```
   */
  InterfaceGetIntAt(event_number: number, index: number): number {
    const res = webui.webui_interface_get_int_at(
      this._handle,
      event_number,
      index,
    );
    return Number(res);
  }

  /**
   *
   * Get an argument as boolean at a specific index.
   *
   * @param event_number The event number
   * @param index The argument position
   * @return Returns argument as boolean
   * @example
   * ```
   * const res = myWindow.InterfaceGetBoolAt(e.event_number, 0);
   * ```
   */
  InterfaceGetBoolAt(event_number: number, index: number): boolean {
    return webui.webui_interface_get_bool_at(this._handle, event_number, index);
  }

  /**
   *
   * Get the size in bytes of an argument at a specific index.
   *
   * @param event_number The event number
   * @param index The argument position
   * @return Returns size in bytes
   * @example
   * ```
   * const size = myWindow.InterfaceGetSizeAt(e.event_number, 0);
   * ```
   */
  InterfaceGetSizeAt(event_number: number, index: number): number {
    const res = webui.webui_interface_get_size_at(
      this._handle,
      event_number,
      index,
    );
    return Number(res);
  }
}
