// controllers/productController.js
const { validationResult } = require('express-validator');
const Product = require('../entities/Product');

/**
 * Controller functions use Express (req, res) signatures and
 * respond with status codes matching MDN/HTTP recommendations.
 */

//Méthode exploitée dans le cas d'un POST (en provenance du router "product.js"
exports.create = async (req, res, next) => {
    try {
        // validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // 400 Bad Request for validation problems
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, imageUrl, price } = req.body;
        const created = await Product.create({ name, description, imageUrl, price });
        // 201 Created
        return res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

//Méthode exploitée dans le cas d'un Get ALL (en provenance du router "product.js"
exports.findAll = async (req, res, next) => {
    try {
        const products = await Product.findAll();
        // 200 OK
        return res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

//Méthode exploitée dans le cas d'un GET by ID (en provenance du router "product.js"
exports.findOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' }); // 404 Not Found

        return res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};

//Méthode exploitée dans le cas d'un PUT (en provenance du router "product.js"
exports.update = async (req, res, next) => {
    try {
        // validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

        const { name, description, imageUrl, price } = req.body;
        const updated = await Product.update(id, { name, description, imageUrl, price });
        if (!updated) return res.status(404).json({ error: 'Product not found' }); // 404 Not Found

        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

//Méthode exploitée dans le cas d'un DELETE (en provenance du router "product.js"
exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

        const deleted = await Product.delete(id);
        if (deleted === 0) return res.status(404).json({ error: 'Product not found' });

        // 204 No Content on successful delete
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};

