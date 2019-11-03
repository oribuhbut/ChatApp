var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var response = require('./../modules/response');
var con = mysql.createPool({
  connectionLimit : 100,
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "ba9bfd6c223252",
  password: "cd294583",
  database:"heroku_4317d32f10002e9",
  charset:"utf8mb4"
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  let userName= req.query.username;
  let Password = req.query.password;
    if(userName.length<1||Password.length<1){
      response.getResponse(false,true,"חלק מהשדות חסרים",[]);
      res.json(response.responesMessage());
      return;
    }
      con.query('SELECT * FROM users WHERE username=? and password =?',[userName,Password],function(error,result,fields){
        if(result.length>0){
          req.session.userDetails = result[0];
          req.session.save;
          response.getResponse(true,false,"משתמש התחבר בהצלחה",result);
          res.json(response.responesMessage());
          return;
        }
          response.getResponse(false,true,"שם משתמש או סיסמה לא נכונים",error);
          res.json(response.responesMessage());
      })
})

router.get('/checklog',function(req,res,next){
  if(req.session.userDetails){
    response.getResponse(true,false,"user still logged",req.session.userDetails);
    res.json(response.responesMessage());
    return;
  }
  else{
    response.getResponse(false,true,"user not logged anymore",[]);
    res.json(response.responesMessage());
  }
})

router.get('/getUsers', function(req, res, next) {
  let text = "";
  let username= req.query.username;
  con.query('SELECT contact_name FROM users_contacts WHERE user_name=? and status_friend=1',[username],function(error,result,fields){
    if(result.length == 0){
      response.getResponse(false,true,"אין לך אנשי קשר",error);
      res.json(response.responesMessage());
      return;
    }
    for(let i=0; i<result.length;i++){
      if(i==result.length-1){
        text+= "'"+result[i].contact_name+"'";
      }
      else{
        text+="'"+result[i].contact_name+"'" + ","
      }
    }
      con.query(`SELECT id,name,photo,username FROM users WHERE username in (${text})`,function(error,result,fields){
        if(error){
          response.getResponse(false,true,"שגיאה",[]);
          res.json(response.responesMessage());
          return;
        }
        response.getResponse(true,false,"התקבלו",result);
        res.json(response.responesMessage());
      });
  })
})
  

router.get('/newMessages',function(req,res,next){
let id = req.query.id;
console.log(id)
con.query(`SELECT * FROM messages WHERE id = ${id}`,function(error,result){
  if(result.length == 0){
    response.getResponse(false,true,"Error",error)
    res.json(response.responesMessage());
    return;
  }
  response.getResponse(true,false,"Success",result);
  res.json(response.responesMessage());
})
})

router.put('/', function(req, res, next) {

  let useremail = req.body.useremail
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let gender = req.body.gender;
  let photo = req.body.photo;
  let age = req.body.age;

  con.query('INSERT INTO users (name,username,password,gender,email,photo,age) VALUES(?,?,?,?,?,?,?)',[name,username,password,gender,useremail,photo,age],function(error,result,fields){
    if(error){
      response.getResponse(false,true,"שם משתמש או אימייל כבר בשימוש",error)
      res.json(response.responesMessage());
      console.log(error)
      return;
    }
    response.getResponse(true,false,"משתמש נרשם בהצלחה",result)
    res.json(response.responesMessage())
  })
});

router.get('/contacts',function(req,res,next){
  let username = req.query.username;
  let filter = req.query.filter;
  let filterText;
  if(filter == "none"){
filterText = "'Male','Female'"
  }
  if(filter == "Male"){
    filterText = "'Male'"
  }
  if(filter == "Female"){
    filterText = "'Female'"
  }
  con.query('SELECT contact_name FROM users_contacts WHERE user_name=? and status IN(1,2)',[username],function(error,result1){
    if(error){
      response.getResponse(false,true,"",[])
      res.json(response.responesMessage())
      return;
    }
    if(result1.length<1){
      con.query(`SELECT * FROM users WHERE username !=? and gender IN (${filterText})`,[username],function(error,result){
        if(error){
          response.getResponse(false,true,"שגיאה",error)
          res.json(response.responesMessage())
          return;
        }
        if(result.length < 1){
          response.getResponse(false,true,"אין תוצאות",error)
          res.json(response.responesMessage())
          return;
        }
        response.getResponse(true,false,"הצליח",[result])
        res.json(response.responesMessage())
        return;
      })
      return;
    }
    let text ="";
      for(let i=0;i<result1.length;i++){
        if(i==0){
          text+= "'"+result1[i].contact_name+"'"
        }
        else{
          text+= ",'"+ result1[i].contact_name +"'"
        }
      }
    con.query(`SELECT * FROM users WHERE username NOT IN(${text},'${username}') and gender IN(${filterText})`,function(error,result){
      console.log("text :", text)
      console.log("changes apply")
      if(error){
        response.getResponse(false,true,"שגיאה",[])
        res.json(response.responesMessage())
        return;
      }
      if(result.length < 1){
        response.getResponse(false,true,"אין תוצאות",[])
        res.json(response.responesMessage())
        return;
      }
      response.getResponse(true,false,"הצליח",[result])
      res.json(response.responesMessage())
      return;
    })
  })
})

router.put('/addcontact', function(req, res, next) {
  let contactUsername = req.body.contactUsername;
  let loggedUser = req.body.loggedUser;
  let text = contactUsername+","+loggedUser;
  con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result){
    if(error)
    {
      response.getResponse(false,true,"error",error)
      res.json(response.responesMessage())
      return;
    }
    if(result.length > 0 && result[0].status == 1)
    {
      response.getResponse(true,false,"you already liked this user",error)
      res.json(response.responesMessage())
      return;
    }
    if(result.length > 0 && result[0].status == 2)
    {
      response.getResponse(true,false,"you already disliked this user",error)
      res.json(response.responesMessage())
      return;
    }
    con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?',[contactUsername,loggedUser],function(error,result,fields){
      if(result.length > 0){
        console.log("status",result[0].status)
        if(result[0].status == 2){
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result,fields){
            if(error){
              response.getResponse(false,true,"error",error)
              res.json(response.responesMessage())
              return;
            }
          response.getResponse(true,false,"the user not like you",result)
          res.json(response.responesMessage())
          })
          return;
        }
        con.query('UPDATE users_contacts SET status_friend=1 WHERE user_name=? and contact_name=?',[contactUsername,loggedUser],function(error,result){
          if(error){
            response.getResponse(false,true,"error",error)
            res.json(response.responesMessage())
            return;
          }
          con.query('UPDATE users_contacts SET status_friend=1, status=1 WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result,fields){
            if(error){
              response.getResponse(false,true,"error",error)
              res.json(response.responesMessage())
              return;
            }
            con.query('INSERT INTO messages (users) VALUES(?)',[text],function(error,result,fields){
              if(error){ 
                response.getResponse(false,true,"לא יכול להוסיף את המשתמש",error)
                res.json(response.responesMessage())
                return;
              }
              response.getResponse(true,false,"match",result);
              res.json(response.responesMessage());
              return;
            });
          });
        })
    }
    else{
      con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,1,0)',[loggedUser,contactUsername],function(error,result,fields){
        if(error){ 
          response.getResponse(false,true,"לא יכול להוסיף את המשתמש",error)
          res.json(response.responesMessage())
          return;
        }
        con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,0,0)',[contactUsername,loggedUser],function(error,result,fields){
          if(error){ 
            response.getResponse(false,true,"לא יכול להוסיף את המשתמש",error)
            res.json(response.responesMessage())
            return;
          }
        response.getResponse(true,false,"משתמש נוסף בהצלחה",result);
        res.json(response.responesMessage());
        });
       });
      }
    })
  });
});

router.get('/messages', function(req, res, next) {
  let first= req.query.first;
  let second = req.query.second;
  let text1 = "'"+first+","+second+"'";
  let text2 = "'"+second+","+first+"'";
con.query(`SELECT * FROM messages WHERE (users=${text1}) OR (users=${text2}) `,function(error,result,fields){
  if(result.length == 0){
    response.getResponse(false,true,"שגיאה",error)
    res.json(response.responesMessage())
    return;
  }
  response.getResponse(true,false,"קשר צלח",result);
  res.json(response.responesMessage());
})
});

router.put('/messages', function(req, res, next) {
 let first = req.query.first;
 let second = req.query.second;
 let message = req.query.message;
 var today = new Date();
 var time = today.getHours() +2 + ":" + today.getMinutes() + ":" + today.getSeconds();

 if(today.getMinutes() < 10 ){
  var time = today.getHours() + 2 + ':0' + today.getMinutes() + ":" +today.getSeconds();
  }

  if(today.getSeconds() < 10){
  var time = today.getHours() + 2 + ":" + today.getMinutes() + ":0" + today.getSeconds();
  }

  if(today.getSeconds() < 10 && today.getMinutes() < 10){
    var time = today.getHours() + 2 + ":0" + today.getMinutes() + ":0" + today.getSeconds();
  }

con.query(`UPDATE messages
SET users_messages = CONCAT(users_messages,',','{"id":${first},"message":"${message}","date":"${time}"}')
WHERE id = ${second};`,function(error,result,fields){
  if(error){
    response.getResponse(false,true,"לא יכול לשלוח את ההודעה",error);
    res.json(response.responesMessage());
    return;
  }
  con.query(`SELECT * FROM messages WHERE id=${second}`,function(error,result,fields){
  if(error){
    response.getResponse(false,true,"לא יכול לשלוח את ההודעה",error);
    res.json(response.responesMessage());
    return;
  }
  response.getResponse(true,false,"הודעה נשלחה בהצלחה",result);
  res.json(response.responesMessage());
});
})
});


router.put('/ignorecontact', function(req, res, next) {
  let contactUsername = req.body.contactUsername;
  let loggedUser = req.body.loggedUser;
  con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result){
    if(error)
    {
      response.getResponse(false,true,"error",error)
      res.json(response.responesMessage())
      return;
    }
    if(result.length > 0 && result[0].status == 2)
    {
      response.getResponse(true,false,"you already disliked this user",error)
      res.json(response.responesMessage())
      return;
    }
    if(result.length > 0 && result[0].status == 1)
    {
      response.getResponse(true,false,"you already liked this user",error)
      res.json(response.responesMessage())
      return;
    }
    if(result.length > 0 ){
      con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?',[contactUsername,loggedUser],function(error,result){
        if(error)
        {
          response.getResponse(false,true,"error",error)
          res.json(response.responesMessage())
          return;
        }
        if(result[0].status == 2){
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result,fields){
            if(error){
              response.getResponse(false,true,"error",error)
              res.json(response.responesMessage())
              return;
            }
            response.getResponse(true,false,"you both didnt liked each other",error)
            res.json(response.responesMessage())
            return;
          });
        }
        if(result[0].status == 1){
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?',[loggedUser,contactUsername],function(error,result,fields){
            if(error){
              response.getResponse(false,true,"error",error)
              res.json(response.responesMessage())
              return;
            }
            con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?',[contactUsername,loggedUser],function(error,result,fields){
              if(error){
                response.getResponse(false,true,"error",error)
                res.json(response.responesMessage())
                return;
              }
            response.getResponse(false,true,"user liked you but you not",error)
            res.json(response.responesMessage())
            return;
            })
          })
        }
      })
    }
    if(result.length == 0){
      con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,2,0)',[loggedUser,contactUsername],function(error,result,fields){
        if(error){ 
          response.getResponse(false,true,"לא יכול להסיר את המשתמש",error)
          res.json(response.responesMessage())
          return;
        }
        con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,0,0)',[contactUsername,loggedUser],function(error,result,fields){
          if(error){ 
            response.getResponse(false,true,"לא יכול להסיר את המשתמש",error)
            res.json(response.responesMessage())
            return;
          }
        response.getResponse(true,false,"משתמש הוסר בהצלחה",result);
        res.json(response.responesMessage());
        return;
        })
    })
  }
})
});

router.post('/editphoto',function(req,res,next){
  let photo = req.body.photo;
  let id = req.body.id;
  con.query(`UPDATE users SET photo='${photo}' WHERE id=${id}`,function(error,result){
    if(error){
      response.getResponse(false,true,"Error",error)
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true,false,"photo edited successfully",result)
    res.json(response.responesMessage());
    return;
  })
})


router.delete('/',function(req,res,next){
  let id = req.body.id;
  let username = req.body.username;
  con.query(`DELETE FROM users WHERE id=${id}`,function(error,result){
    if(error){
      response.getResponse(false,true,"Error",error)
      res.json(response.responesMessage());
      return;
    }
    con.query(`DELETE FROM users_contacts WHERE user_name='${username}' OR contact_name='${username}'`,function(error,result){
      if(error){
        response.getResponse(false,true,"Error",error)
        res.json(response.responesMessage());
        return;
      }
      con.query(`DELETE FROM messages WHERE (users LIKE '%,${username}%' OR users LIKE '%${username},%')`,function(error,result){
        if(error){
          response.getResponse(false,true,"Error",error)
          res.json(response.responesMessage());
          return;
        }
        response.getResponse(true,false,"User Deleted",result)
        res.json(response.responesMessage());
        return;
      })
    })
  })
})
module.exports = router;
