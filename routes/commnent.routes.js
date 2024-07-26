const { createComment } = require('../controllers/controller.comment/createComment')
const { getComment } = require('../controllers/controller.comment/getComments')
const router = require('express').Router()
const ProtectStudentRoute = require('../middleware/studentProtectRoute')

router.route('/:reference_Id/send').post(ProtectStudentRoute,createComment)
router.route('/:reference_Id/:directoryId/get-comment').get(ProtectStudentRoute,getComment)



module.exports = router;