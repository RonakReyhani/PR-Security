$(document).ready(function submitToAPI(e) {
  e.preventDefault();
  var URL = "https://hvv9nvl8rf.execute-api.ap-southeast-2.amazonaws.com/prod/contact-us";

  var Namere = /[A-Za-z]{1}[A-Za-z]/;
  if (!Namere.test($("#name-input").val())) {
    alert("Name can not be less than 2 char");
    return;
  }
  if ($("#email-input").val() == "") {
    alert("Please enter your email address");
    return;
  }

  if ($("#subject").val() == "") {
    alert("Please ");
    return;
  }

  var reeamil = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
  if (!reeamil.test($("#email-input").val())) {
    alert("Please enter valid email address");
    return;
  }

  var name = $("#name-input").val();
  var subject = $("#subject").val();
  var email = $("#email-input").val();
  var message = $("#message").val();
  var data = {
    name: name,
    email: email,
    subject: subject,
    message: message,
  };

  $.ajax({
    type: "POST",
    url: URL,
    dataType: "json",
    crossDomain: "true",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),

    success: function () {
      // clear form and show a success message
      alert("Thank you!");
      document.getElementById("contact-form").reset();
      location.reload();
    },
    error: function () {
      // show an error message
      alert("Sorry! Something went wrong!");
    },
  });
});
