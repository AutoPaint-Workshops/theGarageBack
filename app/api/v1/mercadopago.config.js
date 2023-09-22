import mercadopago from 'mercadopago';

export const mercadopagoCreateOrder = async (items) => {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_TOKEN,
  });

  const result = await mercadopago.preferences.create({
    items,
    back_urls: {
      success: `${process.env.API_URL}/v1/pagos/compra_exitosa`,
      failure: `${process.env.API_URL}/v1/pagos/compra_fallida`,
      pending: `${process.env.API_URL}/v1/pagos/compra_pendiente`,
    },
    notification_url: `https://d165-2800-484-3d7e-6a00-e8a7-d835-b692-edd1.ngrok.io/api/v1/pagos/mercadopago_webhook`,
  });

  return result;
};

export const paymentById = (id) => {
  const result = mercadopago.payment.findById(id);
  return result;
};
