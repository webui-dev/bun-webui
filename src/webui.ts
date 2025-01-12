import { c_webui } from "./libs";
import { isLittleEndian } from "./meta";
import { CString, ptr, toArrayBuffer } from "bun:ffi";
import type { Pointer } from "bun:ffi";

const stringToPtr = (content: string): Pointer => {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(content);
  return ptr(uint8Array);
};

// TODO: 待测试
const ptrToCstring = (pointer: Pointer | number): CString => {
  let _ptr: Pointer;
  if (typeof pointer === "number") {
    _ptr = ptr(new Uint8Array(pointer));
  } else {
    _ptr = pointer;
  }
  return new CString(_ptr);
};

export class WebUI {
  _window_id: bigint;

  constructor(id?: number) {
    if (id == undefined) {
      this._window_id = c_webui.webui_new_window();
      return;
    }

    const _id = BigInt(id);
    this._window_id = c_webui.webui_new_window_id(_id);
    return;
  }

  show(content: string): boolean {
    return c_webui.webui_show(this._window_id, stringToPtr(content));
  }

  static wait() {
    c_webui.webui_wait();
  }
}

// TODO: 待测试
class Event {
  data: DataView<ArrayBuffer>;

  constructor(pointer: Pointer) {
    this.data = new DataView(toArrayBuffer(pointer, 0, 32));
  }

  get window(): bigint {
    return this.data.getBigUint64(0, isLittleEndian);
  }

  get event_type(): EventKind {
    const _event_type = this.data.getBigUint64(8, isLittleEndian);
    return Number(_event_type) as EventKind;
  }

  get element(): string {
    const _ptr_number = this.data.getBigUint64(16, isLittleEndian);
    return ptrToCstring(Number(_ptr_number)).toString();
  }

  get event_number(): bigint {
    return this.data.getBigUint64(24, isLittleEndian);
  }

  get bind_id(): bigint {
    return this.data.getBigUint64(32, isLittleEndian);
  }

  get client_id(): bigint {
    return this.data.getBigUint64(40, isLittleEndian);
  }

  get connection_id(): bigint {
    return this.data.getBigUint64(48, isLittleEndian);
  }

  get cookies(): CString {
    const _ptr_number = this.data.getBigUint64(56, isLittleEndian);
    return ptrToCstring(Number(_ptr_number));
  }
}

export enum Browser {
  NoBrowser = 0, // 0. No web browser
  AnyBrowser = 1, // 1. Default recommended web browser
  Chrome, // 2. Google Chrome
  Firefox, // 3. Mozilla Firefox
  Edge, // 4. Microsoft Edge
  Safari, // 5. Apple Safari
  Chromium, // 6. The Chromium Project
  Opera, // 7. Opera Browser
  Brave, // 8. The Brave Browser
  Vivaldi, // 9. The Vivaldi Browser
  Epic, // 10. The Epic Browser
  Yandex, // 11. The Yandex Browser
  ChromiumBased, // 12. Any Chromium based browser
  Webview, // 13. WebView (Non-web-browser)
}

export enum Runtime {
  None = 0, // 0. Prevent WebUI from using any runtime for .js and .ts files
  Deno, // 1. Use Deno runtime for .js and .ts files
  NodeJS, // 2. Use Nodejs runtime for .js files
  Bun, // 3. Use Bun runtime for .js and .ts files
}

export enum EventKind {
  EVENT_DISCONNECTED = 0, // 0. Window disconnection event
  EVENT_CONNECTED, // 1. Window connection event
  EVENT_MOUSE_CLICK, // 2. Mouse click event
  EVENT_NAVIGATION, // 3. Window navigation event
  EVENT_CALLBACK, // 4. Function call event
}

export enum Config {
  // Control if `show()`,`c.webui_show_browser`,`c.webui_show_wv` should wait
  // for the window to connect before returns or not.
  // Default: True
  show_wait_connection = 0,
  // Control if WebUI should block and process the UI events
  // one a time in a single thread `True`, or process every
  // event in a new non-blocking thread `False`. This updates
  // all windows. You can use `setEventBlocking()` for
  // a specific single window update.
  // Default: False
  ui_event_blocking = 1,
  // Automatically refresh the window UI when any file in the
  // root folder gets changed.
  // Default: False
  folder_monitor,
  // Allow or prevent WebUI from adding `webui_auth` cookies.
  // WebUI uses these cookies to identify clients and block
  // unauthorized access to the window content using a URL.
  // Please keep this option to `True` if you want only a single
  // client to access the window content.
  // Default: True
  multi_client,
  // Allow multiple clients to connect to the same window,
  // This is helpful for web apps (non-desktop software),
  // Please see the documentation for more details.
  // Default: False
  use_cookies,
}
