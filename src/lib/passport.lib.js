import bcrypt from "bcrypt";
import LocalStrategy from "passport-local";
import config from "../config/config.js";
import CartDaoFactory from "../daos/cartDaoFactory.js";
import { User } from "../models/user.model.js";
import moment from 'moment';

const cartDao = CartDaoFactory.getDao(config.db);

const time = moment().format('DD MM YYYY HH:mm:ss');

const hashPasword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const validatePassword = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
};

const loginStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });

        if (!user || !validatePassword(password, user.password)) {
            return done("Invalid credentials", null);
        }

        return done(null, user);
    } catch (err) {
        return done("Error while login in", null);
    }
});

const registerStrategy = new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
        try {
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return done("Username already in use", null);
            }

            const newUser = {
                username,
                password: hashPasword(password),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                age: req.body.age,
                photo: req.file.filename,
                admin: false
            };
            const createdUser = await User.create(newUser);

            cartDao.create({
                username,
                products: [],
                email: req.body.email,
                address: req.body.address,
                time
            });

            req.user = createdUser;

            return done(null, createdUser);
        } catch (err) {
            return done("Error while register", null);
        }
    }
);

export const passportStrategies = { loginStrategy, registerStrategy };