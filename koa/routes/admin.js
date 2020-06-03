const router = require('koa-router')()
const send = require('koa-send');
const {createStudent,checkGrade,queryAllGrade,QueryAllStudent}=require('../../routes/admin/admin')

router.prefix('/admin')

router.get('/',async function (ctx, next) {
  var result=await queryAllGrade()
  ctx.body = {code : 20000,data: `${result}`}
})

router.post('/createStudent', async function (ctx, next) {
  var data =ctx.request.body
  for(let i =0;i<data.length;i++){
    var {stu_id ,stu_class,stu_name,term} = data[i];
    // await createStudent(id,bj,name,password,term);
    console.log("执行了createstudent")
   console.log(stu_id ,stu_class,stu_name,term)
   await createStudent(stu_id ,stu_class,stu_name,stu_id,term);
  }

  
  //  console.log("执行了createstudent")
  //  console.log(stu_id ,stu_class,stu_name,term)
  ctx.body ={code : 20000}
})

router.get('/createTeacher', function (ctx, next) {
  ctx.body = 'createTeacher'
})
router.get('/queryAllStudent',async function (ctx, next) {
  var result=await QueryAllStudent()
    ctx.body ={code : 20000,data: result}
  })
  router.get('/updateTeacher', function (ctx, next) {
    ctx.body = 'upadteTeacher'
  })
  router.get('/checkGrade',async function (ctx, next) {
    var gradeID=ctx.query
    var g=JSON.stringify(gradeID.gradeID)
    var gradeid=g.split('"')
    gradeid.pop()
    var g2=gradeid[1]
    var grade=g2.split(',')
    grade.pop()
    console.log(grade)
    await checkGrade(grade)
    ctx.body = {code: 20000}
  })
 
  router.post('/posttest', function (ctx, next) {
    var {id ,bj,name,password} = ctx.query;

    console.log(id ,bj,name,password)
    ctx.body = {
"success": true
    }
  })

module.exports = router
