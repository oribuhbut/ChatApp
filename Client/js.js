var tempObj = {};
var tempImg =""
var tempId;
var socket;

$(document).ready(function(){
    socket = io('https://geminichat.herokuapp.com/');
    socket.on('connect',function(){
        console.log("socket on")
    })
    socket.on('newmessage',function(id){
        checkForNewMessages(id)
    })
    socket.on('newmatch',function(result){
        if(result.result.username == tempObj.username){
        getUsers(tempObj.username);
      alertify.alert().setContent(`<h1 class="display-4 lead">YAY!</h1><br><p class="lead">יש לך התאמה חדש עם</p><strong>${result.result.tempObj.name}!!</strong>`).show();
      $(".ajs-header").html("");
        }
    })
    socket.on('usersocket',function(){
        getUsers(tempObj.username);
    })
    checkIfUserLogged()
    $(".active").css("display","block");
})


//return from edit to main page

$("#returnFromEdit").on("click",function(){
    $(".tab-item-5").hide();
    $(".tab-item-3").show();
})


//return from register to login

$("#returnFromRegister").on("click",function(){
    $(".tab-item-2").hide();
    $(".tab-item-1").show();
})

//check if user is logged

function checkIfUserLogged(){
    fetch('https://geminichat.herokuapp.com/users/checklog',{
        credentials:'include' 
    })
    .then((result)=>{
        return result.json();
    })
    .then((result)=>{
        if(result.error === true ){
            return; 
        }
        else{
            tempObj = result.data[0];
            $("#userTitleName").text(result.data[0].name)
            $("#profileImg").attr("src",result.data[0].photo);
            $("#alertMessage1").hide();
            $(".tab-item-1").hide()
            $(".tab-item-3").show()
            getUsers(username);
        }
    })
    .catch((err)=>{
        console.log("Error",err);
        return;
    })
}

//back to main page

$("#backToMainPage").on("click",function(){
    $(".tab-item-4").hide();
    $(".tab-item-3").show();
})

//register photo preview

function previewFile() {
    var preview = document.getElementById('previewImg');
    var file    = document.getElementById('photo1').files[0];
    var reader  = new FileReader();
  
    reader.onloadend = function () {
      preview.src = reader.result;
      tempImg = reader.result;
    }
  
    if (file) {
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
    }
  }

// register button
$("#loginBtn").on("click",function(){
tempImg="";
$("#email").show();
$("#email").val("")
$("#name").val("");
$("#userName").val("");
$("#password").val("");
$(".tab-item-1").hide()
$(".tab-item-2").show()
$(".tab-item-1").removeClass("active");
$(".tab-item-2").addClass("active");
})

//login function

$("#loginButton").on("click",function(){
    let username = $("#loginUserName").val();
    let password = $("#loginPassword").val();
    if(username.length<1||password.length<1){
        $("#alertMessage1").find("span").text("חלק מהשדות חסרים");
        $("#alertMessage1").show(500);
        return;
    }
    $(".tab-item-1").hide()
    $("#loader2").show()
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/?username=${username}&password=${password}`,
        type:"GET",
        success:function(result){
            if(result.error == true ){
                $("#loader2").hide()
                 $(".tab-item-1").show()
                $("#alertMessage1").find("span").text(result.message);
                $("#alertMessage1").show(500);
                return; 
            }
            else{
                tempObj = result.data[0];
                $("#userTitleName").text(result.data[0].name)
                $("#profileImg").attr("src",result.data[0].photo);
                $("#alertMessage1").hide();
                $(".tab-item-1").hide()
                $(".tab-item-3").show()
                $("#loader2").hide()
                getUsers(username);
                setTimeout(function(){alertify.alert().setContent(`<h3>רק מזכירים לכם</h3><br><p class="lead">ניתן לשנות את הגדרות החיפוש בכניסה להגדרות המשתמש</p>`).show(); $(".ajs-header").html("");},3000);
            }
        },
        error:function(xhr){
console.log("Error",xhr);
        }
    })
})

//get users

function getUsers(username){
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/getUsers/?username=${username}`,
        type:"GET",
        success:function(result){
            $("#chatUsersList").html("");
            if(result.data == null){
                return;
            }
            for(let i=0;i<result.data.length;i++){
                let user = $(`<a onclick=getMessages("${result.data[i].username}","${result.data[i].photo}") class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"><h6 class="lead">${result.data[i].name}</h6><img data-toggle="modal" data-target="#myModal" onclick=showProfileImg("${result.data[i].photo}") style="border-radius:50%; width:22%; height:54px;" src="${result.data[i].photo}"></img></a>`);
                $("#chatUsersList").append(user);
            }
        },
        error:function(xhr){
            console.log("Error" ,xhr);
        }
    })
}

// log Out Function

$("#logOutFunction").on("click",function(){
    $("#profileImg").attr("src","");
    $("#userAdder").val("");
    $("#alertMessage3").hide();
    $("#contactName").text("")
    $("#chatUsersList").html("");
    $("#messages").html("");
    $("#loginUserName").val("");
    $("#loginPassword").val("");
    $(".tab-item-3").hide();
    $(".tab-item-1").show();
    $(".chatClass").hide();
    tempId=null;
})

//register function 

$("#registerButton").on("click",function(){
    $("#loginUserName").val("");
    $("#loginPassword").val("")
    $("#alertMessage1").hide();
    $("#alertMessage2").hide();
    let name = $("#name").val();
    let userName= $("#userName").val();
    let password = $("#password").val();
    let ageValue = $("#age").val();
    let validAgeChecker = Math.abs(new Date() - new Date(ageValue.replace(/-/g,'/')));
    let fixedAge = parseInt(validAgeChecker/31536000000);
    let gender = $("#gender").val();
    let email = $("#email").val()
    let photo = tempImg;
    let regex =  /[\+\&\#\'\"\/\\]/;
    
    if(userName.match(regex)){
    $("#alertMessage2").find("span").text("שם משתמש לא יכול להכיל את התווים הבאים:'+&#/ ");
    $("#alertMessage2").show();
    return;  
    }
     if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
  {
    $("#alertMessage2").find("span").text("אימייל לא תקין");
    $("#alertMessage2").show();
    return; 
  }
    
    let today = new Date();
    if(validAgeChecker/31536000000 < 18.013){
        $("#alertMessage2").find("span").text("עלייך להיות מעל גיל 18 כדי להירשם");
        $("#alertMessage2").show();
        return;
    }
    
    if(photo.length < 1){
        $("#alertMessage2").find("span").text("חסרה תמונה");
        $("#alertMessage2").show();
        return;
    }
    if(name.length==0||userName.length==0||password.length==0||email.length==0)
    {
        $("#alertMessage2").find("span").text("חלק מהשדות חסרים");
        $("#alertMessage2").show();
        return;
    }
    if(userName.indexOf(" ") > 0){
        $("#alertMessage2").find("span").text("שם משתמש לא יכול להכיל רווח");
        $("#alertMessage2").show();
        return;
    }
    $("#loader1").show();
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/?`,
        type:"PUT",
        data:{name:name,username:userName,password:password,gender:gender,photo:photo,useremail:email,age:fixedAge},
        success:function(result){
            $("#loader1").hide();
            if(result.error==true){
                $("#userName").val("");
                $("#email").val("");
                $("#email").show()
                $("#alertMessage2").find("span").text(result.message);
                $("#alertMessage2").show()
                $("#loader1").hide();
                return;
            }
            if(result == "Email Key Is Wrong"){
                $("#alertMessage2").find("span").text("קוד אימות לא תקין");
                $("#alertMessage2").show()
                $("#loader1").hide();
                return;
            }
            $("#email").val("");
            $("#previewImg").attr("src","");
            $("#alertMessage2").hide();
            $(".tab-item-2").hide()
            $(".tab-item-1").show()
        },
        error:function(xhr){
console.log("Error",xhr);
        }
    })
})


//edit user Function

$("#editUser").on("click",function(){
    $("#loader").hide();
    let photo = $("#profileImg").attr("src")
    $("#previewEditImg").attr("src",photo);
    $(".tab-item-3").hide();
    $(".tab-item-5").show();
})


// loading trigger

$("#loadingTrigger,#searchNewPeopleButton").on("click",function(){
    $("#loader").show();
    $("#exitCarousel").hide()
})


// //edit photo

function editPhoto(){
    $("#loader").show();
    var preview = document.getElementById('previewEditImg');
    var file    = document.getElementById('photo2').files[0];
    var reader  = new FileReader();
  
    reader.onloadend = function () {
      preview.src = reader.result;
      $.ajax({
        url:`https://geminichat.herokuapp.com/users/editphoto/?`,
        type:"POST",
        data:{id:tempObj.id,photo:reader.result},
        success:function(result){
            $("#loader").hide();
$("#profileImg").attr("src",reader.result);
$(".tab-item-5").hide();
$(".tab-item-3").show();
socket.emit("useredit")
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
    }
  
    if (file) {
      reader.readAsDataURL(file);
    } else {
      $("#loader").hide();
      let photo = $("#profileImg").attr("src");
      preview.src = photo;
    }
}

//delete account

$("#deleteAccount").on("click",function(){
        $.ajax({
        url:`https://geminichat.herokuapp.com/users/?`,
        type:"DELETE",
        data:{id:tempObj.id,username:tempObj.username},
        success:function(result){
            if(result.error){
                console.log(result);
                return;
            }
console.log(result);
socket.emit("useredit")
$(".tab-item-5").hide();
$(".tab-item-1").show();
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
})

// add contact

function addUser(username){
    $("#exitCarousel").hide()
    $("#loader").show()
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/addcontact/?`,
        type:"PUT",
        data:{loggedUser:tempObj.username,contactUsername:username},
        success:function(result){
            if(result.error == true)
            {
                $("#alertMessage3").find("span").text(result.message);
                $("#alertMessage3").show(500);
                return;
            }
            if(result.message == "match"){
                $("#animate").text(`! You Have A New Match With ${username}`)
                $("#animate").fadeIn(2000,function(){
                    $("#animate").hide(function(){
                        $("#chatUsersList").html("");
                        $("#alertMessage3").hide();
                        $("#userAdder").val("");
                    });
                    socket.emit('match',{username,tempObj});
                    getUsers(tempObj.username);
                    searchNewContact();
                    return;
                });
            }
            else{
                $("#alertMessage3").hide();
                $("#userAdder").val("");
                searchNewContact();
                return;
            }
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
}

// ignore user function

function ignoreUser(username){
    $("#exitCarousel").hide()
       $("#loader").show()
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/ignorecontact/?`,
        type:"PUT",
        data:{loggedUser:tempObj.username,contactUsername:username},
        success:function(result){
            searchNewContact();
         },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
}


//Search New Contact

function searchNewContact(){
    $("#carouselText").html("");
    $("#carouselInner").html("");
    let filter;
    if($("#checkbox2").prop("checked")==true){
        filter = "Female"
    }
    if($("#checkbox1").prop("checked")==true){
        filter = "Male"
    }
    if($("#checkbox1").prop("checked")==true && $("#checkbox2").prop("checked")==true){
        filter = "none"
    }
    if($("#checkbox1").prop("checked")==false && $("#checkbox2").prop("checked")==false){
         $("#carouselModal").html(`<div class='text-center text-white lead'>Select which gender you looking for in settings</div>`);
         return;
    }
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/contacts/?username=${tempObj.username}&filter=${filter}`,
        type:"GET",
        success:function(result)
        {
            $("#exitCarousel").show()
            $("#loader").hide()
            if(result.error){
                $("#exitCarousel").hide()
                $("#carouselModal").html(`<h4 id="carouselText" class='text-center text-white'>אין אף אחד חדש בסביבה</h4>`);
                return;
            }
            $("#exitIcon").html('<i id="exitCarousel" style="font-weight:500; font-size:26px; color:white; z-index:100 !important;" class="fa fa-times-circle float-right" data-dismiss="modal"></i>');
            $("#carouselModal").html(`<div id="carouselExampleSlidesOnly" class="carousel slide" data-interval="false">
            <div class="carousel-inner" id="carouselInner"></div></div>`);
printCarousel(result);
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
}

//print carousel

function printCarousel(result){
    $("#carouselInner").html("");
    if(result.data[0].length ==1){
        let carouselItem = `<div class="carousel-item active">
            <img src="${result.data[0][0].photo}" alt="user">
            <div class="carousel-caption d-none d-sm-block bg-dark mb-4">
              <h4 class="lead">${result.data[0][0].name}, ${result.data[0][0].age}</h4>
              <p class="lead">${result.data[0][0].gender}</p>
              <div style="display:inline-block;">
              <i class="fas fa-times" href="#carouselExampleSlidesOnly" onclick=ignoreUser("${result.data[0][0].username}") data-dismiss="modal"></i><i class="fa fa-heart" onclick=addUser("${result.data[0][0].username}") href="#carouselExampleSlidesOnly"></i>
              </div>
             </div>
           </div>`;
        $("#carouselInner").append(carouselItem);
        return;
    }
    for(let i=0;i<result.data[0].length;i++){
        if(i==0){
            let carouselItem = `<div class="carousel-item active">
            <img src="${result.data[0][i].photo}" alt="user">
            <div class="carousel-caption d-none d-sm-block bg-dark mb-4">
              <h4 class="lead">${result.data[0][i].name}, ${result.data[0][i].age}</h4>
              <p class="lead">${result.data[0][i].gender}</p>
              <div style="display:inline-block;">
              <i class="fas fa-times" href="#carouselExampleSlidesOnly" onclick=ignoreUser("${result.data[0][i].username}")></i><i class="fa fa-heart" onclick=addUser("${result.data[0][i].username}") href="#carouselExampleSlidesOnly"></i>
              </div>
             </div>
           </div>`;
           $("#carouselInner").append(carouselItem);
        }
        else{
            let carouselItem = `<div class="carousel-item">
            <img src="${result.data[0][i].photo}" alt="user">
            <div class="carousel-caption d-none d-sm-block bg-dark mb-4">
           <h4 class="lead">${result.data[0][i].name}, ${result.data[0][i].age}</h4>
               <p class="lead">${result.data[0][i].gender}</p>
              <div style="display:inline-block;">
              <i class="fas fa-times" href="#carouselExampleSlidesOnly" onclick=ignoreUser("${result.data[0][i].username}")></i><i class="fa fa-heart" onclick=addUser("${result.data[0][i].username}") href="#carouselExampleSlidesOnly"></i>
              </div>
             </div>
           </div>`;
           $("#carouselInner").append(carouselItem);
    }
 }
}

// image pop-up

function showProfileImg(url)
{
    $("#modalImage").attr("src","");
    $("#modalImage").attr("src",url);
}


// contact img on click

$("#contactImg").on("click",function(){
    let url = $(this).attr("src")
    showProfileImg(url);
})
//get messages

function getMessages(...params){
     tempid = null;
let myUserName = tempObj.username;
$.ajax({
    url:`https://geminichat.herokuapp.com/users/messages/?first=${myUserName}&second=${params[0]}`,
    type:"GET",
    success:function(result){   
        $(".tab-item-3").hide()
        $(".tab-item-4").show()
        let fix = result.data[0].users_messages
        let fix1 = fix.slice(2,result.data[0].users_messages.length)
        let fixedresult = "["+fix1+"]";
        let a = JSON.parse(fixedresult);
        tempId = result.data[0].id;
        $("#contactName").text(params[0])
        $("#contactImg").attr("src",params[1])
        $(".chatClass").show(500,function(){
            $('#messages').animate({
                scrollBottom:$('#messages')[0].scrollHeight
        },function(){
            $('#messages').animate({
                scrollTop:$('#messages')[0].scrollHeight
        }, 600);
        });
        });
          $("html, body").animate({ scrollTop: $(document).height() }, "slow");
          if(a.length==0){
            $("#messages").html("")
            return;
        }
        printMessages(a);
    },
    error:function(xhr){
        console.log("Error",xhr);
    }
})
}

$("#messageContent").on("keyup",function(){
     let message = $("#messageContent").val()
    if(message.length > 0 ){
          $("#sendMessage").show();
    }
    else{
         $("#sendMessage").hide();
    }
})


$("#sendMessage").on("click",function(){
let message = $("#messageContent").val();
if(message.length<1||tempId==null){
    return;
}
let regex =  /[\+\&\#\'\"\/\\]/;
if(message.match(regex)){
alertify.alert('אופס', `מטעמי אבטחה אנו לא מאפשרים להשתמש בסימנים הבאים:  '+&#/"`)
    $("#messageContent").val("");
    return;
}
$("#sendMessage").hide();
$.ajax({
    url:`https://geminichat.herokuapp.com/users/messages/?first=${tempObj.id}&second=${tempId}&message=${message}`,
    type:"PUT",
    success:function(result){
        let fix = result.data[0].users_messages
        let fix1 = fix.slice(2,result.data[0].users_messages.length)
        let fixedresult = "["+fix1+"]";
        let a = JSON.parse(fixedresult);
        printMessages(a);
        socket.emit('message',tempId)
    },
    error:function(xhr){
        console.log("Error",xhr);
    }
})
$("#messageContent").val("");
})


//print messages

function printMessages(result){
     $("#messages").html("");
 for(let i=0;i<result.length;i++){
     if(tempObj.id==result[i].id)
     {
     let div = $(`<div class="messageBox"><div><p>${result[i].message}</br><span class="messageTime">${result[i].date}</span><p></div></div>`);
     $("#messages").append(div);
     }
     else{
     let div1 = $(`<div class="messageBox1"><div><p>${result[i].message}</br><span class="messageTime1">${result[i].date}</span><p></div></div>`);
     $("#messages").append(div1); 
     }
 }
}

function checkForNewMessages(id)
{
    $.ajax({
        url:`https://geminichat.herokuapp.com/users/newMessages/?id=${id}`,
        type:"GET",
        success:function(result){

        let fix = result.data[0].users_messages
        let fix1 = fix.slice(2,result.data[0].users_messages.length)
        let fixedresult = "["+fix1+"]";
        let a = JSON.parse(fixedresult);
            if(tempId==id){
                printMessages(a);
                $('#messages').stop().animate({
                    scrollTop: $('#messages')[0].scrollHeight
            }, 600);
            }
            
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
}
