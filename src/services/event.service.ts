import { instanceToPlain, plainToInstance } from "class-transformer";

import dataSource from "../database/dataSource.";
import { appDataSource } from "../dataSource";
import {
	EventUpdateDTO,
	NewActivityEntryDTO,
	NewEventEntryDTO,
} from "../dtos/activity.dto";
import { Activity } from "../entity/Activity";
import { Event } from "../entity/Event";
import { ServerError } from "../errors/server.error";
import { STATUS_CODES } from "../utils/constants";

class EventService {
	// Find Event by Id
	async findEventById(id: number): Promise<any> {
		try {
			const event = await Event.findOneOrFail({ where: { id: id } });
			const eventWithEsPlan = { ...event, es_plan: false };
			return eventWithEsPlan;
		} catch {
			throw new ServerError(
				`The event id: ${id} does not exist`,
				STATUS_CODES.BAD_REQUEST,
			);
		}
	}

	async editEvent(id: number, eventEntry: EventUpdateDTO): Promise<Event> {
		// create a new query runner
		const queryRunner = appDataSource.createQueryRunner();

		// establish real database connection
		await queryRunner.connect();

		// open a new transaction:
		await queryRunner.startTransaction();

		const activityEntry = plainToInstance(NewActivityEntryDTO, eventEntry, {
			excludeExtraneousValues: true,
		});

		try {
			await Activity.update(id, instanceToPlain(activityEntry));
			const eventUpdateEntry = { 
				fecha_inicio: eventEntry.fecha_inicio ,
				fecha_fin: eventEntry.fecha_fin,
				hora_inicio: eventEntry.hora_inicio,
				hora_fin: eventEntry.hora_fin
			};

			if (!Object.values(eventUpdateEntry).every((el) => el === undefined)) {
				await Event.update(id, eventUpdateEntry);
			}

			// commit transaction
			await queryRunner.commitTransaction();
		} catch (err) {
			// rollback changes we made
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			throw new ServerError(
				"There's been an error, try again later",
				STATUS_CODES.BAD_REQUEST,
			);
		}
		// release query runner
		await queryRunner.release();

		return await Event.findOneOrFail({ where: { id } });
	}

	// Adds the id to the json
	async addEvent(newEventEntry: NewEventEntryDTO): Promise<Event> {
		const newActivityEntry = plainToInstance(
			NewActivityEntryDTO,
			newEventEntry,
			{ excludeExtraneousValues: true },
		);
		try {
			return await appDataSource.manager.transaction(
				async (transactionalEntityManager) => {
					const newActivity = Activity.create(
						instanceToPlain(newActivityEntry),
					);
					const createdActivity = await transactionalEntityManager.save(
						newActivity,
					);
					const newEvent = Event.create({
						id: createdActivity.id,
						fecha_inicio: newEventEntry.fecha_inicio,
						fecha_fin: newEventEntry.fecha_fin,
						hora_inicio: newEventEntry.hora_inicio,
						hora_fin: newEventEntry.hora_fin,
					});
					console.log(newEvent);
					const createdEvent = await transactionalEntityManager.save(newEvent);
					return createdEvent;
				},
			);
		} catch (error) {
			throw new ServerError(
				"There's been an error, try again later",
				STATUS_CODES.INTERNAL_ERROR,
			);
		}
	}

	// Deletes event
	async deleteEvent(id: number): Promise<Event> {
		if (typeof id != "number") {
			throw new ServerError("Invalid id", STATUS_CODES.BAD_REQUEST);
		}

		// Finds Event
		const event = await this.findEventById(id);

		// create a new query runner
		const queryRunner = dataSource.createQueryRunner();

		// establish real database connection
		await queryRunner.connect();

		// open a new transaction:
		await queryRunner.startTransaction();

		try {
			Event.remove(event);
			// commit transaction
			await queryRunner.commitTransaction();
		} catch (err) {
			// rollback changes we made
			await queryRunner.rollbackTransaction();
		} finally {
			// release query runner
			await queryRunner.release();
		}

		return event;
	}
}
export default new EventService();
