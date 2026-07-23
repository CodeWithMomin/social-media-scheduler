import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRotuer from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/socialAuthRoutes.js";
import accountRouter from "./routes/accountsRoutes.js";
import postRouter from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import { initScheduler } from "./services/schedulerService.js";

const app = express();
// Database connection
await connectDB()

// Middleware
app.use(cors())
app.use(express.json());

app.use('/api/auth',authRotuer)
app.use('/api/oauth',socialAuthRouter)
app.use('/api/accounts',accountRouter)
app.use('/api/posts',postRouter)
app.use('/api/activity',activityRouter)
// initialize scheduler 
initScheduler();

const port = process.env.PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});
//Global Error handler
app.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{
console.error(err)
res.status(500).send(err?.response.data.message || err?.message)
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});