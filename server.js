const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const accountApi = require('./src/routers/account');
const gameApi = require('./src/routers/game');
const postApi = require('./src/routers/post');
const commentApi = require('./src/routers/comment');
const adminApi = require('./src/routers/admin');
const { Exception } = require('./src/modules/Exception');

app.use('/account', accountApi);
app.use('/game', gameApi);
app.use('/post', postApi);
app.use('/comment', commentApi);
app.use('/admin', adminApi);

app.use((req, res, next) => {
    next({ status: 404, message: 'API 없음' });
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof Exception) {
        return res.status(err.status).send({
            message: err.message,
        });
    }

    res.status(500).send({
        message: 'Server Error',
    });
});

app.listen(process.env.HTTP_PORT, () => {
    console.log(`${process.env.HTTP_PORT}번 포트번호 서버실행`);
});
