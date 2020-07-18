const mysql = require('mysql')

// create database connection
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hngrech'
})

// connect to database
connection.connect((err) => {
  if (err) throw err
	else console.log('Database Connection successful')
})

// create interns table in hnrech database if non exists
// let query = connection.query(`
//   CREATE TABLE IF NOT EXISTS interns(
// 	id int NOT NULL AUTO_INCREMENT,
// 	name varchar(200),
// 	track varchar(100),
// 	phone int(20), PRIMARY KEY(id)
//   )
// `)

// connection.query(query, (err) => {
//   if (err) {
//     res.sendStatus(500)
//   }
//   console.log('Table created')
// })

module.exports = connection
