const mongoose = require('mongoose')
//var passportlocalmongoose= require('passport-local-mongoose')

const userBookSchema =  new mongoose.Schema(
    {
       
       bookId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"bookModel"
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"userModel"

        },
        stauts:{type:String},
        rate:{type:String},
        review:{type:String}

    }   
)



const userbookModel = mongoose.model('usrBoookModel',userBookSchema)
// userbookModel.find().then((data)=>{console.log(data)})

module.exports= userbookModel
