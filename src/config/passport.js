import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Paciente from '../models/Paciente.js';

const initPassport = () => {

  passport.use(
    'google-paciente',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.URL_BACKEND}paciente/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let paciente = await Paciente.findOne({ googleId: profile.id });

          if (!paciente) {
            paciente = await Paciente.findOne({
              emailPaciente: profile.emails[0].value,
            });

            if (paciente) {
              paciente.googleId = profile.id;
              paciente.provider = 'google';
              await paciente.save();
            } else {
              paciente = await Paciente.create({
                nombre: profile.name.givenName,
                apellido: profile.name.familyName,
                emailPaciente: profile.emails[0].value,
                googleId: profile.id,
                provider: 'google',
                telefono: 'N/A',
                cedula: profile.id,
                passwordPaciente: 'GOOGLE_AUTH_' + Math.random().toString(36).slice(-8)
              });
            }
          }

          done(null, paciente);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const paciente = await Paciente.findById(id);
      done(null, paciente);
    } catch (error) {
      done(error, null);
    }
  });
};

export default initPassport;
