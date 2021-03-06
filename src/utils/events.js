const EventEmitter = require('events').EventEmitter;

const INSTANCE = new EventEmitter();
let EVENTS_RECEIVER;

module.exports = INSTANCE;

/**
 * Sets up current instance to forward emitted events to another EventEmitter
 *   instance.
 *
 * @param   {EventEmitter}  [eventEmitter]  The emitter instance to forward
 *   events to. Falsy value, when passed, disables forwarding.
 */
module.exports.forwardEventsTo = function (eventEmitter) {
  // If no argument is specified disable events forwarding
  if (!eventEmitter) {
    EVENTS_RECEIVER = undefined;
    return;
  }

  if (!(eventEmitter instanceof EventEmitter)) { throw new Error('weexpack events can be redirected to another EventEmitter instance only'); }

  // CB-10940 Skipping forwarding to self to avoid infinite recursion.
  // This is the case when the modules are npm-linked.
  if (this !== eventEmitter) {
    EVENTS_RECEIVER = eventEmitter;
  }
  else {
    // Reset forwarding if we are subscribing to self
    EVENTS_RECEIVER = undefined;
  }
};

const emit = INSTANCE.emit;

/**
 * This method replaces original 'emit' method to allow events forwarding.
 *
 * @return  {eventEmitter}  Current instance to allow calls chaining, as
 *   original 'emit' does
 */
module.exports.emit = function () {
  const args = Array.prototype.slice.call(arguments);

  if (EVENTS_RECEIVER) {
    EVENTS_RECEIVER.emit.apply(EVENTS_RECEIVER, args);
  }

  return emit.apply(this, args);
};
