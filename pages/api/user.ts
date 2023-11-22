import type { NextApiRequest, NextApiResponse } from "next";
import { validateJWT } from "../../middlewares/validateJWT";
import { connectMongoDB } from "../../middlewares/connectMongoDB";
import { DefaultResponse } from "../../types/DefaultResponse";
import { UserModel } from "../../models/UserModel";

const userEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any>) => {
    
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
        return res.status(500).json({ error: "Erro" });
    }

}

export default validateJWT(connectMongoDB(userEndpoint));