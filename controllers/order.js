const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/http');
const ORDER = require('mongoose').model('Order');
const PAYMENT = require('mongoose').model('Payment');
const ORDERPRODUCT = require('mongoose').model('OrderProduct');

const PAGE_LIMIT = 15;

module.exports = {

    placeOrder: (req, res) => {
        const order = req.body;
        const loggedInUserId = HELPER.getAuthUserId(req);
        const products = order.products;
        order.products = [];
        delete order.paymentInformation;
        order['createdBy'] = loggedInUserId;

        ORDER.create(order)
            .then(newOrder => {

                products.forEach(o => {
                    o['order'] = newOrder._id;
                    o['createdBy'] = loggedInUserId;
                });
                ORDERPRODUCT.insertMany(products)
                    .then(orderedProducts => {

                        newOrder.products = orderedProducts.map(op => op._id);
                        newOrder.save();
                        return HTTP.success(res, newOrder)
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));
    },

    savePaymentInformation: (req, res) => {
        const orderId = req.params.orderId;
        const paymentStatus = req.body;

        ORDER.findById(orderId)
        .then(order => {
            if (!order) return HTTP.error(res, 'There is no order with the given id in our database.');

            if (order.currentPaymentStatus) order.paymentStatusHistory.push(order.currentPaymentStatus);
            order.currentPaymentStatus = paymentStatus;
            order.save();
            return HTTP.success(res, order);
        })
        .catch(err => HTTP.handleError(res, err));

    },

    getOrders: (req, res) => {
        let params = req.query;
        let searchParams = {
            query: {},
            sort: { creationDate: -1 },
            skip: null,
            limit: PAGE_LIMIT,
        };

        if (params.query || typeof params.query === 'string') {
            let query = JSON.parse(params.query);
            searchParams.query = { $text: { $search: `\"${query['searchTerm']}\"`, $language: 'en' } };
        }

        if (params.sort) {
            searchParams.sort = JSON.parse(params.sort);
        }

        if (params.skip) {
            searchParams.skip = JSON.parse(params.skip);
        }

        if (params.limit) {
            searchParams.limit = JSON.parse(params.limit);
        }
        searchParams.query['createdBy'] = HELPER.getAuthUserId(req);

        ORDER
            .find(searchParams.query)
            .count()
            .then((count) => {
                ORDER
                    .find(searchParams.query)
                    .sort(searchParams.sort)
                    .skip(searchParams.skip)
                    .limit(searchParams.limit)
                    .populate({
                        path: 'products',
                        populate: {
                            path: 'product'
                        }
                    })
                    .then((result) => {
                        return res.status(200).json({
                            message: '',
                            data: result,
                            query: searchParams,
                            itemsCount: count
                        });
                    })
                    .catch(() => {
                        return HTTP.error(res, 'Bad Request!');
                    });
            });
    }
}