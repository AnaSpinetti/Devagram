import type { NextApiRequest, NextApiResponse} from 'next';
import type { DefaultResponse } from '../../../types/DefaultResponse';
import type { RegisterResponse } from '../../../types/RegisterResponse';
import { connectMongoDB } from '../../../middlewares/connectMongoDB';
import { UserModel } from '../../../models/UserModel';
import md5 from 'md5';

const endpointRegister = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    
    if(req.method === 'POST'){
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

        // Salvando usuario com a senha "criptografada"
        const userToSave = {
            name: user.name,
            email: user.email,
            password: md5(user.password)
        }

        await UserModel.create(userToSave);
        return res.status(200).json({ msg: "Usuário cadastrado com sucesso"})
    }

    return res.status(405).json({ error: "O método informado não é valido"})
}

export default connectMongoDB(endpointRegister);