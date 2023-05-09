import ContenedorMongo from "../classes/ContenedorMongo.js";
import config from "../config/config.js";
import CartDaoFactory from "../daos/cartDaoFactory.js";
import logger from "../lib/logger.js";
import { Product } from "../models/product.model.js";
import { Orders } from "../models/order.model.js";
import moment from 'moment';
import { sendOrderMail } from "../services/nodemail.js";

const time = moment().format('DD MM YYYY HH:mm:ss');

const productApi = new ContenedorMongo(Product);
const cartDao = CartDaoFactory.getDao(config.db);
const orderApi = new ContenedorMongo(Orders);

const createCart = async (req, res, next) => {
    try {
        const response = await cartDao.create(req.body);

        return response;
    } catch (err) {
        next(err);
    }
};

const updateCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { user } = req.session.passport
        const product = await productApi.getById(productId);
        const cart = await cartDao.getByFilter({
            username: user.username,
        });
        if (product.stock >= 1) {
            if (cart.products.some(item => item.title === product.title)) {
                cart.products.find(item => item.title === product.title).quantity++
                product.stock--
                await productApi.update(product._id, product)

            }
            else {
                cart.products.push(product);
                product.stock--
                await productApi.update(product._id, product)
            }

            await cartDao.update(
                { username: user.username },
                cart
            );
            res.redirect("/productos");
        }
        else {
            res.send("Por el momento no hay mas stock del producto indicado")
        }

    } catch (err) {
        logger.error({ error: err }, "Error adding product");

        res.sendStatus(500);
    }
};

const deleteCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const response = await cartDao.delete(id);

        res.json(response);
    } catch (err) {
        next(err);
    }
};

const findAllCarts = async (req, res, next) => {
    try {
        const response = await cartDao.getAll();

        return response;
    } catch (err) {
        next(err);
    }
};

const findCartById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const response = await cartDao.getById(id);

        return response;
    } catch (err) {
        next(err);
    }
};

const findCartByFilter = async (req, res, next) => {
    try {
        const { user } = req.session.passport;
        const products = await productApi.getAll()
        const userCart = await cartDao.getByFilter({
            username: user.username,
        });
        if (!user) {
            return res.redirect("/");
        }
        res.render("cart", { cart: userCart, user, products });
    } catch (err) {
        logger.error(err);
    }
};

const deleteProductInCart = async (req, res, next) => {
    try {
        const { user } = req.session.passport;
        const { productId } = req.params;
        const product = await productApi.getById(productId);
        const userCart = await cartDao.getByFilter({
            username: user.username
        });
        const productElim = userCart.products.find((item) => item._id == productId);
        product.stock += productElim.quantity
        await productApi.update(product._id, product)
        const newArray = userCart.products.filter((item) => item._id != productId);
        await cartDao.update(
            { username: user.username },
            { products: newArray, username: user.username }
        );
        res.send("Producto eliminado");
    } catch (err) {
        logger.error(err);
    }
};

const findProductsByCategory = async (req, res, next) => {
    try {
        const { user } = req.session.passport;
        const userCart = await cartDao.getByFilter({
            username: user.username,
        });
        const { category } = req.params;
        const filterProducts = await Product.find({ category }).lean();
        if (filterProducts.length === 0) {
            res.send("La categoria no existe")
        }
        if (!user) {
            return res.redirect("/");
        }
        res.render("cart", { cart: userCart, user, products: filterProducts })

    } catch (err) {
        logger.error(err);
    }
};

const productDescription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productApi.getById(id);
        if (!product) {
            return res.send("El producto no existe")
        }
        const productDescription = {
            titulo: product.title,
            imagen: product.thumbnail,
            precio: product.price,
            categoria: product.category,
            stock: product.stock
        }
        res.json(productDescription)

    } catch (err) {
        next(err);
    }
};

const orders = async (req, res, next) => {
    try {
        const { user } = req.session.passport;
        const userOrders = await Orders.find({ user: user.username }).lean();
        res.render("orders", { userOrders/* , orderProducts: userOrders.products */ })
    }
    catch {
        logger.error({ error: err }, "Error rendering the orders");
    }
}

const finish = async (req, res, next) => {
    try {
        const { cartId } = req.params
        const cart = await cartDao.getById(cartId)
        const orders = await orderApi.getAll()
        const userOrder = {
            user: cart.username,
            products: cart.products,
            order: orders.length + 1,
            email: cart.email,
            time,
        }
        orderApi.save(userOrder);
        sendOrderMail(userOrder);
        await cartDao.update(
            { username: cart.username },
            { products: [], username: cart.username }
        );
        res.render(`final-buy`, { user: cart.username })
    } catch (err) {
        logger.error({ error: err }, "Error adding product");
        res.sendStatus(500);
    }
};

export const cartController = {
    createCart,
    updateCart,
    deleteCart,
    findAllCarts,
    findCartById,
    findCartByFilter,
    findProductsByCategory,
    deleteProductInCart,
    productDescription,
    orders,
    finish,
};
