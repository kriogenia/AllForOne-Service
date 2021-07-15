import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import { Environment } from "./shared/constants";

/**
 * Express server to manage all the routing
 */
const app = express();

/************** PRE-ROUTING MIDDLEWARES **************/

if (process.env.NODE_ENV === Environment.DEV) {
	// Logs all the incoming requests
    app.use(morgan("dev"));
}

if (process.env.NODE_ENV === Environment.PROD) {
	// Sets security headers
    app.use(helmet());
}

// Testing endpoint
app.get("/", (_req, res) => res.send("Hello world"));

export { app }