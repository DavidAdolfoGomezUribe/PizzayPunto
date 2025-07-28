
# 🍕 PizzayPunto

## DISCLAIMER:
crear un archivo .env y agregar la siguiente ruta

```bash
MONGO_URI="mongodb+srv://davstudios95:A05162738a%2A@clusterpruebas.c61iwun.mongodb.net/"
```

**PizzayPunto** es una aplicación de línea de comandos desarrollada en Node.js para gestionar pedidos en una pizzería. Permite registrar pedidos (en sitio o a domicilio), gestionar el inventario de ingredientes, consultar el estado de las pizzas en preparación, y más.

## 🧩 Características

- Registro de pedidos en sitio y a domicilio
- Cálculo dinámico del precio total según tamaño, masa e ingredientes
- Gestión del inventario: listar, agregar, actualizar y eliminar ingredientes
- Control del estado de las pizzas en cola
- Interfaz interactiva por consola mediante `inquirer`
- Conexión con MongoDB para almacenamiento de datos persistente

## 📦 Tecnologías utilizadas

- Node.js
- MongoDB
- Inquirer.js
- Dotenv

## ⚙️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/pizzaypunto.git
   cd pizzaypunto
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` y añade tu URI de conexión a MongoDB:
   ```
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

4. Ejecuta la aplicación:
   ```bash
   node app.js
   ```

## 📚 Estructura del menú

```
📌 Menú principal:
  ├── Registrar un pedido
  │     ├── En sitio
  │     └── A domicilio
  ├── Estado del inventario
  │     ├── Listar
  │     ├── Agregar
  │     ├── Eliminar
  │     └── Actualizar
  ├── Pizzas
  │     ├── Listar todas las pizzas en cola
  │     └── Cambiar estado de pizza
  ├── Repartidores (a desarrollar)
  └── Datos de ventas y tendencias (a desarrollar)
```

## 🧪 Ejemplo de flujo

1. Selecciona **Registrar un pedido**
2. Elige **En sitio** o **A domicilio**
3. Introduce los datos del cliente
4. Configura la pizza: tamaño, masa e ingredientes disponibles
5. Confirma el pedido y se guarda en MongoDB

## ✍️ Autor

**David Gomez**

## 📜 Licencia

Este proyecto está licenciado bajo ISC.
