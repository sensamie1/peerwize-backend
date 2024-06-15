const joi = require('joi')
const logger = require('../logger');


const ValidateUserCreation = async (req, res, next) => {
  try {
    logger.info('[ValidateUserCreation] => Validate user creation process started...');
    const schema = joi.object({
      user_type: joi.string().valid('admin', 'learner', 'expert').default('learner'),
      first_name: joi.string().required(),
      last_name: joi.string().required(),
      dob: joi.date().optional(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      confirm_password: joi.string().valid(joi.ref('password')).required()
      .messages({
        'any.only': 'Password does not match',
        'any.required': 'Confirm password is required'
      }),
      phone_number: joi.string().required(),
      state: joi.string().optional(),
      country: joi.string().required(),
      city: joi.string().required(),
      stack: joi.array().items(joi.string()).optional()
    }).options({ allowUnknown: true }); // sets all unknown true (ignoring checks like terms)

    await schema.validateAsync(req.body, { abortEarly: true })

    logger.info('[ValidateUserCreation] => Validate user creation process done.');
    next()
  } catch (error) {
      return res.status(422).json({
        message: error.message,
        success: false
      })
  }
}

const UserReverifyValidation = async (req, res, next) => {
  try {
    logger.info('[UserReverifyValidation] => User Reverify validation process started...');
    const schema = joi.object({
      email: joi.string().email().required(),
    })

    await schema.validateAsync(req.body, { abortEarly: true })
    
    logger.info('[UserReverifyValidation] => User Reverify validation process done.');
    next()
} catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false
    })
  }
}

const UserLoginValidation = async (req, res, next) => {
  try {
    logger.info('[UserLoginValidation] => User login validation process started...');
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    })

    await schema.validateAsync(req.body, { abortEarly: true })
    
    logger.info('[UserLoginValidation] => User login validation process done.');
    next()
} catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false
    })
  }
}

const UserForgotPasswordValidation = async (req, res, next) => {
  try {
    logger.info('[UserForgotPasswordValidation] => User forgot password validation process started...');
    const schema = joi.object({
      email: joi.string().email().required(),
    })

    await schema.validateAsync(req.body, { abortEarly: true })
    
    logger.info('[UserForgotPasswordValidation] => User forgot password validation process done.');
    next()
} catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false
    })
  }
}

const UserResetPasswordValidation = async (req, res, next) => {
  try {
    logger.info('[UserResetPasswordValidation] => User reset password validation process started...');
    const schema = joi.object({
      new_password: joi.string().required(),
      confirm_password: joi.string().valid(joi.ref('new_password')).required()
      .messages({
        'any.only': 'Password does not match',
        'any.required': 'Confirm password is required'
      }),
    })

    await schema.validateAsync(req.body, { abortEarly: true })
    
    logger.info('[UserResetPasswordValidation] => User reset password validation process done.');
    next()
} catch (error) {
    return res.status(422).json({
      message: error.message,
      success: false
    })
  }
}


module.exports = {
  ValidateUserCreation,
  UserReverifyValidation,
  UserLoginValidation,
  UserForgotPasswordValidation,
  UserResetPasswordValidation
}