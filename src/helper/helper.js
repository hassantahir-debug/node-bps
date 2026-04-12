
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { getBrowser, getPublicAssetsUrl } from "../services/browserService.js";
export const creatingInvoice = (pdfBuffer) => {
  const fileName = `invoice_${Date.now()}.pdf`;
  const filePath = path.resolve("public", fileName);
  fs.writeFileSync(filePath, pdfBuffer);
  return fileName
};

export const generatingInvoice = async (req) => {
  const page = await getBrowser().newPage();
  const templatePath = path.resolve("views/index.ejs");
  const template = await ejs.renderFile(templatePath, {
    content: {
      data: req.body.meta_data,
    },
    publicAssetsUrl: getPublicAssetsUrl(),
    pdfData: req.body,
  });
  await page.setContent(template, {
    waitUntil: "load",
    timeout: 10000,
  });
  const pdfBuffer = await page.pdf({
    path: "document.pdf",
    width: "595px",
    height: "842px",
    margin: { top: "50px", right: "40px", bottom: "50px", left: "35px" },
    footerTemplate: '<footer style="height: 50px"></footer>',
    displayHeaderFooter: true,
    printBackground: true,
  });
  await page.close();
  const fileName = creatingInvoice(pdfBuffer);
  return { pdfBuffer, fileName };
};
export const generatingNf2 = async (req) => {
  const page = await getBrowser().newPage();
  const templatePath = path.resolve("views/nf2.ejs");
  const template = await ejs.renderFile(templatePath, {
    content: {
      data: req.body.meta_data,
    },
    publicAssetsUrl: getPublicAssetsUrl(),
    pdfData: req.body,
  });
  await page.setContent(template, {
    waitUntil: "load",
    timeout: 10000,
  });
  const pdfBuffer = await page.pdf({
    path: "document.pdf",
    width: "595px",
    height: "842px",
    margin: { top: "50px", right: "40px", bottom: "50px", left: "35px" },
    footerTemplate: '<footer style="height: 50px"></footer>',
    displayHeaderFooter: true,
    printBackground: true,
  });
  await page.close();
  const fileName = creatingInvoice(pdfBuffer);
  return { pdfBuffer, fileName };
};
