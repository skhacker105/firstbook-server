const CATALOG = require('mongoose').model('Catalog');
const CONTACT = require('mongoose').model('Contact');
const IMAGE = require('mongoose').model('Image');
const PRODUCT = require('mongoose').model('Product');
const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/http');
const EXCEL_DOWNLOADER = require('../downloaders/download-excel');
const PDF_DOWNLOADER = require('../downloaders/download-pdf');
const CONSTANTS = require('../utilities/contants');

const PAGE_LIMIT = 15;
const excelBaseHeaders = [
    {
        header: 'Product Id',
        key: '_id',
        hidden: true
    }, {
        header: 'Product Name',
        key: 'name',
        width: 50
    }, {
        header: 'Generic Cost',
        key: 'cost',
        width: 22
    }
]

module.exports = {

    downloadCatalAsPDF: (req, res) => {
        let catalogId = req.params.catalogId;
        let filterByClientId = req.params.filterByClientId;

        CATALOG.findById(catalogId)
            .populate({
                path: 'products',
                populate: {
                    path: 'product',
                    populate: {
                        path: 'clientCosts',
                        populate: {
                            path: 'client'
                        }
                    }
                }
            })
            .populate('createdBy')
            .then(catalog => {
                if (!catalog) return HTTP.error(req, 'There is no catalog with the given id in our database.');

                catalog.products = catalog.products.filter(p => !p.product.disabled)
                updateProductCosts(catalog, filterByClientId);
                imageIds = productImagesIds(catalog);
                if (!imageIds || imageIds.length === 0)
                    return PDF_DOWNLOADER.print(req, 'pdfTemplates/catalog.hbs', { catalog, bannerImage: null })
                        .then(file => HTTP.successPDFFile(res, file, catalog.name))
                        .catch(err => HTTP.handleError(res, err));

                IMAGE.find({ _id: { $in: imageIds } })
                    .then(records => {

                        bannerImage = records.splice(records.findIndex(img => img._id.equals(catalog.config?.banner)), 1)
                        bannerImage = bannerImage ? bannerImage[0] : null;
                        mapMainImages(catalog, records);
                        mapOtherImages(catalog, records);
                        PDF_DOWNLOADER.print(req, 'pdfTemplates/catalog.hbs', { catalog, bannerImage })
                            .then(file => HTTP.successPDFFile(res, file, catalog.name))
                            .catch(err => HTTP.error(res, 'pdf error', err));
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));
    },

    downloadCatalAsExcel: (req, res) => {
        let catalogId = req.params.catalogId;
        let loggedInUserId = HELPER.getAuthUserId(req)

        CATALOG.findById(catalogId)
            .populate({
                path: 'products',
                populate: {
                    path: 'product',
                    populate: {
                        path: 'clientCosts',
                        populate: {
                            path: 'client'
                        }
                    }
                }
            })
            .then(catalog => {
                if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

                catalog.products = catalog.products.filter(p => !p.product.disabled)
                // Find Logged in User client contacts
                CONTACT.find({ createdBy: loggedInUserId, type: CONSTANTS.contactTypes.client })
                    .then(contacts => {
                        if (!contacts || contacts.length === 0) {
                            const excelFile = EXCEL_DOWNLOADER.createExcelFile(catalog.products, excelBaseHeaders);
                            return HTTP.successExcelFile(res, excelFile);
                        }

                        const columnsWithClients = excelBaseHeaders.concat(getColumnsFrom(contacts));
                        const excelFile = EXCEL_DOWNLOADER.createExcelFile(catalog.products, columnsWithClients);
                        return HTTP.successExcelFile(res, excelFile);
                    })
                    .catch(err => HTTP.handleError(res, err));

            })
            .catch(err => HTTP.handleError(res, err));
    },

    updateCatalogBanner: (req, res) => {
        let catalogId = req.params.catalogId;
        const image = req.body.image;

        CATALOG.findById(catalogId).then(catalog => {
            if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.', false);
            let resource = {
                resourceType: 'catalog',
                catalogId: catalogId,
                image: image,
                createdBy: HELPER.getAuthUserId(req)
            }

            IMAGE.create(resource).then((newImage) => {
                if (!newImage) return HTTP.error(res, 'Catalog banner did not save. Something went wrong.', false);

                if (catalog.config) {

                    const prev_banner_id = catalog.config.banner;
                    catalog.config.banner = newImage._id
                    catalog.save();
                    if (!prev_banner_id) return HTTP.success(res, true, 'Catalog image updated successfully.');
                    else {

                        IMAGE.findByIdAndDelete(prev_banner_id)
                            .then(deletedImage => {

                                return HTTP.success(res, true, 'Catalog image updated successfully.');
                            })
                            .catch(err => HTTP.handleError(res, err));
                    }
                } else return HTTP.error(res, 'No config updated. Something went wrong', false);
            }).catch(err => HTTP.handleError(res, err));
        });
    },

    getCatalogBanner: (req, res) => {
        let bannerId = req.params.bannerId;
        IMAGE.findById(bannerId).then(banner => {
            if (!banner) return HTTP.error(res, 'There is no banner with the given id in our database.');

            return HTTP.success(res, banner);
        });
    },

    getSingle: (req, res) => {
        let catalogId = req.params.catalogId;

        CATALOG.findById(catalogId)
            .populate({
                path: 'products',
                populate: {
                    path: 'product',
                    populate: {
                        path: 'clientCosts',
                        populate: {
                            path: 'client'
                        }
                    }
                }
            })
            .then((catalog) => {
                if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

                return HTTP.success(res, catalog);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    add: (req, res) => {
        let catalog = req.body;
        catalog['createdBy'] = HELPER.getAuthUserId(req);

        CATALOG.create(catalog).then((newCatalog) => {
            return HTTP.success(res, newCatalog, 'Catalog created successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let catalogId = req.params.catalogId;
        let editedCatalog = req.body;

        CATALOG.findById(catalogId).then((catalog) => {
            if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

            catalog.name = editedCatalog.name;
            catalog.products = editedCatalog.products;
            if (!catalog.config) catalog.config = {};
            catalog.config.useBanner = editedCatalog.config.useBanner;
            catalog.config.useTitleBar = editedCatalog.config.useTitleBar;
            catalog.config.address = editedCatalog.config.address;
            catalog.config.contact = editedCatalog.config.contact;
            catalog.config.email = editedCatalog.config.email;
            catalog.save();

            return HTTP.success(res, catalog, 'Catalog edited successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    updateProductCost: (req, res) => {
        let catalogId = req.body.catalogId;
        let catProductId = req.body.catProductId;
        let clientCostId = req.body.clientCostId;
        let cost = req.body.cost;

        CATALOG.findById(catalogId).then((catalog) => {
            if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

            const catProduct = catalog.products.find(p => p._id.equals(catProductId));
            if (!catProduct) return HTTP.error(res, 'Cannot find link between selected subject and catalog.')
            if (!clientCostId) {

                catProduct.cost = cost;
                catalog.save();
                return HTTP.success(res, catalog);
            }

            PRODUCT.findById(catProduct.product).then((product) => {
                if (!product) return HTTP.error(res, 'There is no product with the given id in our database.');

                const client = !product.clientCosts ? undefined : product.clientCosts.find(cc => cc._id.equals(clientCostId))
                if (client) {
                    client.cost = cost;
                }

                product.save();
                return HTTP.success(res, catalog, 'Catalog edited successfully!');
            });
        }).catch(err => HTTP.handleError(res, err));
    },

    enable: (req, res) => {
        let catalogId = req.params.catalogId;

        CATALOG.findById(catalogId).then((catalog) => {
            if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

            catalog.isDeleted = false;
            catalog.save();
            return HTTP.success(res, catalog, 'Catalog deleted successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    disable: (req, res) => {
        let catalogId = req.params.catalogId;

        CATALOG.findById(catalogId).then((catalog) => {
            if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');

            catalog.isDeleted = true;
            catalog.save();
            return HTTP.success(res, catalog, 'Catalog deleted successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    userCatalogs: (req, res) => {
        CATALOG.find({ createdBy: HELPER.getAuthUserId(req) })
            .then(catalogs => {
                if (!catalogs || catalogs.length === 0) return HTTP.success(res, [])

                const catIds = catalogs.map(p => p._id);
                HTTP.success(res, catIds);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    search: (req, res) => {
        let params = req.query;
        let searchParams = {
            query: {},
            sort: { creationDate: -1 },
            skip: null,
            limit: PAGE_LIMIT,
        };

        if (params.query || typeof params.query === 'string') {
            let query = JSON.parse(params.query);
            searchParams.query = { $text: { $search: query['searchTerm'], $language: 'en' } };
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

        if (params.createdBy) {
            searchParams.query['createdBy'] = params.createdBy;
        }
        searchParams.query['disabled'] = false

        CATALOG
            .find(searchParams.query)
            .count()
            .then((count) => {
                CATALOG
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

function mapMainImages(catalog, images) {
    catalog.products.forEach(cp => {
        const foundImage = images.find(img => img._id.equals(cp.product.defaultImage))
        if (foundImage) {
            cp.product.defaultImage = foundImage.image;
        }
    });
}

function mapOtherImages(catalog, images) {
    catalog.products.forEach(cp => {
        if (cp.product.images) {
            const imageIds = JSON.parse(JSON.stringify(cp.product.images));
            let converted = [];
            imageIds.forEach(imgid => {
                const foundImage = images.find(img => img._id.equals(imgid))
                if (foundImage) converted.push(foundImage.image);
            });
            cp.product.images = converted;
        }
    });
}

function updateProductCosts(catalog, clientId) {
    if (!clientId) return catalog;
    catalog.products.forEach(cp => {
        const filteredClient = cp.product.clientCosts.find(cc => cc.client?._id.equals(clientId));
        if (filteredClient) {
            cp.cost = filteredClient.cost;
        }
    });
}

function productImagesIds(catalog) {
    let r = [];
    catalog.products.forEach(cp => {
        if (cp.product.defaultImage) r.push(cp.product.defaultImage);
        if (cp.product.images) {
            cp.product.images.forEach(img => {
                if (img) r.push(img);
            });
        }
    });
    if (catalog.config?.banner) r.push(catalog.config?.banner);
    return r.length > 0 ? r : [];
}

function getColumnsFrom(contacts) {
    const result = [];
    contacts.forEach(contact => {
        result.push({
            header: contact._id.toString(),
            hidden: true,
            width: contact._id.toString().length
        });
        result.push({
            header: contact.firstName + " " + contact.lastName,
            findFunction: getClientCostFinder(contact),
            altkey: 'cost',
            width: (contact.firstName + " " + contact.lastName).length + 10
        });
    });
    return result;
}

function getClientCostFinder(contact) {
    return (catproduct) => {
        return catproduct.product.clientCosts
            ? catproduct.product.clientCosts.find(cc => cc.client?._id.equals(contact._id))?.cost
            : null;
    };
}