// controllers/usuariosController.js
const { urlencoded } = require('express');
const db = require('../models/database');
const bcrypt = require('bcrypt');
const saltRounds = 12;

exports.crearUsuario = async (req, res) => {
    //console.log(req.body);
    try {
        const { nombre, email, password, edad, alias } = req.body;

        const passwordHash = await bcrypt.hash(password, saltRounds);

        const sql = `
            INSERT INTO usuarios (nombre, email, password_hash, edad, alias)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await db.run(sql, [nombre, email, passwordHash, edad, alias]);
        res.render("login");
        //res.json({ message: 'Usuario creado', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerUsuarios = async (req, res) => {
    try {
        const sql = `SELECT id, nombre, email, edad FROM usuarios`;
        const rows = await db.all(sql);

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.obtenerUsuarioPorEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        const sql = `SELECT id, nombre, email,password_hash, edad, alias, blur, color_fondo, imagen_fondo FROM usuarios WHERE email = ?`;
        const row = await db.get(sql, [email]);
        const usuario = row;
        //console.log("LOGIN:", usuario);
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const esCorrecto = await bcrypt.compare(password, usuario.password_hash);
        //obtner musicas



        if (esCorrecto) {
            const sqlMusic = `SELECT id,nombre,url FROM musicas WHERE email_user = ?`
            const rowMusic = await db.all(sqlMusic, [email]);
            let arrMusics = [];
            Object.keys(rowMusic).forEach(key => {
                arrMusics.push({
                    id: rowMusic[key].id,
                    nombre: rowMusic[key].nombre,
                    url: rowMusic[key].url
                })
            });
            const sqlImg = `SELECT id,nombre,url FROM imagenes WHERE email_user = ?`;
            const rowImg = await db.all(sqlImg, [email]);
            let arrImgs = [];
            Object.keys(rowImg).forEach(key => {
                arrImgs.push({
                    id: rowImg[key].id,
                    nombre: rowImg[key].nombre,
                    url: rowImg[key].url
                })
            })
            // ✅ Guardar datos en sesión
            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                alias: usuario.alias,
                blur: usuario.blur,
                color_fondo: usuario.color_fondo,
                imagen_fondo: usuario.imagen_fondo,
                musics: arrMusics,
                imagenes: arrImgs
            };
            res.redirect("/inicio");
        } else {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.actualizarConfig = async (req, res, next) => {
    try {
        const { blur, imgFondo } = req.body;
        const sql = `
            UPDATE usuarios
            SET blur = ?, imagen_fondo = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE email = ?
        `;
        const result = await db.run(sql, [blur, imgFondo, req.session.usuario.email]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        //Actualizamos datos de la session.suario
        req.session.usuario.blur = blur;
        req.session.usuario.imagen_fondo = imgFondo;
        res.status(200).json({ msg: "Configuracion guradada..." });
    } catch (err) {

    }
}
exports.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, edad } = req.body;

        const sql = `
            UPDATE usuarios
            SET nombre = ?, email = ?, edad = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(sql, [nombre, email, edad, id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM usuarios WHERE id = ?`;
        const result = await db.run(sql, [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

///Musica
exports.addMusic = async (req, res) => {
    try {
        const { nombre, url } = req.body;

        const sql = `
            INSERT INTO musicas (nombre, url, email_user)
            VALUES (?, ?, ?)
        `;
        await db.run(sql, [nombre, url, req.session.usuario.email]);
        req.session.usuario.musics.push({ nombre: nombre, url: url });
        res.json({ nombre: nombre, url: url, email_user: req.session.usuario.email });
        //res.json({ message: 'Usuario creado', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeMusic = async (req, res) => {
    try {
        const { id } = req.body;
        const sql = `DELETE FROM musicas WHERE id = ?`;
        const result = await db.run(sql, [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'no Eliminado',eliminado:false});
        } 
        // Uso 
        const index = req.session.usuario.musics.findIndex(item => item.id === parseInt(id)); 
        if (index !== -1) {
            req.session.usuario.musics.splice(index, 1);
        }
        //console.log(id, req.session.usuario.musics)
        res.json({ message: 'Musica eliminada...', musics: req.session.usuario.musics, eliminado: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
///Imagenes
exports.addImg = async (req, res) => {
    try {
        const { nombre, url } = req.body;

        const sql = `
            INSERT INTO imagenes (nombre, url, email_user)
            VALUES (?, ?, ?)
        `;
        await db.run(sql, [nombre, url, req.session.usuario.email]);
        res.json({ nombre: nombre, url: url, email_user: req.session.usuario.email });
        req.session.usuario.imagenes.push({ nombre: nombre, url: url, email_user: req.session.usuario.email });
        //res.json({ message: 'Usuario creado', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.removeImg = async (req, res) => {
    try {
        const { id } = req.body;
        const sql = `DELETE FROM imagenes WHERE id = ?`;
        const result = await db.run(sql, [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'no Eliminado',eliminado:false});
        } 
        
        // Uso 
        const index = req.session.usuario.imagenes.findIndex(item => item.id === parseInt(id)); 
        if (index !== -1) {
            req.session.usuario.imagenes.splice(index, 1);
        }
        //console.log(id, req.session.usuario.imagenes)
        res.json({ message: 'Img eliminada...', imagenes: req.session.usuario.imagenes, eliminado: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};