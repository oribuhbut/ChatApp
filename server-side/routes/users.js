var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var response = require('./../modules/response');
var jwt = require('jsonwebtoken');
var secret = "Mmd233lfKFdsfEWMcFR432FGkf4kfsldk53KDbbFGkfKgK43"
var con = mysql.createPool({
  connectionLimit: 100,
  host: "us-cdbr-iron-east-05.cleardb.net",
  user: "ba9bfd6c223252",
  password: "cd294583",
  database: "heroku_4317d32f10002e9",
  charset: "utf8mb4"
});

/* GET users listing. */
router.post('/', function (req, res, next) {
  const { username, password } = req.body;
  if (!username.length || !password.length) {
    response.getResponse(false, true, "חלק מהשדות חסרים", []);
    res.json(response.responesMessage());
    return;
  }
  con.query('SELECT * FROM users WHERE username=?', [username], function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error);
      res.json(response.responesMessage());
      return;
    }
    if (!result.length) {
      response.getResponse(false, true, "שם משתשמש או סיסמה לא נכונים", error);
      res.json(response.responesMessage());
      return;
    }
    bcrypt.compare(password, result[0].password, function (err, user) {
      if (user) {
        let userDetails = {
          username:result[0].username
        }
        var token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 1), userDetails }, secret);
        result.push(token);
        response.getResponse(true, false, "משתמש התחבר בהצלחה", result);
        res.json(response.responesMessage())
        return;
      }
      response.getResponse(false, true, "סיסמא לא נכונה", err)
      res.json(response.responesMessage());
      return;
    })
  })
})

router.post('/checklog',function(req,res,next){
  const { token } = req.body;
  try {
    var decoded = jwt.verify(token, secret);
  } catch(err) {
    response.getResponse(false, true, "לא נמצא משתמש", err)
    res.json(response.responesMessage());
    return;
  }
  con.query(`SELECT * FROM users WHERE username=?`,[decoded.userDetails.username],function(error,result){
    if(error){
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage());
      return;
    }
    if(!result.length){
      response.getResponse(false, true, "לא נמצא המשתמש", error)
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true, false, "המשתמש נמצא", result)
    res.json(response.responesMessage());
    return;
  })
})

router.post('/getUsers', function (req, res, next) {
  const { username } = req.body;
  con.query(`SELECT id,name,photo,username FROM users WHERE username in (SELECT contact_name FROM users_contacts WHERE user_name=? and status_friend=1)`, [username], function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", []);
      res.json(response.responesMessage());
      return;
    }
    if (!result.length) {
      response.getResponse(true, false, "אין לך אנשי קשר", result);
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true, false, "התקבלו", result);
    res.json(response.responesMessage());
  });
})


router.post('/newMessages', function (req, res, next) {
  const { id } = req.body;
  con.query(`SELECT * FROM messages WHERE id = ${id}`, function (error, result) {
    if (!result.length) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true, false, "הצליח", result);
    res.json(response.responesMessage());
  })
})

router.put('/', function (req, res, next) {

  const { name, username, password, gender, photo, useremail, age } = req.body;

  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      response.getResponse(true, false, "לא יכול להצפין את הסיסמא", err)
      res.json(response.responesMessage())
      return;
    }
    con.query('INSERT INTO users (name,username,password,gender,email,photo,age) VALUES(?,?,?,?,?,?,?)', [name, username, hash, gender, useremail, photo, age], function (error, result) {
      if (error) {
        response.getResponse(false, true, "שם משתמש או אימייל כבר בשימוש", error)
        res.json(response.responesMessage());
        return;
      }
      response.getResponse(true, false, "משתמש נרשם בהצלחה", result)
      res.json(response.responesMessage())
    })
  })
});

router.post('/contacts', function (req, res, next) {
  const { username, filter } = req.body;
  let filterText;
  if (filter == "none") {
    filterText = "'Male','Female'"
  }
  if (filter == "Male") {
    filterText = "'Male'"
  }
  if (filter == "Female") {
    filterText = "'Female'"
  }
  con.query('SELECT contact_name FROM users_contacts WHERE user_name=? and status IN(1,2)', [username], function (error, result1) {
    if (error) {
      response.getResponse(false, true, "", [])
      res.json(response.responesMessage())
      return;
    }
    if (result1.length < 1) {
      con.query(`SELECT * FROM users WHERE username !=? and gender IN (${filterText})`, [username], function (error, result) {
        if (error) {
          response.getResponse(false, true, "שגיאה", error)
          res.json(response.responesMessage())
          return;
        }
        if (result.length < 1) {
          response.getResponse(false, true, "אין תוצאות", error)
          res.json(response.responesMessage())
          return;
        }
        response.getResponse(true, false, "הצליח", [result])
        res.json(response.responesMessage())
        return;
      })
      return;
    }
    con.query(`SELECT * FROM users WHERE username NOT IN(SELECT contact_name FROM users_contacts WHERE user_name='${username}' and status IN(1,2)) and gender IN(${filterText}) and username !='${username}'`, function (error, result) {
      if (error) {
        response.getResponse(false, true, "שגיאה", [])
        res.json(response.responesMessage())
        return;
      }
      if (!result.length) {
        response.getResponse(false, true, "אין תוצאות", [])
        res.json(response.responesMessage())
        return;
      }
      response.getResponse(true, false, "הצליח", [result])
      res.json(response.responesMessage())
      return;
    })
  })
})

router.put('/addcontact', function (req, res, next) {
  const { loggedUser, contactUserName } = req.body;
  let textForMessagesTable = contactUserName + "," + loggedUser;
  con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage())
      return;
    }
    if (result.length > 0 && result[0].status == 1) {
      response.getResponse(true, false, "כבר עשית לייק למשתמש הזה", error)
      res.json(response.responesMessage())
      return;
    }
    if (result.length > 0 && result[0].status == 2) {
      response.getResponse(true, false, "כבר עשית אנלייק למשתמש הזה", error)
      res.json(response.responesMessage())
      return;
    }
    con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?', [contactUserName, loggedUser], function (error, result) {
      if (result.length > 0) {
        if (result[0].status == 2) {
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
            if (error) {
              response.getResponse(false, true, "שגיאה", error)
              res.json(response.responesMessage())
              return;
            }
            response.getResponse(true, false, "המשתמש עשה לך אנלייק", result)
            res.json(response.responesMessage())
          })
          return;
        }
        con.query('UPDATE users_contacts SET status_friend=1 WHERE user_name=? and contact_name=?', [contactUserName, loggedUser], function (error, result) {
          if (error) {
            response.getResponse(false, true, "שגיאה", error)
            res.json(response.responesMessage())
            return;
          }
          con.query('UPDATE users_contacts SET status_friend=1, status=1 WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
            if (error) {
              response.getResponse(false, true, "שגיאה", error)
              res.json(response.responesMessage())
              return;
            }
            con.query('INSERT INTO messages (users) VALUES(?)', [textForMessagesTable], function (error, result) {
              if (error) {
                response.getResponse(false, true, "לא יכול להוסיף את המשתמש", error)
                res.json(response.responesMessage())
                return;
              }
              response.getResponse(true, false, "match", result);
              res.json(response.responesMessage());
              return;
            });
          });
        })
      }
      else {
        con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,1,0)', [loggedUser, contactUserName], function (error, result) {
          if (error) {
            response.getResponse(false, true, "לא יכול להוסיף את המשתמש", error)
            res.json(response.responesMessage())
            return;
          }
          con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,0,0)', [contactUserName, loggedUser], function (error, result) {
            if (error) {
              response.getResponse(false, true, "לא יכול להוסיף את המשתמש", error)
              res.json(response.responesMessage())
              return;
            }
            response.getResponse(true, false, "משתמש נוסף בהצלחה", result);
            res.json(response.responesMessage());
          });
        });
      }
    })
  });
});

router.put('/ignorecontact', function (req, res, next) {
  const { loggedUser, contactUserName } = req.body;
  con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage())
      return;
    }
    if (result.length > 0 && result[0].status == 2) {
      response.getResponse(true, false, "כבר עשית אנלייק למשתמש הזה", error)
      res.json(response.responesMessage())
      return;
    }
    if (result.length > 0 && result[0].status == 1) {
      response.getResponse(true, false, "כבר עשית לייק למשתמש הזה", error)
      res.json(response.responesMessage())
      return;
    }
    if (result.length > 0) {
      con.query('SELECT * FROM users_contacts WHERE user_name=? and contact_name=?', [contactUserName, loggedUser], function (error, result) {
        if (error) {
          response.getResponse(false, true, "שגיאה", error)
          res.json(response.responesMessage())
          return;
        }
        if (result[0].status == 2) {
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
            if (error) {
              response.getResponse(false, true, "שגיאה", error)
              res.json(response.responesMessage())
              return;
            }
            response.getResponse(true, false, "שניכם לא עשיתם לייק אחד לשני", error)
            res.json(response.responesMessage())
            return;
          });
        }
        if (result[0].status == 1) {
          con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?', [loggedUser, contactUserName], function (error, result) {
            if (error) {
              response.getResponse(false, true, "שגיאה", error)
              res.json(response.responesMessage())
              return;
            }
            con.query('UPDATE users_contacts SET status=2 WHERE user_name=? and contact_name=?', [contactUserName, loggedUser], function (error, result) {
              if (error) {
                response.getResponse(false, true, "שגיאה", error)
                res.json(response.responesMessage())
                return;
              }
              response.getResponse(false, true, "המשתמש עשה לך לייק אבל אתה לא", error)
              res.json(response.responesMessage())
              return;
            })
          })
        }
      })
    }
    if (result.length == 0) {
      con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,2,0)', [loggedUser, contactUserName], function (error, result) {
        if (error) {
          response.getResponse(false, true, "שגיאה", error)
          res.json(response.responesMessage())
          return;
        }
        con.query('INSERT INTO users_contacts (user_name,contact_name,status,status_friend) VALUES(?,?,0,0)', [contactUserName, loggedUser], function (error, result) {
          if (error) {
            response.getResponse(false, true, "שגיאה", error)
            res.json(response.responesMessage())
            return;
          }
          response.getResponse(true, false, "משתמש הוסר בהצלחה", result);
          res.json(response.responesMessage());
          return;
        })
      })
    }
  })
});

router.post('/messages', function (req, res, next) {
  const { first, second } = req.body;
  let text1 = "'" + first + "," + second + "'";
  let text2 = "'" + second + "," + first + "'";
  con.query(`SELECT * FROM messages WHERE users IN(${text1},${text2}) `, function (error, result) {
    if (result.length == 0) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage())
      return;
    }
    response.getResponse(true, false, "קשר צלח", result);
    res.json(response.responesMessage());
  })
});

router.put('/messages', function (req, res, next) {
  const { first, second, message } = req.body;
  var today = new Date();
  var time = today.getHours() + 2 + ":" + today.getMinutes();
  if (today.getMinutes() < 10) {
    var time = today.getHours() + 2 + ':0' + today.getMinutes();
  }
  if (today.getSeconds() < 10) {
    var time = today.getHours() + 2 + ":" + today.getMinutes();
  }
  if (today.getSeconds() < 10 && today.getMinutes() < 10) {
    var time = today.getHours() + 2 + ":0" + today.getMinutes();
  }

  con.query(`UPDATE messages
    SET users_messages = CONCAT(users_messages,',','{"id":${first},"message":"${message}","date":"${time}"}')
    WHERE id = ${second};`, function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error);
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true, false, "הודעה נשלחה בהצלחה", result);
    res.json(response.responesMessage());
  });
});


router.post('/editphoto', function (req, res, next) {
  const { id, photo } = req.body;
  con.query(`UPDATE users SET photo='${photo}' WHERE id=${id}`, function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage());
      return;
    }
    response.getResponse(true, false, "התמונה עודכנה בהצלחה", result)
    res.json(response.responesMessage());
    return;
  })
})


router.delete('/', function (req, res, next) {
  const { id, username } = req.body;
  con.query(`DELETE FROM users WHERE id=${id}`, function (error, result) {
    if (error) {
      response.getResponse(false, true, "שגיאה", error)
      res.json(response.responesMessage());
      return;
    }
    con.query(`DELETE FROM users_contacts WHERE user_name='${username}' OR contact_name='${username}'`, function (error, result) {
      if (error) {
        response.getResponse(false, true, "שגיאה", error)
        res.json(response.responesMessage());
        return;
      }
      con.query(`DELETE FROM messages WHERE (users LIKE '%,${username}%' OR users LIKE '%${username},%')`, function (error, result) {
        if (error) {
          response.getResponse(false, true, "שגיאה", error)
          res.json(response.responesMessage());
          return;
        }
        response.getResponse(true, false, "החשבון נמחק בהצלחה", result)
        res.json(response.responesMessage());
        return;
      })
    })
  })
})
module.exports = router;