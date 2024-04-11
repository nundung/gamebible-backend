class Post {
    /**
     * @type {number} 게시글의 인덱스
     */
    idx;

    /**
     * @type {string} 게시글의 제목
     */
    title;

    /**
     * @type {string} 게시글의 내용
     */
    content;

    /**
     * @type {Date} 게시글 작성 시간
     */
    createdAt;

    /**
     * @type {{
     *  idx: number;
     *  name: string;
     * }}
     */
    author;

    constructor(data) {
        this.idx = data.idx;
        this.title = data.title;
        this.content = data.content;
        this.createdAt = stringToDate(data.createdAt);
    }

    static createPost(data) {
        return new Post(data);
    }
}

const stringToDate = (str) => {
    return new Date(str);
};

/**
 * 게임에 해당하는 게시글 모두 가져오는 메서드
 * @param {number | null} idx Game Idx, null이면 모든 게임 인덱스에 대해서 post를 전부 가져온다.
 * @param {{
 *  page: number,
 *  keyword?: string,
 * }} pagerble
 * @returns {Promise<{
 *  posts: Post[]
 * }>}
 */
const getPostAllByGameIdx = (idx, pagerble) => {};

/**
 * 게시글을 하나 가져오는 메서드
 * @param {number} idx Post Idx
 * @returns {Promise<Post>}
 */
const getPostByIdx = (idx) => {};

/**
 * 게시글을 생성하는 메서드
 * @param {number} idx Game Idx
 * @param {number} userIdx Create user idx
 * @param {{
 *  title: string;
 *  content: string;
 * }} createDto
 * @returns {Promise<void>}
 */
const createPost = async (idx, userIdx, createDto) => {
    return 1;
};

/**
 * 게시글을 수정하는 메서드
 * @param {number} idx Post Idx
 * @param {{
 *  title: string;
 *  content: string;
 * }} updaetDto
 * @returns {Promise<void>}
 */
const updatePostByIdx = (idx, updaetDto) => {};

/**
 * 게시글 하나를 삭제하는 메서드
 * @param {number} idx Post Idx
 * @returns {Promise<void>}
 */
const deletePostByIdx = (idx) => {};

module.exports = {
    getPostAllByGameIdx,
    getPostByIdx,
    createPost,
    updatePostByIdx,
    deletePostByIdx,
};
