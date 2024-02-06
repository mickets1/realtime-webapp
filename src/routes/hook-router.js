import express from 'express'
import { HookController } from '../controllers/hook-controller.js'
import { IssueController } from '../controllers/issue-controller.js'

export const router = express.Router()

const controller = new HookController()
const issueController = new IssueController()

// Map HTTP verbs and route paths to controller actions.
router.post('/issues', controller.authorize, controller.index, issueController.create)
