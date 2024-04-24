module.exports = class PostRepository {
    /**
     * @type {import('pg').Pool}
     */
    pool;

    /**
     * @param {import('pg').Pool} pool
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * 게시글 업로드
     * @param {number} userIdx
     * @param {number} gameIdx
     * @param {CreateDao} createDao
     * @param {import('pg').PoolClient | undefined} conn
     * @returns {Promise<Post | null>}
     */
    async insert(userIdx, gameIdx, createDto, conn = this.pool) {
        const queryResult = await conn.query(
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
        return queryResult.rows[0];
    }

    /**
     * 게시판 보기 (게시글 목록보기)
     * @param {number} gameIdx 가져올 게시판 인덱스
     * @param {GetDao} getDao
     * @param {{
     *   page: number,
     *   maxPage: number,
     *   totalPosts: number,
     *   offset: number,
     *   length: number
     * }} meta
     * @returns {Promise<PostList[]>}
     */
    async select(getDao, conn = this.pool) {
        const queryResult = await conn.query(
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
                20
            OFFSET
                ($2 - 1) * 10`,
            [gameIdx, getDao.page]
        );
        return queryResult.rows;
    }

    /**
     * 전체 게시글 수 불러오기
     * @param {number} gameIdx 가져올 게시판 인덱스
     * @param {GetDao} getDao
     * @param {
     *   totalPosts: number,
     * } meta
     * @returns {Promise<PostList[]>}
     */
    async select(gameIdx, getDao, conn = this.pool) {
        // totalposts를 가져오는 별도의 쿼리
        const queryResult = await conn.query(
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
        return queryResult.rows[0];
    }
    // meta: {
    //     page,
    //     maxPage: Math.ceil(totalPostsResult.rows[0].totalPosts / postsPerPage),
    //     offset: (page - 1) * postsPerPage,
    //     length: result.rows.length,
    // }

    /**
     * 게시글 상세보기
     * @param {number} postIdx 가져올 게시글 인덱스
     * @param {GetDao} getDao
     * @returns {Promise<Post>}
     */
    async select(postIdx, getDao, conn = this.pool) {
        const queryResult = await conn.query(
            `SELECT
                post.title,
                post.content,
                post.created_at AS "createdAt",
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
    }

    /**
     * 게시글 조회수 반영하기
     * @param {*} postIdx
     * @param {*} userIdx
     * @returns {Promise<Void>}
     */
    async insert(postIdx, userIdx, conn = this.pool) {
        await pool.query(
            `INSERT INTO view
                (post_idx, user_idx)
            VALUES
                ($1, $2)`,
            [postIdx, userIdx]
        );
        return;
    }

    /**
     * 게시글 검색하기
     * @param {*} searchDto
     */
    async select(searchDto, conn = this.pool) {
        const offset = (page - 1) * 7;
        //20개씩 불러오기
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
        // }
        // const length = data.rows.length;
        // res.status(200).send({
        //     data: data.rows,
        //     page,
        //     offset,
        //     length,
        // });
        // } catch (err) {
        // return next(err);
    }
};
