import { Strategy, ExtractJwt } from 'passport-jwt'
import config from 'config'
import moment from 'moment'

import { User } from 'models'

let JwtStrategy = (passport) => {
	let opts = {}
	opts.jwtFromRequest = ExtractJwt.fromAuthHeader()
	opts.secretOrKey = config.Api.secret
	passport.use('jwt', new Strategy(opts, (payload, done) => {
		User.findById(payload._id, (err, user) => {
			if (err) return done(err, false)

			let updatedAtUnix = moment(user.updatedAt).unix()
			if (user && payload.iat >= updatedAtUnix) {
				done(null, user)
			} else {
				done(null, false)
			}
		})
	}))
}

export default JwtStrategy
