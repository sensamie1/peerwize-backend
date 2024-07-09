const express = require('express');
const middleware = require('./users-middleware')
const controller = require('./users-controller')
const globalMiddleware = require('../middlewares/global-user-middlewares')

const router = express.Router();


// Create User
router.post('/signup', globalMiddleware.checkBody, middleware.ValidateUserCreation, controller.CreateUser)

// Verify Email
router.get('/verify-email', controller.UserVerifyEmail);

// Resend verification email
router.post('/resend-verification-email', globalMiddleware.checkBody, middleware.UserReverifyValidation, controller.UserReVerifyEmail);

// Signin User
router.post('/login', globalMiddleware.checkBody, middleware.UserLoginValidation, controller.UserLogin)

// User Forget Password
router.post('/forget-password', globalMiddleware.checkBody, middleware.UserForgotPasswordValidation, controller.UserForgotPassword)

// User Forget Password
router.post('/reset-password', globalMiddleware.checkBody, middleware.UserResetPasswordValidation, controller.UserResetPassword)

// Update user details
router.patch('/update',  globalMiddleware.bearerTokenAuth, globalMiddleware.checkBody, controller.updateUser);

// User Logot 
router.get('/logout', controller.UserLogout);



module.exports = router
