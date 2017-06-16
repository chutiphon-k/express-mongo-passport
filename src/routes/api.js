import { Router } from 'express'
import config from 'config'
import jwt from 'jsonwebtoken'
import passport from 'passport'

import { User } from 'models'

const router = Router()

router.post('/register', (req, res) => {
	let { username, password } = req.body

	if (!username || !password) {
		res.json({success: false, message: 'Please enter an username and password to register'})
	} else {
		let newUser = new User({ username, password })
		newUser.save((err) => {
			if (err) return res.json({ success: false, message: 'That username address already exists' })
			res.json({ success: true, message: 'Successfully created new user' })
		})
	}
})

router.post('/login', (req, res) => {
	let { username, password } = req.body
	User.findOne({ username }, (err, user) => {
		if (err) return err

		if (!user) {
			res.send({ success: false, message: 'Authentication failed. User not found.' })
		} else {
			user.comparePassword(password, (err, isMatch) => {
				if (isMatch && !err) {
					let { _id, username } = user
					let token = jwt.sign({ _id, username }, config.Api.secret, {
						expiresIn: 60 * 60 * 24 * 30
					})
					res.json({success: true, token: 'JWT ' + token})
				} else {
					res.send({success: false, message: 'Authentication failed. Password did not match.'})
				}
			})
		}
	})
})

router.get('/aaa', (req, res) => {
	res.redirect('/login')
})

router.use(
	passport.authenticate('jwt', { session: false })
)

router.post('/change', (req, res) => {
	let { username, password } = req.body
	User.findById(req.user._id, (err, user) => {
		if (err) return err

		user.username = username
		user.password = password
		user.save((err) => {
			if (err) return res.json({ success: false, message: 'Cannot update' })
			res.send('update ok')
		})
	})
})

router.get('/data', (req, res) => {
	res.json({
		_id: req.user._id,
		username: req.user.username
	})
})

export default router
