import { QueryResult } from "pg";
import pool from "../database/pool";

// Find Plan by Id
export const getComments = async (
	idActividad:number,
	tabla: string): Promise<QueryResult<any>> => {
	// Connects to the DB
	const client = await pool.connect();
	const result = await client.query(
		`SELECT * FROM ${tabla} WHERE id_actividad = $1`,
		[idActividad],
	);
	client.release();
	if (result.rowCount === 0) {
		throw new Error(`No hay comentarios para ${idActividad}`);
	}
	return result;
};

// Adds the id to the json
export const addComment = async (
    textoComentario: string, 
	idUsuario: number,
	idActividad: number,
	tabla: string): Promise<QueryResult<any>> => {
        // Connects to the DB
		const client = await pool.connect();
        // Inserts Comment
        const result = await client.query(
            `INSERT INTO ${tabla} (id_usuario, id_actividad, texto_comentario) VALUES ($1, $2, $3) RETURNING id_comentario`,
            [idUsuario,idActividad,textoComentario]
        );
        client.release();
    return result
};