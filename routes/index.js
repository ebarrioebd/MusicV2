
var express = require('express');
var router = express.Router();

function isAutenticate(req, res, next) {
  if (req.session.usuario) {
    //console.log(req.session.usuario)
    next();
  } else {
    res.render("login");
  }
}
function isAutenticateLogin(req, res, next) {
  if (req.session.usuario) {
    //console.log(req.session.usuario)
    res.redirect('/inicio');
  } else {
    next();
  }
}
function isAutenticateRegister(req, res, next) {
  if (req.session.usuario) {
    res.redirect('/inicio');
  } else {
    next();
  }
}
router.get("/",(req,res)=>{
  res.redirect('/inicio');
})
/* GET users listing. */
router.get('/inicio', isAutenticate, function (req, res, next) {
  //console.log(req.session.usuario.musics);
  let datosAenviar = {
    id: req.session.usuario.id,
    nombre: req.session.usuario.nombre,
    email: req.session.usuario.email,
    alias: req.session.usuario.alias,
    blur: req.session.usuario.blur,
    imagen_fondo: req.session.usuario.imagen_fondo,
    musics: req.session.usuario.musics,
    imagenes: req.session.usuario.imagenes
  };  
  res.render('inicio', datosAenviar);
});

router.get("/login", isAutenticateLogin, (req, res) => {
  res.render("login");
});
router.get("/register", isAutenticateRegister, (req, res) => {
  res.render("register");
})

router.get("/addMusic", isAutenticate, (req, res) => {
  res.render("addMusic", { imagenes: req.session.usuario.imagenes })
});
router.get("/ver_musicas",isAutenticate,(req,res)=>{
  let datosAenviar = {
    email: req.session.usuario.email,
    blur: req.session.usuario.blur,
    imagen_fondo: req.session.usuario.imagen_fondo,
    musics: req.session.usuario.musics,
    imagenes: req.session.usuario.imagenes
  };  
  res.render('ver_musicas', datosAenviar);
})
router.get("/ver_imagenes",isAutenticate,(req,res)=>{
  let datosAenviar = {
    email: req.session.usuario.email,
    blur: req.session.usuario.blur,
    imagen_fondo: req.session.usuario.imagen_fondo,
    musics: req.session.usuario.musics,
    imagenes: req.session.usuario.imagenes
  };  
  res.render('ver_imagenes', datosAenviar);
});

router.get('/logout',isAutenticate,(req,res)=>{
  
  req.session.destroy();
  res.redirect('/login');
})
module.exports = router;
