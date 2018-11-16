const jwt = require("jsonwebtoken")

//===================================
//Verificar si el token es correcto
//===================================
let verificaToken = (req, res, next) => {
    let token = req.get("token"); //En vez de token suele llamarse Authorization

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido"
                }
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}

//===================================
// Verifica que el usuario sea admin
//===================================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            err: {
                message: "Operacion permitida solo a usuarios administradores"
            }
        });
    }

    next();
}

//===================================
// Verifica token para imagen por URL
//===================================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido"
                }
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}