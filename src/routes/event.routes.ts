import express from "express"; //ESModules

import eventController from "../controllers/event.controller";
import { NewEventEntryDTO } from "../dtos/activity.dto";
import asyncErrorMiddleware from "../middlewares/asyncError.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import dtoValidationMiddleware from "../middlewares/dtoValidation.middleware";
import idNumberValidation from "../middlewares/idNumberValidation.middleware";
import validateAdminMiddleware from "../middlewares/validateAdmin.middleware";
// import toNewActivityEntry from '../utils/utils_activity'

// Crea router
const router = express.Router();

// Creation
router
	.route("")
	.post(
		[authMiddleware, dtoValidationMiddleware(NewEventEntryDTO)],
		asyncErrorMiddleware(eventController.addEvent),
	);

// Editing
router
	.route("/:id")
	.put(
		[authMiddleware, idNumberValidation],
		asyncErrorMiddleware(eventController.editEvent),
	);

export default router;
