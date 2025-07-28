import { log, table } from "console";
import { MongoClient } from "mongodb";
import inquirer from "inquirer";
import dotenv from "dotenv";

dotenv.config();


//conexion a la base de datps
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

//nombre de la base de datos
const dbName = "pizzeria"

await client.connect();
const db=client.db(dbName)


export default async function repartidores() {
    const respuestas = await inquirer.prompt([{
        type: "list",
        name: "menu",
        message: "Seleccione una opcion",
        choices: [
            "listar repartidores disponibles:",
            "listar repartidores en ruta:",
            "finalizar domicilio:"
        ]
    }]);
    switch (respuestas.menu) {
        case "listar repartidores disponibles:":
            await listarRepartidoresDisponibles();
            break;

        case "listar repartidores en ruta:":
            await listarRepartidoresEnRuta();
            break;

        case "finalizar domicilio:":
            await finalizarDomi();
            break;
    }

}

async function listarRepartidoresDisponibles() {
    const repartidores = await db.collection("repartidores")
        .find({ estado: "disponible" }, { projection: { _id: 0 } })
        .toArray();
    if (repartidores.length === 0) {
        log("No hay repartidores disponibles en este momento.");
    } else {
        table(repartidores);
    }
}

async function listarRepartidoresEnRuta() {
    const repartidores = await db.collection("repartidores")
        .find({ estado: "en ruta" }, { projection: { _id: 0 } })
        .toArray();
    if (repartidores.length === 0) {
        log("No hay repartidores en ruta en este momento.");
    } else {
        table(repartidores);
    }
}

async function finalizarDomi() {
    // Buscar repartidores en ruta
    const repartidoresEnRuta = await db.collection("repartidores")
        .find({ estado: "en ruta" })
        .toArray();

    if (repartidoresEnRuta.length === 0) {
        log("No hay repartidores en ruta en este momento.");
        return;
    }

    // Construir opciones para el prompt
    const opciones = repartidoresEnRuta.map((repartidor) => ({
        name: `${repartidor.nombre} (${repartidor.telefono})`,
        value: repartidor._id
    }));

    // Preguntar al usuario cuál repartidor finalizar
    const { idRepartidor } = await inquirer.prompt([
        {
            type: "list",
            name: "idRepartidor",
            message: "Seleccione el repartidor que ha finalizado su entrega:",
            choices: opciones
        }
    ]);

    // Buscar repartidor seleccionado
    const repartidor = repartidoresEnRuta.find(r => r._id.toString() === idRepartidor.toString());

    if (!repartidor || !Array.isArray(repartidor.pedido) || repartidor.pedido.length === 0) {
        log("Este repartidor no tiene pedidos en curso.");
        return;
    }

    // Actualizar repartidor en la base de datos
    await db.collection("repartidores").updateOne(
        { _id: repartidor._id },
        {
            $set: {
                estado: "disponible",
                pedido: []
            },
            $push: {
                pedidosFinalizados: { $each: repartidor.pedido }
            }
        }
    );

    log(`✅ El repartidor ${repartidor.nombre} ha sido marcado como "disponible" y su pedido fue archivado.`);
}
