const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    console.log(pathImg);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        let pathNoImage = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;