const { BadRequestException } = require('../../modules/Exception');

module.exports = class CreatePostDto {
    title;
    content;

    /**
     * @param {
     *  title: string;
     *  content: string;
     * } data
     */
    constructor(data) {
        this.title = data.title;
        this.content = data.content;
    }

    /**
     * @param {
     *  title: string;
     *  content: string;
     * } data
     */
    static createPostDto(data) {
        if (!data.title) {
            throw new BadRequestException('Invalid title');
        }
        if (!data.content) {
            throw new BadRequestException('Invalid content');
        }

        return new CreatePostDto({
            title: data.title,
            content: data.content,
        });
    }
};
