const GetPostDto = require('./getPost.dto');
module.exports = class postEntity {
    /**
     * 게시글 인덱스
     * @type {number}
     */
    idx;

    /**
     * 게시글 제목
     * @type {string}
     */
    title;

    /**
     * 게시글 내용
     * @type {string}
     */
    content;

    /**
     * 게시글 생성날짜
     * @type {Date}
     */
    createdAt;

    /**
     * 게시글 조회수
     * @type {number}
     */
    view;

    /**
     * 게시글 작성자
     * @type {{
     *  idx: number,
     *  nickname: string,
     *  deletedAt: Date
     * }}
     */
    author;

    /**
     * 게시글이 속한 게시판 정보
     * @type {{
     *  idx: number,
     *  title: string
     * }}
     */
    game;

    /**
     * 게시글 엔티티 생성자
     * @param {{
     *  idx: number,
     *  title: string,
     *  content: string,
     *  createdAt: Date,
     *  view: number,
     *  author: { idx: number, nickname: string, deletedAt: Date },
     *  game: { idx: number, title: string }
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.title = data.title;
        this.content = data.content;
        this.createdAt = data.createdAt;
        this.view = data.view;
        this.author = data.author;
        this.game = data.game;
    }

    /**
     * @param {Post} result
     */
    static getPost(result) {
        return new Post({
            idx: result.idx,
            title: result.title,
            content: result.content,
            createdAt: result.createdAt,
            view: result.view,
            author: {
                idx: result.userIdx,
                nickname: result.nickname,
            },
        });
    }

    static getPostList(rows) {
        return rows.map((row) => this.createPost(row));
    }
};
