'use strict';
var events = require('events'),
    util = require('util'),
    Reflect = require('harmony-reflect');

var asyncFuncProxy = {
    get: function(target, name, receiver) {
        //only async functions, need callback
        // can not proxy emit function
        var value = Reflect.get(target, name, receiver);
        if (LAZY.prototype.hasOwnProperty(name) || events.EventEmitter.prototype.hasOwnProperty(name) || Object.prototype.hasOwnProperty(name)) return value;
        if (typeof value === 'function') {
            if (target._ready && target._queue.length === 0) {
                return value;
            } else {
                return function() {
                    var args = arguments;
                    var self = this;
                    //check current state of obj
                    if (target._ready && target._queue.length === 0 && !target._cleaning) {
                        value.apply(self, args);
                    } else {
                        target._enqueue(function() {
                            value.apply(self, args);
                        });
                    }
                };
            }
        } else return value;

    }
};

var LAZY = function() {
        events.EventEmitter.call(this);
        this.once('ready', this._onReady.bind(this));
        return this._init();
    };

util.inherits(LAZY, events.EventEmitter);

LAZY.prototype._ready = false;

LAZY.prototype._cleaning = false;

LAZY.prototype._queue = [];

LAZY.prototype.hello = function() {
    return 'hello world!';
};

LAZY.prototype._enqueue = function(job) {
    this._queue.push(job);
};

LAZY.prototype._onReady = function(evt) {
    this._ready = true;
    if (this._queue.length > 0) {
        this._cleaning = true;
        this._cleanQueue();
    }
};

LAZY.prototype._cleanQueue = function() {
    var job = this._queue.shift();
    if (job && typeof job == 'function') {
        try {
            job();
        } catch (err) {
            //ignore uncaught exceptions;
        }
    }
    if (this._queue.length !== 0) process.nextTick(this._cleanQueue.bind(this));
    else this._cleaning = false;
};

LAZY.prototype._init = function() {
    return Reflect.Proxy(this, asyncFuncProxy);
};

module.exports = LAZY;