import "dotenv/config";
import app from "./app.js";
import { initializeBrowser } from "./src/services/browserService.js";
import "./src/config/db.js";

const PORT = process.env.PORT || 3000;
initializeBrowser()
  .then(() => {
    console.log("Browser initialized successfully.");
    app.listen(PORT);
  })
  .catch((err) => {
    console.error("Failed to initialize browser:", err);
    process.exit(1);
  });
