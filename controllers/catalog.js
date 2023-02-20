const CATALOG = require('mongoose').model('Catalog');
const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/http');
const DOWNLOADER = require('../utilities/download');

const PAGE_LIMIT = 15;
const excelBaseHeaders = [
    {
        header: 'Product Id',
        key: '_id'
    }, {
        header: 'Product Name',
        key: 'name'
    }, {
        header: 'Generic Cost',
        key: 'cost'
    }
]

module.exports = {

    downloadCatalAsExcel: (req, res) => {
        let catalogId = req.params.catalogId;

        CATALOG.findById(catalogId)
            .populate({
                path: 'products',
                populate: {
                    path: 'product'
                }
            })
            .then(catalog => {
                if (!catalog) return HTTP.error(res, 'There is no catalog with the given id in our database.');


                const excelFileWriter = DOWNLOADER.createExcelFile(catalog.products, excelBaseHeaders);
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                return excelFileWriter.write(res)
                    .then(function () {
                        res.status(200).end();
                    });
            })
            .catch(err => HTTP.handleError(res, err));
    },

    getSingle: (req, res) => {
        let catalogId = req.params.catalogId;

        CATALOG.findById(catalogId)
            .populate({
                path: 'products',
                populate: {
                    path: 'product'
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
            catalog.save();

            return HTTP.success(res, catalog, 'Catalog edited successfully!');
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
