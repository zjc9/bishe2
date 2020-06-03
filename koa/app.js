const Koa = require('koa')
var cors=require('koa2-cors')
const path = require('path');
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const serve = require('koa-static')
const multer=require('koa-multer')
const send = require('koa-send');

const Router=require('koa-router')()
const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')
const teacher = require('./routes/teacher')
var {upload_question,upload_homework} =require('../routes/users/upload')
const home   = serve(path.join(__dirname)+'/public/')
var gradeID=''
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
      cb(null, 'public/upload/homework')
  },
  //修改文件名称
  filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
      console.log('origin=='+file.originalname)
      cb(null,fileFormat[0] + "." + fileFormat[fileFormat.length - 1]);
  }
});
var storage_question = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
      cb(null, 'public/upload/question')
  },
  //修改文件名称
  filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");  //以点分割成数组，数组的最后一项就是后缀名
      console.log('origin'+file.originalname)
      cb(null,'作业-'+fileFormat[0] + "." + fileFormat[fileFormat.length - 1]);
  }
});
var upload = multer({ storage: storage });
var upload_question=multer({ storage: storage_question})
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(cors())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(home)
app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

Router.get('/',async (ctx,next)=>{
  let title = '文件上传';
  await ctx.render('index', {
      title
  })
  await next()
});
Router.post('/upload',upload.single('file'),async(ctx,next)=>{
  // 请求的参数为
  // var param = ctx.req.body;

  // 获取保存的路径
  // var path = ctx.req.file;
gradeID=ctx.req.body.gradeID
console.log(`gradeID=${gradeID}`)
  var path = ctx.req.file.path.split('/')
  path =  path[1] + '/' + path[2];
  var port = ctx.req.headers.host.split(':')[1]
  await upload_homework(gradeID,ctx.req.file.originalname)
  ctx.body = {
    code: 20000,
      filename: ctx.req.file.originalname,//返回文件名
      url:'http://' + ctx.req.headers.host+ '/' + path // 返回访问路径
  }
});
Router.post('/uploadq',upload_question.single('file'),async(ctx,next)=>{
  // 请求的参数为
  // var param = ctx.req.body;

  // 获取保存的路径
  // var path = ctx.req.file;

  var path = ctx.req.file.path.split('/')
  path =  path[1] + '/' + path[2];
  var port = ctx.req.headers.host.split(':')[1]
  ctx.body = {
      filename: ctx.req.file.originalname,//返回文件名
      url:'http://' + ctx.req.headers.host+ '/' + path // 返回访问路径
  }
});
Router.get('/download', async function (ctx) {
  // 为了方便演示，这里直接下载index页面
  var {id}=ctx.query
  console.log(id )
  var fileName = `${id}`;
  // Set Content-Disposition to "attachment" to signal the client to prompt for download.
  // Optionally specify the filename of the download.
  // 设置实体头（表示消息体的附加信息的头字段）,提示浏览器以文件下载的方式打开
  // 也可以直接设置 ctx.set("Content-disposition", "attachment; filename=" + fileName);
  ctx.attachment(fileName);
  await send(ctx, fileName, { root: __dirname + '/public'+'/upload' + '/homework' });
});

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), index.allowedMethods())
app.use(teacher.routes(), users.allowedMethods())
app.use(Router.routes(),Router.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
