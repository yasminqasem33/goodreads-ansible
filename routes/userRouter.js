
const express = require('express')
var expressValidator = require('express-validator');
const userRouter = express.Router()
var bodyParser = require('body-parser')
//const bcrypt = require('bcrypt')
userRouter.use(expressValidator())
const userModel = require('../models/userModel')
const categoryModel = require('../models/categoryModel')
const bookmodel = require('../models/bookModel')
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');
require('passport-jwt');
require('../server');
const LocalStrategy = require('passport-local').Strategy;
const autherModel = require('../models/authorModel')
const cookieParser = require('cookie-parser')
var fs = require('fs');
var multer = require('multer');
const userbookModel = require('../models/usrBoookModel')
//=================middleware=======================
userRouter.use(passport.initialize());
userRouter.use(cookieParser());
//multer
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
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});




//==========================login and signup user===============================================
userRouter.get('/', (req, res) => {
    res.render("pages/usersignup.ejs")
})

userRouter.post('/', upload.single('file'), (req, res) => {
    req.checkBody('FirstName', 'First name must be specified.').notEmpty();
    req.checkBody('LastName', 'Last name must be specified.').notEmpty();
    req.checkBody('psw', 'Password must be specified.').notEmpty();
    req.checkBody('email', 'email must be specified.').notEmpty();
    req.checkBody('email', 'email must be valied email.').isEmail();
    const errors = req.validationErrors(req);
    if (errors) {
        console.log("error in sign up page ")
        res.json(errors);
        res.redirect('/')
    } else {
        console.log("1");
        userModel.findOne({ email: req.body.email }).then(user => {
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });
            } else {
                if (req.body.psw != req.body.pswrepeat) {
                    return res.status(400).json({ password: 'password does not match' });
                }
                else {
                    const newUser = new userModel({
                        firstName: req.body.FirstName,
                        lastName: req.body.LastName,
                        email: req.body.email,
                        password: req.body.psw,
                        // userImage: req.file.path || !req.file.path,

                    });
                    console.log("3");
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err)
                                res.json({ err: err });
                            newUser.password = hash;
                            console.log("4");
                            console.log(newUser);
                            newUser.save()
                                .then(user => {
                                    console.log("5")
                                    res.redirect('/login')

                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            }
        });
    }
});


userRouter.get('/login', (req, res) => {
    res.render('pages/login.ejs')
})


userRouter.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.pass;
    req.checkBody('email', 'Email is required !').notEmpty();
    req.checkBody('email', 'Email is incorrect !').isEmail();
    req.checkBody('pass', 'Password is required !').notEmpty();
    const errors = req.validationErrors(req);
    if (errors) {
        console.log("error in Login ");
        res.json(errors);
        return;
    } else {
        userModel.findOne({ email: email })
            .then(user => {
                if (!user) {
                    res.status(404).json({ email: 'email not found' });
                } else {
                    bcrypt.compare(password, user.password)
                        .then(isMatched => {
                            if (isMatched) {
                                const payload = {
                                    _id: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    userImage: user.userImage,
                                    book: user.book

                                };

                                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                                    if (!err) {
                                        //     console.log(token)

                                        var toke = token
                                        let auth = {
                                            userdata: payload,
                                            token: toke
                                        }
                                        res.cookie("userData", auth);
                                        res.redirect('/homepage')

                                        // res.json({
                                        //     success: true,
                                        //     token: token
                                        // })

                                    } else {
                                        res.json({ err: err });
                                    }
                                });

                            } else {
                                res.status(400).json({ password: 'password incorrect' });
                            }
                        })
                }
            });
    }
});


userRouter.use(function (req, res, next) {
    // var token =req.body.token || req.query.token || req.headers['x-access-token'];
    //var token = req.headers['x-access-token'] || req.cookies.userData.token
    if (!req.cookies.userData) {
        res.redirect('/')
    }
    else if (req.cookies.userData) {
        jwt.verify(req.cookies.userData.token, keys.secretOrKey, function (err, decoded) {
            if (err) {
                //  res.clearCookie('userData')
                res.redirect('/')
            }
            next();
        })
    }
    else {
        res.redirect('/')
    }
})


userRouter.get('/logout', (req, res, next) => {
    res.clearCookie('userData')
    res.redirect('/login')
})



userRouter.get('/homepage', (req, res) => {
    bookmodel.find().select('image name').populate('authorId').then((books) => {
        console.log(books)
        res.render('pages/userHome.ejs', { books: books ,shelves:"all"})
    })
})

//====================================categories================================================


userRouter.get('/categories/:id/eco2', (req, res, next) => {
    categoryModel.findById(req.params.id).then((name) => {
        bookmodel.find({ categoryId: req.params.id }).then((record) => {
            console.log(record)
            autherModel.find({ id: record.authorId }).then((author) => {
                res.render('pages/eco2.ejs',
                    {
                        name: name,
                        record: record,
                        author: author
                    })
            }).catch(err => console.log(err))

            // })
        })
    }).catch(console.log)
})

userRouter.get('/categories/:id/eco3', (req, res, next) => {
    categoryModel.findById(req.params.id).then((name) => {
        bookmodel.find({ categoryId: req.params.id }).then((record) => {
            console.log(record)
            autherModel.find({ id: record.authorId }).then((author) => {
                res.render('pages/eco3.ejs',
                    {
                        name: name,
                        record: record,
                        author: author
                    })
            }).catch(err => console.log(err))
        })
    }).catch(console.log)
})



userRouter.get('/categories/:id/eco1', (req, res, next) => {
    categoryModel.findById(req.params.id).then((name) => {
        bookmodel.find({ categoryId: req.params.id }).then((record) => {
            console.log(record)
            autherModel.find({ id: record.authorId }).then((author) => {
                res.render('pages/eco1.ejs',
                    {
                        name: name,
                        record: record,
                        author: author
                    })
            }).catch(err => console.log(err))
        })
    }).catch(console.log)
})




userRouter.get('/categories', (req, res) => {
    categoryModel.find()
        .then((categories) => {
            res.render('pages/usercategories.ejs',
                {
                    categories: categories
                })
        })
})

//=================================books===========================

userRouter.get('/books', (req, res) => {
    bookmodel.find()
        .then((books) => {
            res.render('pages/userbooks.ejs',
                {
                    books: books
                })
        })
})

userRouter.get('/book/:id', (req, res) => {
    // console.log(req.params.bookid)
    bookmodel.findById(req.params.id).then((book) => {
        categoryModel.findById(book.categoryId).then((category) => {
            autherModel.findById(book.authorId).then((author) => {
                res.render('pages/bookid.ejs',
                    {
                        book: book,
                        category: category,
                        author: author
                    })
            })
        })
    }).catch(err => console.log(err))
})




//===========================authors==================================
userRouter.get('/authors', (req, res) => {
    autherModel.find()
        .then((authors) => {
            res.render('pages/userauthors.ejs',
                {
                    authors: authors
                })
        })
})


userRouter.get('/authors/:id', (req, res) => {
    autherModel.find()
        .then((authors) => {
            res.render('pages/userauthors.ejs',
                {
                    authors: authors
                })
        })
})



//===========================shelves==================================

userRouter.get('/homepage/read', (req, res) => {
    

    userbookModel.find({$and: [{ userId: req.cookies.userData.userdata._id },{stauts:"read"}]}).populate('bookId').select('image name')
    .populate('bookId authorId').then((books)=>{res.render('pages/userHome.ejs',{books:books,shelves:"read"})})
})

userRouter.get('/homepage/reading', (req, res) => {
    

    userbookModel.find({$and: [{ userId: req.cookies.userData.userdata._id },{stauts:"reading"}]}).populate('bookId').select('image name')
    .populate('bookId authorId').then((books)=>{res.render('pages/userHome.ejs',{books:books,shelves:"reading"})})
})
userRouter.get('/homepage/wanttoread', (req, res) => {
    

    userbookModel.find({$and: [{ userId: req.cookies.userData.userdata._id },{stauts:"wanttoread"}]}).populate('bookId').select('image name')
    .populate('bookId authorId').then((books)=>{res.render('pages/userHome.ejs',{books:books,shelves:"wanttoread"})})
})


userRouter.post('/homepage/status', (req, res) => {
    console.log("bookid" + req.body.bookId)
    console.log(req.body.readingStatus)

    console.log("userid" + req.cookies.userData.userdata._id)
    console.log("here inside status")
    userbookModel.findOne({ $and: [{ userId: req.cookies.userData.userdata._id }, { bookId: req.body.bookId }] },
        (err, bookUser) => {
            console.log(bookUser)
            if (bookUser == null) {

                userbookModel.create({
                    bookId: req.body.bookId,
                    userId: req.cookies.userData.userdata._id,
                    stauts: req.body.readingStatus
                }).then((userbook) => {

                    console.log("created userbook" + userbook)


                })

            }
            else {
                console.log("prserent")

                userbookModel.updateOne({ userId: req.cookies.userData.userdata._id, bookId: req.body.bookId },
                    { stauts: req.body.readingStatus }).then((updated) => {
                        console.log(updated)

                    }).catch("erroe")
            }

            res.redirect('/homepage')

        })

})



module.exports = userRouter
