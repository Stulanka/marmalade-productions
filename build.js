var start = Date.now()
var fs = require('fs')
var path = require('path')
var find = require('find')
var jade = require('jade')
var async = require('async')
var mkdirp = require('mkdirp')

var inputDir = path.join(__dirname, 'pages')
var outputDir = path.join(__dirname, 'dist')

find.file(/\index.jade$/, inputDir, (files) => {
  var tasks = files.map(tpl => {
    var name = path.dirname(path.relative(inputDir, tpl))
    return {
      name: name,
      input: tpl,
      output: path.join(outputDir, name, 'index.html'),
      content: path.join(path.dirname(tpl), 'content.json')
    }
  })

  tasks.forEach((task) => {
    var locals = { content: require(task.content), pretty: true }
    task.html = jade.renderFile(task.input, locals)
  })

  // shift output of home
  tasks.filter(task => task.name === 'home')
    .forEach(task => { task.output = path.join(outputDir, 'index.html') })

  async.each(tasks, (task, done) => {
    console.log('build.js: Writing ' + path.relative(__dirname, task.output))
    mkdirp(path.dirname(task.output), () => {
      fs.writeFile(task.output, task.html, {encoding: 'utf8'}, done)
    })
  }, (err) => {
    if (err) return console.error('build.js: ', err)
    console.log('build.js: Compiled %s templates to dist in %sms', tasks.length, Date.now() - start)
  })
})
