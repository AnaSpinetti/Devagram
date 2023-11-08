import type { NextApiRequest, NextApiResponse } from "next";
import type {DefaultResponse} from "../../types/DefaultResponse";
import {conectMongoDB} from "../../middlewares/conectMongoDB";

const endPointLogin = (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    if(req.method === "POST"){
        const {login, password} = req.body;

        if(login === 'admin@admin.com' && password === 'teste123'){
            return res.status(200).json({msg: 'Usuário logado com sucesso!'});
        }
        return res.status(200).json({ error: 'Usuário ou senha inválido' })

    }else{
        return res.status(405).json({ error: 'Método não permitido' });
    }
}

export default conectMongoDB(endPointLogin);