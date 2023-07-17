const mongoose=require('mongoose')
const Schema=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose')





const UserSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true,

    }
})

//  By plugin method we can add username,password into the Schema

UserSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model("User",UserSchema)