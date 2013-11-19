lazy-module
===========

Lazy module for nodejs.

Any class that inherit from `LAZY` class will be lazy. All of it's function call will be delayed until it recieve a 'ready' event.


Usage
============
`var LAZY = require('lazy-module');
 var util = require('util');
function Example (){
   this.someProperty = 1;
   return LAZY.call(this); // call super constructor, it will return a proxy object;
}

util.inherits(Example,LAZY); // inherit LAZY

Example.prototype.AsyncFunc = function(callback) {
  console.log('in asyncfunc');
  //do some thing;

  //call callback maybe
  
  callback();
  //can not guarantee the return value, it may be ignored by the proxy.
};
// since the function call will be delayed, some the async function should not have any return value.

var a = new Example();

a.AsyncFunc(function callback(){});// at the point, a is not ready yet. So, this call will be queued
console.log('function call be delaied');
......

a.emit('ready');
//a is ready now!
//after the a recieve a 'ready' event, it will be ready to be functional. All the delaied calls in queue will be executed in order.
//When the queue is empty, all it function calls will be execute immediately. Before that it still apend to the queue.
stdout->function call be delaied\n 
        in asyncfunc\n
`



