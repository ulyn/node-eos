function Filter(){}
/**
 * 请求调用之前
 * @param req RequestProtocol
 * @param res ResponseProtocol
 * @param fc FilterChain
 */
Filter.prototype.before = function(req, res,fc) {
    fc.doFilter(req,res);//remember !!! call this method in order to call next filter
}
/**
 * 请求调用之后
 * @param req
 * @param res
 * @param fc
 */
Filter.prototype.after = function(req,res,fc){
    fc.doFilter(req,res);//remember !!! call this method in order to call next filter
}
module.exports = Filter;