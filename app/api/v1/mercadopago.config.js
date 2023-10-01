import mercadopago from "mercadopago";

export const mercadopagoCreateOrder = async (items, reference) => {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_TOKEN,
  });

  const result = await mercadopago.preferences.create({
    items,
    external_reference: reference,
    back_urls: {
      success: `${process.env.API_URL}/v1/pagos/compra_exitosa`,
      failure: `${process.env.API_URL}/v1/pagos/compra_fallida`,
      pending: `${process.env.API_URL}/v1/pagos/compra_pendiente`,
    },
    notification_url: `https://8ce4-2800-e2-b680-1c03-ee87-e270-1da6-62c.ngrok.io/api/v1/pagos/mercadopago_webhook`,
  });

  return result;
};

export const paymentById = (id) => {
  const result = mercadopago.payment.findById(id);
  return result;
};
