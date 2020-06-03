const router = require('koa-router')()
const path = require('path');
const fs = require('fs');
// import {query} from '../../routes/query'
const {query,queryUserInformation,createStudent}=require('../../routes/query')
const login=require('../../routes/login')
const getGrade=require('../../routes/users/getGrade')
const getUserInfo=require('../components/getUserInfo')



router.post('/login', async (ctx, next) => {
  var {username,password}=ctx.request.body
const result=await login(username,password)
 console.log(username,password)
//ctx.body={"code":20000,"data":{"token":"visitor-token"}};
ctx.body=result;
})

router.get('/json', async (ctx, next) => {
  const result=await query();
  console.log("--------------------------"+result);
  ctx.body =result;
  await next();
})

router.get('/getUserInformation', async (ctx, next) => {
  var {id}=ctx.query
    console.log("-----------------------"+id);
    const result1=await queryUserInformation(id);
    ctx.body = {code: 20000,result:result1};
 
 
  await next();
})
router.get('/getUserInfo', async (ctx, next) => {
  const {token}=ctx.query
  const result=await getUserInfo(token);
  console.log("--------------------------"+token);
  ctx.body =result
  await next();
})
router.post('/postStudentInformation', async (ctx,next) => {
  var data =ctx.query
  var { name, num, term, password, stu_class } = data
  await createStudent(name, num, stu_class, password, term )
  console.log("---"+num+"-"+name+"-"+stu_class+"-"+term+"+"+password)
  ctx.body ={code: 20000}
})
module.exports = router
