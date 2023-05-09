import { Router } from 'express';
import { authController } from "../controllers/index.js";
import compression from 'compression';
import { cartController } from '../controllers/cart.controller.js';

const router = Router()

//Solo para administradores, chat y carga de productos al inventario

router.route('/admin')
    .get(authController.getLoginAdmin)

//Se listan los productos y los datos del usuario

router.route('/productos')
    .get(cartController.findCartByFilter)

//filtra un producto por su id, tuve que hacer la ruta distinta a la de la consigna porque sino iba al mismo que la de categoria

router.route('/productos/id/:id')
    .get(cartController.productDescription)

//filtro por categorias de producto

router.route('/productos/:category')
    .get(cartController.findProductsByCategory)

//se pueden ver todos los chats
router.route('/chat')
    .get(authController.chatUsers)

//solo los chats del email indicado

router.route('/chat/:email')
    .get(authController.findChatByMail)

//Agregar o eliminar productos en carrito por su id 

router.route("/carrito/:productId")
    .post(cartController.updateCart)
    .delete(cartController.deleteProductInCart);

//Finalizar compra/envio de orden al mail del usuario

router.route("/carrito/finish/:cartId")
    .post(cartController.finish)

//Visualizar ordenes del usuario

router.route("/orden")
    .get(cartController.orders)

//Parametros de configuracion

router.get("/info", compression(), authController.info)

export const productsCartRouter = router;