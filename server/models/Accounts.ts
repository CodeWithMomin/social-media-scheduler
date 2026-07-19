import mongoose from "mongoose";


const accountSchema=new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    platform:{type:String,enum:["twitter","facebook","linkedin","instagram","facebook_page",
        "linkedin_page","instagram_business"],required:true},
    handle:{type:String,required:true},
    zernioAccount:{type:String},
    accessToken:{type:String},
    refreshToken:{type:String},
    status:{type:String,enum:["connected","disconnected"],default:"connected"},
    avatarUrl:{type:String},

},{timestamps:true})

export const Account=mongoose.model("Account",accountSchema)