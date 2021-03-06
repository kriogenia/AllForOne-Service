import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as TaskService from "@/services/TaskService";
import { IdParam } from "@/shared/values";
import { ERR_MSG, unathorizedError } from "@/shared/errors";
import { FEED, FeedEvent } from "@/sockets/feed";
import { getFeedRoom } from "@/sockets/SocketHelper";
import * as NotificationService from "@/services/NotificationService";
import { io } from "@server";
import { GLOBAL } from "@/sockets/global";
import { Action } from "@/models/Notification";

/**
 * Removes the requested task
 * @param req request with the requester id and requested task id
 * @param res carried response
 * @param next invokation of the next middleware to use in case of error
 */
export const deleteTask = async (
	req: Request<IdParam>,
	res: Response, 
	next: NextFunction): Promise<void|Response> => 
{
	const { id } = req.params;
	let roomId: string;
	return getFeedRoom(req.sessionId)
		.then((room) => {
			roomId = room;
			if (!TaskService.belongsTo(id, room)) {
				throw unathorizedError(ERR_MSG.unauthorized_operation);
			}
			return TaskService.remove(id);
		})
		.then(async (task) => {
			io.to(roomId).emit(FeedEvent.DELETE, task);
			res.status(StatusCodes.NO_CONTENT).send();
			return NotificationService.removeCreatedTask(id)
		})
		.then((notification) => {
			if (!notification) return;
			notification.action = Action.TASK_DELETED;
			io.to(roomId.replace(FEED, GLOBAL)).emit(notification.event, notification.dto());
		})
		.catch(next);
}