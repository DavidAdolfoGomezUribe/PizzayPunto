import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";
import { log, table } from "console";
import inquirer from "inquirer";

import Pedido from "../abstrac/Pedidos.js";

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
            const laPizza = await pizza(); // esto retorna  {'tamaño': '28', tipodemasa: 'masa original', y ub array de ingredientes
            await transaccionActualizarListado(laPizza.ingredientes);// pa actualizar el listado en la base de datos
            const total = await precioTotal(laPizza.tamaño,laPizza.tipodemasa,laPizza.ingredientes);//retorna el valor de la pizza

            const pedido = new Pedido(datosCliente,laPizza,total); //crea un objeto tipo pedido
            await db.collection("pedidos").insertOne({...pedido}); //inserta el pedido a la base de datos
            log("Pizza registrada con exito")
            table(pedido.toObject());
            log("*******");
            break;
        
        case "A domicilio":
            const datosClienteDomi = await aDomicilio();
            const laPizzaDomi = await pizza();
            await transaccionActualizarListado(laPizzaDomi.ingredientes);
            const totalDomi = await precioTotal(laPizzaDomi.tamaño,laPizzaDomi.tipodemasa,laPizzaDomi.ingredientes);
            const pedidoDomi = new Pedido(datosClienteDomi,laPizzaDomi,totalDomi,"En proceso",new Date(),true);
            await db.collection("pedidos").insertOne({...pedidoDomi});
            log("Pizza registrada con exito")
            table(pedidoDomi.toObject());
            log("*******");
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

//listado de precios
async function precioTotal(tamaño,tipodemasa,ingredientes){
    let array = []
    //precio tamaños pizza
    if (tamaño == "28") {
        array.push(5000)
    }else if(tamaño == "36"){
        array.push(7000)
    }else if (tamaño == "41"){
        array.push(10000)
    }

    //precio tipo de masa
    if(tipodemasa == "masa original"){
        array.push(1000)
    }else if(tipodemasa == "pan pizza"){
        array.push(2000)
    }else if(tipodemasa == "borde de queso"){
        array.push(3000)
    }

    //precios de los ingredientes
    const inventario = db.collection("inventario")

    for (let i = 0; i < ingredientes.length; i++) {
        
        const precio = await inventario.findOne({nombre:ingredientes[i]}            )
        array.push(precio.precio)
    }
    const total = array.reduce((a, b) => a + b, 0);
    
    return total
}

async function aDomicilio() {

    //datos del cliente
    const respuestas = await inquirer.prompt([
        {
            type: "input",
            name: "nombre",
            message: "Inserte su nombre"
        },
        {
            type: "input",
            name: "telefono",
            message: "Inserte su número de teléfono"
        },
        {
            type: "input",
            name: "departamento",
            message: "Inserte su departamento"
        },
        {
            type: "input",
            name: "ciudad",
            message: "Inserte su ciudad"
        },
        {
            type: "input",
            name: "barrio",
            message: "Inserte su barrio"
        },
        {
            type: "input",
            name: "direccion",
            message: "Inserte su dirección (tipo de vía / número / guion). Ejemplo: carrera 1 # 1 - 1"
        },
        {
            type: "list",
            name: "tipoInmueble",
            message: "Seleccione el tipo de inmueble",
            choices: [
                "Apartamento",
                "Casa",
                "Hotel",
                "Edificio",
                "Oficina"
            ]
        },
        {
            type: "input",
            name: "instrucciones",
            message: "¿Alguna instrucción para el repartidor?"
        }
    ]);

    //log(respuestas.nombre , respuestas.telefono);
    return respuestas


}