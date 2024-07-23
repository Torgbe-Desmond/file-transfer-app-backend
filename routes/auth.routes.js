const router = require('express').Router()
const { deleteUSer } = require('../controllers/controller.authentication/delete')
const { forgotPassword } = require('../controllers/controller.authentication/forgotPassword')
const { getAll } = require('../controllers/controller.authentication/getAll')
const { loginUser } = require('../controllers/controller.authentication/login')
const { registerUser } = require('../controllers/controller.authentication/register')
const { sendRecoveryLink } = require('../controllers/controller.authentication/sendRecoveryLink')
const { loginPrivateStudent } = require('../controllers/controller.authentication/studentAuthentication')
const protect = require('../middleware/protectRoutes')


router.post('/login', loginUser)

router.post('/register',registerUser)

router.post('/student-login', loginPrivateStudent)

router.post('/delete', protect,deleteUSer)

router.get('/recovery', sendRecoveryLink)

router.post('/forgot-password',protect, forgotPassword)

router.get('/all', getAll)

module.exports = router
