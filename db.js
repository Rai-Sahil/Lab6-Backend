const mysql = require('mysql');
const databaseName = "dictionary";
const tableName = "dict";
const languageTableName = "language";
// SQL queries
const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (word VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, definition VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, wordLanguage VARCHAR(255), definitionLanguage VARCHAR(255))`;
const createTableLanguageQuery = `CREATE TABLE IF NOT EXISTS ${languageTableName} (language VARCHAR(255))`;
const insertLanguageTableQuery = `INSERT INTO ${languageTableName} (language) VALUES ?`;
const selectLanguageTableQuery = `SELECT language FROM ${languageTableName}`;
const insertWordQuery = `INSERT INTO ${tableName} (word, definition, wordLanguage, definitionLanguage) VALUES (?, ?, ?, ?)`;
const updateWordQuery = `UPDATE ${tableName} SET definition = ?, wordLanguage = ?, definitionLanguage = ? WHERE word = ?`;
const deleteWordQuery = `DELETE FROM ${tableName} WHERE word = ?`;
const selectWordQuery = `SELECT * FROM ${tableName} WHERE word = ?`;
const english = "English";
const chinese = "Chinese";
const arabic = "Arabic";
const resultLog = "results are: ";
const log1 = "All languages already exist in the database. No languages added.";
const log2 = "Word inserted successfully";
const tableLog = "Table created";

var con = mysql.createConnection({
    host: "sql3.freesqldatabase.com",
    user: "sql3659563",
    password: "d8pH6dC9T6",
    database: "sql3659563",
    port: 3306,
    charset: 'utf8mb4',
})

function createTable() {
    con.query(createTableQuery, function (err, result) {
        if (err) throw err;
        console.log(tableLog);
    });
}

function createTableLanguage() {
    return new Promise((resolve, reject) => {
        con.query(createTableLanguageQuery, async (err, result) => {
            console.log(resultLog + JSON.stringify(result));
            if (err) reject(err);
            else resolve(result);
        });
    })
}

function addLanguages() {
    return new Promise((resolve, reject) => {
        const languages = [english, chinese, arabic];

        con.query(selectLanguageTableQuery, function (err, result) {
            if (err) throw err;

            const existingLanguages = result.map(row => row.language);
            const newLanguages = languages.filter(language => !existingLanguages.includes(language));

            if (newLanguages.length === 0) {
                console.log(log1);
                resolve();
            } else {
                const values = newLanguages.map(language => [language]);

                con.query(insertLanguageTableQuery, [values], function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                });
            }
        });
    });
}


exports.wordExists = function (word) {
    return new Promise((resolve, reject) => {
        createTable();
        const query = selectWordQuery;

        con.query(query, [word], function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log(resultLog + JSON.stringify(result));
                resolve(result.length > 0);
            }
        });
    });
};

exports.insertWord = function (word, definition, wordLanguage, definitionLanguage) {
    createTable();
    const sql = insertWordQuery;
    const values = [word, definition, wordLanguage, definitionLanguage];

    con.query(sql, values, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(log2);
        }
    });
}

exports.updateWord = function (word, definition, wordLanguage, definitionLanguage) {
    createTable();
    return new Promise((resolve, reject) => {
        const query = updateWordQuery;
        const values = [definition, wordLanguage, definitionLanguage, word];

        con.query(query, values, function (err, result) {
            if (err) {
                reject(err);
            } else {
                console.log(resultLog + JSON.stringify(result));
                resolve(result);
            }
        });
    });
}

exports.deleteWord = function (word) {
    createTable();
    return new Promise((resolve, reject) => {
        const query = deleteWordQuery;

        con.query(query, [word], function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

exports.getDefinition = function (word) {
    createTable();
    return new Promise((resolve, reject) => {
        const query = selectWordQuery;

        con.query(query, [word], function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    })
}

exports.getLanguages = async function () {
    await createTableLanguage();
    await addLanguages();

    return new Promise((resolve, reject) => {
        con.query(selectLanguageTableQuery, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};
