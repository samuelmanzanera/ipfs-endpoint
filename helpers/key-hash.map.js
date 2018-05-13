let KeyHashMap = {

    instance: null,

    getOne: function() {
        if (!this.instance && this.instance == undefined) {
            this.instance = new Map();
        }
        return this.instance;
    }

};

module.exports = KeyHashMap;
