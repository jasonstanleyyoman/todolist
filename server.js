const express = require('express');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('./schema/user');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(passport.initialize());
app.use(passport.session());

require("./config/passport-set")(passport);

// const Schema = mongoose.Schema;


// const userSchema = new Schema({
//     username: String,
//     password: String,
//     list: [{
//         title: String,
//         description: String
//     }]
// });

// const User = mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    if(req.user){
        res.redirect('/dashboard');
    }else{
        res.render('welcome');
    }
    
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register',(req,res)=>{
    const response = req.body;
    User.findOne({username:response.username}).then(user=>{
        if(user){
            console.log("User has been registered");
            res.redirect('/register');
        }else{
            var newUser = new User({
                username: response.username,
                password: response.password,
                list : []
            });
            newUser.save();
            console.log("New user has been registered");
            res.redirect('/login');
        }
    });
    
});
app.get('/dashboard',(req,res)=>{
    if(!req.user){
        res.redirect('/');
    }else{
        User.findOne({username: req.user.username}).then(user=>{
            res.render('dashboard',{name:req.user.username,list:user.list});
        })
    }
    
});
app.post('/login',(req,res,next)=>{
    
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/login'
    })(req,res,next);
});

app.post('/add',(req,res)=>{
    const listInfo = req.body;
    User.findOneAndUpdate({username: req.user.username},{
        $push: {list:listInfo}
    },(err,suc)=>{
        if(err){
            console.log(err);
        }else{
            console.log("Adding list success");
        }
    });
    res.redirect('/dashboard');
});

app.get('/delete/:id',(req,res)=>{
    
    User.updateOne({username:req.user.username},
        {$pull:{list:{
            '_id' : req.params.id
        }}},(err,suc)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Delete list success");
            }
        })
    res.redirect('/dashboard');
});

const port = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/todolist', {useNewUrlParser: true}).then(()=>console.log("MongoDb connected")).catch(err=>{
    
    console.log(err);
});

app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
});




app.listen(port,()=>{
    console.log(`Listening in port ${port}`);
    
});