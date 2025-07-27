dotenv.config();

import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { log, table } from "console";
import inquirer from "inquirer";


//conexion a la base de datps
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

//nombre de la base de datos
const dbName = "pizzeria"


await client.connect();
const db=client.db(dbName)



export default async function estadoDelInventario() {
    const respuestas = await inquirer.prompt([{
        type:"list",
        name:"registrar",
        message:"Inventario",
        choices:["listar","agreagar","eliminar","actualizar"]
    }])

    log(respuestas.registrar)

    switch (respuestas.registrar) {
        case "listar":
            const inventario =  db.collection("inventario");
            const find = await inventario.find({}).toArray();
            table(find)
            break;
    
        default:
            break;
    }
}