require('dotenv').config();
const { MongoClient } = require('mongodb');
const { log,table,error } = require('node:console');
const inquirer = require('inquirer');

//conexion a la base de datps
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

//nombre de la base de datos
const dbName = "pizzeria"






//estructura basica para conexion al servidor
//testeado y funcional

// async function main() {
//     //aconeccion al servidor
//     try {
//         await client.connect();
//         log("conexion exitosa")
//         const db= client.db(dbName)
//         const collection = db.collection("pedidos")
        
//         const findOne = await collection.find({}).toArray();
//         table(findOne)
        
//     } catch (error) {
//         log(error)
//     } finally{
//         process.exit(0);

//     }
    
    
// }

// main();

