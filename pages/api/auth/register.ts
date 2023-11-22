import type { NextApiRequest, NextApiResponse} from 'next';
import type { DefaultResponse } from '../../../types/DefaultResponse';
import type { RegisterResponse } from '../../../types/RegisterResponse';
import { connectMongoDB } from '../../../middlewares/connectMongoDB';
import { UserModel } from '../../../models/UserModel';
import md5 from 'md5';
import { upload, uploadCosmic } from '../../../services/uploadImageCosmic';
import nc from 'next-connect';

const handler = nc()
    .use(upload.single('file')) 
    .post(async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {

    try {
        // usando o RegisterResponse para que seja usado do body apenas os itens definidos no type
        const user = req.body as RegisterResponse;  

        if(!user.name || user.name.length < 2){
            return res.status(400).json({ error: "Nome inválido" });
        }

        if(!user.email || user.email.length < 5 || !user.email.includes("@") || !user.email.includes(".")){
            return res.status(400).json({ error: "Email inválido" });
        }

        if(!user.password || user.password.length < 5){
            return res.status(400).json({ error: "A senha deve ter mais do que 4 caracteres" });
        }

        // Validar se existe usuário com o mesmo email
        const userExists = await UserModel.find({email: user.email});

        if(userExists && userExists.length > 0){
            return res.status(400).json({ error: "Já existe um usuário com o email informado" });
        }

        // Enviar a imagem do multer para o cosmic
        const image = await uploadCosmic(req);
    
        // Salvando usuario com a senha "criptografada"
        const userToSave = {
            name: user.name,
            email: user.email,
            password: md5(user.password),
            avatar: image?.media?.url
        }

        await UserModel.create(userToSave);
        return res.status(200).json({ msg: "Usuário cadastrado com sucesso"})    
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Erro ao cadastrar usuário"})
    }
});

export const config = {
    api: {
        bodyParser: false,
    }
}

export default connectMongoDB(handler);