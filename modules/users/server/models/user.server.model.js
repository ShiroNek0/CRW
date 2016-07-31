'use strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password'),
  owasp = require('owasp-password-strength-test');

/**
* A Validation function for local strategy properties
*/
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
* A Validation function for local strategy email
*/
var validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};

/**
* User Schema
*/
var UserSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Xin nhập tên người dùng',
    trim: true
  }, 
  email: {
    type: String,
    unique: 'Địa chỉ email đã tồn tại trong hệ thống',
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Định dạng email không hợp lệ']
  },
  password: {
    type: String,
    default: '',
  },
  salt: {
    type: String
  },
  provider: {
    type: String,
    required: 'Xin chọn Provider'
  },
  providerData: {},
  additionalProvidersData: {},
  profileImageURL: {
    type: String,
    trim: true,
    default: 'modules/users/client/img/profile/default.png'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  bookmark: [{
    type: String,
    ref: 'Company'
  }],
  roles: {
    type: [{
      type: String,
      enum: ['user', 'mod', 'admin']
    }],
    default: ['user'],
    required: 'Xin chọn tối thiểu một loại tài khoản'
  },
  accState: {
    type: String,
    enum: ['unverified','active', 'deactive'],
    default: 'unverified',
    required: 'Xin chọn trạng thái tài khoản'
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  announcement:[{
    link: {
      type: String
    },
    content: {
      type: String
    },
    seen:{
      type: Boolean,
      default: false
    }
  }]
});

/**
* Hook a pre save method to hash the password
*/
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
* Hook a pre validate method to test the local password
*/
UserSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    var result = owasp.test(this.password);
    if (result.errors.length) {
      var error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
});

/**
* Create instance method for hashing a password
*/
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
* Create instance method for authenticating user
*/
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

/**
* Check if email existed
*/
UserSchema.statics.findbyEmail = function (email) {
  var _this = this;

  _this.findOne({
    email: email
  }, function (err, user) {
    if (err || !user) {
      return null;
    } else {
      return user;
    }
  });
};

/**
* Generates a random passphrase that passes the owasp test.
* Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
* NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
*/
UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

    // iterate until the we have a valid passphrase. 
    // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present.
    while (password.length < 20 || repeatingCharacters.test(password)) {
      // build the random password
      password = generatePassword.generate({
        length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true,
      });

      // check if we need to remove any repeating characters.
      password = password.replace(repeatingCharacters, '');
    }

    // Send the rejection back if the passphrase fails to pass the strength test
    if (owasp.test(password).errors.length) {
      reject(new Error('An unexpected problem occured while generating the random passphrase'));
    } else {
      // resolve with the validated passphrase
      resolve(password);
    }
  });
};

mongoose.model('User', UserSchema);
