import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import type { DefaultResponse } from '../types/DefaultResponse';
import NextCors from 'nextjs-cors';

export const corsPolicy = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any>) =>{

    try {
        await NextCors(req, res, {
            origin: '*',
            methods: ['GET', 'POST', 'PUT'],
            // Exemplo de header especifico
            //Headers: ['x-api-token']
            optionSuccessStatus: 200,
        })
        
        return handler(req, res);
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Erro ao tratar a politica de CORS"})
    }

}