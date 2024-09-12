const mp = new MercadoPago('APP_USR-2ff7de37-7f50-44f5-b856-15e9aada3aa9',{
    locale:"es-AR"
});
document.getElementById('checkout-btn').addEventListener('click', async ()=>{
    const button = document.getElementById('checkout-btn');
    button.disabled = true;  // Deshabilitar el botón para evitar múltiples clics
    try
    {
    const orderData = {
        title:'S23 sam',
        quantity:1,
        price:650,
    }
    const response = await fetch("http://localhost:3000/create_preference",{
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(orderData),
    });
    
    const preference = await response.json()
    createCheckoutButton(preference.id);
   console.log("Id PREFERENCIA: "+ preference.id )
} catch(error){
    alert("error :(");
   }
   finally {
    button.disabled = false;  // Rehabilitar el botón después de que se completa la operación
}
});

const createCheckoutButton = (preferenceId) => {
    const bricksBuilder = mp.bricks();
    const renderComponent = async ()=> {
        if (window.checkoutButton) window.checkoutButton.unmount();

        window.checkoutButton = await bricksBuilder.create("wallet", "wallet_container", {
        initialization: {
        preferenceId: preferenceId,
        redirectMode:'modal',
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
document.getElementById('payment-checker').addEventListener('click', async ()=>{
    try
    {
    const idData = {
        id:84970446189//1842958086//,//1872832305
    }
    const response = await fetch("http://localhost:3000/pay_checker",{
        method: "POST",
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(idData),
    });
    debugger
    const preference2 = await response.json()
    console.log("-------- F R O N T -------")
    console.log("Checkado",preference2)
   
} catch(error){
    
    alert("error mal :(");
    console.log(error)
   }
});