import { instanceToPlain, plainToInstance } from "class-transformer";

import { appDataSource } from "../dataSource";
import {
	NewActivityEntryDTO,
	NewPlanEntryDTO,
	PlanUpdateDTO,
} from "../dtos/activity.dto";
import { Activity } from "../entity/Activity";
import { Plan } from "../entity/Plan";
import { Visibility } from "../entity/Visibility";
import { ServerError } from "../errors/server.error";
import { STATUS_CODES } from "../utils/constants";
import { RelatedActivity } from "../entity/RelatedActivity";

class PlanService {
	// Find Plan by Id
	async findPlanById(id: number): Promise<any> {
		if (typeof id != "number") {
			throw new ServerError("Invalid id", STATUS_CODES.BAD_REQUEST);
		}
		try {
			const plan = await Plan.findOneOrFail({
				where: { id: id },
			});
			const planWithEsPlan = { ...plan, es_plan: true };
			return planWithEsPlan;
		} catch {
			throw new ServerError(
				`The plan id: ${id} does not exist`,
				STATUS_CODES.BAD_REQUEST,
			);
		}
	}

	// Adds the id to the json
	async addPlan(newPlanEntry: NewPlanEntryDTO): Promise<Plan> {
		const newActivityEntry = plainToInstance(
			NewActivityEntryDTO,
			newPlanEntry,
			{ excludeExtraneousValues: true },
		);
		return await appDataSource.manager.transaction(
			async (transactionalEntityManager) => {
				const newActivity = Activity.create(instanceToPlain(newActivityEntry));
				console.log(newActivity);
				const createdActivity = await transactionalEntityManager.save(
					newActivity,
				);

				if (createdActivity.es_privada){
					if (typeof(newActivityEntry.id_related_public_activity)!="undefined"){
						const newRelation = RelatedActivity.create({
							id_actividad_privada: createdActivity.id,
							id_actividad_publica: newActivityEntry.id_related_public_activity
						});
						const createdRelation = await transactionalEntityManager.save(newRelation)
					}
				}

				const newPlan = Plan.create({
					id: createdActivity.id,
					horario_plan: newPlanEntry.horario_plan,
				});

				const createdPlan = await transactionalEntityManager.save(newPlan);

				if (newPlanEntry.es_privada) {
					const newVisibility = Visibility.create({
						id_actividad: createdActivity.id,
						id_usuario: newActivityEntry.id_usuario,
					});
					await transactionalEntityManager.save(newVisibility);
				}
				return createdPlan;
			},
		);
	}

	// Edits Plan
	async editPlan(id: number, planEntry: PlanUpdateDTO): Promise<Plan> {
		// create a new query runner
		const queryRunner = appDataSource.createQueryRunner();

		// establish real database connection
		await queryRunner.connect();

		// open a new transaction:
		await queryRunner.startTransaction();

		const activityEntry = plainToInstance(NewActivityEntryDTO, planEntry, {
			excludeExtraneousValues: true,
		});

		await Activity.update(id, instanceToPlain(activityEntry));
		const planUpdateEntry = { horario_plan: planEntry.horario_plan };

		if (!Object.values(planUpdateEntry).every((el) => el === undefined)) {
			await Plan.update(id, planUpdateEntry);
		}

		// commit transaction
		await queryRunner.commitTransaction();

		// release query runner
		await queryRunner.release();

		return await Plan.findOneOrFail({ where: { id } });
	}
}

export default new PlanService();
