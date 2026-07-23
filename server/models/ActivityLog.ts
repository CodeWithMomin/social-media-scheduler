import mongoose from "mongoose";

const ActivityLogSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 actionType:{type:String,enum:["POST_PUBLISHED","AI_REPLY"],required:true},
 description:{type:String,required:true},
 relatedPost:{type:mongoose.Schema.Types.ObjectId,ref:"Post"},
 platform:{type:String},
 aiGenreatedText:{type:String}


},{timestamps:true})

export const ActivityLog =mongoose.model("ActivityLog",ActivityLogSchema);