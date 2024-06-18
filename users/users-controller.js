const UserModel = require('../models/user-model');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')


require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const CreateUser = async (req, res) => {
  try {
    logger.info('[CreateUser] => Create user process started.')
    const userFromRequest = req.body

    const existingEmailUser = await UserModel.findOne({ email: userFromRequest.email });

    if (existingEmailUser) {
      return res.status(409).json({
        message: 'User already exists',
        success: false
      });
    }
  
    const user = await UserModel.create({
      firstName: userFromRequest.firstName,
      lastName: userFromRequest.lastName,
      email: userFromRequest.email,
      country: userFromRequest.country,
      city: userFromRequest.city,
      phoneNumber: userFromRequest.phoneNumber,
      password: userFromRequest.password,
      confirmPassword: userFromRequest.confirmPassword
    });
  
    const token = await jwt.sign({ email: user.email, _id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' })

    // Send email verification link
    const verificationLink = `https://peerwize-backend.vercel.app/users/verify-email?token=${token}`;
    // const verificationLink = `http://${process.env.HOST}:${process.env.PORT}/users/verify-email?token=${token}`;
    
    const htmlContent = `
      <html>
        <head>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            text-align: center;
          }
    
          .logo-image {
            display: block;
            width: 200px;
            height: auto;
            border-radius: 5px;
            margin-top: 20px;
          }
    
          button {
            background-color: #fba04b;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
    
          button:hover {
            background-color: #308da6ef;
          }
    
          p {
            margin-top: 20px;
            font-size: 18px;
          }
    
          a {
            color: #fff;
            text-decoration: none;
          }
          </style>
        </head>
        <body>
          <img src="https://res.cloudinary.com/ddi6arl8i/image/upload/v1718133992/Logos/logo_gjoa87.png" alt="peerwize logo" class="logo-image">
          <p><strong>Welcome to Peerwize.</strong></p>
          <p>Your signup was successful.</p>
          <p>Click on this link to verify your email:</p>
          <button><a href="${verificationLink}" style="color: #fff;">Verify</a></button>
        </body>
      </html>
    `
    
    const mailOptions = {
      // from: 'Peerwize' || process.env.EMAIL,
      from: 'Peerwize',
      to: user.email,
      subject: 'Email Verification',
      html: htmlContent
    };

    // Send email using nodemailer
    await transporter.sendMail(mailOptions);
    
    // Filter out sensitive fields
    const filteredUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      track: user.track,
      skills: user.skills,
      dob: user.dob,
      dob: user.dob,
      country: user.country,
      city: user.city,
      phoneNumber: user.phoneNumber
    };

    logger.info('[CreateUser] => Create user process done.')
    return res.status(201).json({
      message: 'User created successfully. Check your Email and verify to complete signup. Note: Verification link expires in 1hr.',
      success: true,
      user: filteredUser,
      token
    }) 
  } catch (error) {
      console.log(error)
      return res.status(500).json({
        message: 'Server Error',
        success: false,
        data: null
      })
  }
}

const UserVerifyEmail = async (req, res) => {
  try {
    logger.info('[UserVerifyEmail] => User verify Email process started.')
    const token = req.query.token;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const verificationLink = `https://peerwize-backend.vercel.app/users/resend-verification-email`
          // const verificationLink = `http://${process.env.HOST}:${process.env.PORT}/users/resend-verification-email`
          return res.status(410).json({
            message: 'Verification link has expired. Please request a new verification link with your email here - ',
            verificationLink: verificationLink,
            success: false
          });
        } else {
          return res.status(401).json({
            message: 'Invalid verification link.',
            success: false
          });
        }
      }

      const user = await UserModel.findById(decoded._id);
      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
          success: false
        });
      }

      if (user.isVerified == true) {
        return res.status(208).json({
          message: 'Email already verified.',
        });
      }
      
      // Update only the isVerified field
      await UserModel.findByIdAndUpdate(decoded._id, { isVerified: true });

      // Filter out sensitive fields
      const filteredUser = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio,
        track: user.track,
        skills: user.skills,
        dob: user.dob,
        country: user.country,
        city: user.city,
        phoneNumber: user.phoneNumber,
        dob: user.dob
      };

      logger.info('[UserVerifyEmail] => Verify Email process done.')
      return res.status(200).json({
        message: 'Email verified successfully.',
        success: true,
        user: filteredUser
      });

    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      message: 'Server error.',
      success: false
    });
  }
}

const UserReVerifyEmail = async (req, res) => {
  try {
    logger.info('[UserVerifyEmail] => User verify Email process started.')
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found.', 
        success: false 
      });
    }

    const token = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email verification link
    const verificationLink = `https://peerwize-backend.vercel.app/users/verify-email?token=${token}`;
    // const verificationLink = `http://${process.env.HOST}:${process.env.PORT}/users/verify-email?token=${token}`;
    
    const htmlContent = `
      <html>
        <head>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            text-align: center;
          }
    
          .logo-image {
            display: block;
            width: 200px;
            height: auto;
            border-radius: 5px;
            margin-top: 20px;
          }
    
          button {
            background-color: #fba04b;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
    
          button:hover {
            background-color: #308da6ef;
          }
    
          p {
            margin-top: 20px;
            font-size: 18px;
          }
    
          a {
            color: #fff;
            text-decoration: none;
          }
          </style>
        </head>
        <body>
          <img src="https://res.cloudinary.com/ddi6arl8i/image/upload/v1718133992/Logos/logo_gjoa87.png" alt="peerwize logo" class="logo-image">
          <p><strong>Welcome to Peerwize.</strong></p>
          <p>Your signup was successful.</p>
          <p>Click on this link to verify your email:</p>
          <button><a href="${verificationLink}" style="color: #fff;">Verify</a></button>
        </body>
      </html>
    `
    
    const mailOptions = {
      // from: 'Peerwize' || process.env.EMAIL,
      from: 'Peerwize',
      to: user.email,
      subject: 'Email Verification',
      html: htmlContent
    };

    // Send email using nodemailer
    await transporter.sendMail(mailOptions);

    logger.info('[UserVerifyEmail] => User verify Email process done.')
    return res.status(200).json({ 
      message: 'Verification email has been resent. Note: Verification link expires in 1hr.', 
      success: true 
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    return res.status(500).json({ 
      message: 'Server error.', 
      success: false 
    });
  }
}

const UserLogin = async (req, res) => {
  try {
    logger.info('[UserLogin] => User login process started')
    const userFromRequest = req.body

    const user = await UserModel.findOne({
      email: userFromRequest.email,
    });
  
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      }) 
    }
  
    const validPassword = await user.isValidPassword(userFromRequest.password)

    if (!validPassword) {
      return res.status(422).json({
        message: 'Email or password is not correct',
        success: false
      }) 
    }

    if (!user.isVerified) {
      const verificationLink = `https://peerwize-backend.vercel.app/users/resend-verification-email`
      // const verificationLink = `http://${process.env.HOST}:${process.env.PORT}/users/resend-verification-email`
      return res.status(403).json({
        message: 'Email not verified. Check your Email for verification link or request a new one here - ',
        verificationLink: verificationLink,
        success: false
      })
    }
  
    const token = await jwt.sign({ email: user.email, _id: user._id}, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' })

    // Filter out sensitive fields
    const filteredUser = {
      _id: user._id,
      firstName: user.lastName,
      email: user.email,
      bio: user.bio,
      track: user.track,
      skills: user.skills,
      dob: user.dob,
      country: user.country,
      city: user.city,
      phoneNumber: user.phoneNumber,
      dob: user.dob
    };
    logger.info('[UserLogin] => User login process done')
    return res.status(200).json({
      message: 'User login successful',
      success: true,
      user: filteredUser,
      token
    })
  } catch (error) {
      logger.error(error.message);
      return res.status(500).json({
        message: 'Server Error',
        success: false,
        data: null
      })
  }
}

const UserForgotPassword = async (req, res) => {
  try {
    logger.info('[UserForgotPassword] => User forgot password process started.')

    const { email } = req.body;

    const user = await UserModel.findOne({ email });
  
    if (!user) {
      return res.status(404).json({
        message: 'User not found.', 
        success: false
      });
    }
  
    const token = await jwt.sign({ email: user.email, _id: user._id}, process.env.JWT_SECRET, { expiresIn: '5m' })
  
      // Send email password reset link
      const resetLink = `https://peerwize-backend.vercel.app/users/reset-password?token=${token}`;
      // const resetLink = `http://${process.env.HOST}:${process.env.PORT}/users/reset-password?token=${token}`;
      
      const htmlContent = `
        <html>
          <head>
            <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              text-align: center;
            }
      
            .logo-image {
              display: block;
              width: 200px;
              height: auto;
              border-radius: 5px;
              margin-top: 20px;
            }
      
            button {
              background-color: #fba04b;
              color: #fff;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background-color 0.3s ease;
            }
      
            button:hover {
              background-color: #308da6ef;
            }
      
            p {
              margin-top: 20px;
              font-size: 18px;
            }
      
            a {
              color: #fff;
              text-decoration: none;
            }
            </style>
          </head>
          <body>
            <img src="https://res.cloudinary.com/ddi6arl8i/image/upload/v1718133992/Logos/logo_gjoa87.png" alt="peerwize logo" class="logo-image">
            <p><strong>Password Reset.</strong></p>
            <p>You requested for password reset.</p>
            <p>Click on this link to change your password:</p>
            <button><a href="${resetLink}" style="color: #fff;">Reset</a></button>
            <p>If you did not request a password change, ignore this message. Password reset link expires in 5min.</p>
          </body>
        </html>
      `
      
      const mailOptions = {
        // from: 'Peerwize' || process.env.EMAIL,
        from: 'Peerwize',
        to: user.email,
        subject: 'Password Reset',
        html: htmlContent
      };

    // Send email using nodemailer
    await transporter.sendMail(mailOptions);

    logger.info('[UserForgotPassword] => User forgot password process done.')
    return res.status(200).json({
      message: 'Password reset email has been resent.', 
      success: true 
    });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Server Error',
        success: false,
        data: null
      });
    }
}

const UserResetPassword = async (req, res) => {
  try {
    logger.info('[UserResetPassword] => User reset password process started.');

    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        success: false
      });
    }

    const newPassword = req.body.newPassword;

    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password must be different from the current password.',
        success: false
      });
    }

    // Check if the new password is one of the old passwords
    for (const oldPassword of user.oldPasswords) {
      const isOldPassword = await bcrypt.compare(newPassword, oldPassword);
      if (isOldPassword) {
        return res.status(400).json({
          message: 'New password must be different from the previous passwords.',
          success: false
        });
      }
    }

    // // Update oldPasswords and set the new password
    user.oldPasswords.push(user.password);
    user.password = newPassword;

    // Save the user with the new password and updated oldPasswords
    await user.save();

    logger.info('[UserResetPassword] => User reset password process done.');
    return res.status(200).json({
      message: 'Password changed successfully.',
      success: true
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Password reset link has expired.',
        success: false
      });
    } else {
      console.error('Password reset error:', error);
      return res.status(410).json({
        message: 'Invalid reset link.',
        success: false
      });
    }
  }
};


const updateUser = async (req, res) => {
  try {
    logger.info('[updateUser] => User update process started.');

    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id; // Get user ID from decoded token
    const updateFields = req.body;

    const allowedUpdates = [
      'firstName', 'lastName', 'email', 'bio', 'dob', 'phoneNumber', 'state',
      'country', 'city', 'track', 'skills'
    ];

    const isValidOperation = Object.keys(updateFields).every(field => 
      allowedUpdates.includes(field)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        message: 'Invalid updates!',
        success: false
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        success: false
      });
    }

      // Check if the dob field is being modified and if it has already been set
      if (updateFields.dob && user.dob) {
        return res.status(400).json({
          message: 'Date of birth cannot be modified once set.',
          success: false
        });
      }

    Object.keys(updateFields).forEach(field => {
      if ((field === 'track' || field === 'skills') && Array.isArray(updateFields[field])) {
        // Append new skills or track items to the existing array
        user[field] = [...new Set([...user[field], ...updateFields[field]])];
      } else if (field === 'dob') {
        // Convert the date string to a Date object
        const [day, month, year] = updateFields[field].split('-');
        user[field] = new Date(`${year}-${month}-${day}`);
      } else {
        user[field] = updateFields[field];
      }
    });

    await user.save();

        // Filter out sensitive fields
        const filteredUser = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: user.bio,
          track: user.track,
          skills: user.skills,
          dob: user.dob,
          country: user.country,
          city: user.city,
          phoneNumber: user.phoneNumber
        };

    logger.info('[updateUser] => User update process done.');
    return res.status(200).json({
      message: 'User updated successfully.',
      success: true,
      user: filteredUser
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Unauthorized: Invalid or expired token.',
        success: false
      });
    } else {
      console.error('User update error:', error);
      return res.status(500).json({
        message: 'Internal server error.',
        success: false
      });
    }
  }
};


module.exports = {
  CreateUser,
  UserVerifyEmail,
  UserReVerifyEmail,
  UserLogin,
  UserForgotPassword,
  UserResetPassword,
  updateUser
}