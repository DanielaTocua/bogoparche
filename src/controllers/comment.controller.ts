import { Request, Response } from "express";
import * as commentServices from "../services/comment.service"
import { STATUS_CODES } from "../utils/constants";
import * as activityUtils from "../utils/activity.utils";
class CommentController {
    async createComment (req: Request, res: Response): Promise<void> {
        const esPlan = req.body.es_plan
        const tabla = activityUtils.getTable(esPlan)
        const idActividad = req.body.id_actividad
        const idUsuario = req.body.user_id
        const textoComentario = req.body.texto_comentario
        try {
            const result = await commentServices.addComment(textoComentario,idUsuario,idActividad,tabla);
			const id = result.rows[0].id_actividad;
			res.json({id});
		} catch (error) {
			res.json({ error: error }).status(STATUS_CODES.BAD_REQUEST);
		}
    }

    async getCommentsFromTable(req: Request, res: Response): Promise<void> {
        const esPlan = JSON.parse(req.params.es_plan);
        const tabla = activityUtils.getTable(esPlan)
        const idActividad = parseInt(req.params.id)
        try {
            const result = await commentServices.getComments(idActividad,tabla)
            res.json(result.rows)    
        } catch (error) {
            res.json({ error: error }).status(STATUS_CODES.NOT_FOUND);
        }
        
    }
}

export default new CommentController();
