import express from "express";
import router from "./routes/index";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api", router);
app.use("/uploads", express.static("src/uploads"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
