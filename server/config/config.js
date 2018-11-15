//===================================
//  Puerto
//===================================
process.env.PORT = process.env.PORT || 3000;

//===================================
//  Entorno
//===================================
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//===================================
//  Vencimiento del token
//===================================
process.env.CADUCIDAD_TOKEN = "1h";

//===================================
//  SEED de autenticación
//===================================
process.env.SEED = process.env.SEED || "este-es-el-seed-de-desarrollo";

//===================================
//  Base de datos
//===================================
let urlDB;

if (process.env.NODE_ENV === "dev") {
    urlDB = "mongodb://localhost:27017/cafe";
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//===================================
//  Google Client ID
//===================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '264801796334-5q81qjo10eei8ogiqqh90s51oq08gi4m.apps.googleusercontent.com';