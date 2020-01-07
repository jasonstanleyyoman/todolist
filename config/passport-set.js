const LocalStrategy = require('passport-local').Strategy;
const User = require('../schema/user');


module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField:'username',passwordField:'password'},(username,password,done)=>{
            User.findOne({username:username},(err,user)=>{
                if(!user){
                    console.log("no user");
                    return done(null,false);
                }else{
                    if(user.password.toString() === password.toString()){
                        return done(null,user);
                    }else{
                        return done(null,false);
                    }
                }
            });
        })
    );
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });	
}