import dotenv from "dotenv";

dotenv.config();

import { MongoClient } from "mongodb";
import { log, table, error } from "node:console";
import inquirer from "inquirer";
import registrarPedido from "./src/controller/registrarPedido.js";
import estadoDelInventario from "./src/controller/estadoDelInventario.js"
import pizzas from "./src/controller/Pizzas.js";
import repartidores from "./src/controller/repartidores.js";

//conexion a la base de datps
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

//nombre de la base de datos
const dbName = "pizzeria"


async function menu() {
    const respuestas = await inquirer.prompt([
        {
            type: "list", //tipo list input confirm 
            name:"registrar",
            message:"Menu",
            choices:[
                "Registrar un pedido:",
                "Estado del inventario:",
                "Pizzas:",
                "Repartidores:",
                "Datos de ventas y tendencias:",
                "salir"
            ]
        }]); 
        
        switch (respuestas.registrar) {
            case "Registrar un pedido:":
                await registrarPedido();
                await menu();
                break;
            
            case "Estado del inventario:":
                await estadoDelInventario();
                await menu();
                break;
            
            case "Pizzas:":
                await pizzas();
                await menu();
                break;
            case "Repartidores:":
                await repartidores();
                await menu();
                
                break;
            case "Datos de ventas y tendencias:":
                log("opcion seleccionada",respuestas.registrar)
                menu();
                break;                                
            case "salir":
                process.exit(0);
                
        }
        
        
    }//fin del menu


menu();



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

