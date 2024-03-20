//Import
const router = require('express').Router();
const { pool } = require('../config/postgres');
const checkLogin = require('../middlewares/checkLogin');

//Apis

//댓글 쓰기
router.post('/', checkLogin, async (req, res, next) => {
    const content = req.body.content;
    const postIdx = req.query.postidx;
    try {
        const userIdx = req.decoded.userIdx;
        const sql = `
            INSERT INTO
                comment(
                    user_idx,
                    post_idx,
                    content
                )
            VALUES
                ($1, $2, $3)`;
        const values = [userIdx, postIdx, content];
        await pool.query(sql, values);
        res.status(201).send();
    } catch (err) {
        next(err);
    }
});

//댓글 보기
router.get('/', async (req, res, next) => {
    const postIdx = req.query.postidx;
    try {
        const sql = `
        SELECT
            comment.user_idx,
            comment.content,
            comment.created_at,
            "user".nickname
        FROM 
            comment
        JOIN
            "user" ON comment.user_idx = "user".idx
        WHERE
            post_idx = $1
        AND 
            comment.deleted_at IS NULL
        ORDER BY
            comment.idx DESC`;
        const values = [postIdx];
        const data = await pool.query(sql, values);
        res.status(201).send({
            data: data.rows,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
