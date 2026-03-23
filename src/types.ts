import type { WebUI } from "../mod.js";
import { loadLib } from "./lib.js";

export type Usize = number | bigint;

export type BindCallback<T extends Datatypes | undefined | void> = (event: WebUIEvent) => T | Promise<T>;
export type BindFileHandlerCallback<T extends Datatypes | undefined | void> = (url: URL) => T | Promise<T>;

export interface WebUIEvent {
  window: WebUI;
  eventType: number;
  eventNumber: number;
  element: string;
  arg: {
    number: (index: number) => number;
    float: (index: number) => number;
    string: (index: number) => string;
    boolean: (index: number) => boolean;
    size: (index: number) => number;
  };
}

export type WebUILib = Awaited<ReturnType<typeof loadLib>>;

export type Datatypes = string | number | boolean;
