import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { sendUserMail } from "../services/nodemail.js";
import logger from "../lib/logger.js";
import { config } from "dotenv";
import configParams from "../config/config.js";
import ContenedorMongo from "../classes/ContenedorMongo.js";
import { Chat } from "../models/chat.model.js";

config();

const chatApi = new ContenedorMongo(Chat);

const getLoginAdmin = (req, res) => {
    try {
        const { user } = req.session.passport;
        if (user.admin === false) { return res.redirect('/') }
        res.render('form', { user })
    }
    catch (err) {
        logger.error(err)
    }
}

const getLoginMail = (req, res) => {

    if (req.isAuthenticated()) {
        const user = req.user;
        sendUserMail(
            user.username,
            user.firstname,
            user.lastname,
            user.email,
            user.phone,
            user.address,
            user.age,
        )
        return res.render("login-ok", {
            usuario: user.username,
            nombre: user.firstname,
            apellido: user.lastname,
            email: user.email,
            tel: user.phone,
            direccion: user.address,
            edad: user.age,
            imagen: user.photo
        });
    }

    res.sendFile(join(__dirname, "../views/login.html"));
};

const getLogin = (req, res) => {

    if (req.isAuthenticated()) {
        const user = req.user;
        return res.render("login-ok", {
            usuario: user.username,
            nombre: user.firstname,
            apellido: user.lastname,
            email: user.email,
            tel: user.phone,
            direccion: user.address,
            edad: user.age,
            imagen: user.photo
        });
    }

    res.sendFile(join(__dirname, "../views/login.html"));
};

const getRegister = (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.session.user;
        const image = req.file.filename;
        res.locals.image = `${image}`;
        return res.render("login-ok", {
            usuario: user.username,
            nombre: user.firstname,
            apellido: user.lastname,
            email: user.email,
            tel: user.phone,
            direccion: user.address,
            edad: user.age,
            imagen: res.locals.image
        });
    }

    res.sendFile(join(__dirname, "../views/signup.html"));
};

const chatUsers = (req, res) => {
    const { user } = req.session.passport;
    console.log(user);
    if (!user) {
        return res.send("Usuario no encontrado");
    }
    res.render("chat-users");
};

const findChatByMail = async (req, res) => {
    const { email } = req.params;
    const { user } = req.session.passport;
    if (!user) {
        return res.send("Usuario no encontrado");
    }
    const chats = await chatApi.getAll();
    const userChat = chats.filter(chat => chat.username === email)

    res.render("find-chat", { userChat });
};

const getLoginFailiure = (req, res) => {
    res.render("login-error");
};

const getRegisterFailiure = (req, res) => {
    res.render("signup-error");
};

const logOut = (req, res) => {
    req.logout(() => {
        return res.redirect("/");
    });
};

const info = (req, res) => {

    res.render("info", {
        port: configParams.port,
        host: configParams.host,
        timeSession: configParams.timeSession,
        mail: configParams.mail,
        db: configParams.db,
        dbUrl: configParams.dbUrl,
        platform: process.platform,
        versionNode: process.version,
        memory: process.memoryUsage().rss,
        path: process.execPath,
        processId: process.pid,
        dir: process.cwd(),
    })
}

export const authController = {
    getLogin,
    getRegister,
    getLoginFailiure,
    getRegisterFailiure,
    chatUsers,
    findChatByMail,
    logOut,
    info,
    getLoginMail,
    getLoginAdmin,
};