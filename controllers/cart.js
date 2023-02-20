const PRODUCT = require('mongoose').model('Product');
const RECEIPT = require('mongoose').model('Receipt');
const USER = require('mongoose').model('User');
const HTTP = require('../utilities/http');

module.exports = {
    checkout: (req, res) => {
        HTTP.success(res, 'submitted');
        // let userId = req.user.id;
        // let totalPrice = 0;
        // let products = [];

        // CART
        //     .findOne({ user: userId })
        //     .populate('books')
        //     .then((cart) => {
        //         for (let book of cart.books) {
        //             totalPrice += book.price * req.body[book._id.toString()];
        //             products.push({
        //                 id: book._id,
        //                 title: book.title,
        //                 author: book.author,
        //                 cover: book.cover,
        //                 price: book.price,
        //                 qty: req.body[book._id.toString()]
        //             });
        //         }

        //         RECEIPT.create({
        //             user: userId,
        //             productsInfo: products,
        //             totalPrice: totalPrice
        //         }).then((receipt) => {
        //             USER.update({ _id: userId }, { $push: { receipts: receipt._id } }).then(() => {
        //                 cart.books = [];
        //                 cart.totalPrice = 0;
        //                 cart.save();
        //                 return res.status(200).json({
        //                     message: 'Thank you for your order! Books will be sent to you as soon as possible!',
        //                     data: receipt
        //                 });
        //             });
        //         }).catch((err) => {
        //             console.log(err);
        //             return res.status(400).json({
        //                 message: 'Something went wrong, please try again.'
        //             });
        //         });
        //     });
    }
};