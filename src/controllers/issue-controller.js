import fetch from 'node-fetch'
/**
 * Encapsulates a controller.
 */
export class IssueController {
  /**
   * Displays a list of issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {object} next - Express' next error object.
   */
  async index (req, res, next) {
    try {
      // Only fetches open issues.
      const getRes = await fetch(process.env.PROJECT_ISSUES + '?state=opened', {
        method: 'GET',
        headers: {
          Authorization: process.env.BEARER_TOKEN,
          'Content-Type': 'application/json'
        }
      })

      const response = JSON.parse(await getRes.text())

      const viewData = {
        issues: response
          .map(issue => ({
            id: issue.iid,
            title: issue.title,
            description: issue.description
          }))
      }

      res.render('issues/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Closing an issue in Gitlab.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {object} next - Express' next error object.
   */
  async closeIssue (req, res, next) {
    try {
      const raw = JSON.stringify({ state_event: 'close' })

      const putRes = await fetch(process.env.PROJECT_ISSUES + req.params.id, {
        method: 'PUT',
        headers: {
          Authorization: process.env.BEARER_TOKEN,
          'Content-Type': 'application/json'
        },
        body: raw
      })

      // Check that issue actually closed correctly.
      const jsonRes = await putRes.json()
      if (jsonRes.state === 'closed' || !jsonRes.state) {
        req.session.flash = { type: 'success', text: 'Issue successfully closed.' }
      } else {
        req.session.flash = { type: 'danger', text: 'Problem encountered when trying to close the issue.' }
      }

      res.redirect('..')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns a HTML form for editing a issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async edit (req, res) {
    const viewData = {
      id: req.params.id
    }

    res.render('issues/edit', { viewData })
  }

  /**
   * Updates a specific issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {object} next - Express' next error object.
   */
  async update (req, res, next) {
    try {
      const raw = JSON.stringify({ title: req.body.title, description: req.body.description })

      const putRes = await fetch(process.env.PROJECT_ISSUES + req.params.id, {
        method: 'PUT',
        headers: {
          Authorization: process.env.BEARER_TOKEN,
          'Content-Type': 'application/json'
        },
        body: raw
      })

      const jsonRes = await putRes.json()
      if (jsonRes.title === req.body.title) {
        req.session.flash = { type: 'success', text: 'Issue successfully updated.' }
      } else {
        req.session.flash = { type: 'danger', text: 'Problem encountered when trying to update the issue.' }
      }

      // Socket.io: Send the updated issue to all subscribers.
      res.io.emit('issue', {
        id: jsonRes.iid,
        title: jsonRes.title,
        description: jsonRes.description
      })

      res.redirect('..')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new issue and sync it to all subscribers.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create (req, res) {
    const viewData = {
      issues: [{
        id: req.body.id,
        title: req.body.title,
        description: req.body.description
      }]
    }

    // Socket.io: Send the created issue to all subscribers.
    res.io.emit('issue', viewData.issues[0])

    res.render('issues/index', { viewData })
  }
}
