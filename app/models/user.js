const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  // email: { type: String, required: true, lowercase: true, unique: true, validate: fieldValidators.emailValidator },
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: false },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles',
    required: true
  },
  isPasswordChanged: { type: Boolean, default: false },
  invalidLoginAttempts: { type: Number, default: 0 },
  lastPasswordUpdatedAt: { type: Number },
  lastPasswords: [{ type: String }],
  temporarytoken: { type: String, required: false },
  resettoken: { type: String, required: false },
  accountCreated: { type: Date },
  loginAttempts: { type: Number, default: 0, select: false },
  blockExpires: { type: Date, default: Date.now, select: false }

}, { collection: 'userProfiles' });

// UserProfileSchema.pre('save', function (next) {
//   let user = this;

//   if (!user.isModified('password')) return next(); // If password was not changed or is new, ignore middleware

//   bcrypt.genSalt(12, (err, salt) => {
//       bcrypt.hash(user.password, salt, (err, hash) => {
//           if (err) throw err;
//           user.password = hash;
//           next();
//       });
//   });
// });

UserProfileSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password); // Returns true if password matches, false if doesn't
}

module.exports = mongoose.model('userProfiles', UserProfileSchema);

// const hash = (user, salt, next) => {
//   bcrypt.hash(user.password, salt, (error, newHash) => {
//     if (error) {
//       return next(error)
//     }
//     user.password = newHash
//     return next()
//   })
// }

// const genSalt = (user, SALT_FACTOR, next) => {
//   bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
//     if (err) {
//       return next(err)
//     }
//     return hash(user, salt, next)
//   })
// }

// UserProfileSchema.pre('save', function (next) {
//   const that = this
//   const SALT_FACTOR = 5
//   if (!that.isModified('password')) {
//     return next()
//   }
//   return genSalt(that, SALT_FACTOR, next)
// })

// UserProfileSchema.methods.comparePassword = function (passwordAttempt, cb) {
//   bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
//     err ? cb(err) : cb(null, isMatch)
//   )
// }
// UserProfileSchema.plugin(mongoosePaginate)
// module.exports = mongoose.model('User', UserProfileSchema)
