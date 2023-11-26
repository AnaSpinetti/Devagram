import type { NextApiRequest, NextApiResponse } from "next";
import type { DefaultResponse } from "../../types/DefaultResponse";
import { connectMongoDB } from "../../middlewares/connectMongoDB"
import { validateJWT } from '../../middlewares/validateJWT';
import { UserModel } from "../../models/UserModel";
import { resolveSoa } from "dns";

const searchEndpoint = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse | any[]>) => {
    try {
        if (req.method === "GET") {

            if (req?.query?.id) {
                const userFound = await UserModel.findById(req?.query?.id);
                
                if(!userFound) {
                    return res.status(400).json({ error: 'Usuário não encontrado' })
                }

                userFound.password = null;

                return res.status(200).json(userFound)

            } else {
                const { filter } = req.query;

                if (!filter || filter.length < 2) {
                    return res.status(400).json({ error: "Favor informar pelo menos 2 caracteres para buscar" })
                }

                const usersFound = await UserModel.find({
                    // Buscando por qualquer trecho do nome e o com o "i" ignorando o case
                    $or: [{ name: { $regex: filter, $options: 'i' } }, { email: { $regex: filter, $options: 'i' } }]

                });

                return res.status(200).json(usersFound)
            }
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Não foi possivel localizar usuário' })
    }
}

export default validateJWT(connectMongoDB(searchEndpoint))