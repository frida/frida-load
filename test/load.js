'use strict';

/* global describe, before, after, afterEach, gc, it */

var data = require('./data');
var frida = require('frida');
var load = require('..');
var should = require('should');
var spawn = require('child_process').spawn;

describe('Load', function () {
  var target;
  var session;

  before(function () {
    target = spawn(data.targetProgram, [], {
      stdio: 'inherit'
    });
    return frida.attach(target.pid)
    .then(function (s) {
      session = s;
    });
  });

  after(function () {
    target.kill('SIGKILL');
  });

  it('should support loading a common-js module', function (done) {
    var script, exp;

    load(require.resolve('./cjs'))
    .then(function (source) {
      return session.createScript(source);
    })
    .then(function (s) {
      script = s;
      return script.load();
    })
    .then(function () {
      return script.getExports();
    })
    .then(function (e) {
      exp = e;
      return exp.add(5, 2);
    })
    .then(function (result) {
      result.should.equal(7);
      return exp.match('bar.foo', '*.foo');
    })
    .then(function (result) {
      result.should.equal(true);
      script.events.listen('message', function (message) {
        message.type.should.equal('error');
        message.description.should.equal('Error: Oops!');
        message.stack.should.equal('Error: Oops!\n    at index.js:15:13');
        message.fileName.should.equal('index.js');
        message.lineNumber.should.equal(15);
        message.columnNumber.should.equal(13);
        done();
      });
      return exp.crashLater();
    })
    .catch(function (error) {
      console.error(error.message);
    });
  });
});
