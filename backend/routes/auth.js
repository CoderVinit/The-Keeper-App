const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
var JWT_SECRET = "vinitisagoodboy";

// Route 1: create a user using : POST "/api/auth/username"
router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 3 }),
    body('email', 'Enter valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false
    // if there are errors , retrun bad request and the error
    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(400).json({ success, error: error.array() });
    }
    //check wheter the user with this email already exist or not
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "sorry a user with this email already exixt" });
        }
        // creating a new user
        var salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const data = {
            user: {
                id: user.id
            }
        }
        var token = jwt.sign(data, JWT_SECRET);
        // res.send(user);
        success = true
        res.json({ success, token });
        // catching the error if occured
    } catch (error) {
        console.error(error.massage);
        res.status(500).send("some error occures");
    }

})

// Route 2: authenticate a user using: POST : "/api/auth/login", no login required.

router.post('/login', [
    body('email', 'Enter valid Email').isEmail(),
    body('password', 'Password cannot be black').exists()

], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    try {
        let success = false;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Pleases try to login with correct credentials" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Pleases try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, token });

    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error");
    }
})
// Route 3: Get loggedin user details using: POST : "/api/auth/getuser", login required.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router