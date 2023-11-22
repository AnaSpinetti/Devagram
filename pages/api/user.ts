import type { NextApiRequest, NextApiResponse } from "next";
import { validateJWT } from "../../middlewares/validateJWT";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { DefaultResponse } from "../../types/DefaultResponse";
import { UserModel } from "../../models/UserModel";
import nc from 'next-connect';
import { upload, uploadCosmic } from "../../services/uploadImageCosmic";

const handler = nc()
    .use(upload.single('file'))
    .put(async (req: any, res: NextApiResponse<DefaultResponse>) => {
        try {
            const {userId} = req?.query;
            const user = await UserModel.findById(userId);

            if(!user){
                return res.status(400).json({error: 'Usuário não localizado'})
            }
            const {name} = req.body;

            if(name && name.length > 2){
                user.name = name
            }

            const {file} = req;
            if(file && file.originalname){
                const image = await uploadCosmic(req)

                if(image && image.media && image.media.url){
                    user.avatar = image.media.url
                }
            }

            await UserModel.findByIdAndUpdate({_id: user._id}, user); 
            return res.status(200).json({msg: 'Usuário alterado com sucesso'})   
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao atualizar o usuário" });
        }
    })
    .get(async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any>) => {
    
        try {
            const {userId} = req?.query;
            const user = await UserModel.findById(userId);
            
            const userToReturn = {
                id: user._id,
                name: user.name,
                email: user.email, 
                avatar: user.avatar,
                followers: user.followers,
                following: user.following, 
                posts: user.posts
            }
            
            return res.status(200).json(userToReturn);
    
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao retornar os dados do usuário" });
        }
    
    });

    export const config = {
        api: {
            bodyParser: false
        }
    }

export default validateJWT(connectMongoDB(handler));