module.exports = class GetPostDto {
    postsPerPage;
    page;

    /**
     * @param {
     *  postsPerPage: number;
     *  page: number;
     * } data
     */
    constructor(data) {
        this.postsPerPage = data.postsPerPage;
        this.page = data.page;
    }

    /**
     * @param {
     *  postsPerPage: number;
     *  page: number;
     * } data
     */
    static GetPostDto(data) {
        if (!data.postsPerPage) {
            throw new BadRequestException('Invalid postPerPage');
        }
        if (!data.page) {
            throw new BadRequestException('Invalid page');
        }
        return new CreateTodoDto({
            postPerPage: data.postPerPage,
            page: data.page,
        });
    }
};
