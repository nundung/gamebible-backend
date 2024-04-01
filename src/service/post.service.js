const { pool } = require('../config/postgres');
const { NotFoundException } = require('../modules/Exception');

/**
 * @typedef {{
 *  idx: number,
 *  title: string,
 *  content: string,
 *  createdAt: Date,
 *  game: {
 *      idx: number,
 *      title: string,
 *      createdAt: Date,
 *  },
 *  author: User,
 *  view: number,
 * }} Post
 */

/**
 * @typedef {Omit<Post, 'content'>} SummaryPost
 */

/**
 * 게시글 생성하기
 * @param {number} userIdx
 * @param {{
 *  gameIdx: number,
 *  title: string,
 *  content: string
 * }} createDto
 * @returns {Promise<{Post}>}
 */
const createPost = async (userIdx, createDto) => {
    await pool.query(
        `INSERT INTO
            post(
                user_idx,
                game_idx,
                title,
                content
            )
        VALUES
            ($1, $2, $3, $4)`,
        [userIdx, createDto.gameIdx, createDto.title, createDto.content]
    );
};

/**
 * 게시글 상세보기
 * @param {number} postIdx 가져올 게시글 인덱스
 * @returns {Promise<{Post}>}
 * @throws {NotFoundException}
 */
const getPostByIdx = async (postIdx, userIdx) => {
    let poolClient = await pool.connect();
    try {
        await poolClient.query('BEGIN');

        await poolClient.query(
            `
             -- 조회수 반영하기
            INSERT INTO
                view(
                    post_idx,
                    user_idx
                )
            VALUES
                ($1, $2)`,
            [postIdx, userIdx]
        );

        const result = await poolClient.query(
            `
        SELECT
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

        const post = result.rows.map((post) => ({
            idx: post.idx,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            view: post.view,
            author: {
                idx: post.user_idx,
                nickname: post.nickname,
            },
        }));
        if (!post) {
            throw new NotFoundException('Cannot find post');
        }
        await poolClient.query('COMMIT');

        return post;
    } catch (err) {
        await poolClient.query('ROLLBACK');
        next(err);
    } finally {
        poolClient.release();
    }
};

/**
 * 게시판 글 전체 가져오기
 * @param {number} gameIdx 가져올 게시판 인덱스
 * @param {{
 *  offset: number,
 *  page: number
 * }} createDto
 * @returns {Promise<{posts: SummaryPost[], meta: { offset: number, page: number }}>}
 * @returns {}
 */
const getPostAll = async (gameIdx, createDto) => {
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
            $3
        OFFSET
            ($2 - 1) * $3`,
        [gameIdx, createDto.page, createDto.offset]
    );

    return {
        posts: result.rows.map((post) => ({
            idx: post.idx,
            title: post.title,
            createdAt: new Date(post.createdAt),
            view: post.view,
            author: {
                idx: post.userIdx,
                nickname: post.nickname,
                createdAt: new Date(post.createdAt),
            },
        })),
        meta: {
            length: result.rowCount,
            offset: createDto.offset,
            page: createDto.page,
        },
    };
};

/**
 * 게시글 하나 삭제하기
 * @param {number} postIdx
 * @returns {Promise<void>}
 */
const deletePostByIdx = async (postIdx) => {
    await pool.query(`UPDATE post SET deleted_at = NOW() WHERE idx = $1`, [postIdx]);

    return;
};

module.exports = {
    createPost,
    getPostByIdx,
    deletePostByIdx,
    getPostAll,
};
