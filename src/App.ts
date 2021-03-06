import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import baseRouter from "@/routes";
import { Environment } from "@/shared/values";
import { handleError } from "@/routes/middlewares";

/*********** CREATE THE EXPRESS APPLICATION **********/
/** Express application */
const app = express();

/************** PRE-ROUTING MIDDLEWARES **************/

/* istanbul ignore next */	// Not part of the test environment
if (process.env.NODE_ENV === Environment.DEV) {
	/* Logs all the incoming requests */
    app.use(morgan("dev"));
}

/* istanbul ignore next */	// Not part of the test environment
if (process.env.NODE_ENV === Environment.PROD) {
	/* Sets security headers */
    app.use(helmet());
}

/* Parses the body JSONs */
app.use(json())

/**************** SET THE BASE ROUTER ****************/
app.use(baseRouter);

/************* POST-ROUTING MIDDLEWARES **************/
app.use(handleError);

/************** EXPORT THE APPLICATION ***************/
export { app }