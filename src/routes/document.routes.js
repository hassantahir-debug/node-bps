import { Router } from "express";
import { generateVehiclePDF } from "../controllers/documentController.js";

const documentRouter = Router();
documentRouter.post("/", generateVehiclePDF);
export default documentRouter;
