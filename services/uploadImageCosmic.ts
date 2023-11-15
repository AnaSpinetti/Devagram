import { createBucketClient } from "@cosmicjs/sdk";
import multer from "multer";

const { BUCKET_SLUG, READ_KEY, WRITE_KEY } = process.env;

const bucketDevagram = createBucketClient({
    bucketSlug: BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string
});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const uploadCosmic = async(req: any) => {
    if(req?.file?.originalname){
        if(!req.file.originalname.includes(".jpg") && !req.file.originalname.includes(".png") && !req.file.originalname.includes(".jpeg")){
            throw new Error("Extensão de imagem inválida");
        }

        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer
        };
        
        if(req.url && req.url.includes("post")){
            return await bucketDevagram.media.insertOne({
                media: media_object, 
                folder: "post"
            });
        }else if(req.url && req.url.includes("register")){
                return await bucketDevagram.media.insertOne({
                media: media_object, 
                folder: "avatar"
            });
        }else{
            return await bucketDevagram.media.insertOne({
                media: media_object, 
                folder: "stories"
            });
        }
    }
}

export {upload, uploadCosmic}