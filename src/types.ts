import {
  JSCallback,
  type Pointer,
  read,
  CString,
  dlopen,
  toArrayBuffer,
} from "bun:ffi";
import { toCString } from "./utils";
import { endianness } from "os";

const is_little_endian = endianness() == "LE";

export enum Events {
  EVENT_DISCONNECTED = 0, // 0. Window disconnection event
  EVENT_CONNECTED, // 1. Window connection event
  EVENT_MOUSE_CLICK, // 2. Mouse click event
  EVENT_NAVIGATION, // 3. Window navigation event
  EVENT_CALLBACK, // 4. Function call event
}

export enum Runtimes {
  None = 0, // 0. Prevent WebUI from using any runtime for .js and .ts files
  Deno, // 1. Use Deno runtime for .js and .ts files
  NodeJS, // 2. Use Nodejs runtime for .js files
}

export enum Browsers {
  NoBrowser = 0, // 0. No web browser
  AnyBrowser, // 1. Default recommended web browser
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
}

export class Event {
  private ptr: Pointer;

  constructor(ptr: Pointer) {
    this.ptr = ptr;
  }

  /**
   * get window handle
   * @returns number
   */
  get window_handle() {
    const val = read.u64(this.ptr, 0);
    return Number(val);
  }

  /**
   * get event type
   * @returns Events
   */
  get event_type(): Events {
    const val = read.u64(this.ptr, 8);
    // typescript has no security check for enumerations
    return Number(val);
  }

  /**
   * get element name
   */
  get element() {
    const val = read.ptr(this.ptr, 16);
    return new CString(val);
  }

  /**
   * get event number
   */
  get event_number() {
    const val = read.u64(this.ptr, 24);
    return Number(val);
  }

  /**
   * get bind id
   */
  get bind_id() {
    const val = read.u64(this.ptr, 32);
    return Number(val);
  }
}

export class BindCallback {
  private callback: JSCallback;

  constructor(callback: (e: Event) => void) {
    const val = new JSCallback(
      (ptr: Pointer) => {
        const wrap = new Event(ptr);
        callback(wrap);
      },
      {
        args: ["pointer"],
        returns: "void",
      },
    );
    this.callback = val;
  }

  get value() {
    return this.callback;
  }

  get ptr() {
    return this.callback.ptr;
  }
}

export class InterfaceBindCallback {
  private callback: JSCallback;
  constructor(
    callback: (
      window_handle: number,
      event_type: number,
      element: CString,
      event_number: number,
      bind_id: number,
    ) => void,
  ) {
    const val = new JSCallback(
      (
        window_handle: bigint,
        event_type: bigint,
        element: CString,
        event_number: bigint,
        bind_id: bigint,
      ) => {
        callback(
          Number(window_handle),
          Number(event_type),
          element,
          Number(event_number),
          Number(bind_id),
        );
      },
      {
        args: ["usize", "usize", "cstring", "usize", "usize"],
        returns: "void",
      },
    );
    this.callback = val;
  }

  get value() {
    return this.callback;
  }

  get ptr() {
    return this.callback.ptr;
  }
}

export class SetFileHandlerCallbak {
  callback: JSCallback;

  constructor(callback: (path: CString) => string) {
    const val = new JSCallback(
      (path: CString, length: Pointer): Pointer => {
        const str = callback(path);
        const res = toCString(str);

        let len_ptr = new DataView(toArrayBuffer(length, 0, 4));
        len_ptr.setInt32(0, res.byteLength as number, is_little_endian);

        return res.ptr;
      },
      {
        args: ["cstring", "pointer"],
        returns: "pointer",
      },
    );

    this.callback = val;
  }

  get value() {
    return this.callback;
  }

  get ptr() {
    return this.callback.ptr;
  }
}

export const { symbols: webui } = dlopen(
  // TODO: for dynamic library path
  "/home/jin/code/bun-webui/src/libwebui.so",
  {
    // size_t webui_new_window(void)
    webui_new_window: {
      args: [],
      returns: "u64",
    },

    // size_t webui_new_window_id(size_t window_number)
    webui_new_window_id: {
      args: ["usize"],
      returns: "usize",
    },

    // size_t webui_get_new_window_id(void)
    webui_get_new_window_id: {
      args: [],
      returns: "usize",
    },

    // size_t webui_bind(size_t window, const char* element, void (*func)(webui_event_t* e))
    webui_bind: {
      args: ["usize", "cstring", "callback"],
      returns: "usize",
    },

    // bool webui_show(size_t window, const char* content)
    webui_show: {
      args: ["usize", "cstring"],
      returns: "bool",
    },

    // bool webui_show_browser(size_t window, const char* content, size_t browser)
    webui_show_browser: {
      args: ["usize", "cstring", "usize"],
      returns: "bool",
    },

    // void webui_set_kiosk(size_t window, bool status)
    webui_set_kiosk: {
      args: ["usize", "bool"],
      returns: "void",
    },

    // void webui_wait(void)
    webui_wait: {
      args: [],
      returns: "void",
    },

    // void webui_close(size_t window)
    webui_close: {
      args: ["usize"],
      returns: "void",
    },

    // void webui_destroy(size_t window)
    webui_destroy: {
      args: ["usize"],
      returns: "void",
    },

    // void webui_exit(void)
    webui_exit: {
      args: [],
      returns: "void",
    },

    // bool webui_set_root_folder(size_t window, const char* path)
    webui_set_root_folder: {
      args: ["usize", "cstring"],
      returns: "bool",
    },

    // bool webui_set_default_root_folder(const char* path)
    webui_set_default_root_folder: {
      args: ["cstring"],
      returns: "bool",
    },

    // void webui_set_file_handler(size_t window, const void* (*handler)(const char* filename, int* length))
    webui_set_file_handler: {
      args: ["usize", "callback"],
      returns: "void",
    },

    // bool webui_is_shown(size_t window)
    webui_is_shown: {
      args: ["usize"],
      returns: "bool",
    },

    // void webui_set_timeout(size_t second)
    webui_set_timeout: {
      args: ["usize"],
      returns: "void",
    },

    // void webui_set_icon(size_t window, const char* icon, const char* icon_type)
    webui_set_icon: {
      args: ["usize", "cstring", "cstring"],
      returns: "void",
    },

    // char* webui_encode(const char* str)
    webui_encode: {
      args: ["cstring"],
      returns: "cstring",
    },

    // char* webui_decode(const char* str)
    webui_decode: {
      args: ["cstring"],
      returns: "cstring",
    },

    // void webui_free(void* ptr)
    webui_free: {
      args: ["pointer"],
      returns: "void",
    },

    // void* webui_malloc(size_t size)
    webui_malloc: {
      args: ["usize"],
      returns: "pointer",
    },

    // void webui_send_raw(size_t window, const char* function, const void* raw, size_t size)
    webui_send_raw: {
      args: ["usize", "cstring", "pointer", "usize"],
      returns: "void",
    },

    // void webui_set_hide(size_t window, bool status)
    webui_set_hide: {
      args: ["usize", "bool"],
      returns: "void",
    },

    // void webui_set_size(size_t window, unsigned int width, unsigned int height)
    webui_set_size: {
      args: ["usize", "u32", "u32"],
      returns: "void",
    },

    // void webui_set_position(size_t window, unsigned int x, unsigned int y)
    webui_set_position: {
      args: ["usize", "u32", "u32"],
      returns: "void",
    },

    // void webui_set_profile(size_t window, const char* name, const char* path)
    webui_set_profile: {
      args: ["usize", "cstring", "cstring"],
      returns: "void",
    },

    // void webui_set_proxy(size_t window, const char* proxy_server)
    webui_set_proxy: {
      args: ["usize", "cstring"],
      returns: "void",
    },

    // const char* webui_get_url(size_t window)
    webui_get_url: {
      args: ["usize"],
      returns: "cstring",
    },

    // void webui_set_public(size_t window, bool status)
    webui_set_public: {
      args: ["usize", "bool"],
      returns: "void",
    },

    // void webui_navigate(size_t window, const char* url)
    webui_navigate: {
      args: ["usize", "cstring"],
      returns: "void",
    },

    // void webui_clean()
    webui_clean: {
      args: [],
      returns: "void",
    },

    // void webui_delete_all_profiles()
    webui_delete_all_profiles: {
      args: [],
      returns: "void",
    },

    // void webui_delete_profile(size_t window)
    webui_delete_profile: {
      args: ["usize"],
      returns: "void",
    },

    // size_t webui_get_parent_process_id(size_t window)
    webui_get_parent_process_id: {
      args: ["usize"],
      returns: "usize",
    },

    // size_t webui_get_child_process_id(size_t window)
    webui_get_child_process_id: {
      args: ["usize"],
      returns: "usize",
    },

    // bool webui_set_port(size_t window, size_t port)
    webui_set_port: {
      args: ["usize", "usize"],
      returns: "bool",
    },

    // bool webui_set_tls_certificate(const char* certificate_pem, const char* private_key_pem)
    webui_set_tls_certificate: {
      args: ["cstring", "cstring"],
      returns: "bool",
    },

    // void webui_run(size_t window, const char* script)
    webui_run: {
      args: ["usize", "cstring"],
      returns: "void",
    },

    // bool webui_script(size_t window, const char* script, size_t timeout,
    // char* buffer, size_t buffer_length)
    webui_script: {
      args: ["usize", "cstring", "usize", "pointer", "usize"],
      returns: "bool",
    },

    // void webui_set_runtime(size_t window, size_t runtime)
    webui_set_runtime: {
      args: ["usize", "usize"],
      returns: "void",
    },

    // long long int webui_get_int_at(webui_event_t* e, size_t index)
    webui_get_int_at: {
      args: ["pointer", "usize"],
      returns: "i64",
    },

    // long long int webui_get_int(webui_event_t* e)
    webui_get_int: {
      args: ["pointer"],
      returns: "i64",
    },

    // const char* webui_get_string_at(webui_event_t* e, size_t index)
    webui_get_string_at: {
      args: ["pointer", "usize"],
      returns: "cstring",
    },

    // const char* webui_get_string(webui_event_t* e)
    webui_get_string: {
      args: ["pointer"],
      returns: "cstring",
    },

    // bool webui_get_bool_at(webui_event_t* e, size_t index)
    webui_get_bool_at: {
      args: ["pointer", "usize"],
      returns: "bool",
    },

    // bool webui_get_bool(webui_event_t* e)
    webui_get_bool: {
      args: ["pointer"],
      returns: "bool",
    },

    // size_t webui_get_size_at(webui_event_t* e, size_t index)
    webui_get_size_at: {
      args: ["pointer", "usize"],
      returns: "usize",
    },

    // size_t webui_get_size(webui_event_t* e)
    webui_get_size: {
      args: ["pointer"],
      returns: "usize",
    },

    // void webui_return_int(webui_event_t* e, long long int n)
    webui_return_int: {
      args: ["pointer", "i64"],
      returns: "void",
    },

    // void webui_return_string(webui_event_t* e, const char* s)
    webui_return_string: {
      args: ["pointer", "cstring"],
      returns: "void",
    },

    // void webui_return_bool(webui_event_t* e, bool b)
    webui_return_bool: {
      args: ["pointer", "bool"],
      returns: "void",
    },

    // size_t webui_interface_bind(size_t window, const char* element,
    // void (*func)(size_t, size_t, char*, size_t, size_t))
    webui_interface_bind: {
      args: ["usize", "cstring", "callback"],
      returns: "usize",
    },

    // void webui_interface_set_response(size_t window, size_t event_number, const char* response)
    webui_interface_set_response: {
      args: ["usize", "usize", "cstring"],
      returns: "void",
    },

    // bool webui_interface_is_app_running(void)
    webui_interface_is_app_running: {
      args: [],
      returns: "bool",
    },

    // size_t webui_interface_get_window_id(size_t window)
    webui_interface_get_window_id: {
      args: ["usize"],
      returns: "usize",
    },

    // const char* webui_interface_get_string_at(size_t window, size_t event_number, size_t index)
    webui_interface_get_string_at: {
      args: ["usize", "usize", "usize"],
      returns: "cstring",
    },

    // long long int webui_interface_get_int_at(size_t window, size_t event_number, size_t index)
    webui_interface_get_int_at: {
      args: ["usize", "usize", "usize"],
      returns: "i64",
    },

    // bool webui_interface_get_bool_at(size_t window, size_t event_number, size_t index)
    webui_interface_get_bool_at: {
      args: ["usize", "usize", "usize"],
      returns: "bool",
    },

    // size_t webui_interface_get_size_at(size_t window, size_t event_number, size_t index)
    webui_interface_get_size_at: {
      args: ["usize", "usize", "usize"],
      returns: "usize",
    },
  },
);
