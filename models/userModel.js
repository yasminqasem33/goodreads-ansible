const mongoose = require('mongoose')
//var passportlocalmongoose= require('passport-local-mongoose')

const userSchema =  new mongoose.Schema(
    {
        firstName: { type: String, required: "First Name is required" },
        lastName: { type: String, required: "Last Name is required" },
        email: {
            type: String, trim: true, lowercase: true, unique: true,
            required: 'Email address is required',
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        password:{type: String},
        userImage:{ data: Buffer, contentType: String },
        // book:[{bookId:{
        //     type:mongoose.Schema.Types.ObjectId,
        //     ref:"bookModel"
        // }, status:String, rate:String}]

    }
)




const userModel = mongoose.model('userModel',userSchema)

// userModel.create({firstName:"yasmin",lastName:"qasem",email:"yasmin@gmail.com",password:"12345",userImage:"sasa"}).then((user)=>{console.log(user)})


 module.exports= userModel


