const express = require('express');

const router = express.Router();

const SQLService = require('../services/SQLService');
const UserService = require('../services/UserService');

/* GET /interface/tables */
router.get('/tables', async (req, res) => {
    console.log('GET /interface/tables');

    try {
        const tables = await SQLService.getTables();
        return res.status(200).json({ tables });
    } catch (err) {
        console.error('SQLService.getTables failed. err =', err);
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
        const fields = await SQLService.getTableFields(table);
        return res.status(200).json({ fields });
    } catch (err) {
        console.error('SQLService.getTableFields failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to load table fields' });
});

/* POST /interface/query */
router.post('/query', async (req, res) => {
    console.log('POST /interface/query');

    const { userId, table, select = [], where = [] } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing `userId` in body' });
    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });

    try {
        const [rows, SQL] = await UserService.select(userId, table, select, where);
        return res.status(200).json({ rows, SQL });
    } catch (err) {
        console.error('UserService.select failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
    }

    return res.status(500).json({ message: 'Failed to load query' });
});

/* POST /interface/query/data */
router.post('/query/data', async (req, res) => {
    console.log('POST /interface/query/data');

    const { userId, table, fields } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing `userId` in body' });
    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });
    if (!fields) return res.status(400).json({ message: 'Missing `fields` in body' });
    if (!Array.isArray(fields))
        return res.status(400).json({ message: '`fields` is not an array' });
    if (fields.length === 0) return res.status(400).json({ message: '`fields` is empty' });

    try {
        const [result, SQL] = await UserService.insert(userId, table, fields);
        return res.status(200).json({ result, SQL });
    } catch (err) {
        console.error('UserService.insert failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
        if ('code' in err && 'message' in err) {
            return res.status(err.code).json(err);
        }
    }

    return res.status(500).json({ message: 'Failed to post data' });
});

/* DELETE /interface/query/data */
router.delete('/query/data', async (req, res) => {
    console.log('DELETE /interface/query/data');

    const { userId, table, rowParams } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing `userId` in query parameters' });
    if (!table) return res.status(400).json({ message: 'Missing `table` in query parameters' });
    if (!rowParams)
        return res.status(400).json({ message: 'Missing `rowParams` in query parameters' });
    const rowParamsObj = JSON.parse(rowParams);
    if (!Array.isArray(rowParamsObj))
        return res.status(400).json({ message: '`rowParams` is not an array' });
    if (rowParamsObj.length === 0) return res.status(400).json({ message: '`rowParams` is empty' });

    try {
        const [result, SQL] = await UserService.delete(userId, table, rowParamsObj);
        return res.status(200).json({ result, SQL });
    } catch (err) {
        console.error('UserService.delete failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
        if ('code' in err && 'message' in err) {
            return res.status(err.code).json(err);
        }
    }

    return res.status(500).json({ message: 'Failed to delete data' });
});

/* PUT /interface/query/data */
router.put('/query/data', async (req, res) => {
    console.log('PUT /interface/query/data');

    const { userId, table, rowParams } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing `userId` in body' });
    if (!table) return res.status(400).json({ message: 'Missing `table` in body' });
    if (!rowParams) return res.status(400).json({ message: 'Missing `rowParams` in body' });
    if (!Array.isArray(rowParams))
        return res.status(400).json({ message: '`rowParams` is not an array' });
    if (rowParams.length === 0) return res.status(400).json({ message: '`rowParams` is empty' });

    try {
        const [result, SQL] = await UserService.update(userId, table, rowParams);
        return res.status(200).json({ result, SQL });
    } catch (err) {
        console.error('UserService.update failed. err =', err);
        if ('code' in err && 'sqlMessage' in err && 'sql' in err) {
            return res.status(400).json({ code: err.code, message: err.sqlMessage, sql: err.sql });
        }
        if ('code' in err && 'message' in err) {
            return res.status(err.code).json(err);
        }
    }

    return res.status(500).json({ message: 'Failed to update data' });
});

module.exports = router;
