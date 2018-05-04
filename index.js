const util = require('util')

const dotenv = require('dotenv')
const express = require('express')
const ipfsApi = require('ipfs-api')
const bodyParser = require('body-parser')

dotenv.load()
const app = express()
const ipfs = ipfsApi(process.env.IPFS_NODE_HOST, process.env.IPFS_NODE_PORT, { protocol: 'http' })

const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.get('/ipfs/:hash', (req, res, next) => {
    ipfs.files.cat(req.params.hash, (err, data) => {
        if (err) {
            return res.status(500).json({ error: util.format(err) })
        }
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', 'attachment; filename='+req.params.hash)
        res.send(data)
    })
})

const uploadFile = upload.single('file')

app.post('/ipfs', (req, res) => {
    uploadFile(req, res, err => {
        if (err) {
            return res.status(400).json({ error: util.format(err) })
        }
        if (!req.file) {
            return res.status(400).json({ error: 'File form data parameter is missing' })
        }
        ipfs.files.add(req.file.buffer)
            .then(result => res.json({ hash: result.hash, size: result.size }))
            .catch(err => res.status(500).json({ error: util.format(err) }))
    })
})

app.listen(process.env.PORT, () => {
    console.log('API listening on ' + process.env.PORT)
})

