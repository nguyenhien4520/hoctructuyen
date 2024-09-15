const express = require('express');
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

// router.get('/', siteController.home);
router.get('/', siteController.signin);
router.post('/signin', siteController.handleSignin);
router.get('/logout', siteController.logout);


module.exports = router;
