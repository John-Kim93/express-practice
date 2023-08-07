const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = '1111111';
const someOtherPlaintextPassword = '1212121';
bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    console.log(hash)
    // Load hash from your password DB.
    bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
        // result == true
        console.log('samePW', result)
    });
    bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
        // result == false
        console.log('otherPW', result)
    });
});
