import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASSWORD_SENDER,
  },
});

export const emailStructure = ({
  asunto,
  correo,
  token = {},
  numeroOrden = {},
  mensaje = {},
  respuesta = {},
}) => {
  if (asunto === 'confirmacion') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: 'Correo de verificación de cuenta',
      text: 'Tu usuario se ha creado satisfactoriamente',
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                      <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Bienvenido a THE GARAGE!</h1>
                          <p>Gracias por registrarte en nuestro sitio web. Para completar el proceso de registro, haz clic en el siguiente enlace:</p>
                           <a href="${process.env.WEB_URL}/activacion/${token}">Confirmar registro</a>
                          <p>Si no has solicitado este registro, ignora este correo electrónico.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de THE GARAGE</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }

  if (asunto === 'recuperacion') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: 'Correo de recuperación de contraseña',
      text: 'Se realizará el reestablecimiento de tu contraseña',
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                      <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Recuperación de contraseña!</h1>
                          <p>Se ha realizado la solicitud para reestablecer tu contraseña, para realizar el cambio ingresa en el siguiente enlace</p>
                           <a href="${process.env.WEB_URL}/Recoverypassword/${token}">Reestablecer Contraseña</a>
                          <p>Si no has solicitado este cambio, ignora este correo electrónico.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de THE GARAGE</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }

  if (asunto === 'Entregada') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: `Actualización estado de la orden #${numeroOrden}`,
      text: `Su orden con numero #${numeroOrden} ha sido entregada`,
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                      <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Entregamos tu orden!</h1>
                          <p>Se ha realizado la entrega satisfactoria de tu pedido en el lugar de destino</p>
                          <p>Gracias por dejarnos ayudarte en tus compras, para consultar los detalles de la orden ingresa a nuestra plataforma, en la seccion de ordenes de tu perfil.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de THE GARAGE</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }

  if (asunto === 'Enviada') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: `Actualización estado de la orden #${numeroOrden}`,
      text: `Su orden con numero #${numeroOrden} ha sido enviada`,
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                  <tr>
                    <td align="center" valign="top">
                      <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                    </td>
                    <td align="center" valign="top">
                      <body>
                          <h1>¡Hemos enviado tu orden!</h1>
                          <p>Se ha realizado el envío de tu orden al lugar de destino.</p>
                          <p>Los detalles el envío son los siguientes:</p>
                          <p>${mensaje}</p>
                          <p>Gracias por dejarnos ayudarte en tus compras.</p>
                          <p>Atentamente,</p>
                          <p>El equipo de THE GARAGE</p>
                      </body>
                    </td>
                  </tr>
                </table>
      `,
    };
  }

  if (asunto === 'Cancelada') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: `Actualización estado de la orden #${numeroOrden}`,
      text: `Su orden con numero #${numeroOrden} ha sido cancelada`,
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                    <tr>
                      <td align="center" valign="top">
                        <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                      </td>
                      <td align="center" valign="top">
                        <body>
                            <h1>¡Han cancelado esta orden!</h1>
                            <p>Se ha realizado la cancelación de esta orden.</p>
                            <p>El motivo es el siguiente:</p>
                            <p>${mensaje}</p>
                            <p>Lamentamos que se haya cancelado esta orden.</p>
                            <p>Atentamente,</p>
                            <p>El equipo de THE GARAGE</p>
                        </body>
                      </td>
                    </tr>
                  </table>
        `,
    };
  }

  if (asunto === 'solucion') {
    return {
      from: `THE GARAGE APP ${process.env.EMAIL_SENDER}`,
      to: correo,
      subject: `Respuesta a la solicitud realizada`,
      text: `Se le ha dado respuesta a su consulta`,
      html: `   <table style="width: 100%; height: 100%; background-color: #f2f2f2; padding: 0; margin: 0;">
                    <tr>
                      <td align="center" valign="top">
                        <img src="https://res.cloudinary.com/db9nfgjqr/image/upload/v1698162482/site_images/the_garage_logo.png" alt="logo" border="0" width="200">
                      </td>
                      <td align="center" valign="top">
                        <body>
                            <h1>¡Gracias por comunicarte con nosotros!</h1>
                            <p>En respuesta a la solicitud realizada, nuestro equipo te hace llegar el siguiente mensaje</p>
                            <p>Respuesta de la solicitud:</p>
                            <p>${respuesta}</p>
                            <p>Atentamente,</p>
                            <p>El equipo de THE GARAGE</p>
                        </body>
                      </td>
                    </tr>
                  </table>
        `,
    };
  }
};
