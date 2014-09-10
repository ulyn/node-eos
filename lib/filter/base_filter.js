function Filter(){}
/**
 * doFiler
 * @param req RequestProtocol
 * @param res ResponseProtocol
 * @param fc FilterChain
 */
Filter.prototype.doFilter = function(req, res,fc) {
    fc.doFilter(req,res);
}
module.exports = Filter;