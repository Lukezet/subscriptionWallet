const mp = new MercadoPago(window.env.MP_PUBLIC_KEY, {
  locale: "es-AR",
});
// Obtener parámetros de la URL
function getParams() {
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  return {
    email: params.get("email"),
    planId: params.get("plan"),
    documento: params.get("documento"),
  };
}

const bricksBuilder = mp.bricks();
let cardBrickController;
window.onload = async () => {
  console.log("Página cargada");

  const { email, planId, documento } = getParams();
  if (!planId?.trim()) {
    alert("Falta el parámetro plan");
    return;
  }

  try {
    const res = await fetch(`https://upcn.nowddns.com/ApiPrueba/api/MercadoPago/obtener-plan/${planId}`);
    const plan = await res.json();

    if (!plan.auto_recurring.transaction_amount) {
      alert("No se pudo obtener el monto del plan.");
      return;
    }
    console.log(plan.auto_recurring.transaction_amount)
    // Recién ahí cargás el Brick con el monto correcto
    bricksBuilder
      .create("cardPayment", "card-brick", {
        initialization: {
          amount: plan.auto_recurring.transaction_amount,
        },
        callbacks: {
          onReady: () => {
            console.log("Brick cargado correctamente");
          },
          onSubmit: async (cardFormData, actions) => {
            
            if (!email?.trim() || !planId?.trim() || !documento?.trim()) {
              alert("Faltan datos en la URL (email, plan o documento).");
              return;
            }

            const body = {
              payer_email: email,
              preapproval_plan_id: planId,
              card_token_id: cardFormData.token,
              back_url: "https://upcn.nowddns.com/upcn/",
              status: "authorized",
              external_reference: documento
            };

            try {
              const response = await fetch(
                "https://upcn.nowddns.com/ApiPrueba/api/MercadoPago/crear-suscripcion-con-plan",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                }
              );
              const data = await response.json();
              if (data.init_point) {
                window.location.href = data.init_point;
              } else {
                alert("Error al crear la suscripción.");
              }
            } catch (error) {
              console.error("Error al enviar datos a la API:", error);
              alert("Error al procesar la suscripción.");
            }
          },
          onError: (error) => {
            console.error("Error en el Brick:", error);
          },
        },
      })
      .then((controller) => (cardBrickController = controller));
  } catch (error) {
    console.error("Error al obtener monto del plan:", error);
    alert("No se pudo obtener el monto del plan.");
  }
};
