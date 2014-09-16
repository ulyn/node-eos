var util   = require('util');
var assert = require('assert');

// All error codes.
var CODES = {
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
 * @param name {String} Name of the exception.
 * @param path {String} Node path of the exception, optional.
 * @param ctor {String} The function to start in stack trace.
 */
function Exception(code, name, path, ctor) {
    if (!ctor) {
        ctor = path;
        path = undefined;
    }

    validateCode(code);
    assert(
        name && typeof name === 'string',
        'name must be a non-empty string.'
    );
    assert(typeof ctor === 'function', 'ctor must be a function.');

    Error.captureStackTrace(this, ctor || Exception);
    this.code = code;
    this.name = name;
    this.path = path;

    this.message = 'Exception: ' + name + '[' + code + ']';

    if (path) {
        this.message += '@' + path;
    }
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
 * Return the path of the Exception.
 *
 * @method getPath
 * @return {String} The path.
 */
Exception.prototype.getPath = function () {
    return this.path;
};

/**
 *
 * @method toString
 * @return {String} The readable form of the exception.
 */
Exception.prototype.toString = function () {
    return 'Exception: ' + this.name + '[' + this.code + ']';
};

/**
 * The factory method to create an instance of Exception.
 *
 * @method create
 * @param code {Number} Exception code.
 * @param path {String} Node path of the exception, optional.
 */
function create(code, path) {
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

    return new Exception(code, name, path, create);
}

module.exports = Exception;
module.exports.create = create;

/**
 * Expose all the error codes.
 */
Object.keys(CODES).forEach(function (key) {
    module.exports[key] = CODES[key];
});

