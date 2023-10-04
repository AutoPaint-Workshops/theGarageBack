import mercadopago from "mercadopago";

export const mercadopagoCreateOrder = async (items, reference) => {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_TOKEN,
  });

  const result = await mercadopago.preferences.create({
    items,
    external_reference: reference,
    back_urls: {
      success: `${process.env.WEB_URL}/SuccessPurchase`,
      failure: `${process.env.WEB_URL}/failurePurchase`,
      pending: `${process.env.WEB_URL}/failurePurchase`,
    },
    notification_url: `https://0982-2800-e2-b680-1c03-ee87-e270-1da6-62c.ngrok.io/api/v1/pagos/mercadopago_webhook`,
  });

  return result;
};

export const paymentById = (id) => {
  const result = mercadopago.payment.findById(id);
  return result;
};
