var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mysql = require('mysql');
var response = require('./../modules/response');
var key;
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"chatdb"
});

var transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user:'moshebuhbutbu@gmail.com',
    pass:'fqnyngvchgnjsked'
  },
  tls: {
    rejectUnauthorized: false
}
});

var mailOptions = {
  from:'buhbutbu@gmail.com',
  to:"",
  subject:'Account Configuration',
  text:""
};

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
  console.log(req.session);
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


router.put('/email', function(req, res, next) {
  key="";
  key = parseInt(Math.random()*9999) + 1000;
  mailOptions.text="";
  mailOptions.text ="This message is from GeminiChat, Your register one time key is : " + String(key) + " .... Have Fun!";
  mailOptions.to="";
  let email = req.query.email;
  if(email.length<1){
    response.getResponse(false,true,"חלק מהשדות חסרים",[])
    res.json(response.responesMessage());
    return;
  }
  mailOptions.to = email;
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    response.getResponse(false,true,"מייל לא תקין",error)
    res.json(response.responesMessage());
    return;
  } else {
response.getResponse(true,false,"מייל נשלח",info.response)
    res.json(response.responesMessage());
  }
});
})



router.put('/', function(req, res, next) {

  let useremail = req.body.useremail
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let gender = req.body.gender;
  let photo = req.body.photo;
  let email = req.body.email;

   if(email != key){
     res.end("Email Key Is Wrong");
     return;
   }

  con.query('INSERT INTO users (name,username,password,gender,email,photo) VALUES(?,?,?,?,?,?)',[name,username,password,gender,useremail,photo],function(error,result,fields){
    if(error){
      response.getResponse(false,true,"שם משתמש או אימייל כבר בשימוש",error)
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true,false,"משתמש נרשם בהצלחה",result)
    res.json(response.responesMessage())
  })
});

router.get('/contacts',function(req,res,next){
  let username = req.query.username;
  con.query('SELECT contact_name FROM users_contacts WHERE user_name=? and status=1',[username],function(error,result1){
    if(error){
      response.getResponse(false,true,"",[])
      res.json(response.responesMessage())
      return;
    }
    if(result1.length<1){
      con.query(`SELECT * FROM users WHERE username !=?`,[username],function(error,result){
        if(error){
          response.getResponse(false,true,"שגיאה",[error])
          res.json(response.responesMessage())
          return;
        }
        if(result.length < 1){
          response.getResponse(false,true,"אין תוצאות",[error])
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
          text+= "and username != " + "'"+result1[i].contact_name+"'"
        }
        else{
          text+= " and username != " + "'"+ result1[i].contact_name +"'"
        }
      }
    con.query(`SELECT * FROM users WHERE username !=? ${text}`,[username],function(error,result){
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
  con.query('SELECT * FROM users WHERE username=?',[contactUsername],function(error,result,fields){
    if(result.length == 0){
      response.getResponse(false,true,"משתמש לא נמצא",error)
      res.json(response.responesMessage())
      return;
    }
    con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?',[contactUsername,loggedUser],function(error,result,fields){
      if(result.length > 0){
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
  router.post('')

router.put('/messages', function(req, res, next) {
 let first = req.query.first;
 let second = req.query.second;
 let message = req.query.message;
 var today = new Date();
 var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
 console.log(typeof(today.getSeconds()))
 if(today.getMinutes() < 10 ){
  var time = today.getHours() + ':0' + today.getMinutes() + ":" +today.getSeconds();
  }
  if(today.getSeconds() < 10){
  var time = today.getHours() + ":" + today.getMinutes() + ":0" + today.getSeconds();
  }
  
  if(today.getHours() == 0){
    var time = today.getHours() + "0:" + today.getMinutes() + ":" + today.getSeconds();
  }

con.query(`UPDATE messages
SET users_messages = IF(
JSON_TYPE(users_messages) <=> 'ARRAY',
users_messages,
JSON_ARRAY()
),
users_messages = JSON_ARRAY_APPEND(users_messages,'$',JSON_OBJECT('id',${first},'message',?,'date','${time}'))
WHERE id = ${second};`,[message],function(error,result,fields){
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

router.put('/typing',function(req,res,next){
let first = req.query.first;
let second = req.query.second;
for(let i=0;i<users.length;i++){
  if(users[i].id == second){
    for(let x=0;x<users[i].userDetails.length;x++){
      if(users[i].userDetails[x].id == first){
        users[i].userDetails[x].typing = true;
        res.json(users);
        setTimeout(function(){users[i].userDetails[x].typing = false},3000);
        return;
      }
    }
  }
}
res.end("not-worked")
})

router.get('/typeCheck',function(req,res,next){
  let first = req.query.first;
  let second = req.query.second
  for(let i=0;i<users.length;i++){
    if(users[i].id == first){
      for(let x=0;x<users[i].userDetails.length;x++){
        if(users[i].userDetails[x].id == second && users[i].userDetails[x].typing == true){
res.send('user-typing')
        }
      }
    }
  }
  res.end("user-not-typing");
  })

module.exports = router;
