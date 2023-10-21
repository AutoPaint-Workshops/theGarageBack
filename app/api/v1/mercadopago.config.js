import mercadopago from "mercadopago";

export const mercadopagoCreateOrder = async (items, reference) => {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_TOKEN,
  });

  const result = await mercadopago.preferences.create({
    items,
    external_reference: reference,
    back_urls: {
      success: `${process.env.WEB_URL}/purchaseDetails`,
      failure: `${process.env.WEB_URL}/purchaseDetails`,
      pending: `${process.env.WEB_URL}/purchaseDetails`,
    },
    notification_url: `${process.env.API_HTTPS_URL}/api/v1/pagos/mercadopago_webhook`,
  });

  return result;
};

export const paymentById = (id) => {
  const result = mercadopago.payment.findById(id);
  return result;
};
