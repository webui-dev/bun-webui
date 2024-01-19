import { webui, BindCallback, Browsers } from "./types";
import { toCString } from "./utils";

const WEBUI_MAX_IDS = 256;

const windows: Map<number, WebUI> = new Map();

export class WebUI {
  private handle: number;

  /**
   *
   * initialize a new WebUI window.
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
      this.handle = Number(handle);
    } else {
      const handle = webui.webui_new_window();
      this.handle = Number(handle);
    }
    windows.set(this.handle, this);
  }

  /**
   *
   * get a valid window id.
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

    const bind_id = webui.webui_bind(this.handle, cstring.ptr, callback.ptr);
    return Number(bind_id);
  }

  /**
   *
   * Show a window using embedded HTML, or a file.
   * If the window is already open, it will be refreshed.
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
    return webui.webui_show(this.handle, tmp_content.ptr);
  }

  /**
   *
   * Same as `show()`. But using a specific web browser
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
    return webui.webui_show_browser(this.handle, tmp_content.ptr, browser);
  }

  /**
   *
   * Set the window in Kiosk mode (Full screen)
   * @param boolean status True or False
   * @example
   * ```ts
   * myWindow.setKiosk(true);
   * ```
   */
  setKiosk(status: boolean) {
    webui.webui_set_kiosk(this.handle, status);
  }

  /**
   *
   * Wait until all opened windows get closed.
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
   * @example
   * ```ts
   * myWindow.close();
   * ```
   */
  close() {
    webui.webui_close(this.handle);
  }

  /**
   *
   * Close a specific window and free all memory resources.
   * @example
   * ```ts
   * myWindow.destory();
   * ```
   */
  destory() {
    webui.webui_destroy(this.handle);
  }

  /**
   *
   * Close all open windows. `wait()` will return (Break).
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
   * @param string The local folder full path
   * @return Returns True if setting root floader is successed.
   * @example
   * ```ts
   * myWindow.setRootFolder("/home/Foo/Bar/");
   * ```
   */
  setRootFolder(path: string) {
    const tmp_path = toCString(path);
    return webui.webui_set_root_folder(this.handle, tmp_path.ptr);
  }

  /**
   *
   * Set the web-server root folder path for all windows.
   * Should be used before `show()`.
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
}
