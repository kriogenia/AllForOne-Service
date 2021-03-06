import * as TokenService from "@/services/TokenService";
import { errorHandler } from "@/shared/ErrorHandler";
import { badRequestError, ERR_MSG, unathorizedError } from "@/shared/errors";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Validates the token passed in the Authorization header following the HTTP conventions.
 * If it's valid adds the same header to the response, stores the uuid of the user in the
 * request as sessionId and calls the next function.
 * It throws an error if the header is invalid or the token doesn't correspond to any
 * active session.
 * @param req original request
 * @param res carried response
 * @param next next function
 */
export const validateToken = async (req: Request, res: Response, next: NextFunction)
: Promise<void> => {
	const header = req.headers.authorization;
	let token: string;
	try { token = extractToken(header); } catch(e) { return next(e); }

	return TokenService.checkAuth(token)
		.then((isValid) => {
			if (isValid) {
				res.setHeader("Authorization", header);
				req.sessionId = TokenService.extractId(token);
				next();
			} else {
				throw unathorizedError(ERR_MSG.session_invalid);
			}
		})
		.catch(next)
}


export const extractToken = (header: string): string => {
	if (!header) {
		throw badRequestError(ERR_MSG.auth_header_missing);
	}

	const parts = header.split(" ");
	if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
		throw badRequestError(ERR_MSG.auth_header_wrong);
	}

	return parts[1];
}

/**
 * Handles the errors associated to a request and response
 * @param err error to handle
 * @param _req original request
 * @param res carried response
 * @param _next next function
 * @returns error response to return to the user
 */
 export const handleError = (err: Error, _req: Request, res: Response, next: NextFunction) 
 : void => {
	errorHandler.handleError(err);
    if (errorHandler.isTrustedError(err)) {
        res.status(err.status).json(err.toJson()).send();
		next();
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "An unexpected error has occurred"
        }).send();
		next(err);
    }
}