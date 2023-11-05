const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ShoppingService {
    constructor() {
        this.repository = new ShoppingRepository();
    }

    async GetCart({ _id }) {
        try {
            const cartItems = await this.repository.Cart(_id);

            return FormateData(cartItems);
        } catch (error) {
            throw error;
        }
    }

    async PlaceOrder(userInput) {
        const { _id, txnNumber } = userInput;

        // Verify the txn number with payment logs

        try {
            const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
            return FormateData(orderResult);
        } catch (err) {
            throw new APIError("Data Not found", err);
        }
    }

    async GetOrders(customerId) {
        try {
            const orders = await this.repository.Orders(customerId);
            return FormateData(orders);
        } catch (err) {
            throw new APIError("Data Not found", err);
        }
    }

    async ManageCart(customerId, item, qty, isRemove) {
        try {
            const cartResult = await this.repository.AddCartItem(customerId, item, qty, isRemove);

            return FormateData(cartResult);
        } catch (error) {
            throw error;
        }
    }

    async SubscribeEvents(payload) {
        payload = JSON.parse(payload);

        const { event, data } = payload;

        const { userId, product, qty, sample_data } = data;

        switch (event) {
            case "ADD_TO_CART":
                this.ManageCart(userId, product, qty, false);
                break;
            case "REMOVE_FROM_CART":
                this.ManageCart(userId, product, qty, true);
                break;
            case "TEST":
                console.log(`TEST event successfully:::: ${sample_data}`);
                break;
            default:
                break;
        }
    }

    async ConstructOrderPayload(userId, order, event) {
        if (order) {
            const payload = {
                event,
                data: {
                    userId,
                    order,
                },
            };

            return payload;
        } else {
            return FormateData({ error: "No order is available" });
        }
    }
}

module.exports = ShoppingService;
