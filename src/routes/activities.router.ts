import express from "express"; //ESModules

import activityController from "../controllers/activity.controller";
import eventController from "../controllers/event.controller";
import planController from "../controllers/plan.controller";
import asyncErrorMiddleware from "../middlewares/asyncError.middleware";
import commentController from "../controllers/comment.controller";
// import toNewActivityEntry from '../utils/utils_activity'

// Crea router
const router = express.Router();

// Gets all activities (plan/events)
router.route("/activities").get(activityController.getAll);

// Creates activities
router
	.route("/create-activity")
	.post(asyncErrorMiddleware(activityController.addActivity));

router.route("/create-activity-suggestion")
	.post(asyncErrorMiddleware(activityController.addActivity));

// Edit activities
router
	.route("/edit-activity/:id/:es_plan")
	.put(asyncErrorMiddleware(activityController.editActivity));

// Deletes activities	
router.route("/delete-activity/:id/:es_plan")
	.delete(asyncErrorMiddleware(activityController.deleteActivity));

// Gets activities
router.route("/get-activity/:id/:es_plan")
	.get(asyncErrorMiddleware(activityController.getActivity));

// Create Event
router.route("/event").post(asyncErrorMiddleware(eventController.addEvent));

// Filter activities
router.route('/filter')
    .get(activityController.filter);

router.route('/comment')
	.post(commentController.createComment)

router.route('/get-comments/:id/:es_plan')
	.get(commentController.getCommentsFromTable)

export default router;

