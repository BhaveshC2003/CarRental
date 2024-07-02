var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'bhavesh1',
    database : 'carrental'
});


module.exports = connection;