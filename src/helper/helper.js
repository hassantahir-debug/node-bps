import fs from "fs";
import path from "path";
import ejs from "ejs";
import { getBrowser, getPublicAssetsUrl } from "../services/browserService.js";
import { nf2DataService } from "../services/nf2DatasService.js";

export const creatingDoc = async (pdfBuffer, docName = "invoice") => {
  const fileName = `${docName}_${Date.now()}.pdf`;
  const filePath = path.resolve("public", fileName);
  await fs.promises.writeFile(filePath, pdfBuffer);
  const stats = await fs.promises.stat(filePath);
  const fileSizeInBytes = stats.size;

  return { fileName, fileSizeInBytes };
};
export const savingDocuments = async (
  type,
  fileName,
  id,
  fileSizeInBytes,
  req,
) => {
  try {
    const cookies = req.headers.cookie || "";
    const sendObj = {
      bill_id: id,
      document_type: type || "nf2",
      file_name: fileName,
      file_size: fileSizeInBytes,
      file_path: `${process.env.APP_URL}/${fileName}`,
      file_type: "pdf",
      upload_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      uploaded_by: 2,
      version: "1",
    };
    const fetchResponse = await fetch(
      `${process.env.LARAVEL_URL}/api/document`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Cookie: cookies,
        },
        body: JSON.stringify(sendObj),
      },
    );
    if (!fetchResponse.ok) {
      const errorDetail = await fetchResponse.text();
      console.error("Error Detail:", errorDetail);
      return { error: true };
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending file to Laravel:", error);
  }
};
export const generatingInvoice = async (req) => {
  const page = await getBrowser().newPage();
  const templatePath = path.resolve("views/index.ejs");
  const template = await ejs.renderFile(templatePath, {
    content: {
      data: req.body,
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
    printBackground: true,
  });
  await page.close();
  const { fileName, fileSizeInBytes } = await creatingDoc(pdfBuffer);
  return { pdfBuffer, fileName, fileSizeInBytes };
};
export const generatingNf2 = async (req) => {
  const page = await getBrowser().newPage();

  const randomId = Math.floor(Math.random() * 20) + 1;
  const accidentData = await nf2DataService(randomId, req);

  const templatePath = path.resolve("views/nf2.ejs");

  const pdfData = {
    ...req.body,
    accident: accidentData,
  };

  const template = await ejs.renderFile(templatePath, {
    pdfData,
    publicAssetsUrl: getPublicAssetsUrl(),
  });

  await page.setContent(template, {
    waitUntil: "load",
    timeout: 10000,
  });

  const pdfBuffer = await page.pdf({
    width: "595px",
    height: "842px",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await page.close();

  const { fileName } = await creatingDoc(pdfBuffer, "nf2");
  return { pdfBuffer, fileName };
};
