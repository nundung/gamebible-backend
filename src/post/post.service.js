const { pool } = require('../config/postgres');
const { NotFoundException, ForbiddenException } = require('../modules/Exception');
const CreateDto = require('./dto/createPost.dto');
const GetDto = require('./dto/getPost.dto');
const SearchDto = require('./dto/searchPost.dto');
const PostRepository = require('./post.repository');
const PostEntity = require('./post.entity');

/**
 * @typedef {Omit<PostEntity, 'content'>} SelectPost
 */

module.exports = class PostService {
    postRepository;

    /**
     * @param {PostRepository} postRepository
     */
    constructor(postRepository) {
        this.postRepository = postRepository;
    }

    /**
     * 게시글 업로드
     * @param {number} userIdx
     * @param {number} gameIdx
     * @param {CreateDto} createDto
     * @returns {Promise<PostEntity>}
     */
    async createPost(userIdx, gameIdx, createDto) {
        const post = await this.postRepository.insert(userIdx, gameIdx, {
            title: createDto.title,
            content: createDto.content,
        });

        return PostEntity.postEntity(post);
    }

    /**
     * 게시판 보기 (게시글 목록보기)
     * @param {number} gameIdx 가져올 게시판 인덱스
     * @param {GetDto} getDto
     * @returns {Promise<{
     *  postList: SummaryPost[],
     *  meta: {page: number,
     *      maxPage: number,
     *      totalPosts: number,
     *      offset: number,
     *      length: number},
     * }>}
     */
    getPostByGameIdx = async (gameIdx, getDto) => {
        const postList = await this.postRepository.select(gameIdx, {
            page: getDto.page,
        });
        return postList.map((post) => PostEntity.postEntity(post));
    };

    /**
     * 게시글 상세보기
     * @param {number} postIdx 가져올 게시글 인덱스
     * @returns {Promise<Post>}
     */
    getPostByIdx = async (postIdx, conn = pool) => {
        const post = await this.postRepository.select(postIdx);
        return PostEntity.postEntity(post);
    };

    /**
     * 게시글 조회수 반영하기
     * @param {number} postIdx
     * @param {number} userIdx
     * @returns {Promise<void>}
     */
    increasePostViewByIdx = async (postIdx, userIdx, conn = pool) => {
        const post = await this.postRepository.select(postIdx, userIdx);
        return PostEntity.postEntity(post);
    };

    /**
     * 게시글 검색하기
     * @param {{
     *  title: string,
     *  page: string,
     * }} searchDto
     * @returns {Promise<{
     *  posts: SummaryPost[],
     *  meta: {
     *   page: number,
     *   maxPage: number,
     *   totalPosts: number,
     *   offset: number,
     *   length: number},
     * }>}
     */
    searchPostByTitle = async (searchDto) => {
        const postList = await this.postRepository.insert(searchDto);
        return postList.map((post) => PostEntity.postEntity(post));
    };

    /**
     * 게시글 삭제하기
     * @param {number} postIdx
     * @param {number} userIdx
     * @returns {Promise<void>}
     */
    deletePost = async (postIdx, userIdx) => {
        const post = await getPostByIdx(postIdx);

        if (post.author.idx !== userIdx) {
            throw new ForbiddenException('Permission denied');
        }

        await pool.query(`UPDATE post SET deleted_at = NOW() WHERE idx = $1`, [postIdx]);

        return;
    };
};
