const tokens = {
    admin: {
      token: 'admin-token'
    },
    editor: {
      token: 'editor-token'
    },
    visitor: {
      token: 'editor-token'
    },
    student: {
      token: 'student-token'
    },
    manager: {
      token: 'manager-token'
    },
    teacher: {
      token: 'teacher-token'
    }
  }
  
  const users = {
    'admin-token': {
      roles: ['admin'],
      introduction: 'I am a super administrator',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Super Admin'
    },
    'editor-token': {
      roles: ['editor'],
      introduction: 'I am an editor',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Normal Editor'
    },
    'visitor-token': {
      roles: ['visitor'],
      introduction: 'I am an visitor',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Normal visitor'
    },
    'student-token': {
      roles: ['student'],
      introduction: 'I am an student',
      avatar: 'https://zjc9.gitee.io/blog/assets/user.jpg',
      name: 'Normal visitor'
    }, 'manager-token': {
      roles: ['manager'],
      introduction: 'I am an manager',
      avatar: 'https://zjc9.gitee.io/blog/assets/admin.jpg',
      name: 'Normal visitor'
    },
    'teacher-token': {
      roles: ['teacher'],
      introduction: 'I am an teacher',
      avatar: 'https://zjc9.gitee.io/blog/assets/teacher.jpg',
      name: 'Normal visitor'
    }
  }


  async function getUserInfo(username){
    
    const info = users[username]
console.log(`info==${info}`)
    console.log(username)
    if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
  }

  module.exports=getUserInfo