import { QueryResult } from "pg";

import pool from "../database/pool";
import { NewEventEntry, EventEntry } from "../dtos/activityTypes.dto";

// Find Event by Id
export const findEventById = async (id: string): Promise<QueryResult<any>> => {
	// Connects to the DB
	const client = await pool.connect();
	const result = await client.query(
		`SELECT * FROM evento WHERE id_actividad = $1`,
		[id],
	);
	client.release();
	if (result.rowCount === 0) {
		throw new Error(`No hay planes con el id ${id}`);
	}
	return result;
};

export const editEvent = async (eventEntry: EventEntry): Promise<QueryResult<any>> => {
	// Connects to the DB
	const client = await pool.connect();
	// Inserts Event
	const result = await client.query(
		`UPDATE evento SET ubicacion=$2, rango_precio=$3, descripcion=$4, restriccion_edad=$5, medio_contacto=$6, es_privada=$7, fecha_inicio=$8, fecha_fin=$9, hora_inicio=$10, hora_fin=$11, es_plan=$12, id_categoria=$13, es_aprobado=$14 WHERE id_actividad= $1`,
		[eventEntry.id_actividad, eventEntry.ubicacion, eventEntry.rango_precio, eventEntry.description, eventEntry.restriccion_edad, eventEntry.medio_contacto, eventEntry.es_privada, 
			eventEntry.fecha_inicio, eventEntry.fecha_fin, eventEntry.hora_inicio, eventEntry.hora_fin, eventEntry.es_plan, eventEntry.id_categoria, eventEntry.es_aprobado]);
	client.release();
	return result;
}

// Adds the id to the json
export const addEvent = async (
    newEventEntry: NewEventEntry): Promise<QueryResult<any>> => {
        const client = await pool.connect()
        // Inserts Event
        const result = await client.query(`INSERT INTO evento (titulo_actividad, ubicacion, rango_precio, descripcion, restriccion_edad, medio_contacto, es_privada, fecha_inicio, fecha_fin, hora_inicio, hora_fin, es_plan, id_categoria, es_aprobado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id_actividad`,
        [newEventEntry.titulo_actividad, newEventEntry.ubicacion, newEventEntry.rango_precio, newEventEntry.description, newEventEntry.restriccion_edad, newEventEntry.medio_contacto, newEventEntry.es_privada, newEventEntry.fecha_inicio, 
            newEventEntry.fecha_fin, newEventEntry.hora_inicio, newEventEntry.hora_fin,newEventEntry.es_plan, newEventEntry.id_categoria, newEventEntry.es_aprobado])
        client.release();
    return result
}


// Deletes event
export const deleteEvent = async (id: string): Promise<void> => {
	const client = await pool.connect();
	await client.query("DELETE FROM evento WHERE id_actividad = $1", [id]);
	client.release();
};
