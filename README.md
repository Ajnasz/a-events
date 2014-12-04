# a-events

Event handler javascript library

# Usage

## Object.create

```javascript
require(['events'], function (events) {
	var object = Object.create(events(), {
			emitter: {
				value: function () {
					this.emit('aEvent', arg1, arg2, arg3);
				}
			}
	});

	object.on('aEvent', function (argPredefined, arg1, arg2, arg3) {
		console.log(argPredefined, arg1, arg2, arg3);
	}, argPredefined);

	object.emitter();
});
```

## Old prototype

```javascript
require(['events'], function (events) {
	function Foo() {}
	Foo.prototype = events();
	Foo.prototype.emitter = function () {
		this.emit('aEvent', arg1, arg2, arg3);
	};
	var object = new Foo();
	object.on('aEvent', function (argPredefined, arg1, arg2, arg3) {
		console.log(argPredefined, arg1, arg2, arg3);
	}, argPredefined);

	object.emitter();
});
```
