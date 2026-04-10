import ejs from "ejs";
import { Readable } from "stream";
import { getBrowser, getPublicAssetsUrl } from "../services/browserService.js";
import { creatingInvoice } from "../helper/helper.js";
import path from "path";
export const generatingInvoice = async (req, res) => {
  try {
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
      waitUntil: "networkidle0",
    });
    await page.evaluateHandle("document.fonts.ready");
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
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("x-file-name", fileName);
    const pdfStream = Readable.from(pdfBuffer);
    pdfStream
      .pipe(res)
      .on("end", () => res.end())
      .on("error", () => res.end());
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};
export const generatingNf2 = async (req, res) => {
  try {
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
      waitUntil: "networkidle0",
    });
    await page.evaluateHandle("document.fonts.ready");
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
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("x-file-name", fileName);
    const pdfStream = Readable.from(pdfBuffer);
    pdfStream
      .pipe(res)
      .on("end", () => res.end())
      .on("error", () => res.end());
  } catch (error) {
    console.error("Error generating nf-2:", error);
    return res.status(500).json({ error: "Failed to generate NF-2" });
  }
};
