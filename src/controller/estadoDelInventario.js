import inquirer from "inquirer";
import { log } from "node:console";

export default async function estadoDelInventario() {
    const respuestas = await inquirer.prompt([{
        type:"list",
        name:"registrar",
        message:"Inventario",
        choices:["listar","agreagar","eliminar","actualizar"]
    }])

    log(respuestas.registrar)
}