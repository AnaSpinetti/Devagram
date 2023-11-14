import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type {DefaultResponse} from "../types/DefaultResponse";
import mongoose from 'mongoose';

export const connectMongoDB = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    //Validar se o banco está conectado, caso sim, seguir para o endpoint ou próximo middleware
    if(mongoose.connections[0].readyState){
        return handler(req, res);
    }

    //Conectar ao banco de dados
    const { DB_CONECTION_STRING } = process.env;
    if(!DB_CONECTION_STRING){
        return res.status(500).json({error: "ENV de configuração do banco de dados não informada"})
    }

    mongoose.connection.on('connected', () => console.log("Banco de dados conectado"));
    mongoose.connection.on('error', error => console.log("Banco de dados não conectado devido a erro: " + error));

    await mongoose.connect(DB_CONECTION_STRING);

    //Após conectar no banco, seguir para o endpoint
    return handler(req, res);
}

