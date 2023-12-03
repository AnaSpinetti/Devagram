import type { NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import nextConnect from "next-connect";
import { upload, uploadCosmic } from "../../services/uploadImageCosmic";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { validateJWT } from "../../middlewares/validateJWT"; 
import { PostModel } from "../../models/PostModel";
import { UserModel } from "../../models/UserModel";
import { corsPolicy } from "../../middlewares/corsPolicy";


const handler = nextConnect()
    .use(upload.single('file'))
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

            const imageFile = await uploadCosmic(req);
            //console.log(imageFile);
            
            const post = {
                idUser: user._id,
                description,
                image: imageFile?.media.url,
                date: new Date()
            }

            // Atualizando a quantidade de publicaçoes do usuario
            user.posts++
            await UserModel.findByIdAndUpdate({_id: user._id}, user)

            await PostModel.create(post);
            return res.status(200).json({msg: "Publicação enviada!"})

        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Não foi possível enviar sua publicação, tente novamente ou fale com o suporte" + error});
        }
    })

export const config = {
    api: {
        bodyParser: false
    }
}

export default corsPolicy(validateJWT(connectMongoDB(handler)));
