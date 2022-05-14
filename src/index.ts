import express, { Express } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { addReading, getReading } from './database';
import { DataController } from "./controllers/data"

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const dataController = new DataController()

//TODO: In order to make this solution scalable in terms of code, we should create a routes folder
app.post('/data', dataController.addData);
app.get('/data', dataController.getData);

app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));
