import Dispatcher2 from './Dispatcher';
import globals2 from './globals';
import SmartComponent2 from './SmartComponent';
import Store2 from './Store';
import error from './error';

export const d = globals2.get('defaultDispatcher');
export const Dispatcher = Dispatcher2;
export const globals = globals2;
export const renderError = error.renderError;
export const SmartComponent = SmartComponent2;
export const Store = Store2;
export const StoreError = error.StoreError;
