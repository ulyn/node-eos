var assert = require("assert");
var Filter = require("./base_filter");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var CallFilter = require('./call_filter');

function FilterChain(){
    this.list = [];
    this.index = 0;//是否结束的标志
    this.before = true;//当前过滤阶段，before和after
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
//    console.info(this.before?"before":"after",filter.constructor.name);
    this.index ++;
    if(this.before){
        filter.before(req, res, this);
    }else{
        filter.after(req, res, this);
    }
}
FilterChain.prototype.finish = function(req,res){
    if(this.before){
        this.before = false;
        this.index = 0;//重置索引，并剔除最后一个CallFilter继续doAfter
        if(this.list.length > 0){
            if(this.list[0] instanceof CallFilter){
                this.list.pop();
            }
            this.list.reverse();
        }
        this.doFilter(req,res);
    }else{
        this.emit("finish",req,res);
//        console.info("finish");
    }
}
module.exports = FilterChain;