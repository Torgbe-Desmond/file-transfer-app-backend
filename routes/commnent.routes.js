const { createComment } = require('../controllers/controller.comment/createComment')
const { getComment } = require('../controllers/controller.comment/getComments')
const router = require('express').Router()
const ProtectStudentRoute = require('../middleware/studentProtectRoute')

router.post('/:reference_Id/send',ProtectStudentRoute,createComment)
router.get('/:reference_Id/:directoryId/get-comment',ProtectStudentRoute,getComment)

module.exports = router;