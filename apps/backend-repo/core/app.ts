const express = require("express");
const cors = require('cors');

import userRoutes from "../routes/userRoutes";
import { initStatusListener } from "./statusListener";

const app = express();
app.use(cors());
const PORT = 3001;

app.use(express.json());
app.use("/", userRoutes);

// Initialize Firebase status listener
initStatusListener();

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
