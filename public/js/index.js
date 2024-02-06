import '../socket.io/socket.io.js'

const issueTemplate = document.querySelector('#issue-template')
const baseURL = document.querySelector('base').getAttribute('href')

// If taskTemplate is not present on the page, just ignore and do not listen for issues
if (issueTemplate) {
  // Create a Handlebars template from the template-tag (rendered from index.hbs)
  const hbsTemplate = window.Handlebars.compile(issueTemplate.innerHTML)

  // Create a socket connection using Socket.io
  const socket = window.io({ path: `${baseURL}socket.io` })

  // Listen for issue.
  socket.on('issue', arg => {
    const issueString = hbsTemplate(arg)
    const tr = document.createElement('tr')
    tr.innerHTML = issueString

    const issueList = document.querySelector('#issue-list')
    issueList.appendChild(tr)
  })
}
