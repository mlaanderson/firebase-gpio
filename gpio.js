var firebase = require('firebase');
var onoff = require('onoff');

function extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || typeof add !== 'object') return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
}


class Gpio {
    constructor(firebase_node) {
        this._node = firebase_node;
        this._gpios = {};

        this._node.on('child_added', this._pinAddedHandler.bind(this));
    }

    _pinAddedHandler(snapshot) {
        this._gpios[snapshot.key] = {
            "ref": snapshot.ref,
            "key": snapshot.key,
            "pin": null
        };

        snapshot.ref.on('value', this._pinHandler.bind(this));
    }

    _pinWatchHandler(error, value) {
        // called with the gpio object as "this"
        if (!error) {
            this.ref.child('value').set(value);
        }
    }

    _pinHandler(snapshot) {
        var gpio = this._gpios[snapshot.key];
        var data = snapshot.val();

        data = extend({
            direction: 'in',
            edge: 'none',
            value: 0
        }, data);

        console.log(data);

        if (gpio.pin == null) {
            gpio.pin = new onoff.Gpio(snapshot.key, data.direction, data.edge);
        }

        if ((gpio.watcher != null) && (data.edge != 'none')) {
            // remove the watcher
            gpio.pin.unwatch(gpio.watcher);
            gpio.watcher = null;
        }

        if (data.direction == "out") {
            // write the value
            gpio.pin.write(data.value);
        } else if ((data.direction == "in") && (gpio.watcher == null) && (data.edge != 'none')) {
            // setup a watcher
            gpio.watcher = this._pinWatchHandler.bind(gpio);
            gpio.pin.watch(gpio.watcher);

            // read the current pin state
            snapshot.ref.child('value').set(gpio.pin.readSync());
        } else if ((data.direction == "in") && (data.edge == 'none')) {
            snapshot.ref.child('value').set(gpio.pin.readSync());
        }
    }
}

module.exports = Gpio;