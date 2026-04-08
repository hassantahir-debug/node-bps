import {chromium} from "playwright";
let browserInstance = null;

export const initializeBrowser  = async () => {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
    });
  }
};
export const closeBrowserInstance = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};
export const getPublicAssetsUrl = () => {
  return `http://localhost:3000/`;
};
export const getBrowser = () => {
  if (!browserInstance) {
    throw new Error("Browser instance not initialized. Call getBrowserInstance() first.");
  }
  return browserInstance;
};