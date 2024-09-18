import express from "express";
import cors from "cors"; 
// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-2986683077668925-060320-8f680b133f6e2838d19c548b98b58c3d-1842958086'});

const app = express();
const port = 3000;


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
/*84970446189
*/
app.listen(port, ()=>{
    console.log(`El servidor esta corriendo en el puerto ${port}`)
})