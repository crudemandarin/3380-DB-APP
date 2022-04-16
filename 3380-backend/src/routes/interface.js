const express = require('express');

const router = express.Router();

const SQLManager = require('../SQLManager');

/* GET /interface/tables */
router.get('/tables', async (req, res) => {
    console.log('GET /interface/tables');

    try {
        const tables = await SQLManager.getTables();
        return res.status(200).json({ tables });
    } catch (err) {
        console.error('SQLManager.getTables failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to load tables' });
});

/* GET /interface/fields?table= */
router.get('/fields', async (req, res) => {
    console.log('GET /interface/fields');

    const { table } = req.query;
    if (!table) return res.status(400).json({ message: 'Missing `table` in query parameters' });

    try {
        const fields = await SQLManager.getTableFields(table);
        return res.status(200).json({ fields });
    } catch (err) {
        console.error('SQLManager.getTableFields failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to load table fields' });
});

/* POST /interface/query */
router.post('/query', async (req, res) => {
    console.log('POST /interface/query');

    const { table, select, where } = req.body;
    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });

    try {
        const rows = await SQLManager.select(table, select, where);
        return res.status(200).json({ rows });
    } catch (err) {
        console.error('SQLManager.select failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to load query' });
});

/* POST /interface/query/data */
router.post('/query/data', async (req, res) => {
    console.log('POST /interface/query/data');

    const { table, fields } = req.body;

    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });
    if (!fields) return res.status(400).json({ message: 'Missing `fields` in body' });
    if (!Array.isArray(fields))
        return res.status(400).json({ message: '`fields` is not an array' });
    if (fields.length === 0) return res.status(400).json({ message: '`fields` is empty' });

    try {
        await SQLManager.insert(table, fields);
        return res.status(200).json({ message: 'Insertion successful' });
    } catch (err) {
        console.error('SQLManager.insert failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to post data' });
});

/* DELETE /interface/query/data */
router.delete('/query/data', async (req, res) => {
    console.log('DELETE /interface/query/data');

    const { table, fields } = req.query;
    const fieldsObj = JSON.parse(fields);

    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });

    try {
        await SQLManager.delete(table, fieldsObj);
        return res.status(200).json({ message: 'Deletion successful' });
    } catch (err) {
        console.error('SQLManager.delete failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Delete failed' });
});

/* PUT /interface/query/data */
router.put('/query/data', async (req, res) => {
    console.log('PUT /interface/query/data');

    const { table, fields, where } = req.body;

    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });
    if (!fields) return res.status(400).json({ message: 'Missing `fields` in body' });
    if (!Array.isArray(fields))
        return res.status(400).json({ message: '`fields` is not an array' });
    if (fields.length === 0) return res.status(400).json({ message: '`fields` is empty' });
    if (!where) return res.status(400).json({ message: 'Missing `where` in body' });
    if (!Array.isArray(where)) return res.status(400).json({ message: '`where` is not an array' });
    if (where.length === 0) return res.status(400).json({ message: '`where` is empty' });

    try {
        await SQLManager.update(table, fields, where);
        return res.status(200).json({ message: 'Update successful' });
    } catch (err) {
        console.error('SQLManager.update failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to update data' });
});

module.exports = router;
