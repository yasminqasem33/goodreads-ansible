const mongoose = require('mongoose')
const categoryModel= require('../models/categoryModel')
const authorModel =require('../models/authorModel')



const bookSchema =  new mongoose.Schema(
    {
        image:{type: String},
        name:{type:String},
        avgrate:{type:String},
        categoryId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"categoryModel"
        },
        authorId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"authorModel"
        }
        
        
    }
)
const bookModel = mongoose.model('bookModel',bookSchema)
// bookModel.find().then((data)=>{console.log(data)})
// bookModel.create({image:"sdssd",name:"saas",avgrate:"aasa",categoryId:"5c9298cacd2a9f6e6b25d47d",authorId:"5c9298344905f3676329eff9"}).then((data)=>{console.log(data)})




//=====================================

// let authors=bookModel.find().select('image name').populate('authorId categoryId').then((data)=>{console.log(data[0].authorId)})



//===================================
module.exports=bookModel