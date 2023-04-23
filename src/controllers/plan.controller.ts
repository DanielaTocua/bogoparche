import { PlanEntry } from "@/dtos/activityTypes.dto";
import { Request, Response } from "express";

import * as planServices from "../services/plan.service";
import { STATUS_CODES } from "../utils/constants";
import toNewPlanEntry from "../utils/plan.utils";

class PlanController {
	async getPlan(req: Request, res: Response): Promise<void> {
		const result = planServices.findPlanById(req.params.id);
		const rowCount = (await result).rowCount;
		const rows = (await result).rows;
		rowCount != 0 ? res.json(rows[0]) : res.status(STATUS_CODES.NOT_FOUND);
	}

	async deletePlan(req: Request, res: Response): Promise<void> {
		const result = planServices.findPlanById(req.params.id);
		const rowCount = (await result).rowCount;
		if (rowCount === 0) {
			res
				.json({ message: "No existe el registro que desea eliminar" })
				.status(STATUS_CODES.NOT_FOUND);
		}
		planServices.deletePlan(req.params.id);
		const rows = (await result).rows;
		res.json(rows[0]);
	}

	async editPlan(req: Request, res: Response): Promise<void> {
		// Checks if id_activity exists
		const result = planServices.findPlanById(req.params.id);
		const rowCount = (await result).rowCount;
		if (rowCount === 0) {
			res
				.json({ message: "No existe el registro que desea editar" })
				.status(STATUS_CODES.NOT_FOUND);
		}
		// Updates info
		const id:number = Number (JSON.parse(req.params.id))
		const newPlanEntry = await toNewPlanEntry(req.body);
		const planEntry: PlanEntry = {
			id_actividad: id,
			... newPlanEntry}
		
		planServices.editPlan(planEntry);
		const rows = (await result).rows;
		res.json(rows[0]);
	}

	async addPlan(req: Request, res: Response): Promise<void> {
		try {
			// Retrieves plan info
			const newPlanEntry = await toNewPlanEntry(req.body);
			const result = await  planServices.addPlan(newPlanEntry);
			const id = result.rows[0].id_actividad;
			res.json({id});
		} catch (error) {
			res.json({ error: error }).status(STATUS_CODES.BAD_REQUEST);
		}
	}
}

export default new PlanController();
