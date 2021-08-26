import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes"; 
import * as UserService from "@/services/UserService";
import * as GoogleAuth from "@/services/GoogleAuth";
import * as TokenService from "@/services/TokenService";
import { User } from "@/models/User";
import { LeanDocument } from "mongoose";
import { SessionPackage } from "@/interfaces";

interface SignInParams {
	token: string
}

interface SignInResponse {
	session: SessionPackage,
	user: LeanDocument<User>
}

/**
 * Checks the GoogleIdToken of the user and if it's valid returns a response
 * with the application user details.
 * In case that the user doesn't have an application account, create a
 * new one to return.
 * @param req request with the Google credentials
 * @param res carried response
 * @returns response with the user account details
 */
export const signIn = async (
	req: Request<SignInParams>, 
	res: Response<SignInResponse>, 
	next: NextFunction): Promise<void|Response<SignInResponse>> => 
{
	// Verify the Google token
	return GoogleAuth.verify(req.params.token)
		.then(UserService.getUserByGoogleId)	// And get the user to return
		.then((user) => res.status(StatusCodes.OK).json({
				session: TokenService.generate(user.id),
				user: user.toJSON()
			}).send())
		.catch(next);
}