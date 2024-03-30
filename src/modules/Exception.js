class Exception {
    status;
    message;

    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}

class BadRequestException extends Exception {
    constructor(message) {
        super(400, message);
    }
}

class UnauthorizedException extends Exception {
    constructor(message) {
        super(401, message);
    }
}

class ForbiddenException extends Exception {
    constructor(message) {
        super(403, message);
    }
}

class NotFoundException extends Exception {
    constructor(message) {
        super(404, message);
    }
}

class InternalServerErrorException extends Exception {
    constructor(message) {
        super(500, message);
    }
}

module.exports = {
    Exception,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    InternalServerErrorException,
};
