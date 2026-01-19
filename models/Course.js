const mongoose=require("mongoose");
module.exports=mongoose.model("Course",new mongoose.Schema({
 title:String,code:String,creditHours:Number
}));