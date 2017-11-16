import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/Button';
import { globals } from 'au-flux';
import stores from './stores';
globals.set('stores', stores);

ReactDOM.render(<Button />, document.getElementById('main'));
