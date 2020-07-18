const axios = require('axios')
let express = require('express')
let bodyParser = require('body-parser')
let expHandlebars = require('express-handlebars')
let connection = require('./db/dbConnection')
const port = 4000 // connection port

let app = express()

// static files
app.use('/public', express.static('public'))
// Handlebars Middleware
app.engine('handlebars', expHandlebars({
  defaultLayout: 'main'
}))
// Body-Parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// view or template engine
app.set('view engine', 'handlebars')
// index route
app.get('/', (req, res) => {
  const title = 'HNGi7'
  res.render('index', {
    title: title
  })
})
// about route
app.get('/about', (req, res) => {
  res.render('about')
})
// addInterns route
app.get('/interns/addIntern', (req, res) => {
  res.render('interns/addIntern')
})
// add intern
app.post('/interns', (req, res) => {
  let errors = []
  if (!req.body.name || !req.body.phone) {
    errors.push({
      text: 'Please provide all information'
    })
  }
  // error message for empty input fields adding intern
  if (errors.length > 0) {
    res.render('interns/addIntern', {
      errors: errors
    })
  } else {
    let intern = req.body
    let insertQuery = `INSERT INTO interns SET ?`
    connection.query(insertQuery, intern, (err, data, fields) => {
      if(err) throw err
      res.redirect('/interns')
    })
  }
})
// get all interns
app.get('/interns', (req, res) => {
  let getInterns = `SELECT * FROM interns ORDER BY name`
  // fetch interns from database
  connection.query(getInterns, (err, data, fields) => {
    if (err) res.render('interns/rech_failure')
    else {
  	  res.render('interns/interns', {internsProfile: data})
    }
  })
})
// edit intern
app.get('/interns/edit/:id', (req, res) => {
  let internID = req.params.id
  // fetch a prticular video idea from database
  connection.query(`SELECT * FROM interns WHERE id = ${internID}`, (err, data, fields) => {
    if (err) res.render('interns/rech_failure')
    else res.render('interns/edit', {internProfile: data}) // edit page
  })
})
app.post('/update/:id', (req, res) => {
  let internID = req.params.id
  let updateQuery = `UPDATE interns SET ? WHERE id = ${internID}`
  connection.query(updateQuery, [req.body], (err, data, fields) => {
    if(err) res.render('interns/rech_failure')
    else res.redirect('/interns')
  })
})
// delete route
app.post('/delete/:id', (req, res) => {
  let internID = req.params.id
  let deleteQuery = `DELETE FROM interns WHERE id = ${internID}`
  connection.query(deleteQuery, (err, data, fields) => {
    if (err) res.render('interns/rech_failure')
    else res.redirect('/interns')
  })
})

// RECHARGE SECTION ***************************
let apiHead = (type) => {
  return {
    'method': 'post',
    'url': `https://sandbox.wallets.africa/bills/airtime/${type}`,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SECRET_KEY'
    }
  }
}
let apiBody = (code, amount, phone) => {
  return  {
    body: JSON.stringify({'Code': code, 'Amount': amount, 'PhoneNumber': phone, 'SecretKey': 'SECRET_KEY'})
  }
}
let rechargeRequest = (type, code, amount, phone) => {
 return axios(apiHead(type), apiBody(code, amount, phone))
}

// recharge_intern route
app.get('/interns/recharge/:id', (req, res) => {
  // fetch unique intern from database  
  connection.query(`SELECT * FROM interns WHERE id = ${req.params.id}`, (err, data, fields) => {
    if (err) res.render('interns/rech_failure')
    else {
      axios(apiHead('providers'))
      .then(data => {
        const networks = data.data.Providers
        // fetch unique intern from database  
        connection.query(`SELECT * FROM interns WHERE id = ${req.params.id}`, (err, data, fields) => {
          if(err) throw err; else {
            res.render('interns/recharge_intern', {
              internProfile: data,
              networks: networks
            })
          }
        })
      })
      .catch(err => res.render('interns/rech_failure'))
    }
  })
})
// // recharge_intern POST
app.post('/recharge_intern', (req, res) => { 
  rechargeRequest('purchase', req.body.code, req.body.amount, req.body.phone)
  .then(data => {
    res.render('interns/rech_success', {message: `Successfully recharged ${req.body.phone}`})
  })
  .catch(() => {
    res.render('interns/rech_failure')
  })
})

// recharge_others route
app.get('/others', (req, res) => {
  axios(apiHead('providers'))
  .then(data => {
    const networks = data.data.Providers
    res.render('interns/recharge_others', {networks: networks})
  })
  .catch(() => {
    res.render('interns/rech_failure')
  })
})
// recharge_others POST
app.post('/recharge_others', (req, res) => {  
  rechargeRequest('purchase', req.body.code, req.body.amount, req.body.phone)
  .then(data => {
    res.render('interns/rech_success', {message: `Successfully recharged ${req.body.phone}`})
  })
  .catch(() => {
    res.render('interns/rech_failure')
  })
})

app.listen(port, () => console.log(`Listening to port ${port}`)
)
 