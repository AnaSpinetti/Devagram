import type { NextApiRequest, NextApiResponse} from 'next';
import { UserModel } from '../../models/UserModel';
import { validateJWT } from '../../middlewares/validateJWT';
import { PostModel } from '../../models/PostModel';
import { DefaultResponse } from '../../types/DefaultResponse';
import { connectMongoDB } from '../../middlewares/connectMongoDB';
import { FollowModel } from '../../models/FollowModel';

const feedEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any>) => {
    try {
        if(req.method === 'GET'){
            // Exibindo feed completo se não passar o ID de um usuario
            if(!req?.query?.id){
                const {userId} = req.query;
                const user = await UserModel.findById(userId);

                if(!user){
                    return res.status(400).json({error: 'Usuário não encontrado'})
                }

                const followers = await FollowModel.find({userAuthenticated: user._id})
                const followersId = followers.map(s => s.followedUser)
                const posts = await PostModel.find({
                    $or: [
                        {idUser: user._id},
                        {idUser: followersId}
                    ]
                }).sort({date: -1});
                
                const result = [];
                // Buscando o usuário de cada publicação para exibir no feed
                for(const post of posts) {
                    const userPost = await UserModel.findById(post.idUser);
                    if(userPost){
                        const final = {...post._doc, user : {
                            name: userPost.name,
                            avatar: userPost.avatar 
                        }}

                        result.push(final);
                    }
                }

                return res.status(200).json(result)
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