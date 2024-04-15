const { pool } = require('../config/postgres');
const { NotFoundException, ForbiddenException } = require('../modules/Exception');
const { Post } = require('../entity/postEntity');

/**
 * @typedef {{
 *  idx: number,
 *  title: string,
 *  content: string,
 *  createdAt: Date,
 *  view: number,
 *  author: User,
 *  game: {
 *      idx: number,
 *      title: string,
 *      createdAt: Date,
 *  },
 * }} Post
 */

/**
 * @typedef {Omit<Post, 'content'>} SelectPost
 */

/**
 * 게시글 업로드
 * @param {number} userIdx
 * @param {number} gameIdx
 * @param {{
 *  title: string,
 *  content: string
 * }} createDto
 * @returns {Promise<void>}
 */
const createPost = async (userIdx, gameIdx, createDto, conn = pool) => {
    await conn.query(
        `INSERT INTO
            post(
                user_idx,
                game_idx,
                title,
                content
            )
        VALUES
            ($1, $2, $3, $4)`,
        [userIdx, gameIdx, createDto.title, createDto.content]
    );
    return;
};

/**
 * 게시판 보기 (게시글 목록보기)
 * @param {number} gameIdx 가져올 게시판 인덱스
 * @param  {{
 *  postsPerPage: number,
 *  page: number
 * }} getDto
 * @returns {Promise<{
 *  posts: SummaryPost[],
 *  meta: {page: number,
 *      maxPage: number,
 *      totalPosts: number,
 *      offset: number,
 *      length: number},
 * }>}
 * @returns {}
 */
const getPostAllByGameIdx = async (gameIdx, getDto) => {
    const postsPerPage = 20;
    // totalposts를 가져오는 별도의 쿼리
    const totalPostsResult = await pool.query(
        `SELECT
            COUNT(*)::int AS "totalPosts"
        FROM
            post
        WHERE
            game_idx = $1
        AND 
            deleted_at IS NULL`,
        [gameIdx]
    );
    const result = await pool.query(
        `SELECT
            post.idx,
            post.title,
            post.created_at AS "createAt",
            "user".idx AS "userIdx",
            "user".nickname,
            "user".created_at AS "createdAt",
            -- 조회수
            (
                SELECT
                    COUNT(*)::int
                FROM
                    view
                WHERE
                    post_idx = post.idx
            ) AS view
        FROM
            post
        JOIN
            "user" ON post.user_idx = "user".idx
        WHERE
            game_idx = $1
        AND
            post.deleted_at IS NULL
        ORDER BY
            post.idx DESC
        LIMIT
            10
        OFFSET
            ($2 - 1) * 10`,
        [gameIdx, getDto.page]
    );

    return {
        posts: Post.getPostList(result.rows),
        meta: {
            page,
            maxPage: Math.ceil(totalPostsResult.rows[0].totalPosts / postsPerPage),
            totalPosts: totalPostsResult.rows[0].totalPosts,
            offset: (page - 1) * postsPerPage,
            length: result.rows.length,
        },
    };
};

/**
 * 게시글 상세보기
 * @param {number} postIdx 가져올 게시글 인덱스
 * @returns {Promise<Post>}
 */
const getPostByIdx = async (postIdx, conn = pool) => {
    const result = await pool.query(
        `SELECT
            post.title,
            post.content,
            post.created_at,
            "user".nickname,
            -- 조회수 불러오기
            (
                SELECT
                    COUNT(*)::int
                FROM
                    view
                WHERE
                    post_idx = post.idx 
            ) AS view
        FROM 
            post
        JOIN
            "user" ON post.user_idx = "user".idx
        WHERE
            post.idx = $1
        AND 
            post.deleted_at IS NULL`,
        [postIdx]
    );
    if (!result.rows[0]) {
        throw new NotFoundException('Cannot find post');
    }
    return Post.getPost(result.rows[0]);
};

/**
 * 조회수 반영하기
 * @param {number} postIdx
 * @param {number} userIdx
 * @returns {Promise<void>}
 */
const increasePostViewByIdx = async (postIdx, userIdx, conn = pool) => {
    await pool.query(
        `INSERT INTO view
            (post_idx, user_idx)
        VALUES
            ($1, $2)`,
        [postIdx, userIdx]
    );
    return;
};

/**
 * 게시글 검색하기
 */

/**
 * 게시글 삭제하기
 * @param {number} postIdx
 * @returns {Promise<void>}
 */
const deletePostByIdx = async (postIdx, userIdx) => {
    const post = await getPostByIdx(postIdx);

    if (post.author.idx !== userIdx) {
        throw new ForbiddenException('Permission denied');
    }

    await pool.query(`UPDATE post SET deleted_at = NOW() WHERE idx = $1`, [postIdx]);

    return;
};

module.exports = {
    createPost,
    getPostByIdx,
    deletePostByIdx,
    getPostAllByGameIdx,
    increasePostViewByIdx,
};
