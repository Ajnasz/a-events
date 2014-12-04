var requirejs = require('requirejs');
var assert = require('chai').assert;
var sinon = require('sinon');

requirejs.config({
    baseUrl: '.',
    nodeRequire: require
});

suite('something', function () {
	var events, eventName;
	setup(function (done) {
		requirejs(['index'], function (mod) {
			events = mod;
			eventName = 'Foo' + Math.round(Math.random() * 1000) + 'Event';
			done();
		});
	});

	suite('base tests', function () {
		test('events should be an function', function () {
			assert.isFunction(events);
		});

		test('calling events, should return an object', function () {
			assert.isObject(events());
		});

		test('events object should have a emit method', function () {
			assert.isFunction(events().emit);
		});
		test('events object should have a emit on', function () {
			assert.isFunction(events().on);
		});
		test('events object should have a emit off', function () {
			assert.isFunction(events().off);
		});
	});

	suite('test on method', function () {
		suite('test event name type check', function () {
			test('passing string as event name should not throw error', function () {
				assert.doesNotThrow(function () {
					events().on(eventName);
				}, /Event name should be a string/);
			});
			test('passing null as event name should throw error', function () {
				assert.throws(function () {
					events().on(null);
				}, /Event name should be a string/);
			});
			test('passing object as event name should throw error', function () {
				assert.throws(function () {
					events().on({});
				}, /Event name should be a string/);
			});

			test('passing number as event name should throw error', function () {
				assert.throws(function () {
					events().on(12345);
				}, /Event name should be a string/);
			});
			test('passing undef as event name should throw error', function () {
				assert.throws(function () {
					var undef;
					events().on(undef);
				}, /Event name should be a string/);
			});
		});

		suite('test if event name is valid string', function () {
			test('passing empty name, should throw error', function () {
				assert.throws(function () {
					events().on('');
				}, /Event name should not be empty or only whitespace/);
			});

			test('passing only spaces, should throw error', function () {
				assert.throws(function () {
					events().on('   ');
				}, /Event name should not be empty or only whitespace/);
			});

			test('passing only tabs, should throw error', function () {
				assert.throws(function () {
					events().on('		');
				}, /Event name should not be empty or only whitespace/);
			});

			test('passing spaces and tabs, should throw error', function () {
				assert.throws(function () {
					events().on('		');
				}, /Event name should not be empty or only whitespace/);
			});
		});

		suite('test if callback is a valid function', function () {
			test('passing a function, should not throw', function () {
				assert.doesNotThrow(function () {
					events().on(eventName, function () {
					});
				});
			});
			test('passing a string, should throw', function () {
				assert.throws(function () {
					events().on(eventName, '');
				}, /Callback should be a function/);
			});
			test('passing a number, should throw', function () {
				assert.throws(function () {
					events().on(eventName, 12435);
				}, /Callback should be a function/);
			});
			test('passing null, should throw', function () {
				assert.throws(function () {
					events().on(eventName, null);
				}, /Callback should be a function/);
			});
			test('passing a object, should throw', function () {
				assert.throws(function () {
					events().on(eventName, {});
				}, /Callback should be a function/);
			});
			test('passing a undefined, should throw', function () {
				assert.throws(function () {
					var undef;
					events().on(eventName, undef);
				}, /Callback should be a function/);
			});
		});

		suite('test if callback returns valid listenerId', function () {
			test('listener id should be string', function () {
				assert.isString(events().on(eventName, function () {}));
			});

			test('listener id should start with the event name', function () {
				assert.match(events().on(eventName, function () {}), new RegExp('^' + eventName + '\\d+'));
			});
		});
	});

	suite('test emit method', function () {
		test('passing string as event name should not throw error', function () {
			assert.doesNotThrow(function () {
				events().emit(eventName);
			});
		});
		test('passing null as event name should throw error', function () {
			assert.throws(function () {
				events().emit(null);
			}, /Event name should be a string/);
		});
		test('passing number as event name should throw error', function () {
			assert.throws(function () {
				events().emit(12345);
			}, /Event name should be a string/);
		});
		test('passing object as event name should throw error', function () {
			assert.throws(function () {
				events().emit({});
			}, /Event name should be a string/);
		});
		test('passing undefined as event name should throw error', function () {
			assert.throws(function () {
				var undef;
				events().emit(undef);
			}, /Event name should be a string/);
		});
	});

	suite('test if emit calls callbacks', function () {
		var eventsObj, spy;
		setup(function () {
			eventsObj = events();

			spy = sinon.spy();

			eventsObj.on(eventName, spy);
		});
		teardown(function () {
			spy.reset();
		});
		test('callback should be called when call emit', function () {
			eventsObj.emit(eventName);

			sinon.assert.calledOnce(spy);
		});
		test('callback should not be called when emitting other event', function () {
			eventsObj.emit(eventName + 'a');

			sinon.assert.notCalled(spy);
		});
		test('callback should be called with passed arguments', function () {
			eventsObj.emit(eventName, 1);

			sinon.assert.calledWith(spy, 1);
		});

		test('callback should be called with passed arguments, even with more args', function () {
			var rand = Math.random();
			eventsObj.emit(eventName, 1, 2, rand, 4, 5);

			sinon.assert.calledWith(spy, 1, 2, rand, 4, 5);
		});

		test('callback should be called with passed object arguments', function () {
			var rand = {a: Math.random()};
			eventsObj.emit(eventName, 1, 2, rand, 4, 5);

			sinon.assert.calledWith(spy, 1, 2, rand, 4, 5);
		});

		test('callback should be called with passed falsy arguments', function () {
			var rand = {a: Math.random()};
			eventsObj.emit(eventName, 1, 2, rand, 4, false);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, false);
		});

		test('callback should be called with passed falsy arguments, (falsy not last)', function () {
			var rand = {a: Math.random()};
			eventsObj.emit(eventName, 1, 2, rand, 4, false, 5);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, false, 5);
		});

		test('callback should be called with passed null arguments', function () {
			var rand = {a: Math.random()};
			eventsObj.emit(eventName, 1, 2, rand, 4, null);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, null);
		});

		test('callback should be called with passed null arguments (null not last)', function () {
			var rand = {a: Math.random()};
			eventsObj.emit(eventName, 1, 2, rand, 4, null, 5);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, null, 5);
		});

		test('callback should be called with passed undefined arguments', function () {
			var rand = {a: Math.random()},
				undef;
			eventsObj.emit(eventName, 1, 2, rand, 4, undef);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, undef);
		});

		test('callback should be called with passed null arguments (null not last)', function () {
			var rand = {a: Math.random()},
				undef;
			eventsObj.emit(eventName, 1, 2, rand, 4, undef, 5);
			sinon.assert.calledWith(spy, 1, 2, rand, 4, undef, 5);
		});
	});

	suite('test if emit calls callbacks with predefined args', function () {
		var eventsObj, spy;
		setup(function () {
			eventsObj = events();

		});

		test('callback should be called with predefined arg', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, 1);
			eventsObj.emit(eventName);

			sinon.assert.calledWith(spy, 1);

			spy.reset();
		});
		test('callback should be called with more than 1 predefined arg', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, 1, 2, 3, 4);
			eventsObj.emit(eventName);

			sinon.assert.calledWith(spy, 1, 2, 3, 4);

			spy.reset();
		});
		test('callback should be called with array predefined arg', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, [1, 2, 3, 4]);
			eventsObj.emit(eventName);

			sinon.assert.calledWith(spy, [1, 2, 3, 4]);

			spy.reset();
		});
		test('callback should be called with array predefined arg', function () {
			spy = sinon.spy();

			var rand = Math.random();

			eventsObj.on(eventName, spy, [1, 2, 3, 4], rand);
			eventsObj.emit(eventName);

			sinon.assert.calledWith(spy, [1, 2, 3, 4], rand);

			spy.reset();
		});
	});

	suite('test if emit calls callbacks with predefined and passed args', function () {
		var eventsObj, spy;
		setup(function () {
			eventsObj = events();
		});

		test('callback should be called with predefined and passed args', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, 1);
			eventsObj.emit(eventName, 2);

			sinon.assert.calledWith(spy, 1, 2);

			spy.reset();
		});
		test('callback should be called with predefined and passed args, predefined array', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, [1, 2]);
			eventsObj.emit(eventName, 3);

			sinon.assert.calledWith(spy, [1, 2], 3);

			spy.reset();
		});
		test('callback should be called with predefined and passed args, passed array', function () {
			spy = sinon.spy();

			eventsObj.on(eventName, spy, 1);
			eventsObj.emit(eventName, [2, 3]);

			sinon.assert.calledWith(spy, 1, [2, 3]);

			spy.reset();
		});
	});

	suite('test off method', function () {
		var eventsObj;

		setup(function () {
			eventsObj = events();
		});

		test('if giving id, only the callback with id should be removed', function () {
			var spy1 = sinon.spy(),
				spy2 = sinon.spy(),
				evid1, evid2;

			evid1 = eventsObj.on(eventName, spy1);
			evid2 = eventsObj.on(eventName, spy2);

			eventsObj.off(eventName, evid2);
			eventsObj.emit(eventName);

			sinon.assert.calledOnce(spy1);
			sinon.assert.notCalled(spy2);
		});

		test('if not giving id, all of the callback for the event should be removed', function () {
			var spy1 = sinon.spy(),
				spy2 = sinon.spy(),
				evid1, evid2;

			evid1 = eventsObj.on(eventName, spy1);
			evid2 = eventsObj.on(eventName, spy2);

			eventsObj.off(eventName);
			eventsObj.emit(eventName);

			sinon.assert.notCalled(spy1);
			sinon.assert.notCalled(spy2);
		});
	});

	suite('test inherited objects', function () {
		test('inherited obejct should have on method', function () {
			var obj = Object.create(events());

			assert.isFunction(obj.on);
		});
		test('inherited obejct should have off method', function () {
			var obj = Object.create(events());

			assert.isFunction(obj.off);
		});
		test('inherited obejct should have emit method', function () {
			var obj = Object.create(events());

			assert.isFunction(obj.emit);
		});

		test('Calling emit from object function should emit on object\'s context', function () {
			var obj, spy;
			obj = Object.create(events(), {
				foo: {
					value: function () {
						this.emit(eventName);
					}
				}
			});

			spy = sinon.spy();

			obj.on(eventName, spy, 1);

			obj.foo(2);

			sinon.assert.calledOn(spy, obj);
		});
		test('Calling emit from objects function should keep argument order', function () {
			var obj, spy;
			obj = Object.create(events(), {
				foo: {
					value: function (arg) {
						this.emit(eventName, arg);
					}
				}
			});

			spy = sinon.spy();

			obj.on(eventName, spy, 1);

			obj.foo(2);

			sinon.assert.calledWith(spy, 1, 2);
		});
	});

	suite('Test old school prototype inheritance', function () {
		test('inherited obejct should have on method', function () {
			function Foo() {}
			Foo.prototype = events();
			var obj = new Foo();

			assert.isFunction(obj.on);
		});
		test('inherited obejct should have off method', function () {
			function Foo() {}
			Foo.prototype = events();
			var obj = new Foo();

			assert.isFunction(obj.off);
		});
		test('inherited obejct should have emit method', function () {
			function Foo() {}
			Foo.prototype = events();
			var obj = new Foo();

			assert.isFunction(obj.emit);
		});

		test('Calling emit from object function should emit on object\'s context', function () {
			function Foo() {}
			Foo.prototype = events();
			Foo.prototype.foo = function () {
				this.emit(eventName);
			};
			var obj, spy;
			obj = new Foo();

			spy = sinon.spy();

			obj.on(eventName, spy, 1);

			obj.foo(2);

			sinon.assert.calledOn(spy, obj);
		});
		test('Calling emit from objects function should keep argument order', function () {
			function Foo() {}
			Foo.prototype = events();
			Foo.prototype.foo = function (arg) {
				this.emit(eventName, arg);
			};
			var obj, spy;

			obj = new Foo();

			spy = sinon.spy();

			obj.on(eventName, spy, 1);

			obj.foo(2);

			sinon.assert.calledWith(spy, 1, 2);
		});
	});

});
