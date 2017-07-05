var Gpio = require('.');
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyAnQ4CH82MFR-kFxoyp2NfhbUxPuE8VLSM",
    authDomain: "gpio-4bfc9.firebaseapp.com",
    databaseURL: "https://gpio-4bfc9.firebaseio.com",
    projectId: "gpio-4bfc9",
    storageBucket: "gpio-4bfc9.appspot.com",
    messagingSenderId: "530282064340"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged((auth, error, completed) => {
    if (auth != null) {
        new Gpio(firebase.database().ref().child('test/pins'));
    }
});


firebase.auth().signInWithEmailAndPassword('manderson@amesburytruth.com', 'kari55rene');