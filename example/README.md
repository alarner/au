# Example Flow

1. Clicking on button triggers a "click" event on the dispatcher
2. Dispatcher dispatches that event to all stores that have registered the click event, being sure to repsect dependencies
3. Store makes some sort of change and fires a change event
4. Component is listening for change and updates its state
 - Components can connect a store to their state so that the current value of the store is always represented in the state.