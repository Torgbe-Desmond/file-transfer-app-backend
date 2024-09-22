const router = require('express').Router()
const { createNewComment } = require('../controllers/comment/createNewMessage')
const { getAllComments } = require('../controllers/comment/getAllComments')
const studentProtectRoutes = require('../middleware/studentProtectRoute')
const protectRoutes = require('../middleware/protectRoutes')


router.post('/:reference_Id/send',studentProtectRoutes,createNewComment)
router.get('/:reference_Id/:directoryId/get-comment',protectRoutes,getAllComments)

module.exports = router;