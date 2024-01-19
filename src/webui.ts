import { webui, BindCallback } from "./types";
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
   * const bind_id1 = myWindow1.show("<html>...</html>");
   * const bind_id2 = myWindow2.show("index.html");
   * const bind_id3 = myWindow3.show("http://...");
   * ```
   */
  show(content: string): boolean {
    const tmp_content = toCString(content);
    return webui.webui_show(this.handle, tmp_content.ptr);
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
  wait() {
    webui.webui_wait();
  }
}
