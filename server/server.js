import express from "express";
import cors from "cors"; 
import sql from 'mssql';
import dotenv from 'dotenv'; // Cambia require a import

dotenv.config(); // Configurar dotenv

// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

const accessToken = process.env.ACCESS_TOKEN;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbServer = process.env.DB_SERVER;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: accessToken });

const app = express();
const port = 3000;

// Configura la conexión a la base de datos
const dbConfig = {
    user: dbUser,
    password: dbPassword,
    server: dbServer,
    port: parseInt(dbPort), // Asegúrate de convertir el puerto a un número
    database: dbName,
    options: {
        encrypt: false, // Cambia a true si utilizas conexiones encriptadas
        enableArithAbort: true
    }
};

sql.connect(dbConfig)
    .then(pool => {
        console.log('Conectado a la base de datos');
        return pool;
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
    });

app.use(express.json());
app.use(cors());
app.get("/",(req, res) => {
	res.send("soy el server :)");
});

app.post("/create_preference", async (req, res) => {
    try {
        // Recibe el JSON con los datos de la orden
        const { title, quantity, price } = req.body;

        // Define el cuerpo de la preferencia de pago
        const body = {
            items: [{
                title: title,
                quantity: Number(quantity),
                unit_price: Number(price),
                currency_id: "ARS"
            }],
            back_urls: {
                success: "https://tu-pagina-exito.com/",
                failure: "https://tu-pagina-error.com/",
                pending: "https://tu-pagina-pendiente.com/"
            },
            auto_return: "approved",
            notification_url: "https://9109-200-5-122-254.ngrok-free.app/webhook" // Cambia esto con tu URL real
        };

        // Crea la preferencia usando MercadoPago SDK
        const preference = new Preference(client);
        const result = await preference.create({ body });

        // Devuelve el ID de la preferencia para que puedas generar el botón de pago
        res.json({
            id: result.id
        });
        console.log("Orden de Compra creada:", result.items);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Error al crear la preferencia"
        });
    }
});

app.post("/webhook",async function(req,res){
    console.log(req.query)
    const paymentId = req.query.id;
    try{
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`,{
        method: 'GET',
        headers:{
            'Authorization':`Bearer ${client.accessToken}`
        }
    })
    if (response.ok){
        const data = await response.json();
        // Inserta los datos del pago en la tabla DetallePagos
        await insertDetallePago({
            idDetalleDeuda: 1173,  // Usa los valores correspondientes
            fechaPago: new Date(), // Fecha actual o extraída de los detalles del pago
            importePago: data.transaction_amount,
            tipoPago: 1, // Tipo de pago correspondiente
            mes: '08', // Mes en formato de dos caracteres
            año: '2024', // Año en formato de cuatro caracteres
            idRecibo: data.id,  // Ejemplo, puedes ajustar con datos reales
            idArchivoR: 0,
            idDetalleArchivoR: 0,
            idCargo: 1111,
            opCrea: 14, // Usuario que crea
            fecCrea: new Date(), // Fecha de creación
            opModi: 0,
            fecModi: new Date(),
            anulado: 0,
            opAnula: 0,
            fecAnula: new Date(),
            idNegativo: 0,
            idAutomatico: 0,
            idPagoDel: 0
        });
        console.log(data);
    }
    res.sendStatus(200);
    } catch(error){
        console.log('Error: ',error);
        res.sendStatus(500)
    }



})
app.post("/pay_checker",async(req,res)=>{
    const paymentId = req.body.id;
    try{
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`,{
        method: 'GET',
        headers:{
            'Authorization':`Bearer ${client.accessToken}`
        }
    })
    if (response.ok){
        const data = await response.json();
        console.log("------------ B A C K -------------")
        console.log(data);
    }
    res.send(response);
    } catch(error){
        console.log('Error: ',error);
        res.sendStatus(500)
    }
})

// Función para insertar los datos del pago en la tabla DetallePagos
async function insertDetallePago({
    idDetalleDeuda,
    fechaPago,
    importePago,
    tipoPago,
    mes,
    año,
    idRecibo,
    idArchivoR,
    idDetalleArchivoR,
    idCargo,
    opCrea,
    fecCrea,
    opModi,
    fecModi,
    anulado,
    opAnula,
    fecAnula,
    idNegativo,
    idAutomatico,
    idPagoDel
}) {
    try {
        // Conectar a la base de datos
        const pool = await sql.connect(dbConfig);

        // Crear y ejecutar la consulta de inserción
        const result = await pool.request()
            .input('idDetalleDeuda', sql.BigInt, idDetalleDeuda)
            .input('fechaPago', sql.DateTime, fechaPago)
            .input('importePago', sql.Numeric(10, 2), importePago)
            .input('tipoPago', sql.Int, tipoPago)
            .input('mes', sql.NChar(2), mes)
            .input('año', sql.NChar(4), año)
            .input('idRecibo', sql.BigInt, idRecibo)
            .input('idArchivoR', sql.BigInt, idArchivoR)
            .input('idDetalleArchivoR', sql.BigInt, idDetalleArchivoR)
            .input('idCargo', sql.BigInt, idCargo)
            .input('opCrea', sql.Numeric(3, 0), opCrea)
            .input('fecCrea', sql.DateTime, fecCrea)
            .input('opModi', sql.Numeric(3, 0), opModi)
            .input('fecModi', sql.DateTime, fecModi)
            .input('anulado', sql.Int, anulado)
            .input('opAnula', sql.Numeric(3, 0), opAnula)
            .input('fecAnula', sql.DateTime, fecAnula)
            .input('idNegativo', sql.BigInt, idNegativo)
            .input('idAutomatico', sql.BigInt, idAutomatico)
            .input('idPagoDel', sql.BigInt, idPagoDel)
            .query(`
                INSERT INTO DetallePagos (
                    IdDetalleDeuda,
                    FechaPago,
                    ImportePago,
                    TipoPago,
                    Mes,
                    Año,
                    Id_Recibo,
                    IdArchivoR,
                    IdDetalleArchivoR,
                    IdCargo,
                    OpCrea,
                    FecCrea,
                    OpModi,
                    FecModi,
                    Anulado,
                    OpAnula,
                    FecAnula,
                    IdNegativo,
                    IdAutomatico,
                    IdPagoDel
                )
                VALUES (
                    @idDetalleDeuda,
                    @fechaPago,
                    @importePago,
                    @tipoPago,
                    @mes,
                    @año,
                    @idRecibo,
                    @idArchivoR,
                    @idDetalleArchivoR,
                    @idCargo,
                    @opCrea,
                    @fecCrea,
                    @opModi,
                    @fecModi,
                    @anulado,
                    @opAnula,
                    @fecAnula,
                    @idNegativo,
                    @idAutomatico,
                    @idPagoDel
                )
            `);

        console.log('Inserción exitosa:', result);
    } catch (err) {
        console.error('Error en la inserción:', err);
    }
}

/*84970446189
*/
app.listen(port, ()=>{
    console.log(`El servidor esta corriendo en el puerto ${port}`)
})