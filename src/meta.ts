import { join } from "path";
import { homedir } from "os";
import { existsSync } from "fs";
import { file, write } from "bun";

import webui_win_dll from "../libs/webui-2.dll" with { type: "file" };

// user data dir
const appDataDir = join(homedir(), "AppData", "Local", "WebuiDev");

// debug function
export const debug = (...data: any[]) => {
  if (process.env.BUN_WEBUI_DEBUG)
    data.forEach((e) => {
      console.debug(e);
    });
};

// lib_path
export const lib_path = join(appDataDir, "webui-2.dll");

if (!existsSync(lib_path)) {
  debug("lib not exist, start extract lib");
  await write(lib_path, file(webui_win_dll));
  debug("finish to extract lib");
} else {
  debug("lib exists");
}
