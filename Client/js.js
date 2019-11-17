var tempObj = {};
var tempImg = ""
var tempId;
var tempUser;
var socket;

$(document).ready(function () {
    socket = io('https://geminichat.herokuapp.com/');
    socket.on('connect', function () {
        console.log("socket on")
    })
    socket.on('newmessage', function (data) {
        if (data.tempUser == tempObj.username) {
            NewMessages(data.tempId)
        }
    })
    socket.on('newmatch', function (result) {
        if (result.result.username == tempObj.username) {
            console.log("here")
            getUsers(tempObj.username);
            alertify.alert().setContent(`<h1 class="display-4 lead">YAY!</h1><br><p class="lead intro">יש לך התאמה חדש עם</p><strong>${result.result.tempObj.name}!!</strong>`).show();
            $(".ajs-header").html("");
        }
    })
    socket.on('usersocket', function () {
        getUsers(tempObj.username);
    })
    $(".active").css("display", "block");
})


//return from edit to main page

$("#returnFromEdit").on("click", function () {
    $(".tab-item-5").hide();
    $(".tab-item-3").show();
})


//return from register to login

$("#returnFromRegister").on("click", function () {
    $(".tab-item-2").hide();
    $(".tab-item-1").show();
})

//back to main page

$("#backToMainPage").on("click", function () {
    $(".tab-item-4").hide();
    $(".tab-item-3").show();
})

//register photo preview

$("#registerPhoto").on("change", function () {
    let preview = $('#previewImg');
    let file = $('#registerPhoto')[0].files[0];
    let reader = new FileReader();
    reader.onloadend = function () {
        $('#previewImg').attr("src", reader.result);
        tempImg = reader.result;
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {
        $('#previewImg').attr("src", "");
    }
})

// register button

$("#register").on("click", function () {
    $("#registerPhoto").val("");
    tempImg = "";
    $('#previewImg').attr("src", "");
    $("#email").val("")
    $("#name").val("");
    $("#userName").val("");
    $("#password").val("");
    $(".tab-item-1").hide()
    $(".tab-item-2").show()
})

// log Out Function

$("#logOutFunction").on("click", function () {
    $("#profileImg").attr("src", "");
    $("#userAdder").val("");
    $("#contactName").text("")
    $("#chatUsersList").html("");
    $("#messages").html("");
    $("#loginUserName").val("");
    $("#loginPassword").val("");
    $(".tab-item-3").hide();
    $(".tab-item-1").show();
    $(".chatClass").hide();
    tempId = null;
})

//login function

$("#loginButton").on("click", function () {
    let username = $("#loginUserName").val();
    let password = $("#loginPassword").val();
    if (!username.length || !password.length) {
        $("#loginMessage").find("span").text("חלק מהשדות חסרים");
        $("#loginMessage").show(500);
        return;
    }
    $(".tab-item-1").hide()
    $("#mainLoader").show()
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/?`,
        type: "POST",
        data: { username: username, password: password },
        success: function (result) {
            if (result.error) {
                $("#mainLoader").hide();
                $(".tab-item-1").show();
                $("#loginMessage").find("span").text(result.message);
                $("#loginMessage").show(500);
                return;
            }
            else {
                tempObj = result.data[0];
                $("#userTitleName").text(result.data[0].name)
                $("#profileImg").attr("src", result.data[0].photo);
                $("#loginMessage").hide();
                $(".tab-item-1").hide()
                $(".tab-item-3").show()
                $("#mainLoader").hide()
                getUsers(username);
                setTimeout(function () { alertify.alert().setContent(`<h3>רק מזכירים לכם</h3><br><p class="lead">ניתן לשנות את הגדרות החיפוש בכניסה להגדרות המשתמש</p>`).show(); $(".ajs-header").html(""); }, 3000);
            }
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
})

//get users

function getUsers(username) {
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/getUsers/?`,
        type: "POST",
        data: { username: username },
        success: function (result) {
            $("#chatUsersList").html("");
            if (result.data == null) {
                return;
            }
            printContacts(result);
            return;
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}

//Print Contacts
function printContacts(result) {
    for (let i = 0; i < result.data.length; i++) {
        let user = $(`<a onclick=getMessages("${result.data[i].username}","${result.data[i].photo}") class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"><h6 class="lead">${result.data[i].name}</h6><img data-toggle="modal" data-target="#myModal" onclick=showProfileImg("${result.data[i].photo}") style="border-radius:50%; width:22%; height:54px;" src="${result.data[i].photo}"></img></a>`);
        $("#chatUsersList").append(user);
    }
}


//register function 

$("#registerButton").on("click", function () {

    $("#loginUserName").val("");
    $("#loginPassword").val("")
    $("#loginMessage").hide();
    $("#registerMessage").hide();

    let name = $("#name").val();
    let userName = $("#userName").val();
    let password = $("#password").val();
    let ageValue = $("#age").val();
    let validAgeChecker = Math.abs(new Date() - new Date(ageValue.replace(/-/g, '/')));
    let fixedAge = parseInt(validAgeChecker / 31536000000);
    let gender = $("#gender").val();
    let email = $("#email").val()
    let photo = tempImg;

    let regexUserName = /[\+\&\#\'\"\/\\]/;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!name.length || !userName.length || !password.length || !email.length || !photo.length) {
        $("#registerMessage").find("span").text("חלק מהשדות חסרים");
        $("#registerMessage").show();
        return;
    }

    if (userName.match(regexUserName)) {
        $("#registerMessage").find("span").text("שם משתמש לא יכול להכיל את התווים הבאים:'+&#/ ");
        $("#registerMessage").show();
        return;
    }
    if (!email.match(regexEmail)) {
        $("#registerMessage").find("span").text("אימייל לא תקין");
        $("#registerMessage").show();
        return;
    }

    let today = new Date();
    if (validAgeChecker / 31536000000 < 18.013) {
        $("#registerMessage").find("span").text("עלייך להיות מעל גיל 18 כדי להירשם");
        $("#registerMessage").show();
        return;
    }

    if (userName.indexOf(" ") > 0) {
        $("#registerMessage").find("span").text("שם משתמש לא יכול להכיל רווח");
        $("#registerMessage").show();
        return;
    }

    $("#registerLoader").show();

    $.ajax({
        url: `https://geminichat.herokuapp.com/users/?`,
        type: "PUT",
        data: { name: name, username: userName, password: password, gender: gender, photo: photo, useremail: email, age: fixedAge },
        success: function (result) {
            $("#registerLoader").hide();
            if (result.error) {
                $("#userName").val("");
                $("#email").val("");
                $("#registerMessage").find("span").text(result.message);
                $("#registerMessage").show()
                $("#registerLoader").hide();
                return;
            }
            $("#registerMessage").hide();
            $(".tab-item-2").hide()
            $(".tab-item-1").show()
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
})


//edit user Function

$("#editUser").on("click", function () {
    $("#mainLoader").hide();
    let photo = $("#profileImg").attr("src")
    $("#previewEditImg").attr("src", photo);
    $(".tab-item-3").hide();
    $(".tab-item-5").show();
})


// loading trigger

$("#loadingTrigger,#searchNewPeopleButton").on("click", function () {
    $("#mainLoader").show();
    $("#exitCarousel").hide()
})


// //edit photo

$("#photoEditInput").on("change", function () {
    $("#mainLoader").show();
    let preview = $("#previewEditImg");
    let file = $("#photoEditInput")[0].files[0];
    var reader = new FileReader();

    reader.onloadend = function () {
        $("#previewEditImg").attr("src", reader.result);
        $.ajax({
            url: `https://geminichat.herokuapp.com/users/editphoto/?`,
            type: "POST",
            data: { id: tempObj.id, photo: reader.result },
            success: function (result) {
                $("#mainLoader").hide();
                $("#profileImg").attr("src", reader.result);
                $(".tab-item-5").hide();
                $(".tab-item-3").show();
                socket.emit("useredit")
            },
            error: function (xhr) {
                console.log("Error", xhr);
            }
        })
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        $("#mainLoader").hide();
        let photo = $("#profileImg").attr("src");
        preview.src = photo;
    }
})



//delete account

$("#deleteAccount").on("click", function () {
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/?`,
        type: "DELETE",
        data: { id: tempObj.id, username: tempObj.username },
        success: function (result) {
            if (result.error) {
                return;
            }
            socket.emit("useredit")
            $(".tab-item-5").hide();
            $(".tab-item-1").show();
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
})

// add contact

function addUser(username) {
    $("#exitCarousel").hide()
    $("#mainLoader").show()
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/addcontact/?`,
        type: "PUT",
        data: { loggedUser: tempObj.username, contactUserName: username },
        success: function (result) {
            if (result.message == "match") {
                $("#animate").text(`! יש לך התאמה חדשה עם ${username}`)
                $("#animate").fadeIn(2000, function () {
                    $("#animate").hide(function () {
                        $("#chatUsersList").html("");
                    });
                    getUsers(tempObj.username);
                    socket.emit('match', { username, tempObj });
                    searchNewContact();
                    return;
                });
            }
            else {
                searchNewContact();
                return;
            }
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}

// ignore user function

function ignoreUser(username) {
    $("#exitCarousel").hide()
    $("#mainLoader").show()
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/ignorecontact/?`,
        type: "PUT",
        data: { loggedUser: tempObj.username, contactUserName: username },
        success: function (result) {
            searchNewContact();
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}


//Search New Contact

function searchNewContact() {
    $("#carouselText").html("");
    $("#carouselInner").html("");
    let filter;
    if ($("#checkbox2").prop("checked") == true) {
        filter = "Female"
    }
    if ($("#checkbox1").prop("checked") == true) {
        filter = "Male"
    }
    if ($("#checkbox1").prop("checked") == true && $("#checkbox2").prop("checked") == true) {
        filter = "none"
    }
    if ($("#checkbox1").prop("checked") == false && $("#checkbox2").prop("checked") == false) {
        $("#mainLoader").hide()
        $("#carouselModal").html(`<div class='text-center text-white lead'>תבחר לפחות מגדר אחד בהגדרות חיפוש</div>`);
        return;
    }
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/contacts/?`,
        type: "POST",
        data: { username: tempObj.username, filter: filter },
        success: function (result) {
            $("#exitCarousel").show()
            $("#mainLoader").hide()
            if (result.error) {
                $("#exitCarousel").hide()
                $("#carouselModal").html(`<h4 id="carouselText" class='text-center text-white'>אין אף אחד חדש בסביבה</h4>`);
                return;
            }
            $("#exitIcon").html('<i id="exitCarousel" style="font-weight:500; font-size:26px; color:white; z-index:100 !important;" class="fa fa-times-circle float-right" data-dismiss="modal"></i>');
            $("#carouselModal").html(`<div id="carouselExampleSlidesOnly" class="carousel slide" data-interval="false">
            <div class="carousel-inner" id="carouselInner"></div></div>`);
            printCarousel(result);
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}

//print carousel

function printCarousel(result) {
    $("#carouselInner").html("");
    if (result.data[0].length == 1) {
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
    for (let i = 0; i < result.data[0].length; i++) {
        if (i == 0) {
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
        else {
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

function showProfileImg(url) {
    $("#modalImage").attr("src", "");
    $("#modalImage").attr("src", url);
}


// contact img on click

$("#contactImg").on("click", function () {
    let url = $(this).attr("src")
    showProfileImg(url);
})
//get messages

function getMessages(...params) {
    tempUser = null;
    tempid = null;
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/messages/?}`,
        type: "POST",
        data: { first: tempObj.username, second: params[0] },
        success: function (result) {
            $(".tab-item-3").hide()
            $(".tab-item-4").show()
            let messages = convertMessages(result.data[0].users_messages);
            tempId = result.data[0].id;
            tempUser = params[0];
            $("#contactName").text(params[0])
            $("#contactImg").attr("src", params[1])
            $(".chatClass").show(500, function () {
                $('#messages').animate({
                    scrollBottom: $('#messages')[0].scrollHeight
                }, function () {
                    $('#messages').animate({
                        scrollTop: $('#messages')[0].scrollHeight
                    }, 600);
                });
            });
            $("html, body").animate({ scrollTop: $(document).height() }, "slow");
            if (!messages.length) {
                $("#messages").html("")
                return;
            }
            printMessages(messages);
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}

$("#messageContent").on("keyup", function () {
    let message = $("#messageContent").val()
    if (message.length > 0) {
        $("#sendMessage").show();
    }
    else {
        $("#sendMessage").hide();
    }
})


$("#sendMessage").on("click", function () {
    let message = $("#messageContent").val();
    if (message.length < 1 || tempId == null) {
        return;
    }
    let regex = /[\+\&\#\'\>\<\"\/\\]/;
    if (message.match(regex)) {
        alertify.alert('אופס', `מטעמי אבטחה אנו לא מאפשרים להשתמש בסימנים הבאים:  '+&#<>/"`)
        $("#messageContent").val("");
        return;
    }
    $("#sendMessage").hide();
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/messages/?`,
        type: "PUT",
        data: { first: tempObj.id, second: tempId, message: message },
        success: function (result) {
            NewMessages(tempId)
            socket.emit('message', { tempId, tempUser })
        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
    $("#messageContent").val("");
})


//print messages

function printMessages(result) {
    $("#messages").html("");
    for (let i = 0; i < result.length; i++) {
        if (tempObj.id == result[i].id) {
            let div = $(`<div class="messageBox"><div><p>${result[i].message}</br><span class="messageTime">${result[i].date}</span><p></div></div>`);
            $("#messages").append(div);
        }
        else {
            let div1 = $(`<div class="messageBox1"><div><p>${result[i].message}</br><span class="messageTime1">${result[i].date}</span><p></div></div>`);
            $("#messages").append(div1);
        }
    }
    $('#messages').stop().animate({
        scrollTop: $('#messages')[0].scrollHeight
    }, 600);
}

function NewMessages(id) {
    $.ajax({
        url: `https://geminichat.herokuapp.com/users/newMessages/?`,
        type: "POST",
        data: { id: id },
        success: function (result) {

            let messages = convertMessages(result.data[0].users_messages);
            if (tempId == id) {
                printMessages(messages);
                $('#messages').stop().animate({
                    scrollTop: $('#messages')[0].scrollHeight
                }, 600);
            }

        },
        error: function (xhr) {
            console.log("Error", xhr);
        }
    })
}

// converting the result of string from database into array of messgages.

function convertMessages(data) {
    let slice = data.slice(2, data.length)
    let fixedresult = "[" + slice + "]";
    return JSON.parse(fixedresult);
}
