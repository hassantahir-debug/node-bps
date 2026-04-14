import { Router } from "express";
import {
  generatingInvoiceController,
  generatingNf2Controller,
} from "../controllers/documentController.js";

const documentRouter = Router();
documentRouter.post("/", generatingInvoiceController);
documentRouter.post("/nf2", generatingNf2Controller);
export default documentRouter;
