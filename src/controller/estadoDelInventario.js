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
    
        case "agreagar":
            await agregar();
            break;
    
        case "eliminar":
            await eliminar();
            break;

        case "actualizar":
            await editar();
            break;
    
        }
}

async function agregar (){ 
    log("por favor ingrese los siguientes datos para insertar un nuevo ingrediente ")
    
    const respuestas = await inquirer.prompt([
        {
            type:"input",
            name:"nombre",
            message:"Ingrese el nombre del ingrediente",
        },{
            type:"input",
            name:"cantidad",
            message:"Ingrese la cantidad del ingrediente",
        },{
            type:"input",
            name:"precio",
            message:"Ingrese el precio ingrediente",
        }
    ])

    const session =  client.startSession();    
    
    try {
        await session.withTransaction(async ()=>{
            const inventario =  db.collection("inventario");
            
                const response = await inventario.insertOne(
                    {nombre: respuestas.nombre,
                    cantidad: parseInt(respuestas.cantidad),
                    precio: parseInt(respuestas.precio)},
                    {session}
                )
                const generateID = response.insertedId
                log(`Producto registrado con exito con el id: ${generateID}`)
                table(respuestas)
        })
        
     } catch (error) {
        
     }finally{
         await session.endSession();
     }

}


async function eliminar(){
    const inventario = db.collection("inventario")
    const findOne = await inventario.find({}).toArray();
    const nombres = findOne.map((ingrediente)=>{return ingrediente.nombre})

    const respuestas = await inquirer.prompt([{
        type:"list",
        name:"nombre",
        message:"Inventario",
        choices: nombres
    }])

    const session =  client.startSession();    
    
    try {
        await session.withTransaction(async ()=>{
            const inventario =  db.collection("inventario");
                const response = await inventario.deleteOne(
                    {nombre: respuestas.nombre},                    
                    {session}
                )
                
                log(`Producto eliminado: ${respuestas.nombre}`)
                table(response)
        })
        
    } catch (error) {
    
    }finally{
        await session.endSession();
    }

}


async function  editar() {

    const inventario = db.collection("inventario")
    const findOne = await inventario.find({}).toArray();

    const nombres = findOne.map((ingrediente)=>{return ingrediente.nombre})
     

    const respuestas = await inquirer.prompt([{
            type:"list",
            name:"nombre",
            message:"Seleccione un producto para editar",
            choices: nombres
        },{
            type:"input",
            name:"cantidad",
            message:"cantidad"
        },{
            type:"input",
            name:"precio",
            message:"precio"
        }
    ])

    const session =  client.startSession();    

    try {
        await session.withTransaction(async ()=>{
            const inventario =  db.collection("inventario");
                const response = await inventario.updateOne(
                    {nombre: respuestas.nombre},
                    {$set:{
                        cantidad:parseInt(respuestas.cantidad),
                        precio:parseInt(respuestas.precio)
                    }},                    
                    {session}
                )
                
                log(`Producto actualizado con exito: `)
                table(response)
        })
        
    } catch (error) {
    
    }finally{
        await session.endSession();
    }

    
}

