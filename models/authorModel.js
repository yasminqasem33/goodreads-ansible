const mongoose = require('mongoose')


const authorSchema =  new mongoose.Schema(
    {
        first_name:{type:String},
        last_name:{type:String},
        photo:{type:String},
        date_birth:{type:String}
    })
const authorModel = mongoose.model('authorModel',authorSchema)
// authorModel.create({first_name:"lllll",last_name:"oooo",photo:"assa",date_birth:"assa"}).then((data)=>{console.log(data)})
module.exports=authorModel