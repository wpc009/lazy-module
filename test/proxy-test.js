'use strict';
var assert = require('assert'),
	util = require('util'),
	lazyModule = require('../lib/lazy-module');

suite('Lazy initialization with Proxy Test', function() {

	function OB1() {
		this.nonFunc = 1;
		return lazyModule.call(this);
	};

	util.inherits(OB1, lazyModule);
	// the proxied function must be an async function. (return nothing, having an callback)
	OB1.prototype.func1 = function(callback) {
		var str = "I'm func1";
		callback(str);
	};

	OB1.prototype.func2 = function() {
		return "I'm func2, return an string";
	};

	

	test(':lazy initialization with queued func1 calls', function(done) {

		var obj = new OB1();
		//assert.equal(obj._ready,false,'obj should be unready!');
		var calledImmediately = true;

		obj.func1(function() {
			done();
		});
		calledImmediately = false;
		process.nextTick(function() {
			obj.emit('ready');
		});
	});

	test(':cached proxy function handler', function(done) {
		var a = new OB1();
		var func = a.func1;
		var calledImmediately = false;
		a.emit('ready');
		func(function() {
			calledImmediately = true;
		});
		assert.equal(calledImmediately,true, 'func should not be queued');
		done();
	});


	test(':queued async function call should follow FIFO ', function(done) {
		var a = new OB1();
		var ct = 0;
		a.func1(function() {
			assert.equal(ct++, 0, ' shuold be 1st');
		});
		a.func1(function() {
			assert.equal(ct++, 1, ' shuold be 2nd');
		});
		a.func1(function() {
			assert.equal(ct++, 2, ' shuold be 3rd');
		});

		a.emit('ready');
		done();
	});


	test(':exception raised from the callback', function(done) {
		var a = new OB1();
		a.func1(); // call async function without callback , will raise a undefined callback exception
		a.emit('ready');
		assert.equal(a._queue.length,0,' the _cleanQueue chain stopped unexpectly caused by errors in callback');
		done();
	});
});