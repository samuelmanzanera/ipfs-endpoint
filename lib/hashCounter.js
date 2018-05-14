const fs = require('fs')
const hashCounterFilename = __dirname + '/hashCounter.json'

class HashCounter {

    checkRateLimit(hash) {
        return new Promise((resolve, reject) => {
            fs.exists(hashCounterFilename, exists => {
                if (!exists) {
                    return reject('Not rate limit was given for this file')
                }
                fs.readFile(hashCounterFilename, { encoding: 'utf8'}, (err, data) => {
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

    decrementAllowedDownloads(hash) {
        return new Promise((resolve, reject) => {
            fs.readFile(hashCounterFilename, { encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return reject(err)
                }
                const hashCounterData = JSON.parse(data)
                if (hashCounterData[hash] > 0) {
                    hashCounterData[hash] -= 1
                    this.writeCounterOnFile(hashCounterData)
                        .then(resolve)
                        .catch(reject)
                } 
                else {
                    resolve()
                }
            })
        })
    }

    writeCounterOnFile(hashCounterData) {
        return new Promise((resolve, reject) => {
            fs.writeFile(hashCounterFilename, JSON.stringify(hashCounterData), { encoding: 'utf8' }, err => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        })
    }

    storeHashCounter(hash, counter) {
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
                        return this.writeCounterOnFile(hashCounterData)
                            .then(resolve)
                            .catch(reject)
                    })
                }
                else {
                    hashCounterData[hash] = counter
                    this.writeCounterOnFile(hashCounterData)
                        .then(resolve)
                        .catch(reject)
                }
    
            })
        })
    }
}

module.exports = new HashCounter()