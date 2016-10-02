const expect = require('chai').expect;
const storeBuilder = require('../src/store/index');
const Dispatcher = require('../src/dispatcher/index');
const sinon = require('sinon');

describe('storeBuilder', function() {
    it('should exist', function() {
        expect(storeBuilder).to.be.a('function');
    });

    it('should build a Store class', function() {
        const d = new Dispatcher();
        const Store = storeBuilder('TestStore', d);
        expect(Store).to.be.a('function');
    });
});

describe('Store', function() {
    const d = new Dispatcher();
    const Store = storeBuilder('TestStore', d);

    class TestStore extends Store {
        __contructor() {
            this.events = {};
        }

        get() {
            return { foo: 'bar' };
        }
    }

    const ts = new TestStore();

    describe('listen', function() {
        it('should exist', function() {
            expect(ts.listen).to.be.a('function');
        });

        it('should allow components to listen', function() {
            const test = new TestStore();
            test.listen('ButtonComponent', () => {});
            test.listen('FooComponent', () => {});
        });

        it('should not allow the same component to listen more than once', function() {
            const test = new TestStore();
            test.listen('ButtonComponent', () => {});
            expect(() => { test.listen('ButtonComponent', () => {}); }).to.throw(
                '"ButtonComponent" component is already listening to the store "TestStore"'
            );
        });

        it('should call the callback function when the store is changed', function*() {
            const test = new TestStore();
            let called = false;
            test.listen('ButtonComponent', (resolve, reject, data) => {
                called = true;
                expect(data.event).to.equal('test_evt');
                resolve();
            });

            yield test.change('test_evt');

            expect(called).to.be.true;
        });
    });

    describe('ignore', function() {
        it('should exist', function() {
            expect(ts.ignore).to.be.a('function');
        });

        it('should allow components to ignore', function() {
            const test = new TestStore();
            test.ignore('ButtonComponent');
        });

        it('should not trigger the callback after being ignored', function*() {
            const test = new TestStore();
            let called = false;
            test.listen('ButtonComponent', (resolve, reject, data) => {
                called = true;
                resolve();
            });
            test.ignore('ButtonComponent');

            yield test.change('test_evt');

            expect(called).to.be.false;
        });
    });

    describe('connectToState', function() {
        it('should exist', function() {
            expect(ts.connectToState).to.be.a('function');
        });

        it('should return the current value of the store', function() {
            const test = new TestStore();
            const setState = sinon.stub();
            const state = test.connectToState('ButtonComponent', setState);

            expect(state).to.deep.equal({ foo: 'bar' });
        });

        it('should call setState with the new value from the get method', function*() {
            const test = new TestStore();
            const setState = sinon.stub();
            test.connectToState('ButtonComponent', setState);

            yield test.change('test_evt');

            expect(setState.called, 'called').to.be.true;
            expect(setState.firstCall.args[0]).to.deep.equal({ TestStore: { foo: 'bar' } });
        });
    });
});