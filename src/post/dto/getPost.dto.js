module.exports = class GetPostDto {
    page;

    /**
     * @param {
     *  page: number;
     * } data
     */
    constructor(data) {
        this.page = data.page;
    }

    /**
     * @param {
     *  page: number;
     * } data
     */
    static getPostDto(data) {
        if (!data.page) {
            throw new BadRequestException('Invalid page');
        }
        return new GetPostDto({
            page: data.page,
        });
    }
};
