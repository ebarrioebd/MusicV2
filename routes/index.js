
var express = require('express');
var router = express.Router();

function isAutenticate(req, res, next) {
  if(req.session.usuario) {
    console.log(req.session.usuario)
    next();
  } else {
    res.render("login");
  } 
}
function isAutenticateLogin(req, res, next) {
  if(req.session.usuario) {
    console.log(req.session.usuario)
    res.redirect('/inicio');
  } else {
    next();
  } 
}
function isAutenticateRegister(req,res,next){
   if(req.session.usuario) {
    res.redirect('/inicio');
  } else {
    next();
  } 
}
/* GET users listing. */
router.get('/inicio',isAutenticate, function(req, res, next) {
  res.render('inicio',{data:req.session.usuario});
});

router.get("/login",isAutenticateLogin,(req,res)=>{
  res.render("login");
});
router.get("/register",isAutenticateRegister,(req,res)=>{
  res.render("register");
})

router.get("/addMusic",isAutenticate,(req,res)=>{
  res.render("addMusic")
})
module.exports = router;
