const router = require('express').Router()
const {  updatePassword } = require('../controllers/authentication/updatePassword')
const { getAll } = require('../controllers/authentication/getAll')
const { loginUser } = require('../controllers/authentication/login')
const { registerUser } = require('../controllers/authentication/register')
const deleteUser = require('../controllers/authentication/delete')
const protect = require('../middleware/protectRoutes')
const logout = require('../controllers/authentication/Logout')
const { sendEmailForVerification } = require('../controllers/authentication/sendEmailForVerification')
const { generateTokenForVerification } = require('../controllers/authentication/generateTokenForVerification')

router.post('/login', loginUser)

router.post('/register', registerUser)

router.post('/:reference_Id /delete', protect ,deleteUser)  

router.post('/update-password',protect, updatePassword)

router.get('/:reference_Id/get-verification-token',  generateTokenForVerification)

router.post('/send-email-verification', sendEmailForVerification)

router.post('/logout',logout) 

module.exports = router 
 