import type { NextApiRequest, NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import { validateJWT } from "../../middlewares/validateJWT";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { UserModel } from "../../models/UserModel";
import { PostModel } from "../../models/PostModel";

const commentEndpoint = async(req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    try {
        if(req.method === "PUT") {
            const {userId, id} = req?.query;
            const loggedUser = await UserModel.findById(userId);
            const post = await PostModel.findById(id);
            const comment = req.body;

            if(!loggedUser) {
                return res.status(400).json({error: "Usuário não localizado"})
            }

            if(!post) {
                return res.status(400).json({error: "Publicação não localizada"})
            }

            if(!comment || comment.length < 1) {
                return res.status(400).json({error: "Comentário inválido"})
            }

            const newComment = {
                idUser: loggedUser._id,
                name: loggedUser.name,
                avatar: loggedUser.avatar,
                comment: comment
                 
            }

            post.comments.push(newComment)
            await PostModel.findByIdAndUpdate({_id: post._id}, post)
            return res.status(200).json({msg: "Comentário adicionado com sucesso"});
        }

        return res.status(405).json({error: "Método não permitido"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Erro ao enviar comentário, tente novamente mais tarde ou fale com o suporte"})
    }
}

export default validateJWT(connectMongoDB(commentEndpoint))