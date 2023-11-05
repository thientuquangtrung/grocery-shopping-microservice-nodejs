const { SHOPPING_SERVICE, CUSTOMER_SERVICE } = require("../config");
const ShoppingService = require("../services/shopping-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
    const service = new ShoppingService();
    SubscribeMessage(channel, SHOPPING_SERVICE, service);

    app.post("/order", UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        const { txnNumber } = req.body;

        try {
            const { data } = await service.PlaceOrder({ _id, txnNumber });

            const payload = await service.ConstructOrderPayload(_id, data, "CREATE_ORDER");
            // PublishCustomerEvent(payload);
            PublishMessage(channel, CUSTOMER_SERVICE, payload);

            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get("/orders", UserAuth, async (req, res, next) => {
        const { _id } = req.user;

        try {
            const { data } = await service.GetOrders(_id);
            return res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    });

    app.get("/cart", UserAuth, async (req, res, next) => {
        const { _id } = req.user;
        try {
            const { data } = await service.GetCart(_id);
            return res.status(200).json(data.cart);
        } catch (err) {
            next(err);
        }
    });
};
