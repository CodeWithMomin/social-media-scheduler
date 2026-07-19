import mongoose from "mongoose";

const PostSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 content:{type:String,required:true},
mediaUrl:{type:String},
mediaType:{type:String,enum:["image","video"]},
platforms:{type:String,enum:["twitter","facebook","linkedin","instagram","facebook_page",
        "linkedin_page","instagram_business"],required:true},
scheduledFor:{type:Date,required:true},
status:{type:String,enum:["draft","scheduled","published","failed"],default:"scheduled"}

},{timestamps:true})

export const Post =mongoose.model("Post",PostSchema);