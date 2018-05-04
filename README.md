# ipfs-endpoint
Provide an API to interact with a IPFS node

## Using

Start the api using npm
```js
$ npm install
$ npm start
```

## Description

The API provide two endpoints

- GET /ipfs/:hash => get the document stored on IPFS
- POST /ipfs => add a new document on IPFS
    - Required parameters: file as form-data

## Licence

MIT