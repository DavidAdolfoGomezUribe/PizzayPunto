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
        choices:["listar todas las pizzas en cola:","Cambiar estado de pizza:"]
    }])
    
    switch (respuestas.menu) {
        case "listar todas las pizzas en cola:":
            const pedidos = await db.collection("pedidos")
                .find({ estado: "En proceso" }, { projection: { _id: 0 } })
                .toArray();
            table(pedidos)
            
            break;
    
        case "Cambiar estado de pizza:":
            log("ok")
            await editarEstado();
            break;
    }
    
}

async function editarEstado() {
    const { tipo } = await inquirer.prompt([
        {
            type: "list",
            name: "tipo",
            message: "¿Qué tipo de pedido desea gestionar?",
            choices: ["En sitio", "A domicilio"]
        }
    ]);

    const esDomicilio = tipo === "A domicilio";

    // Buscar pedidos en proceso según el tipo
    const pedidos = await db.collection("pedidos").find({
        estado: "En proceso",
        domi: esDomicilio
    }).toArray();

    if (pedidos.length === 0) {
        log(`No hay pedidos ${esDomicilio ? "a domicilio" : "en sitio"} en proceso.`);
        return;
    }

    // Preparar las opciones para mostrar al usuario
    const opciones = pedidos.map((pedido, idx) => {
        const { nombre } = pedido.datosCliente;
        const { tamaño, tipodemasa, ingredientes } = pedido.tipoDePizza;
        return {
            name: `${nombre} | ${tamaño}cm | ${tipodemasa} | ${ingredientes.join(", ")}`,
            value: idx
        };
    });

    const { seleccionado } = await inquirer.prompt([
        {
            type: "list",
            name: "seleccionado",
            message: "Seleccione un pedido para cambiar su estado a 'Lista':",
            choices: opciones
        }
    ]);

    const pedido = pedidos[seleccionado];

    // Actualizar estado en la base de datos
    await db.collection("pedidos").updateOne(
        { _id: pedido._id },
        { $set: { estado: "Lista" } }
    );

    log(`✅ El pedido de ${pedido.datosCliente.nombre} fue marcado como 'Lista'.`);

    
    if (esDomicilio) {
        await asignarRepartidorAuto(pedido);
    }
}


async function asignarRepartidorAuto(pedido) {
    // Buscar el primer repartidor disponible
    const repartidorDisponible = await db.collection("repartidores").findOne({ estado: "disponible" });

    if (!repartidorDisponible) {
        log("❌ No hay repartidores disponibles en este momento. El pedido quedará en espera.");
        return;
    }

    // Agregar el pedido al array de pedidos del repartidor y cambiar estado a "en ruta"
    await db.collection("repartidores").updateOne(
        { _id: repartidorDisponible._id },
        {
            $set: { estado: "en ruta" },
            $push: { pedido: pedido }
        }
    );

    log(`🚚 El repartidor ${repartidorDisponible.nombre} ha sido asignado al pedido de ${pedido.datosCliente.nombre}.`);
}
