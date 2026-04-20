import {
  generatingInvoice,
  generatingNf2,
  savingDocuments,
} from "../helper/helper.js";
import { Readable } from "stream";
import { asyncHandler } from "../utils/asyncHandler.js";

// Generate invoice
export const generatingInvoiceController = asyncHandler(async (req, res) => {
  // Create PDF
  const { pdfBuffer, fileName, fileSizeInBytes } = await generatingInvoice(req);

  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("x-file-name", fileName);

  // Stream response
  const pdfStream = Readable.from(pdfBuffer);
  const id = req.body.bill_id;

  // Save document
  const saveDocRes = await savingDocuments(
    "invoice",
    fileName,
    id,
    fileSizeInBytes,
    req,
  );
  if (saveDocRes.error)
    throw new Error("Error saving document kindly try again Later");
  // Pipe response
  pdfStream
    .pipe(res)
    .on("end", () => res.end())
    .on("error", () => res.end());
});

// Generate NF2
export const generatingNf2Controller = asyncHandler(async (req, res) => {
  // Create PDF
  const { pdfBuffer, fileName } = await generatingNf2(req);

  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("x-file-name", fileName);
  const id = req.body.bill_id;
  const fileSizeInBytes = pdfBuffer.length;
  // Stream response
  const pdfStream = Readable.from(pdfBuffer);
  await savingDocuments("NF2 Form", fileName, id, fileSizeInBytes, req);

  // Pipe response
  pdfStream
    .pipe(res)
    .on("end", () => res.end())
    .on("error", () => res.end());
});
