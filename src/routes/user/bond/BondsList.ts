import { Role } from "@/models/User";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as UserService from "@/services/UserService";
import { badRequestError, ERR_MSG } from "@/shared/errors";
import { UserPublicDto } from "@/models/dto";

interface BondsResponse {
	bonds: UserPublicDto[]
}

export const list = async (
	req: Request, 
	res: Response<BondsResponse>, 
	next: NextFunction): Promise<void|Response<BondsResponse>> => 
{
	const id = req.sessionId;
	const role = await UserService.getRole(id);

	if (role === Role.Blank) return next(badRequestError(ERR_MSG.unauthorized_operation));
	
	const list = (role === Role.Patient)
		? UserService.getBonds(id)
		: UserService.getBondsOfCared(id);
	return list.then((users) => {
		const bonds = users.filter(u => u._id != id).map(u => u.dto());
		return res.status(StatusCodes.OK).send({bonds: bonds});
	}).catch(next);
}