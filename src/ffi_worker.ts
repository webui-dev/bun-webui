/*
  WebUI Bun 2.5.6
  http://webui.me
  https://github.com/webui-dev/bun-webui
  Copyright (c) 2020-2026 Hassan Draga.
  Licensed under MIT License.
  All rights reserved.
  Canada.
*/

import { JSCallback, type Pointer } from "bun:ffi";
import { loadLib } from "./lib.js";
import { toCString } from "./utils.js";
import { log } from "console";

// Load the WebUI library inside the worker
const _lib = loadLib();

self.onmessage = (event: MessageEvent) => {
  const { id, action, data } = event.data;
  if (action === "bind") {
    // Bind
    // We are safe here to bind the callback with WebUI
    const windowId = BigInt(data.windowId);
    const elementId = data.elementId;
    const callbackIndex = data.callbackIndex;
    const callbackResource = new JSCallback(
      (
        _param_window: number | bigint,
        _param_event_type: number | bigint,
        _param_element: number,
        _param_event_number: number | bigint,
        _param_bind_id: number | bigint
      ) => {
        self.postMessage({
          action: "invokeCallback",
          data: {
            callbackIndex,
            param_window: _param_window,
            param_event_type: _param_event_type,
            param_element: _param_element,
            param_event_number: _param_event_number,
            param_bind_id: _param_bind_id,
          },
        });
      },
      {
        returns: "void",
        args: ["usize", "usize", "pointer", "usize", "usize"],
        threadsafe: true,
      }
    ) as any as Pointer;
    log(`Binding callback for windowId=${windowId}, elementId='${elementId}'`);
    _lib.symbols.webui_interface_bind(windowId, toCString(elementId), callbackResource);
    self.postMessage({ id, result: "bind_success" });
  } else if (action === "setFileHandler") {
    // File Handler
    // We are safe here to bind the file handler callback with WebUI
    const windowId = BigInt(data.windowId);
    const callbackIndex = data.callbackIndex;
    const callbackResource = new JSCallback(
      (
        _param_url: number,
        _param_length: number
      ) => {
        self.postMessage({
          action: "invokeFileHandler",
          data: {
            callbackIndex,
            windowId,
            param_url: _param_url,
            param_length: _param_length,
          },
        });
      },
      {
        returns: "pointer",
        args: ["pointer", "pointer"],
        threadsafe: true,
      }
    ) as any as Pointer;
    _lib.symbols.webui_set_file_handler(windowId, callbackResource);
    self.postMessage({ id, result: "setFileHandler_success" });
  } else if (action === "setFileHandlerWindow") {
    // File Handler (with window context)
    const windowId = BigInt(data.windowId);
    const callbackIndex = data.callbackIndex;
    const callbackResource = new JSCallback(
      (
        _param_window: number | bigint,
        _param_url: number,
        _param_length: number
      ) => {
        self.postMessage({
          action: "invokeFileHandlerWindow",
          data: {
            callbackIndex,
            windowId: _param_window,
            param_url: _param_url,
            param_length: _param_length,
          },
        });
      },
      {
        returns: "pointer",
        args: ["usize", "pointer", "pointer"],
        threadsafe: true,
      }
    ) as any as Pointer;
    _lib.symbols.webui_set_file_handler_window(windowId, callbackResource);
    self.postMessage({ id, result: "setFileHandlerWindow_success" });
  } else if (action === "setCloseHandlerWV") {
    // Close Handler for WebView window
    // Uses a SharedArrayBuffer so the JSCallback can read the allow-close flag synchronously.
    const windowId = BigInt(data.windowId);
    const sharedBuffer: SharedArrayBuffer = data.sharedBuffer;
    const view = new Int32Array(sharedBuffer);
    const callbackResource = new JSCallback(
      (_param_window: number | bigint) => {
        return Atomics.load(view, 0) !== 0;
      },
      {
        returns: "bool",
        args: ["usize"],
        threadsafe: true,
      }
    ) as any as Pointer;
    _lib.symbols.webui_set_close_handler_wv(windowId, callbackResource);
    self.postMessage({ id, result: "setCloseHandlerWV_success" });
  } else if (action === "setLogger") {
    // Custom logger
    const callbackIndex = data.callbackIndex;
    const callbackResource = new JSCallback(
      (
        _param_level: number | bigint,
        _param_log: number,
        _param_user_data: number
      ) => {
        self.postMessage({
          action: "invokeLogger",
          data: {
            callbackIndex,
            param_level: _param_level,
            param_log: _param_log,
          },
        });
      },
      {
        returns: "void",
        args: ["usize", "pointer", "pointer"],
        threadsafe: true,
      }
    ) as any as Pointer;
    _lib.symbols.webui_set_logger(callbackResource, null);
    self.postMessage({ id, result: "setLogger_success" });
  }
};
