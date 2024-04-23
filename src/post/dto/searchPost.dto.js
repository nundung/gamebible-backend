module.exports = class searchDto {
    page;
    title;

    /**
     * @param {
     *  page: number;
     *  title: string;
     * } data
     */
    constructor(data) {
        this.page = data.page;
        this.title = data.title;
    }

    /**
     * @param {
     *  page: number;
     *  title: string;
     * } data
     */
    static searchPostDto(data) {
        if (!data.page) {
            throw new BadRequestException('Invalid page');
        }
        if (!data.title) {
            throw new BadRequestException('Invalid title');
        }
        return SearchPostDto({
            postPerPage: data.postPerPage,
            page: data.page,
        });
    }
};
