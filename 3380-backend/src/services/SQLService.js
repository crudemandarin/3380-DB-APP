const mysql = require('mysql');
const util = require('util');
const Utils = require('../Utils');

const connection = mysql.createConnection({
    host: process.env.DB_SERVICE_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const query = util.promisify(connection.query).bind(connection);

class SQLService {
    static query(SQL) {
        console.log('SQLService.query invoked! SQL =', SQL);
        return query(SQL);
    }

    static async getTables() {
        console.log('SQLService.getTables invoked!');
        const SQL = 'SHOW TABLES';
        const output = await SQLService.query(SQL);
        const tables = output.map((row) => row[`Tables_in_${process.env.DB_NAME}`]);
        // console.log('SQLService.getTables: Tables = ', tables);
        return tables;
    }

    static async getTableFields(table) {
        console.log('SQLService.getTableFields invoked! Table =', table);
        const SQL = `SHOW COLUMNS FROM ${table};`;
        const output = await SQLService.query(SQL);
        const fields = output.map((row) => ({
            name: row.Field,
            type: row.Type,
            nullable: row.Null === 'YES',
            isPrimaryKey: row.Key === 'PRI',
            isForeignKey: row.Key === 'MUL',
            default: row.Default ? row.Default : '',
        }));
        // console.log('SQLService.getTableFields: Fields = ', fields);
        return fields;
    }

    static async select(table, select, where, fromSql) {
        console.log(
            `SQLService.select invoked! Table = ${table}, Fields = ${select}, Where =`,
            where,
            'fromSql =',
            fromSql
        );

        let selectParams = '*';
        if (Array.isArray(select) && select.length !== 0) {
            selectParams = select.join(',');
        }
        let whereParams = Utils.nameValueArrToString(where).join(' AND ');
        if (whereParams) whereParams = ` WHERE ${whereParams}`;

        const from = fromSql || table;
        const SQL = `SELECT ${selectParams} FROM ${from}${whereParams};`;
        const rows = await SQLService.query(SQL);
        // console.log('SQLService.select: rows =', rows);
        return [rows, SQL];
    }

    static async insert(table, fields) {
        console.log(`SQLService.insert invoked! Table = ${table}, Fields =`, fields);

        const keys = fields.map((field) => field.name).join(',');
        const values = fields
            .map((field) => field.value)
            .map((value) => (typeof value === 'string' ? `'${value}'` : value))
            .join(',');

        const SQL = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
        const result = await SQLService.query(SQL);
        // console.log('SQLService.insert: result =', result);
        return [result, SQL];
    }

    static async update(table, fields, where) {
        const whereParams = SQLService.nameValueArrToString(where).join(' AND ');
        const updateParams = SQLService.nameValueArrToString(fields).join(',');
        const SQL = `UPDATE ${table} SET ${updateParams} WHERE ${whereParams}`;
        const result = await SQLService.query(SQL);
        // console.log('SQLService.update: result =', result);
        return [result, SQL];
    }

    static async delete(table, fields) {
        const whereParams = Utils.nameValueArrToString(fields).join(' OR ');
        const SQL = `DELETE FROM ${table} WHERE ${whereParams}`;
        const result = await SQLService.query(SQL);
        // console.log('SQLService.delete: result =', result);
        return [result, SQL];
    }
}

module.exports = SQLService;
