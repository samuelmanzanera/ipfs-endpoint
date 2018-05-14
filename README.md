# ipfs-endpoint
Provide an API to interact with a IPFS node

## Using

Start the api using npm
```bash
$ npm install
$ npm start
```

## Description

The API provide two endpoints

- GET /ipfs/:hash => get the document stored on IPFS
- GET /ipfs/keycode/:hash => get the document by an user friendly keycode
- POST /ipfs => add a new document on IPFS
    - Required parameters: 
        - file as form-data -> File to store on IPFS
        - rateLimit -> Rate limit to reach to have an access to the file
        - keyCodeHash -> Specify an user-friendly hash to have access it lately


## Test

To test the project, you need to launch a local IPFS node.
Then type on terminal

```bash
$ npm test
```

## Licence

MIT