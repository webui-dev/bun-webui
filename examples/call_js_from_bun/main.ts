import { WebUI, Browser, Event } from "../../src/webui";
import { file } from "bun";
import index from "./index.html" with { type: "file" };

const content = await file(index).text();
const window = new WebUI();

const my_function_exit = (_: Event) => {
  WebUI.exit();
};

// TODO: need to finish
const my_function_count = (e: Event) => {};

window.bind("my_function_exit", my_function_exit);

window.show(content);

WebUI.wait();

WebUI.clean();
