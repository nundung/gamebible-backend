const GetPostDto = require('./dto/getPost.dto');

class Author {
    /**
     * 글쓴이 인덱스
     * @type {number}
     */
    idx;

    /**
     * 글쓴이 닉네임
     * @type {string}
     */
    nickname;

    /**
     * 글쓴이 탈퇴날짜 (탈퇴여부)
     * @type {Date}
     */
    deletedAt;

    /**
     * 글쓴이 엔티티 생성자
     * @param {{
     *  idx: number,
     *  nickname: string,
     *  deletedAt: Date,
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.nickname = data.nickname;
        this.deletedAt = data.deletedAt;
    }
}

class Game {
    /**
     * 게시판(게임) 인덱스
     * @type {number}
     */
    idx;

    /**
     * 게시판 제목
     * @type {string}
     */
    title;

    /**
     * 게시판 생성날짜
     * @type {Date}
     */
    createdAt;

    /**
     * 게시판 엔티티 생성자
     * @param {{
     *  idx: number,
     *  title: string,
     *  createdAt: Date,
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.title = data.title;
        this.createdAt = data.createdAt;
    }
}

module.exports = class PostEntity {
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
     * @type {Author}
     */
    author;

    /**
     * 게시글이 속한 게시판 정보
     * @type {Game}
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
     *  author: Author,
     *  game: Game,
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
    static postEntity(result) {
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
};
