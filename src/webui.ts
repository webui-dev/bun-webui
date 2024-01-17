import { c_webui } from "./libs";
import { CString, ptr, type Pointer } from "bun:ffi";

export class WebUI {
    _window_id: bigint;

    constructor(id?: number) {
        if (id !== undefined) {
            const _id = BigInt(id);
            this._window_id = c_webui.webui_new_window_id(_id);
        } else {
            this._window_id = c_webui.webui_new_window();
        }
    }

    show(content: string): boolean {
        return c_webui.webui_show(this._window_id, WebUI.stringToPtr(content));
    }

    static wait() {
        c_webui.webui_wait();
    }

    static stringToPtr(content: string): Pointer {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(content);
        return ptr(uint8Array);
    }
}



