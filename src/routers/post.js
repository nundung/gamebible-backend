//Import
const router = require('express').Router();
const checkLogin = require('../middleware/checkLogin');
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');
const wrapper = require('../middleware/wrapper');
const { postController } = require('../controller');

//Apis

//게시글 업로드
router.post(
    '/',
    checkLogin,
    body('title').trim().isLength({ min: 2, max: 40 }).withMessage('제목은 2~40자로 입력해주세요'),
    body('content')
        .trim()
        .isLength({ min: 2, max: 10000 })
        .withMessage('본문은 2~10000자로 입력해주세요'),
    handleValidationErrors,
    wrapper(postController.createPost)
);

//게시판 보기 (게시글 목록보기)
router.get('/all', checkLogin, wrapper(postController.getPostAllByGameIdx));

//게시글 상세보기
router.get('/:postidx', checkLogin, wrapper(postController.getPostByIdx));

//게시글 검색하기
router.get(
    '/search',
    checkLogin,
    query('title').trim().isLength({ min: 2 }).withMessage('2글자 이상입력해주세요'),
    wrapper(postController.searchPostByTitle)
);

//게시글 삭제하기
router.delete('/:postidx', checkLogin, wrapper(postController.deletepostByIdx));

module.exports = router;
