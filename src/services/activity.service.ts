import { appDataSource } from "../dataSource";
import { Activity } from "../entity/Activity";
import { Category } from "../entity/Category";
import { Favorite } from "../entity/Favorite";
import { ServerError } from "../errors/server.error";
import { STATUS_CODES } from "../utils/constants";

class ActivityService {
	async findActivityById(id: number): Promise<Activity> {
		if (typeof id != "number") {
			throw new ServerError("Invalid id", STATUS_CODES.BAD_REQUEST);
		}
		try {
			const activity = await Activity.findOneByOrFail({ id });
			return activity;
		} catch {
			throw new ServerError(
				`The activity id: ${id} does not exist`,
				STATUS_CODES.BAD_REQUEST,
			);
		}
	}

	async findAllNotApproved(): Promise<Activity[]> {
		console.log("IN FIND ALL NOT APPROVED");
		const notApprovedActivities = (await appDataSource.manager.query(
			`SELECT  id, titulo_actividad, ubicacion, rango_precio, descripcion, restriccion_edad, medio_contacto,id_categoria, es_plan FROM activity WHERE es_aprobado IS false AND es_privada IS false`,
		)) as Activity[];
		return notApprovedActivities;
	}

	async findAllPublic(): Promise<Activity[]> {
		console.log("IN FIND ALL PUBLIC");
		const publicActivities = (await appDataSource.manager.query(
			`SELECT  id, titulo_actividad, ubicacion, rango_precio, descripcion, restriccion_edad, medio_contacto,id_categoria, es_plan FROM activity WHERE es_aprobado IS true AND es_privada IS false`,
		)) as Activity[];
		return publicActivities;
	}

	async findUserPrivate(id: number): Promise<Activity[]> {
		console.log("IN FIND USER PRIVATE");
		const privateActivities = (await appDataSource.manager.query(
			`SELECT  id, titulo_actividad, ubicacion, rango_precio, descripcion, restriccion_edad, medio_contacto,id_categoria, es_plan FROM activity WHERE es_privada IS true AND id_usuario = $1`,
			[id]
		)) as Activity[];
		return privateActivities;
	}

	async deleteActivity(activity: Activity): Promise<Activity> {
		Activity.remove(activity);
		// Puede cambiarse a raw queries
		return activity;
	}

	async findAllPublicAuthenticated(id: number): Promise<(Activity&{attendance:boolean, favorite:boolean})[]> {
		// Puede cambiarse a raw queries

		try{
			const publicActivities = (await appDataSource.manager
				.query(`SELECT activity.id,
				CASE WHEN favorite.id IS NULL THEN false ELSE true END AS favorite,
				CASE WHEN attendance.id IS NULL THEN false  ELSE true   END AS attendance,
				titulo_actividad, ubicacion, rango_precio, descripcion, restriccion_edad,
				medio_contacto,id_categoria, activity.es_plan
				FROM activity LEFT JOIN favorite ON activity.id=favorite.id_actividad AND  favorite.id_usuario = $1
				LEFT JOIN attendance ON activity.id=favorite.id_actividad AND  attendance.id_usuario = $1 WHERE es_aprobado IS true AND es_privada IS false`,[id])) as (Activity&{attendance:boolean, favorite:boolean})[];
			return publicActivities;
		} catch (error) {
			throw new ServerError(
				"There's been an error, try again later",
				STATUS_CODES.INTERNAL_ERROR,
			);
		}
	}
		

	async findCategory(nombre_categoria: string) {
		if (typeof nombre_categoria != "string" || nombre_categoria == "") {
			throw new ServerError("Invalid category name", STATUS_CODES.BAD_REQUEST);
		}
		try {
			const categoria = Category.findOneByOrFail({ nombre_categoria });
			return categoria;
		} catch {
			throw new ServerError(
				`There is no category ${nombre_categoria}`,
				STATUS_CODES.BAD_REQUEST,
			);
		}
	}

	filterByPrices(rangePrices: string[], filtered: any[]) {
		const filteredByPrice: any[] = [];
		if (rangePrices.length != 0) {
			for (let i = 0; i < rangePrices.length; i++) {
				const filteredPriceI = filtered.filter(
					(activity) => activity.rango_precio == rangePrices[i],
				);
				for (let n = 0; n < filteredPriceI.length; n++) {
					filteredByPrice.push(filteredPriceI[n]);
				}
			}
			filtered = filteredByPrice;
		}
		return filtered;
	}

	async filterByCategory(categories: string[], filtered: any[]) {
		const filteredByCateg: any[] = [];
		if (categories.length != 0) {
			for (let i = 0; i < categories.length; i++) {
				const id_categoria = (await this.findCategory(categories[i])).id;
				const filteredCategI = filtered.filter(
					(activity) => activity.id_categoria === id_categoria,
				);
				for (let n = 0; n < filteredCategI.length; n++) {
					filteredByCateg.push(filteredCategI[n]);
				}
			}
			filtered = filteredByCateg;
		}
		return filtered;
	}

	/*
	filterByFavorites(filtered: any[]) {
		const filteredByCateg: any[] = [];
				const id_categoria = (await this.findCategory(categories[i])).id;
				const filteredCategI = filtered.filter(
					(activity) => activity.id_categoria === id_categoria,
				);
				for (let n = 0; n < filteredCategI.length; n++) {
					filteredByCateg.push(filteredCategI[n]);
				}
			filtered = filteredByCateg;
		return filtered;
	}
	*/

	searchByWords(search: string[], filtered: any[]) {
		if (search.length != 0) {
			for (let i = 0; i < search.length; i++) {
				filtered = filtered.filter(
					(activity) =>
						String(activity.titulo_actividad)
							.toLowerCase()
							.includes(String(search[i]).toLowerCase()) ||
						String(activity.descripcion)
							.toLowerCase()
							.includes(String(search[i]).toLowerCase()) ||
						String(activity.ubicacion)
							.toLowerCase()
							.includes(String(search[i]).toLowerCase()),
				);
			}
		}
		return filtered;
	}

	async addFavorites(id_usuario: number, id_actividad: number): Promise<void> {
		if (await Favorite.findOneBy({ id_usuario, id_actividad })) {
			return;
		}
		const newFavorite = Favorite.create({ id_usuario, id_actividad });
		await newFavorite.save();
	}

	async deleteFavorites(
		id_usuario: number,
		id_actividad: number,
	): Promise<void> {
		const favorite = await Favorite.findOneBy({ id_actividad, id_usuario });
		if (favorite === null) {
			throw new ServerError(
				"This favorite does not exist",
				STATUS_CODES.BAD_REQUEST,
			);
		}
		Favorite.remove(favorite);
	}

	async getFavoritebyActivityId(
		id_usuario: number,
		id_actividad: number,
	): Promise<boolean> {
		const foundFavorite = await Favorite.findOneBy({
			id_usuario,
			id_actividad,
		});
		return foundFavorite === null ? true : false;
	}
}
export default new ActivityService();
