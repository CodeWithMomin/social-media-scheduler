import mongoose from "mongoose";

const PostSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 content:{type:String,required:true},
mediaUrl:{type:String},
mediaType:{type:String,enum:["image","video"]},
platforms:{type:[{type:String,enum:["twitter","facebook","linkedin","instagram","facebook_page",
        "linkedin_page","instagram_business"],required:true}],required:true,validate:{
        validator:function(v:any[]){return v && v.length > 0},
        message:"platforms must contain at least one platform"}},
scheduledFor:{type:Date,required:true},
status:{type:String,enum:["draft","scheduled","published","failed"],default:"scheduled"}

},{timestamps:true})

export const Post =mongoose.model("Post",PostSchema);