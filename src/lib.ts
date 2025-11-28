// Bun WebUI
// FFI (Foreign Function Interface) for webui.ts

import { dlopen, suffix } from "bun:ffi";
import { libName } from "../deps.ts";

export function loadLib() {
  return dlopen(
    libName,
    {
      webui_wait: {
        // void webui_wait(void)
        args: [],
        returns: "void",
        nonblocking: true,
      },
      webui_new_window: {
        // size_t webui_new_window(void)
        args: [],
        returns: "usize",
      },
      webui_show: {
        // bool webui_show(size_t window, const char* content)
        args: ["usize", "buffer"],
        returns: "bool",
      },
      webui_show_browser: {
        // bool webui_show_browser(size_t window, const char* content, size_t browser)
        args: ["usize", "buffer", "usize"],
        returns: "bool",
      },
      webui_interface_bind: {
        // size_t webui_interface_bind(size_t window, const char* element, void (*func)(size_t, size_t, char*, size_t, size_t))
        args: ["usize", "buffer", "function"],
        returns: "usize",
      },
      webui_script: {
        // bool webui_script(size_t window, const char* script, size_t timeout, char* buffer, size_t buffer_length)
        args: ["usize", "buffer", "usize", "buffer", "usize"],
        returns: "bool",
      },
      webui_run: {
        // void webui_run(size_t window, const char* script)
        args: ["usize", "buffer"],
        returns: "void",
      },
      webui_interface_set_response: {
        // void webui_interface_set_response(size_t window, size_t event_number, const char* response)
        args: ["usize", "usize", "buffer"],
        returns: "void",
      },
      webui_exit: {
        // void webui_exit(void)
        args: [],
        returns: "void",
      },
      webui_is_shown: {
        // bool webui_is_shown(size_t window)
        args: ["usize"],
        returns: "bool",
      },
      webui_close: {
        // void webui_close(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_set_file_handler: {
        // void webui_set_file_handler(size_t window, const void* (*handler)(const char* filename, int* length))
        args: ["usize", "function"],
        returns: "void",
      },
      webui_interface_is_app_running: {
        // bool webui_interface_is_app_running(void)
        args: [],
        returns: "bool",
      },
      webui_set_profile: {
        // void webui_set_profile(size_t window, const char* name, const char* path)
        args: ["usize", "buffer", "buffer"],
        returns: "void",
      },
      webui_interface_get_int_at: {
        // long long int webui_interface_get_int_at(size_t window, size_t event_number, size_t index)
        args: ["usize", "usize", "usize"],
        returns: "i64",
      },
      webui_interface_get_string_at: {
        // const char* webui_interface_get_string_at(size_t window, size_t event_number, size_t index)
        // Change return type from "buffer" to "pointer"
        args: ["usize", "usize", "usize"],
        returns: "pointer",
      },
      webui_interface_get_bool_at: {
        // bool webui_interface_get_bool_at(size_t window, size_t event_number, size_t index)
        args: ["usize", "usize", "usize"],
        returns: "bool",
      },
      webui_clean: {
        // void webui_clean()
        args: [],
        returns: "void",
      },
      webui_set_root_folder: {
        // bool webui_set_root_folder(size_t window, const char* path)
        args: ["usize", "buffer"],
        returns: "bool",
      },
      webui_set_tls_certificate: {
        // bool webui_set_tls_certificate(const char* certificate_pem, const char* private_key_pem)
        args: ["buffer", "buffer"],
        returns: "bool",
      },
      webui_set_kiosk: {
        // void webui_set_kiosk(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_destroy: {
        // void webui_destroy(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_set_timeout: {
        // void webui_set_timeout(size_t second)
        args: ["usize"],
        returns: "void",
      },
      webui_set_icon: {
        // void webui_set_icon(size_t window, const char* icon, const char* icon_type)
        args: ["usize", "buffer", "buffer"],
        returns: "void",
      },
      webui_encode: {
        // char* webui_encode(const char* str)
        // Change return type from "buffer" to "pointer"
        args: ["buffer"],
        returns: "pointer",
      },
      webui_decode: {
        // char* webui_decode(const char* str)
        // Change return type from "buffer" to "pointer"
        args: ["buffer"],
        returns: "pointer",
      },
      webui_free: {
        // void webui_free(void* ptr)
        args: ["pointer"],
        returns: "void",
      },
      webui_malloc: {
        // void* webui_malloc(size_t size)
        args: ["usize"],
        returns: "pointer",
      },
      webui_send_raw: {
        // void webui_send_raw(size_t window, const char* function, const void* raw, size_t size)
        args: ["usize", "buffer", "buffer", "usize"],
        returns: "void",
      },
      webui_set_hide: {
        // void webui_set_hide(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_set_size: {
        // void webui_set_size(size_t window, unsigned int width, unsigned int height)
        args: ["usize", "u32", "u32"],
        returns: "void",
      },
      webui_set_position: {
        // void webui_set_position(size_t window, unsigned int x, unsigned int y)
        args: ["usize", "u32", "u32"],
        returns: "void",
      },
      webui_get_url: {
        // const char* webui_get_url(size_t window)
        // Change return type from "buffer" to "pointer"
        args: ["usize"],
        returns: "pointer",
      },
      webui_set_public: {
        // void webui_set_public(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_navigate: {
        // void webui_navigate(size_t window, const char* url)
        args: ["usize", "buffer"],
        returns: "void",
      },
      webui_delete_all_profiles: {
        // void webui_delete_all_profiles(void)
        args: [],
        returns: "void",
      },
      webui_delete_profile: {
        // void webui_delete_profile(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_get_parent_process_id: {
        // size_t webui_get_parent_process_id(size_t window)
        args: ["usize"],
        returns: "usize",
      },
      webui_get_child_process_id: {
        // size_t webui_get_child_process_id(size_t window)
        args: ["usize"],
        returns: "usize",
      },
      webui_set_port: {
        // bool webui_set_port(size_t window, size_t port)
        args: ["usize", "usize"],
        returns: "bool",
      },
      webui_set_runtime: {
        // void webui_set_runtime(size_t window, size_t runtime)
        args: ["usize", "usize"],
        returns: "void",
      },
      webui_set_config: {
        // void webui_set_config(webui_config option, bool status)
        //   show_wait_connection: 0
        //   ui_event_blocking: 1
        //   folder_monitor: 2
        //   multi_client: 3
        //   use_cookies: 4
        //   asynchronous_response: 5
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_interface_show_client: {
        // bool webui_interface_show_client(size_t window, size_t event_number, const char* content)
        args: ["usize", "usize", "buffer"],
        returns: "bool",
      },
      webui_interface_close_client: {
        // void webui_interface_close_client(size_t window, size_t event_number)
        args: ["usize", "usize"],
        returns: "void",
      },
      webui_interface_send_raw_client: {
        // void webui_interface_send_raw_client(
        //  size_t window, size_t event_number, const char* function, const void* raw, size_t size)
        args: ["usize", "usize", "buffer", "buffer", "usize"],
        returns: "void",
      },
      webui_interface_navigate_client: {
        // void webui_interface_navigate_client(size_t window, size_t event_number, const char* url)
        args: ["usize", "usize", "buffer"],
        returns: "void",
      },
      webui_interface_run_client: {
        // void webui_interface_run_client(size_t window, size_t event_number, const char* script)
        args: ["usize", "usize", "buffer"],
        returns: "void",
      },
      webui_interface_script_client: {
        // bool webui_interface_script_client(
        //  size_t window, size_t event_number, const char* script, size_t timeout, char* buffer, size_t buffer_length)
        args: ["usize", "usize", "buffer", "usize", "buffer", "usize"],
        returns: "bool",
      },
      webui_send_raw_client: {
        // void webui_send_raw_client(webui_event_t* e, const char* function, const void* raw, size_t size)
        args: ["pointer", "buffer", "buffer", "usize"],
        returns: "void",
      },
      webui_interface_set_response_file_handler: {
        // void webui_interface_set_response_file_handler(size_t window, const void* response, int length)
        args: ["usize", "pointer", "usize"],
        returns: "void",
      },
      webui_get_best_browser: {
        // size_t webui_get_best_browser(size_t window)
        args: ["usize"],
        returns: "usize",
      },
      webui_start_server: {
        // const char* webui_start_server(size_t window, const char* content)
        // Change return type from "buffer" to "pointer"
        args: ["usize", "buffer"],
        returns: "pointer",
      },
      webui_show_wv: {
        // bool webui_show_wv(size_t window, const char* content)
        args: ["usize", "buffer"],
        returns: "bool",
      },
      webui_set_custom_parameters: {
        // void webui_set_custom_parameters(size_t window, char *params)
        args: ["usize", "buffer"],
        returns: "void",
      },
      webui_set_high_contrast: {
        // void webui_set_high_contrast(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_is_high_contrast: {
        // bool webui_is_high_contrast(void)
        args: [],
        returns: "bool",
      },
      webui_browser_exist: {
        // bool webui_browser_exist(size_t browser)
        args: ["usize"],
        returns: "bool",
      },
      webui_set_default_root_folder: {
        // bool webui_set_default_root_folder(const char* path)
        args: ["buffer"],
        returns: "bool",
      },
      webui_set_minimum_size: {
        // void webui_set_minimum_size(size_t window, unsigned int width, unsigned int height)
        args: ["usize", "u32", "u32"],
        returns: "void",
      },
      webui_set_proxy: {
        // void webui_set_proxy(size_t window, const char* proxy_server)
        args: ["usize", "buffer"],
        returns: "void",
      },
      webui_open_url: {
        // void webui_open_url(const char* url)
        args: ["buffer"],
        returns: "void",
      },
      webui_get_free_port: {
        // size_t webui_get_free_port(void)
        args: [],
        returns: "usize",
      },
      webui_memcpy: {
        // void webui_memcpy(void* dest, void* src, size_t count)
        args: ["pointer", "pointer", "usize"],
        returns: "void",
      },
      webui_new_window_id: {
        // size_t webui_new_window_id(size_t window_number)
        args: ["usize"],
        returns: "usize",
      },
      webui_get_new_window_id: {
        // size_t webui_get_new_window_id(void)
        args: [],
        returns: "usize",
      },
      webui_get_port: {
        // size_t webui_get_port(size_t window)
        args: ["usize"],
        returns: "usize",
      },
      webui_set_center: {
        // void webui_set_center(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_set_browser_folder: {
        // void webui_set_browser_folder(const char* path)
        args: ["buffer"],
        returns: "void",
      },
      webui_set_event_blocking: {
        // void webui_set_event_blocking(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_set_frameless: {
        // void webui_set_frameless(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_set_transparent: {
        // void webui_set_transparent(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_set_resizable: {
        // void webui_set_resizable(size_t window, bool status)
        args: ["usize", "bool"],
        returns: "void",
      },
      webui_get_mime_type: {
        // const char* webui_get_mime_type(const char* file)
        args: ["buffer"],
        returns: "pointer",
      },
      webui_minimize: {
        // void webui_minimize(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_maximize: {
        // void webui_maximize(size_t window)
        args: ["usize"],
        returns: "void",
      },
      webui_get_hwnd: {
        // void* webui_get_hwnd(size_t window)
        args: ["usize"],
        returns: "pointer",
      },
      webui_win32_get_hwnd: {
        // void* webui_win32_get_hwnd(size_t window)
        args: ["usize"],
        returns: "pointer",
      },
    } as const,
  );
}
