const wrapper = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (err) {
            return next(err);
        }
    };
};

module.exports = wrapper;
