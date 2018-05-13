const fs = require('fs')
const assert = require('assert')
const supertest = require('supertest')
const path = require('path');

const app = require('../index')
const request = supertest(app)

describe('Endpoints testing', () => {
    
    // before((done) => {
    //     request.post('/bykey/ipfs/key1')
    //         .field('file', fs.createReadStream(__dirname + '/testFile.txt'))
    //         .field('rateLimit', 1)
    //         .end(done);
    // });

    it.only('publish file', done => {
        request.post('/bykey/ipfs/key1')
            .field('file', fs.createReadStream(path.join(__dirname, '/myfile.txt')))
            .field('rateLimit', 1)
            .expect(200)
            .expect(res => {
                assert.equal(res.body.hash !== undefined, true)
            })
            .end(done)
    });

    it('getting file by keycode', done => {
        request.get('/bykey/ipfs/key1')
            .expect(200)
            .expect(res => {
                console.log(`Response is: ${JSON.stringify(res)}`)
            })
            .end(done);
    })

    it('publish file', done => {
        request.post('/ipfs')
            .field('file', fs.createReadStream(__dirname + '/testFile.txt'))
            .field('rateLimit', 1)
            .expect(200)
            .expect(res => {
                assert.equal(res.body.hash !== undefined, true)
            })
            .end(done)
    })

    it('cannot publish with missing file parameter', done => {
        request.post('/ipfs')
            .expect(400)
            .expect(res => {
                assert.equal(res.body.error, 'File form data parameter is missing')
            })
            .end(done)
    })

    it('cannot publish with missing rateLimit parameter', done => {
        request.post('/ipfs')
            .field('file', fs.createReadStream(__dirname + '/testFile.txt'))
            .expect(400)
            .expect(res => {
                assert.equal(res.body.error, 'rateLimit parameter is missing')
            })
            .end(done)
    })

    it('get file', done => {
        request.post('/ipfs')
            .field('file', fs.createReadStream(__dirname + '/testFile.txt'))
            .field('rateLimit', 1)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }

                request.get('/ipfs/' + res.body.hash)
                    .expect(200)
                    .expect(res => {
                        assert.equal(res.headers['content-type'], 'application/octet-stream')
                        assert.equal(Buffer.isBuffer(res.body), true)
                    })
                    .end(done)

            })
    })

    it('cannot get file after the rate limit reached', done => {
        request.post('/ipfs')
            .field('file', fs.createReadStream(__dirname + '/testFile.txt'))
            .field('rateLimit', 1)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                request.get('/ipfs/' + res.body.hash)
                    .expect(200)
                    .end((err) => {
                        if (err) {
                            return done(err)
                        }
                        request.get('/ipfs/' + res.body.hash)
                            .expect(403)
                            .expect(res => {
                                assert.equal(res.body.error, 'Rate limit reached. The resource is not anymore available')
                            })
                            .end(done)
                    })
            })
    })

})
