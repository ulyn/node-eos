var assert = require("assert");
var Filter = require("./base_filter");
var util = require("util");
var EventEmitter = require('events').EventEmitter;

function FilterChain(){
    this.list = [];
    this.index = 0;
}
util.inherits(FilterChain, EventEmitter);
FilterChain.prototype.addFilter = function(filter){
    assert.ok(filter instanceof Filter,"please add instance of class Filter ");
    this.list.push(filter);
    return this;
}
FilterChain.prototype.doFilter = function(req, res) {
    if(this.index == this.list.length){
        this.finish(req,res);
        return;
    }
    var filter = this.list[this.index];
    this.index ++;
    filter.doFilter(req, res, this);
}
FilterChain.prototype.finish = function(req,res){
    this.emit("finish",req,res);
}
module.exports = FilterChain;