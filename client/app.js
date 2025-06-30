const mp = new MercadoPago("APP_USR-0a5b622d-6362-4814-95c9-157d85aa2b20", {
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
// bricksBuilder
//   .create("cardPayment", "card-brick", {
//     initialization: {
//       amount: 150, // Monto referencial
//     },
//     callbacks: {
//       onReady: () => {
//         console.log("Brick cargado correctamente");
//       },
//       onSubmit: async (cardFormData, actions) => {
//         console.log("onSubmit triggered");
//         // actions.preventDefault();
//         const { email, planId, documento } = getParams();
//         console.log("Email:", email, "PlanId:", planId,"Documento", documento);
//         if (!email?.trim() || !planId?.trim()|| !documento?.trim()) {
//           alert("Faltan datos en la URL (email o plan o documento).");
//           return;
//         }

//         const body = {
//           payer_email: email,
//           preapproval_plan_id: planId,
//           card_token_id: cardFormData.token,
//           back_url: "https://upcn.nowddns.com/upcn/",
//           status: "authorized",
//           external_reference:documento
//         };

//         try {
//           const response = await fetch(
//             "https://upcn.nowddns.com/ApiPrueba/api/MercadoPago/crear-suscripcion-con-plan",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify(body),
//             }
//           );
//           console.log("Datos que se mandan al backend:", body);
//           const data = await response.json();
//           console.log("Respuesta del backend:", data);
//           if (data.init_point) {
//             window.location.href = data.init_point;
//           } else {
//             alert("Error al crear la suscripción.");
//           }
//         } catch (error) {
//           console.error("Error al enviar datos a la API:", error);
//           alert("Error al procesar la suscripción.");
//         }
//       },
//       onError: (error) => {
//         console.error("Error en el Brick:", error);
//       },
//     },
//   })
//   .then((controller) => (cardBrickController = controller));
// window.onload = () => {
//   console.log("Página cargada");
// };

function forzarSuscripcion() {
  const { email, planId } = getParams();
  const tokenDummy = "123456789"; // fake token para testear

  const body = {
    payer_email: email,
    preapproval_plan_id: planId,
    card_token_id: tokenDummy,
    back_url: "https://upcn.nowddns.com/upcn/",
    status: "authorized",
  };

  fetch(
    "https://upcn.nowddns.com/ApiPrueba/api/MercadoPago/crear-suscripcion-con-plan",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )
    .then((r) => r.json())
    .then((data) => console.log("Respuesta forzada:", data))
    .catch((e) => console.error("Error:", e));
}
