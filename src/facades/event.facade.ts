import activityService from "../services/activity.service";
import eventService from "../services/event.service";
import { Activity } from "../entity/Activity";
import { Event } from "../entity/Event";
import { EventUpdateDTO, NewEventEntryDTO } from "../dtos/activity.dto";

class EventFacade {
	async getEvent(id: number): Promise<Event> {
		const result = await eventService.findEventById(id);
		return result;
	}

	async editEvent(id: number, newEventUpdated: EventUpdateDTO, userId: number, isAdmin: boolean): Promise<Event> {

		// checks if event exists
		const event = await eventService.findEventById(id);

		const activity:Activity = event.activity;
		
		activityService.checkAccess(activity, userId, isAdmin)

		// Updates info
		const result = await eventService.editEvent(id, newEventUpdated);
		return result;
	}

	async addEvent(
		newEventEntry: NewEventEntryDTO,
		isAdmin: boolean,
	): Promise<Event> {
		// Creates an event

		let result: Event;
		if (isAdmin) {
			result = await eventService.addEvent({
				...newEventEntry,
				es_aprobado: true,
			});
		} else {
			result = await eventService.addEvent({
				...newEventEntry,
				es_aprobado: false,
			});
		}
		return result;
	}
}

export default new EventFacade();
