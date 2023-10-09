import mercadopago from 'mercadopago';

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
    notification_url: `https://be76-2800-484-3d7e-6a00-8853-a682-5a04-5a67.ngrok.io/api/v1/pagos/mercadopago_webhook`,
  });

  return result;
};

export const paymentById = (id) => {
  const result = mercadopago.payment.findById(id);
  return result;
};
