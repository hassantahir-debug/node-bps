import { Router } from "express";
import {
  generatingInvoice,
  generatingNf2,
} from "../controllers/documentController.js";

const documentRouter = Router();
documentRouter.post("/", generatingInvoice);
documentRouter.post("/nf2", generatingNf2);
export default documentRouter;
