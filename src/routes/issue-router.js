import express from 'express'
import { IssueController } from '../controllers/issue-controller.js'

export const router = express.Router()

const controller = new IssueController()

// Map HTTP verbs and route paths to controller actions.
router.get('/', controller.index)
router.get('/:id/close', controller.closeIssue)

router.get('/:id/edit', controller.edit)
router.post('/:id/update', controller.update)
