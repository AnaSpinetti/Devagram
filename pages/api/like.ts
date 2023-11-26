import type { NextApiRequest, NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import { validateJWT } from "../../middlewares/validateJWT";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { PostModel } from "../../models/PostModel";
import { UserModel } from "../../models/UserModel";

const likeEndpoint = async(req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    
    try {
        if(req.method === "PUT"){
            const {id} = req?.query;
            const {userId} = req?.query;

            const post = await PostModel.findById(id);
            const user = await UserModel.findById(userId);

            if(!post){
                return res.status(400).json({error: "Públicação não localizada"})
            }
                    
            if(!user){
                return res.status(400).json({error: "Usuário não localizada"})
            }

            // Se o resultado for -1 ele não curtiu a foto, se for maior que -1 ele ja curte a foto
            const userIndex = post.likes.findIndex((e : any) => e.toString() === user._id.toString())
            
            if(userIndex !== -1){
                post.likes.splice(userIndex, 1);
                await PostModel.findByIdAndUpdate({_id: post._id}, post)
                return res.status(200).json({msg: "Você descurtiu essa publicação"})
            }else{
                post.likes.push(user._id);
                await PostModel.findByIdAndUpdate({_id: post._id}, post)
                return res.status(200).json({msg: "Você curtiu essa publicação"})
            }


        }
       else{
        return res.status(405).json({error: "O método informado não é permitido"})
       }         

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Não foi possível curtir/descurtir essa publicação" });
    }
}

export default validateJWT(connectMongoDB(likeEndpoint))