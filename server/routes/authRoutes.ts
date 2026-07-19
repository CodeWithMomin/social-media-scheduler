import express from 'express'
import { loginUser, registerUser } from '../controllers/authController.js'

const authRotuer=express.Router()

authRotuer.post('/register',registerUser)
authRotuer.post('/login',loginUser)

export default authRotuer