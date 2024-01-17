import { dlopen } from "bun:ffi";
import { lib_path } from "./meta";

export const { close, symbols:c_webui } = dlopen(lib_path, {
  // ok
  webui_new_window: {
    args: [],
    returns: "usize",
  },

  webui_new_window_id: {
    args: ["usize"],
    returns: "usize",
  },

  webui_get_new_window_id: {
    args: [],
    returns: "usize",
  },

  webui_bind: {
    args: ["usize", "cstring", "callback"],
    returns: "usize",
  },

  webui_get_best_browser: {
    args: ["usize"],
    returns: "usize",
  },

  // ok
  webui_show: {
    args: ["usize", "cstring"],
    returns: "bool",
  },

  webui_show_client: {
    args: ["pointer", "cstring"],
    returns: "bool",
  },

  webui_show_browser: {
    args: ["usize", "cstring", "usize"],
    returns: "bool",
  },

  webui_start_server: {
    args: ["usize", "cstring"],
    returns: "cstring",
  },

  webui_show_wv: {
    args: ["usize", "cstring"],
    returns: "bool",
  },

  webui_set_kiosk: {
    args: ["usize", "bool"],
  },

  webui_set_high_contrast: {
    args: ["usize", "bool"],
  },

  webui_is_high_contrast: {
    args: [],
    returns: "bool",
  },

  webui_browser_exist: {
    args: ["usize"],
    returns: "bool",
  },

  // ok
  webui_wait: {
    args: [],
    returns: undefined,
  },

  webui_close: {
    args: ["usize"],
  },

  webui_close_client: {
    args: ["pointer"],
  },

  webui_destroy: {
    args: ["usize"],
  },

  webui_exit: {
    args: [],
  },

  webui_set_root_folder: {
    args: ["usize", "cstring"],
    returns: "bool",
  },

  webui_set_default_root_folder: {
    args: ["cstring"],
    returns: "bool",
  },

  webui_set_file_handler: {
    args: ["usize", "callback"],
  },

  webui_is_shown: {
    args: ["usize"],
    returns: "bool",
  },

  webui_set_timeout: {
    args: ["usize"],
  },

  webui_set_icon: {
    args: ["usize", "cstring", "cstring"],
  },

  webui_encode: {
    args: ["cstring"],
    returns: "cstring",
  },

  webui_decode: {
    args: ["cstring"],
    returns: "cstring",
  },

  webui_free: {
    args: ["pointer"],
  },

  webui_malloc: {
    args: ["usize"],
    returns: "pointer",
  },

  webui_send_raw: {
    args: ["usize", "cstring", "pointer", "usize"],
  },

  webui_send_raw_client: {
    args: ["pointer", "cstring", "pointer", "usize"],
  },

  webui_set_hide: {
    args: ["usize", "bool"],
  },

  webui_set_size: {
    args: ["usize", "u32", "u32"],
  },

  webui_set_position: {
    args: ["usize", "u32", "u32"],
  },

  webui_set_profile: {
    args: ["usize", "cstring", "cstring"],
  },

  webui_set_proxy: {
    args: ["usize", "cstring"],
  },

  webui_get_url: {
    args: ["usize"],
    returns: "cstring",
  },

  webui_open_url: {
    args: ["cstring"],
  },

  webui_set_public: {
    args: ["usize", "bool"],
  },

  webui_navigate: {
    args: ["usize", "cstring"],
  },

  webui_navigate_client: {
    args: ["pointer", "cstring"],
  },

  webui_clean: {
    args: [],
  },

  webui_delete_all_profiles: {
    args: [],
  },

  webui_delete_profile: {
    args: ["usize"],
  },

  webui_get_parent_process_id: {
    args: ["usize"],
    returns: "usize",
  },

  webui_get_child_process_id: {
    args: ["usize"],
    returns: "usize",
  },

  webui_set_port: {
    args: ["usize", "usize"],
    returns: "bool",
  },

  webui_set_config: {
    args: ["u32", "bool"],
  },

  webui_set_event_blocking: {
    args: ["usize", "bool"],
  },

  webui_set_tls_certificate: {
    args: ["cstring", "cstring"],
    returns: "bool",
  },

  webui_run: {
    args: ["usize", "cstring"],
  },

  webui_run_client: {
    args: ["pointer", "cstring"],
  },

  webui_script: {
    args: ["usize", "cstring", "usize", "pointer", "usize"],
    returns: "bool",
  },

  webui_script_client: {
    args: ["pointer", "cstring", "usize", "pointer", "usize"],
    returns: "bool",
  },

  webui_set_runtime: {
    args: ["usize", "usize"],
  },

  webui_get_count: {
    args: ["pointer"],
    returns: "usize",
  },

  webui_get_int_at: {
    args: ["pointer", "usize"],
    returns: "i64",
  },

  webui_get_int: {
    args: ["pointer"],
    returns: "i64",
  },

  webui_get_float_at: {
    args: ["pointer", "usize"],
    returns: "double",
  },

  webui_get_float: {
    args: ["pointer"],
    returns: "double",
  },

  webui_get_string_at: {
    args: ["pointer", "usize"],
    returns: "cstring",
  },

  webui_get_string: {
    args: ["pointer"],
    returns: "cstring",
  },

  webui_get_bool_at: {
    args: ["pointer", "usize"],
    returns: "bool",
  },

  webui_get_bool: {
    args: ["pointer"],
    returns: "bool",
  },

  webui_get_size_at: {
    args: ["pointer", "usize"],
    returns: "usize",
  },

  webui_get_size: {
    args: ["pointer"],
    returns: "usize",
  },

  webui_return_int: {
    args: ["pointer", "u64"],
  },

  webui_return_float: {
    args: ["pointer", "double"],
  },

  webui_return_string: {
    args: ["pointer", "cstring"],
  },

  webui_return_bool: {
    args: ["pointer", "bool"],
  },

  webui_interface_bind: {
    args: ["usize", "cstring", "callback"],
    returns: "usize",
  },

  webui_interface_set_response: {
    args: ["usize", "usize", "cstring"],
  },

  webui_interface_is_app_running: {
    args: [],
    returns: "bool",
  },

  webui_interface_get_window_id: {
    args: ["usize"],
    returns: "usize",
  },

  webui_interface_get_string_at: {
    args: ["usize", "usize", "usize"],
    returns: "cstring",
  },

  webui_interface_get_int_at: {
    args: ["usize", "usize", "usize"],
    returns: "i64",
  },

  webui_interface_get_float_at: {
    args: ["usize", "usize", "usize"],
    returns: "double",
  },

  webui_interface_get_bool_at: {
    args: ["usize", "usize", "usize"],
    returns: "bool",
  },

  webui_interface_get_size_at: {
    args: ["usize", "usize", "usize"],
    returns: "usize",
  },
});
