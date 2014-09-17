var util   = require('util');
var assert = require('assert');

// All error codes.
var CODES = {
    REMOTE_SERVER_EXCEPTION : -2,
    NETWORK_PACKAGE_EXCEPTION : -1,
    UNKNOWN_EXCEPTION : 0,
    NETWORK_EXCEPTION : 1,
    TIMEOUT_EXCEPTION : 2,
    CONNECT_EXCEPTION : 3,
    MOCK_EXCEPTION : 4,
    FORBIDDEN_EXCEPTION : 5,
    SERIALIZATION_EXCEPTION : 6,
    SERVICE_NO_FOUND_EXCEPTION : 7,
    DEBUG_SERVER_OUTLINE_EXCEPTION : 8,
    REFLECT_INVOKE_EXCEPTION : 9
};

/**
 * Check if the given error code is a valid code, throw an error if the
 * code is not supported.
 *
 * @method validateCode
 * @param code {Number} The error code to be checked.
 */
function validateCode(code) {
    assert(typeof code === 'number', 'code must be a number.');

    var defined = Object.keys(CODES).some(function (name) {
        return CODES[name] === code;
    });

    if (!defined) {
        throw new Error('Unknown code: ' + code);
    }
}

/**
 * Exception class for all errors.
 *
 * @class Exception
 * @constructor
 * @private
 * @param code {Number} Exception code.
 * @param msg {String} msg of the exception.
 * @param ctor {String} The function to start in stack trace.
 */
function Exception(code, msg,ctor) {
    validateCode(code);
    var name,
        i = 0,
        keys = Object.keys(CODES);

    while (i < keys.length) {
        if (CODES[keys[i]] === code) {
            name = keys[i];
            break;
        }

        i += 1;
    }
    this.name = name;

    assert(typeof ctor === 'function', 'ctor must be a function.');

    Error.captureStackTrace(this, ctor || Exception);
    this.code = code;
    this.msg = msg;
}

util.inherits(Exception, Error);

/**
 * Return the code of the Exception.
 *
 * @method getCode
 * @return {Number} The code.
 */
Exception.prototype.getCode = function () {
    return this.code;
};

/**
 * Return the name of the Exception.
 *
 * @method getName
 * @return {String} The name.
 */
Exception.prototype.getName = function () {
    return this.name;
};
/**
 * Return the name of the Exception.
 *
 * @method getMessage
 * @return {String} The msg.
 */
Exception.prototype.getMessage = function () {
    return this.msg;
};


/**
 *
 * @method toString
 * @return {String} The readable form of the exception.
 */
Exception.prototype.toString = function () {
    return 'Exception: ' + this.name + '[' + this.code + ']' + this.msg;
};

/**
 * The factory method to create an instance of Exception.
 *
 * @method create
 * @param code {Number} Exception code.
 * @param msg {String} msg of the exception, optional.
 */
function create(code,msg) {
    validateCode(code);
    return new Exception(code, msg, create);
}

module.exports = Exception;
module.exports.create = create;

/**
 * Expose all the error codes.
 */
Object.keys(CODES).forEach(function (key) {
    module.exports[key] = CODES[key];
});

