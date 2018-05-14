const express = require('express')
const router = express.Router()

const ipfsController = require('./controllers/ipfsController')

router
    .get('/ipfs/:hash', ipfsController.getFile)
    .get('/ipfs/keycode/:hash', ipfsController.getFileByKeycode)
    .post('/ipfs', ipfsController.createFile)

module.exports = router

