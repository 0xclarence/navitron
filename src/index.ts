import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import express, { Express } from "express";

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const app: Express = express();
const port = process.env.PORT ?? 8888;

dotenv.config();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
