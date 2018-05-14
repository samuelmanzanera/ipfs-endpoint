const util = require('util')
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const uploadFile = upload.single('file')

const ipfsService = require('../services/ipfsService')

class IpfsController {

    getFile (req, res) {
        const fileHash = req.params.hash
        ipfsService.getFile(fileHash).then(data => {
            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Content-Disposition', 'attachment; filename='+req.params.hash)
            res.send(data)
        })
        .catch(err => res.status(err.code || 500).json({ error: util.format(err.error) }))
    }

    getFileByKeycode(req, res) {
        const keyCodeHash = req.params.hash
        ipfsService.getFileByKeyCode(keyCodeHash)
            .then(data => {
                res.setHeader('Content-Type', 'application/octet-stream')
                res.setHeader('Content-Disposition', 'attachment; filename='+req.params.hash)
                res.send(data)
            })
            .catch(err => res.status(err.code || 500).json({ error: util.format(err.error) }))
    }

    createFile (req, res) {
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

            ipfsService.createFile(req.file.buffer, req.body.rateLimit, req.body.keyCodeHash)
                .then(result => res.json(result))
                .catch(err => res.status(err.code || 500).json({ error: util.format(err.error)}))
        })
    }

}

module.exports = new IpfsController()