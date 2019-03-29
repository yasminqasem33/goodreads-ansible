const mongoose = require('mongoose')
var crypto = require('crypto');


const adminSchema =  new mongoose.Schema(
    {
        name:{type:String},
        password:{type:String}
        
    }
)



const adminModel = mongoose.model('adminSchema',adminSchema)





module.exports=adminModel