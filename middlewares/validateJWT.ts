import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";

export const validateJWT = (handler: NextApiHandler) => (req: NextApiRequest, res: NextApiResponse) => {
    const {JWT_KEY} = process.env;

    try {
        if(!JWT_KEY){
            return res.status(500).json({error: "ENV JWT não informada"});
        }
    
        if(!req || !req.headers){
            return res.status(401).json({error: "Não autorizado, realize seu login e tente novamente"})
        }
    
        if(req.method !== "OPTIONS"){
            const authorization = req.headers["authorization"];
    
            if(!authorization){
                return res.status(401).json({error: "Não foi possivel validar o seu token de acesso"});
            }
            
            const token = authorization.substring(7);
            if(!token){
                return res.status(401).json({error: "Não foi possivel validar o seu token de acesso"});
            }
            
            const decoded = jwt.verify(token, JWT_KEY) as JwtPayload;
            if(!decoded){
                return res.status(401).json({error: "Não foi possivel validar o seu token de acesso"});
            }
    
            if(!req.query){
                req.query = {};
            }
    
            req.query.userId = decoded._id;
        }
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({error: "Não foi possivel validar seu token de acesso"})
    }

   

    return handler(req, res);
}