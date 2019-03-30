const express = require('express')
const categoryModel = require('../models/categoryModel')
const authorModel = require('../models/authorModel')
const bookModel = require('../models/bookModel')
const adminModel = require('../models/adminModel')
const url = require('url');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
//const bcrypt=require('bcrypt')
const cookieParser = require('cookie-parser')
var expressValidator = require('express-validator');
const adminRouter = express.Router()
adminRouter.use(expressValidator())
adminRouter.use(passport.initialize());
adminRouter.use(cookieParser());
var fs = require('fs');
var multer = require('multer');



//=============================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') 
        cb(null, true);
    else 
        cb(null, false);  
}
const upload = multer({
    storage: storage,
    limits: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});



//=====================================================
adminRouter.get('/', (req, res) => {
    res.render('pages/adminsignin.ejs')
});

adminRouter.post('/', (req, res) => {
    const name = req.body.name;
    const password =req.body.password
            adminModel.findOne({ name: name ,password : password })
            .then(user => {
                if (!user) {
                    res.status(404).json({ name: 'not admin' });
                } else {
                    let user ={
                        name: name
                                }
        jwt.sign(user,"dina", { expiresIn: 400 }, (err, token) => {
        if (!err) {
            console.log(user)
            let auth ={
                userdata: user,
                token: token
            }
            res.cookie("userData", auth); 
            res.redirect('/admin/categories')
        } else {
            console.log("not admin")
            res.json({ err: err });
        }
});
                }
            })
})



adminRouter.use(function(req,res,next)
{
    console.log("this is middleware")
    if(!req.cookies.userData){
    res.redirect('/admin')
  }  
  else if (req.cookies.userData){
        jwt.verify(req.cookies.userData.token,"dina",function(err,decoded){
            if (err){
                res.redirect('/admin')
            }
           // req.decoded=decoded;
        next();
        })
    }
    else{
        res.redirect('/admin')
    }
})


adminRouter.get('/logout', (req, res,next)=>{  
    res.clearCookie('userData')
   res.redirect('/admin')
})

//=====================category routes=================

adminRouter.get('/categories', (req, res) => {
    getCategories(res)
})
function getCategories(res) {
    categoryModel.find()
        .then((categories) => {
            res.render('pages/admin_categories.ejs', {
                categories: categories
            })
        })
}
adminRouter.post('/categories/addCategory_andsave', (req, res) => {
    categoryModel.findOne({ name: req.body.name })
        .then((category) => {
            if (category == null) {
                categoryModel.create({
                    name: req.body.name
                }, (category) => {
                    res.redirect('/admin/categories')
                })
            }
            else { res.send("Repeated category name,Enter Back To Try Again") }
        })
})

adminRouter.get('/categories/addCategories', (req, res) => {
    res.render('pages/admin_formCategory.ejs', { form: "add" })
})

adminRouter.get('/categories/:id/deleteCategory', (req, res) => {
    categoryModel.findByIdAndDelete({ _id: req.params.id })
        .then((deletdCategory) => {
            console.log(deletdCategory)
            res.redirect('/admin/categories')

        })
})

adminRouter.post('/categories/:id/editCategory_andsave', (req, res) => {
    categoryModel.findOne({ name: req.body.name }).then((category)=>
    {
        if(category==null){
            categoryModel.findByIdAndUpdate(req.params.id, { name: req.body.name })
            .then((updated) => {
                console.log("this is id" + req.params.id)
    
                console.log("this is new name" + req.body.name)
                console.log(updated)
                res.redirect('/admin/categories')
            }).catch(err => {
                res.send("id not found")
            })
        }            
        else { res.send("Repeated category name,Enter Back To Try Again") }

    })

})

adminRouter.get('/categories/:id/editCategory', (req, res) => {
    console.log(req.params.id)
    categoryModel.findOne(
        { _id: req.params.id })
        .then((category) => {
            console.log("this is category which passed to input" + category)
            res.render('pages/admin_formCategory.ejs',
                {
                    form: "edit",
                    category: category
                })
        })
})











//============================ books routes======================

adminRouter.post('/books/:id/editBook_andsave', (req,res) => {
    
    bookModel.findOne({ name: req.body.name })
    .then((book) => {
        if (book == null) {
            authorModel.findOne({ first_name: req.body.authors })
                .then((author) => {
                    console.log("author is "+req.body.authors)
                    categoryModel.findOne({ name: req.body.categories })
                        .then((category) => {
                            console.log("book is "+req.body.categories)

                            bookModel.findByIdAndUpdate(req.params.id,{
                                image: req.body.image,
                                name: req.body.name,
                                authorId: author._id,
                                categoryId: category._id

                            }
                            ).then(()=>
                            {
                                res.redirect('/admin/books')

                            })
                               

                        })
                })
        }
        else {
            res.send("Repeated Book Name, Enter back To Try Again")
        }


    })

})


adminRouter.get('/books', (req, res) => {
    bookModel.find()
        .then((books) => {
            res.render('pages/admin_books.ejs',
                {
                    books: books
                })

        })
})


adminRouter.get('/books/:id/editBook', (req, res) => {

    bookModel.findOne({ _id: req.params.id })
        .then((book) => {
            authorModel.find()
                .then((authors) => {
                    categoryModel.find()
                        .then((categories) => {
                            
                            res.render('pages/admin_formBook.ejs', {
                                book: book,
                                form: "edit",
                                categories:categories,
                                authors:authors

                            })


                        })

                })

        })

})


//del book
adminRouter.get('/books/:id/deleteBook', (req, res) => {
    bookModel.findByIdAndDelete({ _id: req.params.id })
        .then((deleteBook) => {
            console.log(deleteBook)
            res.redirect('/admin/books')

        })

})
adminRouter.post('/books/add_save',upload.single('image'), (req, res) => {

    bookModel.findOne({ name: req.body.name })
        .then((book) => {
           // console.log(book)
            if (book == null) {
                authorModel.findOne({ first_name: req.body.authors })
                    .then((author) => {
                        categoryModel.findOne({ name: req.body.categories })
                            .then((category) => {
                                console.log(req.file.path)
                                bookModel.create({
                                    image: req.file.path || !req.file.path,
                                    name: req.body.name,
                                    authorId: author._id,
                                    categoryId: category._id

                                })
                                    .then(() => {
                                        res.redirect('/admin/books')

                                    })

                            })
                    })

            }
            else {
                res.send("Repeated Book Name, Enter back To Try Again")
            }


        })
})



adminRouter.get('/books/add', (req, res) => {
    authorModel.find()
        .then((authors) => {
            console.log(authors)

            categoryModel.find()
                .then((categories) => {
                    res.render('pages/admin_formBook.ejs', {
                        categories: categories,
                        authors: authors,
                        form: "add"
                    })

                })
        })

})


//==========================authors routes======================
adminRouter.get('/authors', (req, res) => {
    authorModel.find()
        .then((authors) => {
            console.log(authors)
            res.render('pages/admin_authors.ejs', {
                authors: authors
            })
        })
})


adminRouter.post('/authors/addauthor_andsave',upload.single('image'),(req, res) => {
    authorModel.findOne({ name: req.body.firstname }, function (err, data) {
        console.log(req.body.firstname)
        if(data == null)
        {
            authorModel.create({
                first_name:req.body.firstname,
                last_name:req.body.lastname,
                date_birth:req.body.date_birth,
                photo: req.file.path || !req.file.path
            }).then((user) => {
                console.log(user)
                res.redirect('/admin/authors')
            })         
        
        }
        else
        {
            res.send("repeated")
        }
           
    })
})
//del author
adminRouter.get('/authors/:id/deleteAuthor', (req, res) => {
    authorModel.findByIdAndDelete({ _id: req.params.id })
        .then((deletedAuthors) => {
            console.log(deletedAuthors)
            res.redirect('/admin/authors')
        })
})

function getauthors(res) {
    authorModel.find()
        .then((authors) => {
            res.render('pages/admin_authors.ejs', {
                authors: authors
            })
        })
}



adminRouter.get('/authors/addauthors', (req, res) => {
    res.render('pages/admin_formauthor.ejs', { form: "add" })
})


adminRouter.post('/authors/:id/editauthor_andsave', (req, res) => {
    authorModel.findOne({ first_name: req.body.firstname }, function (err, data) {
        if(data == null)
        {
            authorModel.findByIdAndUpdate(req.params.id, {  
                first_name:req.body.firstname,
                last_name:req.body.lastname,
                date_birth:req.body.date_birth,
                photo: req.body.image
            })
                .then((updated) => {
                    console.log("this is id" + req.params.id)
        
                    console.log("this is new name" + req.body.firstname)
                    console.log(updated)
                    res.redirect('/admin/authors')
                }).catch(err => {
                    res.send("id not found")
                })
        }
        else
        {res.send("repeated") }
    })
})

   


adminRouter.get('/authors/:id/editAuthor', (req, res) => {
    authorModel.findOne(
        { _id: req.params.id })
        .then((author) => {
            console.log("this is author which passed to input" + author)
            res.render('pages/admin_formauthor.ejs',
                {
                    form: "edit",
                    author: author
                })
        })
})
module.exports = adminRouter
