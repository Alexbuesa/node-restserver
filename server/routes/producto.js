const express = require('express');
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//===================================
//  Obtener todos los productos
//===================================
app.get('/producto', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || null; //Si no viene límite los saca todos
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

//===================================
//  Obtener un producto por ID
//===================================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "No existe ningun producto con ese ID"
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });
});

//===================================
//  Buscar productos
//===================================
app.get('/producto/:nombre', verificaToken, (req, res) => {
    let nombre = req.params.nombre;

    let regex = new RegExp(nombre, 'i'); //la 'i' es para que NO sea case sensitive

    Producto.find({ nombre: regex }) //Encuentra todos los registros cuyo nombre CONTENGA el parámetro envíado, transformado en expresión regular(regex)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "No existe ningun producto con ese criterio de búsqueda"
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });
});

//===================================
//  Crear un producto
//===================================
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;
    let id_usuario = req.usuario._id;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.id_categoria,
        usuario: id_usuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: "Producto creado"
        });

    });

});

//===================================
//  Actualizar un producto por ID
//===================================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "precioUni", "descripcion", "disponible", "categoria"]); //En body vienen todos los datos que se envían para actualizar, con _.pick se cogen solo los que queramos y se guardan en un nuevo array
    console.log(req.body);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Producto no encontrado"
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: "Producto actualizado"
        });
    });
});

//===================================
//  Eliminar producto por ID (poner disponible = false, no borrar físicamente) 
//===================================
app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    let cambiaDisponible = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Producto no encontrado"
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            message: "Producto borrado"
        });
    });
});

module.exports = app;