function Filter(){}
/**
 * doFiler
 * @param req RequestProtocol
 * @param res ResponseProtocol
 * @param fc FilterChain
 */
Filter.prototype.doFilter = function(req, res,fc) {
    fc.doFilter(req,res);//remember !!! call this method in order to call next filter
}
module.exports = Filter;