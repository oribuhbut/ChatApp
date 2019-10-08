var interval;
var tempObj = {};
var tempImg =""
var tempId;
var tempLength;
// var secondId;


$(document).ready(function(){
    checkIfUserLogged()
    $(".active").css("display","block");
    clearInterval(interval);
})

//check if user is logged

function checkIfUserLogged(){
    fetch('http://localhost:3000/users/checklog',{
        credentials:'include' 
    })
    .then((result)=>{
        return result.json();
    })
    .then((result)=>{
        console.log(result);
        if(result.error == true ){
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
        console.log(err);
        return;
    })
}

//register photo preview

function previewFile() {
    var preview = document.getElementById('previewImg');
    var file    = document.querySelector('input[type=file]').files[0];
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
$("#email").show();
$("#email").val("")
$("#emailConfirm").hide(500);
$("#emailButton").show();
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
    $("#alertMessage1").hide();
    $.ajax({
        url:`http://localhost:3000/users/?username=${username}&password=${password}`,
        type:"GET",
        success:function(result){
            console.log(result)
            if(result.error == true ){
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
                getUsers(username);
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
        url:`http://localhost:3000/users/getUsers/?username=${username}`,
        type:"GET",
        success:function(result){
            $("#chatUsersList").html("");
            if(result.data == null){
                return;
            }
            for(let i=0;i<result.data.length;i++){
                let user = $(`<a onclick=getMessages("${result.data[i].username}") class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"><h6>${result.data[i].name}</h6><img data-toggle="modal" data-target="#myModal" onclick=showProfileImg("${result.data[i].photo}") style="border-radius:50%; width:20%" src="${result.data[i].photo}"></img></a>`);
                $("#chatUsersList").append(user);
            }
        },
        error:function(xhr){
            console.log(xhr);
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
    clearInterval(interval);
})

//email Function

$("#emailButton").on("click",function(){
    $("#emailConfirm").val("");
    $("#alertMessage2").hide("");
    let value = $("#email").val();
    $("#emailConfirm").show();
    $("#emailButton").hide();
    $.ajax({
        url:`http://localhost:3000/users/email/?email=${value}`,
        type:"PUT",
        success:function(result){
            if(result.error == true ){
                $("#email").val("");
                $("#emailConfirm").hide();
                $("#emailButton").show();
                $("#alertMessage2").show();
                $("#alertMessage2").find("span").text(result.message);
            }
            else
            {
                $("#email").hide();
                $("#emailButton").hide(); 
            }
        },
        error:function(xhr){
            console.log(xhr)
        }
    })
})

//register function 

$("#registerButton").on("click",function(){
    $("#emailButton").text("שלחו לי קוד אימות");
    $("#loginUserName").val("");
    $("#loginPassword").val("")
    $("#alertMessage1").hide();
    let name = $("#name").val();
    let userName= $("#userName").val();
    let password = $("#password").val();
    let gender = $("#gender").val();
    let emailConfirm = $("#emailConfirm").val();
    let email = $("#email").val()
    let photo = tempImg;
    if(name.length==0||userName.length==0||password.length==0||email.length==0)
    {
        $("#alertMessage2").find("span").text("חלק מהשדות חסרים");
        $("#alertMessage2").show();
        return;
    }
    $.ajax({
        url:`http://localhost:3000/users/?`,
        type:"PUT",
        data:{name:name,username:userName,password:password,gender:gender,photo:photo,email:emailConfirm,useremail:email},
        success:function(result){
            console.log(result)
            if(result.error==true){
                $("#userName").val("");
                $("#email").val("");
                $("#email").show()
                $("#emailConfirm").hide();
                $("#emailButton").show();
                $("#alertMessage2").find("span").text(result.message);
                $("#alertMessage2").show()
                return;
            }
            if(result == "Email Key Is Wrong"){
                $("#emailConfirm").hide();
                $("#emailButton").show();
                $("#alertMessage2").find("span").text("קוד אימות לא תקין");
                $("#alertMessage2").show()
                $("#emailButton").text("שלח שוב");
                return;
            }
            $("#email").val("");
            $("#emailConfirm").hide();
            $("#emailButton").show();
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

// add contact

function addUser(username){
    console.log(username);
    $.ajax({
        url:`http://localhost:3000/users/addcontact/?`,
        type:"PUT",
        data:{loggedUser:tempObj.username,contactUsername:username},
        success:function(result){
            console.log(result)
            if(result.error == true)
            {
                $("#alertMessage3").find("span").text(result.message);
                $("#alertMessage3").show(500);
                return;
            }
            if(result.message == "match"){
                $("#animate").fadeIn(1500,function(){
                    $("#animate").hide(function(){
                        $("#chatUsersList").html("");
                        $("#alertMessage3").hide();
                        $("#userAdder").val("");
                        getUsers(tempObj.username);
                        searchNewContact();
                    });
                });
                return;
            }
                $("#alertMessage3").hide();
                $("#userAdder").val("");
                searchNewContact();
        },
        error:function(xhr){
            console.log("Error",xhr);
        }
    })
}


//Search New Contact

function searchNewContact(){
    $.ajax({
        url:`http://localhost:3000/users/contacts/?username=${tempObj.username}`,
        type:"GET",
        success:function(result){
            console.log(result)
            if(result.error){
                $("#carouselModal").html(`<div><h2 class='text-center display-4'>no one new around</div>`);
                return;
            }
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
    for(let i=0;i<result.data[0].length;i++){
        if(i==0){
            let carouselItem = `<div class="carousel-item active">
            <img src="${result.data[0][i].photo}" alt="user">
            <div class="carousel-caption d-none d-sm-block bg-dark mb-4">
              <h4>${result.data[0][i].name}</h4>
              <p>${result.data[0][i].gender}</p>
              <div style="display:inline-block;">
              <i class="fas fa-times" href="#carouselExampleSlidesOnly" data-slide="next"></i><i class="fa fa-heart" onclick=addUser("${result.data[0][i].username}") href="#carouselExampleSlidesOnly"></i>
              </div>
             </div>
           </div>`;
           $("#carouselInner").append(carouselItem);
        }
        else{
            let carouselItem = `<div class="carousel-item">
            <img src="${result.data[0][i].photo}" alt="user">
            <div class="carousel-caption d-none d-sm-block bg-dark mb-4">
              <h4>${result.data[0][i].name}</h4>
              <p>${result.data[0][i].gender}</p>
              <div style="display:inline-block;">
              <i class="fas fa-times" href="#carouselExampleSlidesOnly" data-slide="next"></i><i class="fa fa-heart" onclick=addUser("${result.data[0][i].username}") href="#carouselExampleSlidesOnly"></i>
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

//get messages

function getMessages(username){
    clearInterval(interval);
    console.log(username)
     tempid = null;
let myUserName = tempObj.username;
$.ajax({
    url:`http://localhost:3000/users/messages/?first=${myUserName}&second=${username}`,
    type:"GET",
    success:function(result){
        console.log(result)
        $("#typeCheck").hide();
        tempId = result.data[0].id;
        $("#contactName").text(username)
            let data = JSON.parse(result.data[0].users_messages)
            if(data!=null){
                tempLength = data.length;
            }
            interval = setInterval(checkForNewMessages,3000)
        $(".chatClass").show(500);
        $('#messages').stop().animate({
            scrollTop: $('#messages')[0].scrollHeight
          }, 600);
          $("html, body").animate({ scrollTop: $(document).height() }, "slow");
          if(result.data[0].users_messages==null){
            $("#messages").html("")
            return;
        }
        printMessages(data);
    },
    error:function(xhr){
        console.log("Error",xhr);
    }
})
}

$("#sendMessage").on("click",function(){
    console.log(tempId)
let message = $("#messageContent").val();
if(message.length<1||tempId==null){
    return;
}
$.ajax({
    url:`http://localhost:3000/users/messages/?first=${tempObj.id}&second=${tempId}&message=${message}`,
    type:"PUT",
    success:function(result){
        console.log(result)
        let data = JSON.parse(result.data[0].users_messages);
        printMessages(data);
        $('#messages').stop().animate({
            scrollTop: $('#messages')[0].scrollHeight
          }, 600);
    },
    error:function(xhr){
        console.log("Error",xhr);
    }

})
$("#messageContent").val("");
})


//print messages

function printMessages(result){
    console.log(result)
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

function checkForNewMessages()
{
    console.log("here")
    $.ajax({
        url:`http://localhost:3000/users/newMessages/?id=${tempId}`,
        type:"GET",
        success:function(result){
            if(result.data[0].users_messages==null){
                return;
            }
            let data = JSON.parse(result.data[0].users_messages)
            if(tempLength<data.length)
            {
printMessages(data);
$('#messages').stop().animate({
    scrollTop: $('#messages')[0].scrollHeight
  }, 600);
  tempLength = data.length;
            }
            
        },
        error:function(xhr){
            console.log(xhr);
        }
    })
}

// typing function 

// $("#messageContent").on("keyup",function(){
// $.ajax({
//     url:`http://localhost:3000/users/typing/?first=${tempObj.id}&second=${secondId}`,
//     type:"PUT",
//     success:function(result){
//     console.log(result);
//     },
//     error:function(xhr){
//         console.log(xhr);
//     }
// })
// });

// function typeFunction(){
//     $.ajax({
//         url:`http://localhost:3000/users/typeCheck/?first=${tempObj.id}&second=${secondId}`,
//         type:"GET",
//         success:function (result){
//             if(result == "user-typing"){
//                 $("#typeCheck").fadeIn(500);
//                 return;
//              }
//              $("#typeCheck").fadeOut(500);
//         },
//         error:function(xhr){
// console.log(xhr);
//         }
//     })
// }