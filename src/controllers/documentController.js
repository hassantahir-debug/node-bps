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
  savingDocuments("invoice", fileName, id, fileSizeInBytes);
  
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
  
  // Stream response
  const pdfStream = Readable.from(pdfBuffer);
  
  // Pipe response
  pdfStream
    .pipe(res)
    .on("end", () => res.end())
    .on("error", () => res.end());
});
