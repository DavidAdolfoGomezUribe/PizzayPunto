export default class Pedido {
    constructor(datosCliente = [],tipoDePizza =[],total,estado ="En proceso",date = new Date(),domi = false) {
        this.date = date; // Fecha del pedido
        this.datosCliente = datosCliente; // Datos del cliente
        this.tipoDePizza = tipoDePizza; // Tipo de pizza
        this.total = total; // Total del pedido
        this.estado = estado; // Estado del pedido
        this.domi = domi; // Domicilio
        
    }
    toObject() {
        return {
            domi: this.domi,
            tamaño: this.tipoDePizza.tamaño,
            datosCliente: this.datosCliente,
            tipoDePizza: this.tipoDePizza,
            total: this.total,
            estado: this.estado,
            };
    }
}