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

app.post("/create_preference",async(req,res)=>{
    try{
        const body = {
            items:[{
                title: req.body.title,
                quantity: Number(req.body.quantity),
                unit_price: Number(req.body.price),
                currency_id:"ARS"
            }],
            back_urls: {
                success:"https://lukezet.github.io/",
                failure:"https://www.youtube.com/watch?v=vEXwN9-tKcs&t=1652s",
                pending:"https://chatgpt.com/c/5a7d8125-6a2e-4463-bc23-941005c076f1"
            },
            auto_return:"approved",
            notification_url:"https://510e-181-93-74-134.ngrok-free.app/webhook"
        };
        const preference = new Preference(client);
        const result = await preference.create({body});
        res.json({
            id:result.id,
        })
        console.log("Orden de Compra creada:  ",result.items)
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            error:"Error al crear la preferencia"
        })
    }
})
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