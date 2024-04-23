const TokenPayloadDto = require('../dto/tokenPayload.dto');

module.exports = class UserEntity {
    /**
     * @type
     */
    idx;

    /**
     * @param {{
     *  idx: number;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
    }

    /**
     * @param {TokenPayloadDto} payload
     */
    static userEntity(payload) {
        return new UserEntity(payload.idx);
    }
};
