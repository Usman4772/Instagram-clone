const mongoose=require("mongoose")
const postModel= mongoose.Schema({
image:String,
caption:String,
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
},
likes:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
],
date:{
    type:Date,
    default:Date.now()
}
})
module.exports=mongoose.model("posts",postModel)