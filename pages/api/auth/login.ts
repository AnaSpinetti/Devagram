import type { NextApiRequest, NextApiResponse } from "next";
import type {DefaultResponse} from "../../../types/DefaultResponse";
import type {LoginResponse} from "../../../types/LoginResponse";
import {connectMongoDB} from "../../../middlewares/connectMongoDB";
import { UserModel } from "../../../models/UserModel";
import md5 from "md5";
import jwt from "jsonwebtoken";
import { corsPolicy } from "../../../middlewares/corsPolicy";

const endPointLogin = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | LoginResponse>) => {
    
    const { JWT_KEY } = process.env;
    if(!JWT_KEY) {
        return res.status(500).json({ error: "Chave JWT não informada" });
    }

    if(req.method === "POST"){
        const {login, password} = req.body;

        const userFound = await UserModel.find({ email: login, password: md5(password) }) 

        if(userFound && userFound.length > 0){
            const loggedUser = userFound[0];

            const token = jwt.sign({_id: loggedUser._id}, JWT_KEY)

            return res.status(200).json({name: loggedUser.name, email: loggedUser.email, token});
        }
        return res.status(200).json({ error: 'Usuário ou senha inválido' })

    }else{
        return res.status(405).json({ error: 'Método não permitido' });
    }
}

export default corsPolicy(connectMongoDB(endPointLogin));