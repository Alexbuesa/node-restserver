const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// Es un middleware que carga todos los archivos en req.files
// Se le pueden pasar params para configurar diferentes opciones
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo
            }
        });
    }



    //Es el parámetro que envíamos, por ejemplo en Postman pasamos un parámetro en el body con Key = archivo y Value imagen.jpg
    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre del archivo
    // Se forma el nombre del archivo, lo de los milliseconds es para evitar algún problema con la caché del navegador, no se exactamente el problema
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Una vez la imagen está en nuestro sistema de archivos, se llama a la funcion imagenUsuario o imagenProducto
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }



    });
});


//===================================
// Guardar en BD la imagen del usuario
//===================================
// Busca el usuario al que se le va a asignar la imagen, si lo encuentra, comprueba que no tenga ya una imagen asignada
// En caso de que tenga imagen, la elimina y le asigna la nueva imagen que se acaba de subir, para no tener imágenes viejas en nuestro sistema de archivos
function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //Como ha habido un error, se llama a borrarArchivo para eliminar la imagen que se acabad e subir
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            //Como ha habido un error, se llama a borrarArchivo para eliminar la imagen que se acaba de subir
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe el usuario'
                }
            });
        }

        //Todo correcto, se llama borrarArchivo para eliminar su imagen vieja antes de asignarle la nueva
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioActualizado) => {
            res.json({
                ok: true,
                usuario: usuarioActualizado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {

        if (err) {
            //Como ha habido un error, se llama a borrarArchivo para eliminar la imagen que se acaba de subir
            borrarArchivo(nombreArchivo, 'productos');

            res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBD) {
            //Como ha habido un error, se llama a borrarArchivo para eliminar la imagen que se acaba de subir
            borrarArchivo(nombreArchivo, 'productos');

            res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe el producto'
                }
            });
        }

        //Todo correcto, se llama borrarArchivo para eliminar su imagen vieja antes de asignarle la nueva
        borrarArchivo(productoBD.img, 'productos');

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoActualizado) => {
            res.json({
                ok: true,
                producto: productoActualizado,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(imgBorrar, tipo) {

    //El path.resolve junta los argumentos que le pongamos para crear el path
    //__dirname nos da la ruta en la que se encuentra este archivo
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${imgBorrar}`);
    if (fs.existsSync(pathImg)) {
        //Elimina la imagen
        fs.unlinkSync(pathImg);
    }
}
module.exports = app;