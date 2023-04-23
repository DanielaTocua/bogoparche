<<<<<<< HEAD
import { NewActivityEntry } from "../dtos/activityTypes.dto";
import * as activityServices from "../services/activity.service";
import { RANGE_PRICES } from "./constants";
=======
import { NewActivityEntry, Range_prices } from "../dtos/activityTypes.dto";
import * as activityServices from "../services/activity.service";
>>>>>>> 7a99664b067eb018fba5ca9bb0f8c9e0df84186c

export const parseString = (string: any): string => {
	if (typeof string != "string") {
		console.log(string);
		throw new Error("Entrada incorrecta o faltante");
	}
	return string;
};

export const isString = (string: string): boolean => {
	return typeof string === "string";
};

const isDate = (date: string): boolean => {
	return Boolean(Date.parse(date));
};

const isPriceRange = (price_range: any): boolean => {
	return Object.values(RANGE_PRICES).includes(price_range);
};

<<<<<<< HEAD
export const parsePriceRange = (priceRangeFromRequest: any): RANGE_PRICES => {
=======
export const parsePriceRange = (priceRangeFromRequest: any): Range_prices => {
>>>>>>> 7a99664b067eb018fba5ca9bb0f8c9e0df84186c
	if (
		!isString(priceRangeFromRequest) ||
		!isPriceRange(priceRangeFromRequest)
	) {
		console.log(
			typeof priceRangeFromRequest,
			isPriceRange(priceRangeFromRequest),
		);
		throw new Error(`Rango de precio no válido`);
	}
	return priceRangeFromRequest;
};

export const parseCategoria = async (
	nombre_categoria: any,
): Promise<number> => {
	const result = await activityServices.findCategory(nombre_categoria);
	const rows = result.rows;
	return rows[0].id_categoria;
};

export const categoriaAsNumber = async (
	promise: Promise<number>,
): Promise<number> => {
	return await promise;
};

const toNewActivityEntry = async (object: any): Promise<NewActivityEntry> => {
	const newEntry: NewActivityEntry = {
		titulo_actividad: parseString(object.titulo_actividad),
		ubicacion: parseString(object.ubicacion),
		rango_precio: parsePriceRange(object.rango_precio),
<<<<<<< HEAD
		descripcion: parseString(object.description),
=======
		description: parseString(object.description),
>>>>>>> 7a99664b067eb018fba5ca9bb0f8c9e0df84186c
		restriccion_edad: object.restriccion_edad,
		medio_contacto: parseString(object.medio_contacto),
		es_privada: object.es_privada,
		es_plan: object.es_plan,
		id_categoria: await parseCategoria(object.categoria),
		es_aprobado: object.es_aprobado,
	};
	return newEntry;
};

export default toNewActivityEntry;
