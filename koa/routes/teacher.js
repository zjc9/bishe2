const router = require('koa-router')()
const {postGrade}=require('../../routes/teacher/postGrade')

router.prefix('/teacher')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a teacher!'
})

router.post('/postGrade',async function (ctx, next) {
  
if(ctx.request.body===undefined){
  // await postGrade(ctx.query)
  console.log(ctx.request.body)
}else{
  // 
  var arr=ctx.request.body
  ctx.body={code:20000}
  console.log(JSON.stringify(arr))
  var {stu_name,num,bj,term,teacher,course,kt1,kt2,kt3,dm1,dm2,dm3,sy1,sy2,sy3,ps_grade,qm_grade,totalgrade,sta}=arr[0]
   await postGrade(arr)
  var stu_name=[]
  for(let i=0;i<arr.length;i++){
    stu_name.push(arr[i].stu_name)
  }
  console.log(stu_name)
 
}
})

router.get('/updateGrade', function (ctx, next) {
    ctx.body = 'teacher updateGrade'
  })

module.exports = router
