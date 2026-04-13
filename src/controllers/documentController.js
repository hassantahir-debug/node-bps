import { generatingInvoice, generatingNf2 } from "../helper/helper.js";
import { Readable } from "stream";

export const generatingInvoiceController = async (req, res) => {
  try {
    const { pdfBuffer, fileName } = await generatingInvoice(req);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("x-file-name", fileName);
    const pdfStream = Readable.from(pdfBuffer);
    const id = req.body.meta_data.id
    try {
      const docFile = new FormData()
      docFile.append("bill_id", id)
      docFile.append("file", pdfBuffer, {
        filename: fileName,
        contentType: "application/pdf"
      })
      const res = await fetch(`${process.env.LARAVEL_URL}/api/document`, {
        method: "POST",
        body: docFile,
      })
      console.log(res)
    } catch (error) {
      throw new Error("error sending file in laravel", error)
    }
    pdfStream
      .pipe(res)
      .on("end", () => res.end())
      .on("error", () => res.end());

  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(500).json({ error: "Failed to generate invoice" });
  }
};

export const generatingNf2Controller = async (req, res) => {
  try {
    const { pdfBuffer, fileName } = await generatingNf2(req);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("x-file-name", fileName);
    const pdfStream = Readable.from(pdfBuffer);
    pdfStream
      .pipe(res)
      .on("end", () => res.end())
      .on("error", () => res.end());
  } catch (error) {
    console.error("Error generating NF2:", error);
    return res.status(500).json({ error: "Failed to generate NF2" });
  }
};