/*
  WebUI Bun 2.5.3
  http://webui.me
  https://github.com/webui-dev/bun-webui
  Copyright (c) 2020-2025 Hassan Draga.
  Licensed under MIT License.
  All rights reserved.
  Canada.
*/

import { JSCallback } from "bun:ffi";
import { loadLib } from "./lib.ts";
import { toCString } from "./utils.ts";

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
    );
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
    );
    _lib.symbols.webui_set_file_handler(windowId, callbackResource);
    self.postMessage({ id, result: "setFileHandler_success" });
  }
};
