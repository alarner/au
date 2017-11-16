# AU Flux

Building complicated, intaractive UI applications is hard. Flux is the application architecture that Facebook uses for building these types of applications on the web. There are many different implementations of the Flux architecture, but I found them difficult to wrap my head around. AU Flux is a simplified implementation of a Flux architecture with a few basic additions to make development more fun and more efficient.

## A simple react component...

Let's start with a simple react component. A button:

```js
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
    render() {
        return (
            <div>
                <button>0 Likes</button>
            </div>
        );
    }
}

ReactDOM.render(<Button />, document.getElementById('app'));
```

We'd like to have this button count up from zero as it's clicked on. In React we might commonly do that by updating the state on each click like so:

```js
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
    // Set the initial state
    constructor(props) {
        super(props);
        this.state = { numLikes: 0 };
    }
    render() {
        // On each click increment the state by one
        return (
            <div>
                <button onClick={() => this.setState({ numLikes: this.state.numLikes+1 })}>
                    {this.state.numLikes} Likes
                </button>
            </div>
        );
    }
}

ReactDOM.render(<Button />, document.getElementById('app'));
```

## Managing more complex data...

This is great, but what if we want to also store the number of likes in a database on our server? Maybe we'd also like to allow other components in our web app to display the number of likes (accurately). As complexity grows, this approach to storing data can become very cumbersome. Flux architecture prescribes what should happen when an action occurs within our UI (like clicking on a button). The general flow of information looks like this:

![Flux Data Flow](http://fluxxor.com/images/flux-simple.png)

Image taken from [Fluxxor - What is Flux?](http://fluxxor.com/what-is-flux.html)

Within AU Flux we can follow this pattern by first creating a store. Aptly named because it's a place to store our data. In this particular example, the number of likes. Here's an example of what the store might look like:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Store } from 'au-flux'; // Import the store builder

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = { numLikes: 0 };
    }
    render() {
        return (
            <div>
                <button onClick={() => this.setState({ numLikes: this.state.numLikes+1 })}>
                    {this.state.numLikes} Likes
                </button>
            </div>
        );
    }
}

// Create a new store that will respond to the 'add_like' action
const LikeCount = Store.build({
    add_like: {
        // Tell the store what should happen when the action is received
        run(resolve, reject, action) {
            // Resolve the new value of the store.
            resolve(this.value() + 1);
        }
    }
});

// Instantiate the store that we defined above and set it's initial value to 0.
const likeCount = new LikeCount(0);
```

Each AU Flux store is created using `Store.build(...)` and passed an object. The property names of that object represent actions that may occur in your app (in this case "add_like"). The value of each property should be another object with a `run` method. The run method always takes three arguments `resolve`, `reject`, and `action`. Resolve and reject are functions that can be called to update the value of the store (just like a promise). Either `resolve` or `reject` should always be called within your store depending on whether or not an error occurred. `action` will contain any data associated with the action being processed. In this case we are just grabbing the current value of the store and adding one to it.

## Connecting the pieces

Now that we have created our first store all we need to do is inform our app about it and call the `add_like` action.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Store, globals } from 'au-flux'; // Import au-flux globals

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = { numLikes: 0 };
    }
    render() {
        return (
            <div>
                <button onClick={() => this.setState({ numLikes: this.state.numLikes+1 })}>
                    {this.state.numLikes} Likes
                </button>
            </div>
        );
    }
}

const LikeCount = Store.build({
    add_like: {
        run(resolve, reject, action) {
            resolve(this.value() + 1);
        }
    }
});

const likeCount = new LikeCount(0);

// Create a list of all of the stores that our app is using. If we had multiple stores in our app we
// would list all of them here
const stores = {
    likeCount
}

// Notify au-flux about those stores so that they can be used
globals.set('stores', stores);

ReactDOM.render(<Button />, document.getElementById('app'));
```

What we've done here is a little bit of connecting work. AU Flux needs to keep track of all of the stores in our application, and it does that in the globals object. We import the globals object, create a new stores object to keep track of all of the stores (in this case there is only one) and set the 'stores' global.

We're almost there, just one more change. Instead of updating the state in our button we want to update our store. Instead of reading from the button state we want to read from the store state:

```js
import React from 'react';
import ReactDOM from 'react-dom';
// SmartComponents allow us to connect our store to generic React components. `d` is the default
// dispatcher which we can use to dispatch actions.
import { Store, globals, SmartComponent, d } from 'au-flux'; 

class Button extends React.Component {
    render() {
        // Use props instead of state. The props are passed from the SmartButton.
        // d.trigger dispatches a new action when the button is clicked.
        return (
            <div>
                <button onClick={() => d.trigger('add_like')}>
                    {this.props.likeCount} Likes
                </button>
            </div>
        );
    }
}

// This creates a wrapper component that passes the store to the Button component via props.
const SmartButton = SmartComponent.build(Button, 'likeCount');

const LikeCount = Store.build({
    add_like: {
        run(resolve, reject, action) {
            console.log('add_like', this.value() + 1);
            resolve(this.value() + 1);
        }
    }
});

const likeCount = new LikeCount(0);

const stores = {
    likeCount
};

globals.set('stores', stores);

// Use the SmartButton instead of the regular button now.
ReactDOM.render(<SmartButton />, document.getElementById('app'));
```