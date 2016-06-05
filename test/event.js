let expect = require('chai').expect;
let Event = require('../src/event/index');

describe('Event', function() {
	it('should exist', function() {
		expect(Event).not.to.be.undefined;
	});

	describe('constructor', function() {
		it('should be able to be instantiated', function() {
			let e = new Event();
			expect(e).to.be.an.instanceof(Event);
		});
	});

	describe('on', function() {
		it('should have an on method', function() {
			let e = new Event();
			expect(e.on).to.be.a('function');
		});
		it('should throw an error if the first argument is not a string', function() {
			let e = new Event();
			expect(function(){ e.on(); }, 'no first argument').to.throw('Event.on requires a string eventName');
			expect(function(){ e.on(5); }, 'number first argument').to.throw('Event.on requires a string eventName');
			expect(function(){ e.on(null); }, 'null first argument').to.throw('Event.on requires a string eventName');
		});
		it('should throw an error if the second argument is not a function', function() {
			let e = new Event();
			expect(function(){ e.on('evt_name'); }, 'no second argument').to.throw('Event.on requires a function callback');
			expect(function(){ e.on('evt_name', 5); }, 'number second argument').to.throw('Event.on requires a function callback');
			expect(function(){ e.on('evt_name', null); }, 'null second argument').to.throw('Event.on requires a function callback');
			expect(function(){ e.on('evt_name', 'test'); }, 'string second argument').to.throw('Event.on requires a function callback');
		});

		it('should work if both arguments are correct', function() {
			let e = new Event();
			expect(function(){ e.on('evt_name', () => {}); }).not.to.throw();
		});

		it('should return a numeric id', function() {
			let e = new Event();
			expect(e.on('evt_name', () => {})).to.be.a('number');
		});
	});

	describe('trigger', function() {
		it('should have a trigger method', function() {
			let e = new Event();
			expect(e.trigger).to.be.a('function');
		});
		it('should throw an error if the first argument is not a string', function() {
			let e = new Event();
			expect(function(){ e.trigger(); }, 'no first argument').to.throw('Event.trigger requires a string eventName');
			expect(function(){ e.trigger(5); }, 'number first argument').to.throw('Event.trigger requires a string eventName');
			expect(function(){ e.trigger(null); }, 'null first argument').to.throw('Event.trigger requires a string eventName');
		});

		it('should cause all event handlers to run', function(done) {
			let e = new Event();
			let numTriggers = 0;
			e.on('evt_name', () => {
				numTriggers++;
				if(numTriggers >= 2) {
					done();
				}
			});

			e.on('evt_name', () => {
				numTriggers++;
				if(numTriggers >= 2) {
					done();
				}
			});

			e.trigger('evt_name');
		});

		it('should pass through the event object', function(done) {
			let evtObj = { foo: 'bar', baz: 7 };
			let e = new Event();
			e.on('evt_name', (data) => {
				expect(data).to.deep.equal(evtObj);
				done();
			});
			e.trigger('evt_name', evtObj);
		});

		it('should not trigger irrelevant events', function(done) {
			let e = new Event();
			e.on('evt_name', (data) => {
				setTimeout(done, 50);
			});
			e.on('irrelevant', (data) => {
				expect(true, 'irrelevant event ignored').to.equal(false);
				done();
			});
			e.trigger('evt_name', {});
		});
	});

	describe('off', function() {
		it('should have an off method', function() {
			let e = new Event();
			expect(e.off).to.be.a('function');
		});

		it('should throw an error if the first argument is not a string or number', function() {
			let e = new Event();
			expect(function() { e.off(); }, 'no first argument').to.throw('Event.off requires an id or eventName & optional callback');
			expect(function() { e.off(false); }, 'boolean first argument').to.throw('Event.off requires an id or eventName & optional callback');
			expect(function() { e.off({}); }, 'object first argument').to.throw('Event.off requires an id or eventName & optional callback');
			expect(function() { e.off(null); }, 'null first argument').to.throw('Event.off requires an id or eventName & optional callback');
		});

		it('should work if just a number is passed in', function() {
			let e = new Event();
			expect(function() { e.off(1); }).not.to.throw();
		});

		it('should work if just a string is passed in', function() {
			let e = new Event();
			expect(function() { e.off('evt_name'); }).not.to.throw();
		});

		it('should work if a string and function are passed in', function() {
			let e = new Event();
			function handler() {}
			expect(function() { e.off('evt_name', handler); }).not.to.throw();
		});

		it('should not cause handlers to run after off is called with a single string', function(done) {
			let e = new Event();
			function dontRun1() {
				expect(false, 'don\'t run removed handler 1').to.equal(true);
				done();
			}
			function dontRun2() {
				expect(false, 'don\'t run removed handler 2').to.equal(true);
				done();
			}
			e.on('evt_name', dontRun1);
			e.on('evt_name', dontRun2);
			e.off('evt_name');
			e.trigger('evt_name');
			setTimeout(done, 50);
		});

		it('should not cause handlers to run after off is called with a single number', function(done) {
			let e = new Event();
			function dontRun() {
				expect(false, 'don\'t run removed handler').to.equal(true);
				done();
			}
			function run() {
				setTimeout(done, 50);
			}
			let id = e.on('evt_name', dontRun);
			e.on('evt_name', run);
			e.off(id);
			e.trigger('evt_name');
		});

		it('should not cause handlers to run after off is called with a string and function', function(done) {
			let e = new Event();
			function dontRun() {
				expect(false, 'don\'t run removed handler').to.equal(true);
				done();
			}
			function run() {
				setTimeout(done, 50);
			}
			e.on('evt_name', dontRun);
			e.on('evt_name', run);
			e.off('evt_name', dontRun);
			e.trigger('evt_name');
		});
	});
});