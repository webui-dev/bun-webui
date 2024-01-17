import { WebUI } from "../../src/webui"

const content =
  '<html><head><script src="webui.js"></script></head> Hello World ! </html>';

const window = new WebUI();

window.show(content);
WebUI.wait();
