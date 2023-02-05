const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/HTTP');
const PRODUCT = require('mongoose').model('Product');
const PRODUCTSPEC = require('mongoose').model('Productspec');


module.exports = {
    getProductSpecs: (req, res) => {
        let productId = req.params.productId;

        PRODUCTSPEC.find({ productId: productId })
            .then(specs => {
                if (!specs) return HTTP.success(res, []);

                return HTTP.success(res, specs);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    getCategoriesSpecs: (req, res) => {
        var category_regexp = { $regex: '^' + req.params.category };

        PRODUCTSPEC.find({ category: category_regexp })
            .then(specs => {
                if (!specs) return HTTP.success(res, []);

                return HTTP.success(res, specs);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    add: (req, res) => {
        let productId = req.params.productId;
        let spec = req.body;

        PRODUCT.findById(productId)
            .then(product => {
                if (!product) return HTTP.error(res, 'There is no product with the given id in our database.');

                PRODUCTSPEC.create(spec)
                    .then(newSpec => {
                        if (!product.specifications) product.specifications = [];
                        product.specifications.push(newSpec._id)
                        newSpec.productId = product._id;

                        product.save();
                        newSpec.save();
                        return HTTP.success(res, newSpec, 'Product specification created successfully.')
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let productspecId = req.params.productspecId;
        let editedProductSpec = req.body;

        PRODUCTSPEC.findById(productspecId).then((spec) => {
            if (!spec) return HTTP.error(res, 'There is no product specification with the given id in our database.');
            spec.category = editedProductSpec.category;
            spec.name = editedProductSpec.name;
            spec.value = editedProductSpec.value;
            spec.isImportant = editedProductSpec.isImportant;

            spec.save();
            return HTTP.success(res, spec, 'Product specification edited successfully.');
        }).catch(err => HTTP.handleError(res, err));
    },

    delete: (req, res) => {
        let productspecId = req.params.productspecId;

        PRODUCTSPEC.findById(productspecId).then((spec) => {
            if (!spec) return HTTP.error(res, 'There is no product specification with the given id in our database.');

            PRODUCT.findById(spec.productId).then((product) => {
                if (!product) return HTTP.error(res, 'There is no product for the given specification id in our database.');

                PRODUCTSPEC.findByIdAndRemove(productspecId).then(() => {

                    PRODUCT.update({ _id: product._id }, { $pull: { specifications: productspecId } }).then(() => {

                        return res.status(200).json({
                            message: 'Specification deleted successfully!'
                        });
                    })
                        .catch(err => HTTP.handleError(res, err));
                })
                    .catch(err => HTTP.handleError(res, err));
            })
                .catch(err => HTTP.handleError(res, err));
        })
            .catch(err => HTTP.handleError(res, err));
    }
}