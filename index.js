const util = require('util')
const fs = require('fs')

const dotenv = require('dotenv')
const express = require('express')
const ipfsApi = require('ipfs-api')
const multer = require('multer')
const helmet = require('helmet')

dotenv.load()

const ipfs = ipfsApi(process.env.IPFS_NODE_HOST, process.env.IPFS_NODE_PORT, { protocol: 'http' })
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const hashCounterFilename = __dirname + '/hashCounter.json'

const app = express()
app.use(helmet())

const uploadFile = upload.single('file')
const byKeyRouter = require('./routes/bykey.route.js');






app.use('/bykey', byKeyRouter);

app.get('/ipfs/:hash', (req, res, next) => {

  checkRateLimit(req.params.hash)
    .then(isRateLimitReached => {
      if (!isRateLimitReached) {
        return res.status(403).json({ error: 'Rate limit reached. The resource is not anymore available' })
      }
      ipfs.files.cat(req.params.hash, (err, data) => {
        if (err) {
          return res.status(500).json({ error: util.format(err) })
        }

        decrementAllowedDownloads(req.params.hash)
          .then(() => {
            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.hash)
            res.send(data)
          })
          .catch(err => res.status(500).json({ error: util.format(err) }))

      })
    })
    .catch(err => res.status(500).json({ error: util.format(err) }))
})



app.post('/ipfs', (req, res) => {
  uploadFile(req, res, err => {
    if (err) {
      return res.status(400).json({ error: util.format(err) })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File form data parameter is missing' })
    }

    if (!req.body.rateLimit) {
      return res.status(400).json({ error: 'rateLimit parameter is missing' })
    }

    ipfs.files.add(req.file.buffer)
      .then(result => {
        const ipfsResponse = result[0]
        storeHashCounter(ipfsResponse.hash, req.body.rateLimit)
          .then(() => res.json({
            hash: ipfsResponse.hash,
            size: ipfsResponse.size,
            rateLimit: req.body.rateLimit
          }))
          .catch(err => res.status(500).json({ error: util.format(err) }))
      })
      .catch(err => res.status(500).json({ error: util.format(err) }))
  })
});

app.get('/', (res, resp) => {
  resp.status(200).json({
    status: 'Ok',
    routes: [
      'GET /bykey/ipfs/:keycode',
      'POST /bykey/ipfs/:keycode',
      'GET /ipfs/:hash',
      'POST /ipfs/:hash',
      ]
  })
})



function checkRateLimit(hash) {
  return new Promise((resolve, reject) => {
    fs.exists(hashCounterFilename, exists => {
      if (!exists) {
        return reject('Not rate limit was given for this file')
      }
      fs.readFile(hashCounterFilename, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          return reject(err)
        }
        const hashCounterData = JSON.parse(data)
        if (hashCounterData[hash] === undefined) return resolve(true)
        else if (hashCounterData[hash] === 0) return resolve(false)
        else resolve(true)
      })
    })
  })
}

function decrementAllowedDownloads(hash) {
  return new Promise((resolve, reject) => {
    fs.readFile(hashCounterFilename, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        return reject(err)
      }
      const hashCounterData = JSON.parse(data)
      if (hashCounterData[hash] > 0) {
        hashCounterData[hash] -= 1
        writeCounterOnFile(hashCounterData)
          .then(resolve)
          .catch(reject)
      }
      else {
        resolve()
      }
    })
  })
}

function storeHashCounter(hash, counter) {
  return new Promise((resolve, reject) => {
    fs.exists(hashCounterFilename, exists => {
      let hashCounterData = {}
      if (exists) {
        fs.readFile(hashCounterFilename, { encoding: 'utf8' }, (err, data) => {
          if (err) {
            return reject(err)
          }
          hashCounterData = JSON.parse(data)
          hashCounterData[hash] = counter
          return writeCounterOnFile(hashCounterData)
            .then(resolve)
            .catch(reject)
        })
      }
      else {
        hashCounterData[hash] = counter
        writeCounterOnFile(hashCounterData)
          .then(resolve)
          .catch(reject)
      }

    })
  })
}

function writeCounterOnFile(hashCounterData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(hashCounterFilename, JSON.stringify(hashCounterData), { encoding: 'utf8' }, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

app.listen(process.env.PORT, () => {
  console.log('API listening on ' + process.env.PORT)
})


module.exports = app
