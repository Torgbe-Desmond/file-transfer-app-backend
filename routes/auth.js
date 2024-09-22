const router = require('express').Router()
const { deleteUSer } = require('../controllers/authentication/delete')
const { forgotPassword } = require('../controllers/authentication/forgotPassword')
const { getAll } = require('../controllers/authentication/getAll')
const { loginUser } = require('../controllers/authentication/login')
const { registerUser } = require('../controllers/authentication/register')
const { sendRecoveryLink } = require('../controllers/authentication/sendRecoveryLink')
const { loginPrivateStudent } = require('../controllers/authentication/studentAuthentication')
const protect = require('../middleware/protectRoutes')


router.post('/login', loginUser)

router.post('/register',registerUser)

router.post('/student-login', loginPrivateStudent)

router.post('/delete', protect,deleteUSer)

router.get('/recovery', sendRecoveryLink)

router.post('/forgot-password',protect, forgotPassword)

router.get('/all', getAll)

module.exports = router
