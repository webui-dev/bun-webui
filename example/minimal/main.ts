import { WebUI } from "../../src/webui";

const myWindow = new WebUI();

myWindow.show(
  '<html><head><script src="webui.js"></script></head> Hello World ! </html>',
);
myWindow.wait();
