const bcrypt = require("bcryptjs");

const userSchema = {
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
};

function createUser(data) {
  const user = {
    id: null,
    ...data
  };
  user.passwordHash = bcrypt.hashSync(user.passwordHash, 12);
  return user;
}

module.exports = { userSchema, createUser };
