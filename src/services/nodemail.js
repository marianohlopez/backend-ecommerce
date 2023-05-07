import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

const trasporter = createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: process.env.MAIL_ADMIN,
        pass: process.env.API_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendUserMail = async (usuario, nombre, apellido, email, tel, direccion, edad) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_ADMIN,
            to: process.env.MAIL_USER,
            subject: "Nuevo registro",
            html: `<h3 style="color: blue;">usuario: ${usuario}</h3>
            <h3 style="color: blue;">nombre: ${nombre}</h3>
            <h3 style="color: blue;">apellido: ${apellido}</h3>
            <h3 style="color: blue;">mail: ${email}</h3>
            <h3 style="color: blue;">tel: ${tel}</h3>
            <h3 style="color: blue;">direccion: ${direccion}</h3>
            <h3 style="color: blue;">edad: ${edad}</h3>`,
        };
        const info = await trasporter.sendMail(mailOptions);
        console.log(info);
    } catch (err) {
        console.log(err);
    }
}

export const sendOrderMail = async (order) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_ADMIN,
            to: process.env.MAIL_USER,
            subject: "Nueva orden de compra",
            html: `
            <h3 style="color: blue;">Email del cliente: ${order.email}</h3>
            <h4>Orden nº: ${order.order}</h4>
            <h4>Hora: ${order.time}</h4>
            <ul>
                ${order.products.map((product) =>
                `<li>${product.title} - $${product.price} - cant: ${product.quantity}</li>`).join('')}
            </ul>`,
        };
        const info = await trasporter.sendMail(mailOptions);
        console.log(info);
    } catch (err) {
        console.log(err);
    }
}

