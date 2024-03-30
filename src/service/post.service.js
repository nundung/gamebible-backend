const { pool } = require('../config/postgres');
const { NotFoundException } = require('../modules/Exception');
/**
 * 게시글 하나에 대한 타입 정의
 * @typedef {{
 *  idx: number,
 *  game_idx: number,
 *  author: {
 *      userIdx: number,
 *      nickname: string,
 *  }
 *  title: string,
 *  content: string,
 *  created_at: string,
 *  deleted_at: string,
 * }} Post
 */

/**
 * 게시글 요약
 * @typedef {{
 *  idx: number,
 *  game_idx: number,
 *  author: {
 *      userIdx: number,
 *      nickname: string,
 *  }
 *  title: string,
 *  created_at: string,
 * }} SummaryPost
 */

/**
 * 게시글 하나 가져오기
 * @param {number} postIdx 가져올 게시글 인덱스
 * @returns {Promise<Post>}
 * @throws {NotFoundException}
 */
const getPostByIdx = async (postIdx) => {
    const result = await pool.query(`SELECT * FROM post WHERE idx = $1 AND deleted_at IS NULL`, [
        postIdx,
    ]);
    const post = result.rows[0];

    if (!post) {
        throw new NotFoundException('Cannot find post');
    }

    return post;
};

/**
 * @returns {Promise<SummaryPost[]}
 */
const getPostAll = async () => {};

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
    getPostByIdx,
    deletePostByIdx,
    getPostAll,
};
