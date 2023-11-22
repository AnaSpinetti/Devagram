import type { NextApiRequest, NextApiResponse} from 'next';
import { UserModel } from '../../models/UserModel';
import { validateJWT } from '../../middlewares/validateJWT';
import { PostModel } from '../../models/PostModel';
import { DefaultResponse } from '../../types/DefaultResponse';
import { connectMongoDB } from '../../middlewares/connectMongoDB';

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any>) => {
    try {
        if(req.method === 'GET'){
            if(!req?.query?.id){
                return res.status(500).json({error: 'Não foi possível validar o usuário'})
            }
            const idUser = req?.query?.id
            const user = await UserModel.findById(idUser);

            if(!user){
                return res.status(400).json({error: 'Usuário não encontrado'})
            }

            const posts = await PostModel.find({idUser: user._id}).sort({date: -1});

            return res.status(200).json(posts);

        }

        return res.status(405).json({ error: 'Método não permitido' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: 'Ocorreu um erro ao exibir o feed do usuário'});
    }
};

export default validateJWT(connectMongoDB(feedEndpoint));