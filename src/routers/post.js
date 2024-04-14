//Import
const router = require('express').Router();
const checkLogin = require('../middlewares/checkLogin');
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validator');
const wrapper = require('../middlewares/wrapper');
const { NotFoundException, ForbiddenException } = require('../modules/Exception');
const { pool } = require('../config/postgres');
const {
    Post,
    createPost,
    getPostByIdx,
    deletePostByIdx,
    getPostAllByGameIdx,
    increasePostViewByIdx,
} = require('../service/post.service');
const { CostExplorer } = require('aws-sdk');
const { ResultWithContextImpl } = require('express-validator/src/chain');

//Apis

//게시글 업로드
//이 api는 프론트와 상의 후 수정하기로..
router.post(
    '/',
    checkLogin,
    body('title').trim().isLength({ min: 2, max: 40 }).withMessage('제목은 2~40자로 입력해주세요'),
    body('content')
        .trim()
        .isLength({ min: 2, max: 10000 })
        .withMessage('본문은 2~10000자로 입력해주세요'),
    handleValidationErrors,
    wrapper(async (req, res, next) => {
        const gameIdx = req.query.gameidx;
        const userIdx = req.decoded.userIdx;
        const { title, content } = req.body;
        const createDto = { title, content };

        // service
        await createPost(userIdx, gameIdx, createDto);

        // controller
        res.status(201).end();
    })
);

//게시판 보기 (게시글 목록보기)
//페이지네이션
//deleted_at 값이 null이 아닌 경우에는 탈퇴한 사용자
// controller
router.get(
    '/all',
    checkLogin,
    wrapper(async (req, res, next) => {
        const gameIdx = parseInt(req.query.gameidx);
        const page = parseInt(req.query.page) || 1;
        const getDto = { page }; // createDto 객체 생성 및 설정

        // service
        const result = await getPostAllByGameIdx(gameIdx, getDto);

        // controller
        if (!result.posts) {
            res.status(204);
        } else {
            res.status(200).send(result);
        }
    })
);

//게시글 상세보기
router.get(
    '/:postidx',
    checkLogin,
    wrapper(async (req, res, next) => {
        const postIdx = req.params.postidx;
        const userIdx = req.decoded.userIdx;

        const conn = await pool.connect();
        try {
            await conn.query('BEGIN');

            const posts = await getPostByIdx(postIdx, conn);

            await increasePostViewByIdx(postIdx, userIdx, conn);

            await conn.query('COMMIT');

            res.status(200).send({
                data: posts,
            });
        } catch (err) {
            await conn.query('ROLLBACK');
            throw err;
        }

        res.status(200).send(posts);
    })
);

//게시글 검색하기
//페이지네이션
router.get(
    '/search',
    query('title').trim().isLength({ min: 2 }).withMessage('2글자 이상입력해주세요'),
    async (req, res, next) => {
        const { page, title } = req.query;
        try {
            //20개씩 불러오기
            const offset = (page - 1) * 7;
            const data = await pool.query(
                `
            SELECT 
                post.title, 
                post.created_at, 
                "user".nickname,
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
            LEFT JOIN
                view ON post.idx = view.post_idx
            JOIN 
                "user" ON post.user_idx = "user".idx
            WHERE
                post.title LIKE '%${title}%'
            AND 
                post.deleted_at IS NULL
            ORDER BY
                post.idx DESC
            LIMIT
                7
            OFFSET
                $1`,
                [offset]
            );
            const length = data.rows.length;
            res.status(200).send({
                data: data.rows,
                page,
                offset,
                length,
            });
        } catch (err) {
            return next(err);
        }
    }
);

//게시글 삭제하기
router.delete(
    '/:postidx',
    checkLogin,
    wrapper(async (req, res, next) => {
        const postIdx = req.params.postidx;
        const loginUser = req.decoded;

        const post = await getPostByIdx(postIdx);

        if (post.user_idx !== loginUser.userIdx) {
            throw new ForbiddenException('권한이 없습니다.');
        }

        await deletePostByIdx(postIdx);

        res.status(200).send();
    })
);

//게시글에 이미지 업로드하면 s3랑 게시글에 첨부되는 기능
//게시글 업로드를 취소하면 이미지가 삭제 되도록 어쩌구...

module.exports = router;
