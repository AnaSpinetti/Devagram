import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
    idUser: {type: String, required: true},
    image: {type: String, required: true},
    description: { type: String, required: false},
    date: {type: Date, required: true},
    comments: {type: Array, required: true, default: []},
    likes: {type: Array, required: true, default: []},
});

export const PostModel = (mongoose.models.posts || mongoose.model('posts', PostSchema));