import type { NextApiRequest, NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import { validateJWT } from "../../middlewares/validateJWT";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { UserModel } from "../../models/UserModel";
import { FollowModel } from "../../models/followModel";

const followEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {

    try {
        if (req.method === "PUT") {
            const { userId, id } = req?.query;

            const loggedUser = await UserModel.findById(userId);
            const userToFollow = await UserModel.findById(id);

            if (!loggedUser) {
                return res.status(400).json({ error: "Usuário logado não localizado" })
            }
            if (!userToFollow) {
                return res.status(400).json({ error: "Usuário a ser seguido não localizado" })
            }

            // Validando se o usuario autenticado ja segue esse usuario
            const isFollowing = await FollowModel.find({ userAuthenticated: loggedUser._id, followedUser: userToFollow._id });
            if (isFollowing && isFollowing.length > 0) {

                isFollowing.forEach(async (e: any) => await FollowModel.findByIdAndDelete({_id: e._id}))

                // Adicionando um seguido para o usuario logado
                loggedUser.following--
                await UserModel.findByIdAndUpdate({ _id: loggedUser._id }, loggedUser)

                // Adicionando um seguidor pro usuario que foi seguido
                userToFollow.followers--
                await UserModel.findByIdAndUpdate({ _id: userToFollow._id }, userToFollow)

                return res.status(200).json({ msg: "Deixou de seguir esse usuário com sucesso" })
            } else {
                const follower = {
                    userAuthenticated: loggedUser._id,
                    followedUser: userToFollow._id
                };

                // Adicionando um seguido para o usuario logado
                loggedUser.following++
                await UserModel.findByIdAndUpdate({ _id: loggedUser._id }, loggedUser)

                // Adicionando um seguidor pro usuario que foi seguido
                userToFollow.followers++
                await UserModel.findByIdAndUpdate({ _id: userToFollow._id }, userToFollow)

                await FollowModel.create(follower);
                return res.status(200).json({ msg: "Usuário seguido com sucesso" })
            }
        }

        return res.status(405).json({ error: "Método não permitido" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Não foi possivel realizar a ação, tente novamente" })
    }
}

export default validateJWT(connectMongoDB(followEndpoint))