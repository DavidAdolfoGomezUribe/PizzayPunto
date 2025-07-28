import { log, table } from "console";
import inquirer from "inquirer";
import { MongoClient } from "mongodb";

//conexion a la base de datps
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

//nombre de la base de datos
const dbName = "pizzeria"


await client.connect();
const db=client.db(dbName)

export default async function pizzas() {
    
    const respuestas = await inquirer.prompt([{
        type:"list",
        name:"menu",
        message:"Seleccione una opcion",
        choices:["listar todas las pizzas en cola:","cambiar estado de pizza:"]

    }])
    
    switch (respuestas.menu) {
        case "listar todas las pizzas en cola:":
            const pedidos = await db.collection("pedidos")
                .find({ estado: "En proceso" }, { projection: { _id: 0 } })
                .toArray();
            table(pedidos)
            
            break;
    
        case "cambiar estado de pizza:":
            editarEstado();
            break;
    }
    
}

async function editarEstado(){
    
}