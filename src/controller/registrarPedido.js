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



export default async function registrarPedido() {
    const respuestas = await inquirer.prompt([
        {
            type:"list",
            name:"registrar",
            message:"¿Que desea registrar el dia de hoy?",
            choices:[
                "En sitio",
                "A domicilio"]
        }
    ]);

    switch (respuestas.registrar) {
        case "En sitio":
            
            log("********")
            const datosCliente = await enSitio();//esto retorna un objeto { nombre: 'asf', cedula: '123' }
            const laPizza = await pizza(); // esto retorna { nombre: 'asd', telefono: 'asd' } {'tamaño': '28', tipodemasa: 'masa original',
            await transaccionActualizarListado(laPizza.ingredientes)// pa actualizar el listado en la base de datos
            

            log(datosCliente,laPizza)
            break;
        
        case "A domicilio":
            log("a domicilio")
            log("********")
            break;

        
    }
    
}


//plantilla de objetos
async function enSitio() {
    //datos del cliente
    const respuestas = await inquirer.prompt([
        {
            type:"input",
            name:"nombre",
            message: "Inserte su nombre"
        },
        {
            type:"input",
            name:"telefono",
            message: "Inserte su numero de telefono"
        },
    ])
    //log(respuestas.nombre , respuestas.telefono);
    return respuestas

}


async function pizza() {
    //conexion a la base de datos collecion inverntario
    
    const inventario = db.collection("inventario")

    const findOne = await inventario.find({}).toArray();
    
    //filtrado por ingredientes cuya cantidad es mayor a 0
    const ingredientesDisponibles = findOne.map( (ingrediente) =>{
                if (ingrediente.cantidad > 0) {
                    return  ingrediente.nombre
                } else {
                    return null
                }
            } ).filter(Boolean);
    
    
    //debe consular la base de datos para los ingredientes
    const respuestas = await inquirer.prompt([
        {
            type:"list",
            name:"tamaño",
            message: "elija un tamaño (en cm)",
            choices:["28","36","41"]
        },
        {
            type:"list",
            name:"tipodemasa",
            message: `Seleccione el tipo de masa \n 
masa original: (Nuestra original masa hecha a mano)
pan pizza: (Masa horneada en sartén, esponjosa, sin borde, con un toque de mantequilla)
Borde de Queso: (Masa original con un delicioso borde relleno de queso y finas hierbas) \n`,
            choices:["masa original","pan pizza","borde de queso"]
        },
        {
            type:"checkbox",
            name:"ingredientes",
            message: "Seleccione los ingredientes que desea agregar a su pizza",
            choices: ingredientesDisponibles
            
                
            
        }

    ])
    //log(respuestas.tamaño , respuestas.tipodemasa);
    
    return respuestas

}
//funcion para actualizar las cantidades de los ngredientes
async function  transaccionActualizarListado(ingredientes) {
    ingredientes

    const session =  client.startSession();
    
    try {
        
        await session.withTransaction(async ()=>{
            const inventario =  db.collection("inventario");
            // san buclecito for
            for (let i = 0; i < ingredientes.length; i++) {
                
                await inventario.updateOne({
                    nombre:ingredientes[i]},
                    {$inc:{cantidad:-1}},
                    {session}
               )
                
            }

        })
        
    } catch (error) {
        
    }finally{
        await session.endSession();

    }
}