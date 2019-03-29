const mongoose = require('mongoose')


const categorySchema =  new mongoose.Schema(
    {
        name:{type:String},
        
        
    }
)
const categoryModel = mongoose.model('categoryModel',categorySchema)
// categoryModel.create({name:"pppp"}).then((data)=>{console.log(data)})

module.exports=categoryModel

