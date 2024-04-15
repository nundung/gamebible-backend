module.exports = class PostController {
    postService;

    /**
     * @param {PostService} postService
     */
    constructor(postService) {
        this.postService = postService;
    }

    //게시글 업로드
    async createPost(req, res, next) {
        const gameIdx = req.query.gameidx;
        const userIdx = req.decoded.userIdx;
        const { title, content } = req.body;
        const createDto = { title, content };

        // service
        await createPost(userIdx, gameIdx, createDto);

        // controller
        res.status(201).end();
    }

    //게시판 보기 (게시글 목록보기)
    async getPostAllByGameIdx(req, res, next) {
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
    }

    //게시글 상세보기
    async getPostByIdx(req, res, next) {
        const postIdx = req.params.postidx;
        const userIdx = req.decoded.userIdx;

        const post = await getPostByIdx(postIdx);

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
            return next(err);
        } finally {
            conn.release();
        }
    }

    //게시글 검색하기
    async searchPostByTitle(req, res, next) {
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

    //게시글 삭제하기
    async deletePostByIdx(req, res, next) {
        const postIdx = req.params.postidx;
        const loginUser = req.decoded;

        const post = await getPostByIdx(postIdx);

        if (post.user_idx !== loginUser.userIdx) {
            throw new ForbiddenException('권한이 없습니다.');
        }

        await deletePostByIdx(postIdx);

        res.status(200).send();
    }
};
