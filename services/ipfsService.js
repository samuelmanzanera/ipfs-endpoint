const hashCounter = require('../lib/hashCounter')
const ipfsApi = require('ipfs-api')
const util = require('util')
const keyCodeMapper = require('../lib/keycodeMapper')

class ipfsService {

    constructor () {
        this.ipfsClient = ipfsApi(process.env.IPFS_NODE_HOST, process.env.IPFS_NODE_PORT, { protocol: 'http' })
    }

    getFile (fileHash) {
        return new Promise((resolve, reject) => {
            hashCounter.checkRateLimit(fileHash).then(isRateLimitReached => {
                if (!isRateLimitReached) {
                    return reject({ code: 403, error: 'Rate limit reached. The resource is not anymore available' })
                }
                this.ipfsClient.files.cat(fileHash, (err, data) => {
                    if (err) {
                        return reject({ code: 500, error: util.format(err) })
                    }
    
                    hashCounter.decrementAllowedDownloads(fileHash)
                        .then(() => resolve(data))
                        .catch(err => reject({ code: 500, error: util.format(err) }))
    
                })
            })
            .catch(err => reject({ code: 500, error: util.format(err) }))
        })
    }

    getFileByKeyCode(keyCodeHash) {
        return new Promise((resolve, reject) => {
            
            if (!keyCodeMapper.has(keyCodeHash)) {
                return reject({ code: 404, error: 'Invalid hash of the keycode. Not found' })
            }

            const ipfsHash = keyCodeMapper.get(keyCodeHash)
            this.getFile(ipfsHash)
                .then(resolve)
                .catch(reject)
        })
    }

    createFile (fileBuffer, rateLimit, keyCodeHash) {
        return new Promise((resolve, reject) => {
            this.ipfsClient.files.add(fileBuffer)
                .then(result => {
                    const ipfsResponse = result[0]
                    hashCounter.storeHashCounter(ipfsResponse.hash, rateLimit)
                        .then(() => {
                            let result = { 
                                hash: ipfsResponse.hash, 
                                size: ipfsResponse.size,
                                rateLimit: rateLimit
                            }

                            if (keyCodeHash !== undefined) {
                                keyCodeMapper.set(keyCodeHash, ipfsResponse.hash)
                                    .then(() => {
                                        result.keyCodeHash = keyCodeHash
                                        resolve(result)
                                    })
                                    .catch(err => reject({ code: 500, error: util.format(err) }))
                            }
                            else {
                                resolve(result)
                            }
                        })
                        .catch(err => reject({ code: 500, error: util.format(err) }))
                })
                .catch(err => reject({ code: 500, error: util.format(err) }))
        })
    }

}

module.exports = new ipfsService()