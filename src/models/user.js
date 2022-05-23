const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = mongoose.Schema;

const UserModel = new schema({
  password: { type: String, required: true},
  email: {
    type: String,
    required: true,
    unique: true, 
    index: true,
    validate:{
      validator: (email)=> {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: (props) => `${props.value} is not a valid Email format`
    }
  },
  refresh: String
});

UserModel.pre('save', function presave(next){
  const user = this;

  if (!user.isModified('password')){
    return next();
  }

  new Promise((resolve, reject)=> {
    bcrypt.genSalt(10, (err, salt)=> {
      if (err){
        return reject(err);
      }
      resolve(salt);
    });
  }).then((salt) =>{
    bcrypt.hash(user.password, salt, (err, hash)=>{
      if(err){
        throw new Error(err);
      }
      user.password = hash;

      next(null);
    });
  }).catch(err=> next(err));
});

UserModel.methods.generateAccessToken = () =>{
  const user = this;

  const token = jwt.sign({id:user.id || user._id}, config.token, {
    expiresIn: '24h'
  });
};

UserModel.methods.generateToken = async ()=> {
  const user = this;
  const token = jwt.sign({ id: user._id}, config.token, { expiresIn: '24h'});
  const refresh = jwt.sign({ id: user._id}, config.refresh_token);
  await user.constructor.findOneAndUpdate(
    { _id: user._id},
    { refresh },
    { new: true}
  );
  return { refresh, token };
};

module.exports = mongoose.model('user', UserModel);