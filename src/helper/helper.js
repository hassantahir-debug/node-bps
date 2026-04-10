
import fs from "fs";
import path from "path";

export const creatingInvoice = (pdfBuffer) => {
  const fileName = `invoice_${Date.now()}.pdf`;
  const filePath = path.resolve("public", fileName);
  fs.writeFileSync(filePath, pdfBuffer);
  return fileName
};
