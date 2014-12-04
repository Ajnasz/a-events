define(function () {
	function toArray(arg) {
		return Array.prototype.slice.call(arg);
	}

	function isArray(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	}

	var uniqueId = (function () {
		var id = 0;

		return function (prefix) {
			return (prefix || '') + String(++id);
		};
	}());

	return function () {
		var listeners = {};

		return Object.create({
			emit: function emit (ev) {
				if (typeof ev !== 'string') {
					throw new TypeError('Event name should be a string');
				}

				var emitArgs = toArray(arguments).slice(1),
					context = this;

				if (listeners[ev]) {
					Object.keys(listeners[ev]).forEach(function (key) {
						var listener = listeners[ev][key],
							args;

						if (!listener) { // deleted listener
							return;
						}
						args = isArray(listener.args) ? listener.args : [];

						listener.cb.apply(context, args.concat(toArray(emitArgs)));
					});
				}
			},
			on: function (ev, cb) {
				var listenerId, args;

				if (typeof ev !== 'string') {
					throw new TypeError('Event name should be a string');
				}

				if (ev.trim() === '') {
					throw new TypeError('Event name should not be empty or only whitespace');
				}

				if (typeof cb !== 'function') {
					throw new TypeError('Callback should be a function');
				}

				args = toArray(arguments).slice(2);

				if (!listeners[ev]) {
					listeners[ev] = {};
				}

				listenerId = uniqueId(ev);

				listeners[ev][listenerId] = {
					cb: cb,
					args: args
				};

				return listenerId;
			},

			off: function (ev, id) {
				if (id) {
					listeners[ev][id] = null;
				} else {
					listeners[ev] = null;
				}
			}
		});
	};
});
