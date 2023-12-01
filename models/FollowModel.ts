import mongoose, { Schema } from "mongoose";

const FollowSchema = new Schema({
    // Quem segue
    userAuthenticated: {type: String, required: true},
    
    // Quem está sendo seguido
    followedUser: {type: String, required: true}
});

export const FollowModel = (mongoose.models.followers || mongoose.model('followers', FollowSchema))