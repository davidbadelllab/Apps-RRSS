const { serializerUser } = require('passport');
const User = require('../../models/user');
const Utils = require('../../utils/users');

let _this;
class Auth {
  constructor(){
   _this = this;
   this.User = User;
   this.utils = Utils; 
  }
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
  async authUser(req, res){
    const {body} = req;

    try {
      if(!body){
        throw new Error('Cuerpo Vacio');
      }
      if (typeof body.email !== 'string' || !body.email.length){
        throw new Error('El correo debe ser una cadena de texto');
      }
      if (!_this.utils.validateEmail(body.email)){
        throw new Error('No es un correo valido');
      }
      if (typeof body.password !== 'string' || !body.password.length){
        throw new Error ('La contraseña tiene que ser una cadena de texto');
      }
      const user = await _this.user.findOne({ email: body.email });

      if (!user) {
        throw new Error('Usuario no Registrado');
      }

      const isPassword = await user.validatePassword(body.password);

      if (!isPassword) {
        throw new Error('Contraseña Invalida');
      }
      const token = await user.generateToken();

      const { password, refresh, ...userToSend } = user._doc;
      res.status(200).json({
        ...token,
        user: userToSend
      });

    } 
    catch (error) {
      res.status(422).json({ message: error.message });
    }
  }
  async refreshToken(req, res) {
    try {
      const token = await user.generateAccessToken();
      res.status(200).json({
        ...token,
        user: userToSend
      });
    } catch ({ message, ...error }) {
      res.status(500).json({ message });
    }
  }
  async getUserByToken(req, res) {
    console.log(req.user);
    res.status(200).json({ user: req.user });
  }

  /**
   * @param {Request} req
   * @param {Response} res
   */
  async logOut(req, res) {
    const { user } = req;
    try {
      user.refresh = '';
      await user.save();
      res.status(204).send();
    } catch ({ message, ...error }) {
      res.status(500).json({ message });
    }
  }
}