import { type Narrow, type FFIFunction, CFunction, JSCallback } from "bun:ffi";

type MyFns = Record<string, Narrow<FFIFunction>>;

// NOTE: this is not implemented
const bind_callback = () => {
  return new JSCallback((ptr) => {}, {
    returns: "void",
    args: ["ptr"],
  });
};

// webui_set_file_handler
// webui_interface_bind

const types: MyFns = {
  // size_t webui_new_window(void)
  webui_new_window: {
    args: [],
    returns: "usize",
  },

  // size_t webui_new_window_id(size_t window_number)
  webui_new_window_id: {
    args: ["usize"],
    returns: "usize,",
  },

  // size_t webui_get_new_window_id(void)
  webui_get_new_window_id: {
    args: [],
    returns: "usize,",
  },

  // TODO: callback implement

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
    args: ["usize", "booll"],
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
    args: ["pointer", "string"],
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
};

export { types };
