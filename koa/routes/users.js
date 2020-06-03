const router = require('koa-router')()
const {getGrade}=require('../../routes/users/getGrade')
const {postQuestion}=require('../../routes/users/postQuestion')

router.prefix('/users')

router.get('/',async function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/getGrade',async function (ctx, next) {
  if(ctx.query.id==undefined){
    console.log(ctx.query)
ctx.body=`false`
  }else{
    const result=await getGrade(ctx.query.id)
  ctx.body = {code: 20000, data: `${result}` }
  }
  
})

router.post('/postQuestion',async function (ctx, next) {
  var {gradeID}=ctx.query
  console.log(gradeID)
  await postQuestion(gradeID)
  ctx.body = {code: 20000}
})

module.exports = router
