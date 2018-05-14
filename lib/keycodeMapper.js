const fs = require('fs')
const keyCodesFilename = __dirname + '/keyCodes.json'

class KeycodeMapper {

    constructor () {
        this.keyCodeMap = new Map()
        if (fs.existsSync(keyCodesFilename)){
            const keyCodes = fs.readFileSync(keyCodesFilename, { encoding: 'utf8' })
            const keyCodesData = JSON.parse(keyCodes)

            //Convert Object deserialized to a Map
            for (let k of Object.keys(keyCodesData)) {
                this.keyCodeMap.set(k, keyCodesData[k]);
            }
        }
    }

    set(key, hash) {
        return new Promise((resolve, reject) => {
            this.keyCodeMap.set(key, hash)

            //Convert the Map to an object to be serialized
            let obj = Object.create(null);
            for (let [k,v] of this.keyCodeMap) {
                obj[k] = v;
            }

            fs.writeFile(keyCodesFilename, JSON.stringify(obj), { encoding: 'utf8' }, err => {
                if (err) {
                    return reject(err)
                }
                resolve()
            })
        })
    }

    get(key) {
        return this.keyCodeMap.get(key)
    }

    has (key) {
        return this.keyCodeMap.has(key)
    }

}

module.exports = new KeycodeMapper()