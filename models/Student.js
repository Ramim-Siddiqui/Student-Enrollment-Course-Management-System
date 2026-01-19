const mongoose=require("mongoose");
module.exports=mongoose.model("Student",new mongoose.Schema({
 student_id:String,name:String,email:String,age:Number
}));