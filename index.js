const dotenv = require('dotenv')
const express = require('express')
const helmet = require('helmet')

dotenv.load()

const app = express()
app.use(helmet())
app.use(require('./router'))

app.listen(process.env.PORT, () => {
    console.log('API listening on ' + process.env.PORT)
})


module.exports = app