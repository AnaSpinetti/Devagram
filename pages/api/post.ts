import type { NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import nextConnect from "next-connect";
import { upload, uploadCosmic } from "../../services/uploadImageCosmic";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { validateJWT } from "../../middlewares/validateJWT"; 
import { PostModel } from "../../models/PostModel";
import { UserModel } from "../../models/UserModel";


const handler = nextConnect()
    .use(upload.single('image'))
    .post(async (req: any, res: NextApiResponse<DefaultResponse>) => {
        try {
            const {userId} = req.query;
            const {description} = req.body;
            const user = await UserModel.findById(userId);

            if(!user){
                return res.status(400).json({ error: "Usuário não encontrado"})
            }

            if(!req || !req.body){
                return res.status(400).json({ error: "Parametros de entrada não informados"})
            }
            
            if(!req.file || !req.file.originalname){
                return res.status(400).json({ error: "A imagem é obrigatória na publicação"})
            }

            const imagePost = await uploadCosmic(req);
            const post = {
                idUser: user._id,
                description,
                image: imagePost.media.url,
                date: new Date()
            }

            await PostModel.create(post);
            res.status(200).json({msg: "Publicação enviada!"})

        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Não foi possível enviar sua publicação, tente novamente ou fale com o suporte"});
        }
    })

export const config = {
    api: {
        bodyParser: false
    }
}

export default validateJWT(connectMongoDB(handler));