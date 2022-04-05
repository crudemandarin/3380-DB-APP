const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'pms',
});

const query = util.promisify(connection.query).bind(connection);

class SQLManager {
    static nameValueArrToString(arr) {
        return arr.map((field) => {
            const value = typeof field.value === 'string' ? `'${field.value}'` : `${field.value}`;
            return `${field.name}=${value}`;
        });
    }

    static query(SQL) {
        console.log('SQLManager.query invoked! SQL =', SQL);
        return query(SQL);
    }

    static async getTables() {
        console.log('SQLManager.getTables invoked!');
        const SQL = 'SHOW TABLES';
        const output = await this.query(SQL);
        const tables = output.map((row) => row.Tables_in_pms);
        console.log('SQLManager.getTables: Tables = ', tables);
        return tables;
    }

    static async getTableFields(table) {
        console.log('SQLManager.getTableFields invoked! Table =', table);
        const SQL = `SHOW COLUMNS FROM ${table};`;
        const output = await this.query(SQL);
        const fields = output.map((row) => ({ name: row.Field, type: row.Type }));
        console.log('SQLManager.getTableFields: Fields = ', fields);
        return fields;
    }

    static async select(table, select, where) {
        console.log(
            `SQLManager.select invoked! Table = ${table}, Fields = ${select}, Where =`,
            where
        );

        let selectParams = '*';
        if (Array.isArray(select) && select.length !== 0) {
            selectParams = select.join(',');
        }

        let whereParams = this.nameValueArrToString(where).join(' AND ');
        if (whereParams) whereParams = ` WHERE ${whereParams}`;

        const SQL = `SELECT ${selectParams} FROM ${table}${whereParams};`;
        const rows = await this.query(SQL);
        console.log('SQLManager.select: rows =', rows);
        return rows;
    }

    static async insert(table, fields) {
        console.log(`SQLManager.insert invoked! Table = ${table}, Fields =`, fields);

        const keys = fields.map((field) => field.name).join(',');
        const values = fields
            .map((field) => field.value)
            .map((value) => (typeof value === 'string' ? `'${value}'` : value))
            .join(',');

        const SQL = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
        const result = await this.query(SQL);
        console.log('SQLManager.insert: result =', result);
        return result;
    }

    static async update(table, fields, where) {
        const whereParams = this.nameValueArrToString(where).join(' AND ');
        const updateParams = this.nameValueArrToString(fields).join(',');
        const SQL = `UPDATE ${table} SET ${updateParams} WHERE ${whereParams}`;
        const result = await this.query(SQL);
        console.log('SQLManager.insert: result =', result);
        return result;
    }

    static async delete(table, id) {}
}

module.exports = SQLManager;
