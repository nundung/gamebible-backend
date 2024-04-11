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

//Apis

//게시판 보기 (게시글 목록보기)
router.get(
    '/',
    checkLogin,
    wrapper(async (req, res, next) => {
        const gameIdx = req.query.gameidx;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * 7;
        const createDto = { page, offset }; // createDto 객체 생성 및 설정

        const result = await getPostAllByGameIdx(gameIdx, {
            page: page,
        });

        // controller
        res.status(200).send({
            data: {
                posts: result.posts,
            },
        });
    })
);

//게시글 상세보기
router.get(
    '/:postidx',
    checkLogin,
    wrapper(async (req, res, next) => {
        const postIdx = req.params.postidx;
        const userIdx = req.decoded.userIdx;

        const post = await getPostByIdx(postIdx);

        res.status(200).send({
            data: post,
        });
    })
);

//게시글 쓰기
router.post(
    '/',
    checkLogin,
    body('title').trim().isLength({ min: 2, max: 40 }).withMessage('제목은 2~40자로 입력해주세요'),
    body('content')
        .trim()
        .isLength({ min: 2, max: 10000 })
        .withMessage('본문은 2~10000자로 입력해주세요'),
    handleValidationErrors,
    async (req, res, next) => {
        const { title, content } = req.body;
        const gameIdx = req.query.gameidx;
        const userIdx = req.decoded.userIdx;

        await createPost(gameIdx, userIdx, {
            title,
            content,
        });

        res.status(201).end();
    }
);

//게시글 쓰기
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
        const { title, content } = req.body;
        const gameIdx = req.query.gameidx;
        const userIdx = req.decoded.userIdx;

        const post = await createPost(userIdx, {
            gameIdx,
            content,
            title,
        });

        res.status(200).send(post);
    })
);

//게시글 검색하기
router.get(
    '/search',
    query('title').trim().isLength({ min: 2 }).withMessage('2글자 이상입력해주세요'),
    async (req, res, next) => {
        const { page, title } = req.query;

        const result = await getPostAllByGameIdx(null, {
            page,
            keyword: title,
        });

        res.status(200).send({
            data: {
                posts: result.posts,
            },
        });
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

        if (post.author.idx !== loginUser.idx) {
            throw new ForbiddenException('Permssion denied');
        }

        await deletePostByIdx(postIdx);

        res.status(200).send();
    })
);

module.exports = router;
