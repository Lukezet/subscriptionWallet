const mp = new MercadoPago('APP_USR-2ff7de37-7f50-44f5-b856-15e9aada3aa9', {
    locale: "es-AR"
});

// Función para obtener los parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        title: params.get('title'),
        quantity: params.get('quantity'),
        price: params.get('price')
    };
}

// Crear el botón de pago utilizando los parámetros de la URL
async function createPaymentButton() {
    // Obtener los datos de la URL
    const { title, quantity, price } = getUrlParams();

    if (!title || !quantity || !price) {
        alert("Faltan datos para generar el pago");
        return;
    }

    // Hacer una petición POST a tu servidor para crear la preferencia
    try {
        const response = await fetch("http://localhost:3000/create_preference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                quantity: quantity,
                price: price
            })
        });

        const preference = await response.json();
        createCheckoutButton(preference.id);
        console.log("Id PREFERENCIA: " + preference.id);
    } catch (error) {
        console.error("Error al crear la preferencia: ", error);
        alert("Error al crear la preferencia");
    }
}

// Función para crear y renderizar el botón de pago
const createCheckoutButton = (preferenceId) => {
    const bricksBuilder = mp.bricks();
    const renderComponent = async () => {
        if (window.checkoutButton) window.checkoutButton.unmount();

        window.checkoutButton = await bricksBuilder.create("wallet", "wallet_container", {
            initialization: {
                preferenceId: preferenceId,
                redirectMode: 'modal',
            },
            customization: {
                texts: {
                    valueProp: 'smart_option',
                },
            },
        });
    };

    renderComponent();
};

// Llamar a la función cuando la página se cargue
window.onload = createPaymentButton;

// document.getElementById('payment-checker').addEventListener('click', async ()=>{
//     try
//     {
//     const idData = {
//         id:84970446189//1842958086//,//1872832305
//     }
//     const response = await fetch("http://localhost:3000/pay_checker",{
//         method: "POST",
//         headers: {
//             "Content-Type":"application/json",
//         },
//         body: JSON.stringify(idData),
//     });
//     debugger
//     const preference2 = await response.json()
//     console.log("-------- F R O N T -------")
//     console.log("Checkado",preference2)
   
// } catch(error){
    
//     alert("error mal :(");
//     console.log(error)
//    }
// });