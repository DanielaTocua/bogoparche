import { plainToInstance } from "class-transformer";
import { NextFunction, Request, Response } from "express";

import { UserRegisterDTO } from "../dtos/user.dto";
import UserFacade from "../facades/user.facade";
import { STATUS_CODES } from "../utils/constants";

class UserController {
	async registerUser(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
<<<<<<< HEAD
		console.log("a")
=======
>>>>>>> 7a99664b067eb018fba5ca9bb0f8c9e0df84186c
		const userDTO = plainToInstance(UserRegisterDTO, req.body);
		res.json(await UserFacade.registerUser(userDTO)).status(STATUS_CODES.OK);
	}
}

export default new UserController();
