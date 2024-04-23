const PostEntity = require('./post.entity');
const UserEntity = require('../auth/entity/user.entity');
const CreatePostDto = require('./dto/createPost.dto');
const GetPostDto = require('./dto/getPost.dto');
const SearchPostDto = require('./dto/searchPost.dto');
const PostService = require('./post.service');

module.exports = class PostController {
    postService;

    /**
     * @param {PostService} postService
     */
    constructor(postService) {
        this.postService = postService;
    }

    //게시글 업로드
    createPost = async (req, res) => {
        const userIdx = UserEntity.userEntity(req.decoded.userIdx);
        const gameIdx = PostEntity.postEntity(req.query.gameIdx);
        const createDto = CreatePostDto.createPostDto({
            title: req.query.title,
            content: req.query.content,
        }); // createDto 객체 생성 및 설정

        // service
        await this.postService.createPost(userIdx, gameIdx, createDto);
        res.status(201).end();
    };

    //게시판 보기 (게시글 목록보기)
    getPosByGameIdx = async (req, res) => {
        const gameIdx = UserEntity.userEntity(req.decoded.gameIdx);
        const getDto = GetPostDto.getPostDto({
            page: req.query.page,
        }); // getDto 객체 생성 및 설정

        // service
        const postList = await this.postService.getPostByGameIdx(gameIdx, getDto);
        if (!result.posts) {
            res.status(204);
        } else {
            res.status(200).send(postList);
        }
    };

    //게시글 상세보기
    getPostByIdx = async (req, res, next) => {
        const userIdx = UserEntity.userEntity(req.decoded.userIdx);
        const postIdx = req.params.postidx;
        const conn = await pool.connect();
        try {
            await conn.query('BEGIN');

            // service
            const post = await this.postService.getPostByIdx(postIdx, conn);
            await this.postService.increasePostViewByIdx(postIdx, userIdx, conn);
            await conn.query('COMMIT');
            res.status(200).send({ data: post });
        } catch (err) {
            await conn.query('ROLLBACK');
            return next(err);
        } finally {
            conn.release();
        }
    };

    //게시글 검색하기
    searchPostByTitle = async (req, res) => {
        const searchDto = SearchPostDto.searchPostDto({
            page: req.query.page,
            title: req.query.title,
        });

        // service
        const postList = await this.postService.searchPostByTitle(searchDto);

        res.status(200).send(postList);
    };

    //게시글 삭제하기
    deletePost = async (req, res) => {
        const postIdx = PostEntity.postEntity(req.params.postidx);
        const userIdx = UserEntity.userEntity(req.decoded.userIdx);

        // service
        await this.postService.deletePost(postIdx, userIdx);

        res.status(200).end();
    };
};
