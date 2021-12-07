const express = require('express');
const router = express.Router();

const { register, login, refreshToken } = require('../controllers/User');

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh_token").post(refreshToken);

module.exports = router;
