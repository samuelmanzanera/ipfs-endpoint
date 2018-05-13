const express = require('express');
const ipfsApi = require('ipfs-api');
const multer = require('multer');
const util = require('util');

const ipfs = ipfsApi(process.env.IPFS_NODE_HOST, process.env.IPFS_NODE_PORT, { protocol: 'http' });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadFile = upload.single('file');
const codeToHashMap = (require('../helpers/key-hash.map.js')).getOne();


let byKeyRouter = express.Router();

    byKeyRouter.route('/ipfs/:keycode')
    .post((req, res, next) => {
        uploadFile(req, res, err => {
            if (err) {
                return res.status(400).json({ error: util.format(err) })
            }
            if (!req.file) {
                return res.status(400).json({ error: 'File form data parameter is missing' })
            }
            if (!req.params.keycode)
                return res.status(400).json({ error: 'KeyCode parameter  is missing' })

            if (!req.body.rateLimit) {
                return res.status(400).json({ error: 'rateLimit parameter is missing' })
            }


            let keycode = req.params.keycode;
            console.log(keycode);

            ipfs.files.add(req.file.buffer)
                .then(result => {
                    const ipfsResponse = result[0];

                    console.log('Saved IPFS File: ')
                    console.dir(ipfsResponse);


                    if (!ipfsResponse || ipfsResponse == undefined) {
                        return res.status(400).json({ error: 'NO data added to ipfs' })
                    }

                    codeToHashMap.set(keycode, ipfsResponse.hash);

                    let respObj = {
                        hash: ipfsResponse.hash,
                        size: ipfsResponse.size,
                        rateLimit: req.body.rateLimit,
                        keycode: keycode
                    }
                    console.dir(respObj);
                    res.status(200).json(respObj)
                })
        })
    })

    .get((req, res, next) => {
        let keycode = req.params.keycode;
        if (!codeToHashMap.has(keycode))
            return res.status(400).json({ err: `No keyCode found in map: ${keycode}` });

        let hash = codeToHashMap.get(keycode);
        ipfs.files.cat(hash, (err, data) => {
            if (err) {
                return res.status(500).json({ error: util.format(err) })
            }

            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Content-Disposition', 'attachment; filename=' + keycode)
            res.send(data)
        })

    });
module.exports = byKeyRouter;