function submitToAPI(e) {
  e.preventDefault();

  var Namere = /[A-Za-z]{1}[A-Za-z]/;
  if (!Namere.test($("#name-input").val())) {
    alert("Name can not be less than 2 char");
    return;
  }
  if ($("#email-input").val() == "") {
    alert("Please enter your email address");
    return;
  }
  var reeamil = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,6})?$/;
  if (!reeamil.test($("#email-input").val())) {
    alert("Please enter valid email address");
    return;
  }
  if ($("#subject-input").val() == "") {
    alert("Please select a title for your enquiry");
    return;
  }

  if ($("#message").val() == "") {
    alert("Please tell us how we can help!");
    return;
  }

  var name = $("#name-input").val();
  var subject = $("#subject-input").val();
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
    url: "https://cxifjxkle8.execute-api.ap-southeast-2.amazonaws.com/prod/contact-us",
    dataType: "json",
    crossDomain: "true",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    // beforeSend: function (xhr) {
    //   xhr.setRequestHeader('Accept', 'application/json');
    //   xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    //   xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
    //   xhr.setRequestHeader('Access-Control-Allow-Methods', 'OPTIONS,POST,GET');
    //   xhr.setRequestHeader('Access-Control-Allow-Credentials', true);
    // },
    headers: {
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Accept, Content-Type, Access-Control-Allow-Credentials, Access-Control-Allow-Methods",
    },

    success: function () {
      // clear form and show a success message
      alert("Thank you!");
      document.getElementById("contact-form").reset();
      location.reload();
    },
    error: function () {
      // show an error message
      alert("Sorry! Something went wrong!");
      document.getElementById("contact-form").reset();
    },
  });
}
