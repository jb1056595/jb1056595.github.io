// Send form data to HubSpot from the client.
function submitToHubSpot(data) {
  var $form = $('#hubspot-form form'),
  k;
  // Loop through each value and find a matching input.
  // NOTE: Doesn't support checkbox/radio.
  for (k in data) {
    $form.find("input[name='" + k + "']").val(data[k])
  }
  $(".hbspt-form input:submit").trigger("click");
}

// Here's how you'd use this.
$('#signupform').on('submit', function() {
  var formData = {};
  $(this).serializeArray().forEach(function(data) {
    formData[data.name] = data.value;
  });
  var customerdata = {};
  submitToHubSpot(formData);
  Intercom('update', {"email": formData.email});
  Intercom('trackEvent', 'signedup');
  customerdata.contactEmail = formData.email;
  customerdata.companyName = formData.company;
  customerdata.apiDomain = formData.username;
  customerdata.contactFirstName = formData.firstname
  customerdata.contactLastName = formData.lastname
  //jQuery.ajaxSetup({async:false});
  jQuery.ajax({
    type: "POST",
    url: '/api/provider?autologin=true',
    data: JSON.stringify(customerdata),
    contentType: 'application/json',
    dataType: 'json',
    cache: false,
    timeout:60000,
    success: function(result) {
      $('#signupform').addClass('hidden');
      $('#signupconfirmation').removeClass('hidden');
      mixpanel.identify (result.objectUUID);
      mixpanel.people.set_once ({
        'hostname': result.webDomain.replace(/\..*/, ''),
        'company': result.companyName,
        '$first_name': formData.firstname,
        '$last_name': formData.lastname,
        '$email': result.contactEmail,
      });
      mixpanel.track('signup');
      if (result.authtoken) {
        var token = window.btoa(result.authtoken);
        window.location.href = 'https://' + result.webDomain + '/#/register/' + token;
      }
    },
    error: function (response, desc, exception) {
    // show ajax error
    }
  });
  //submitToHubSpot(formData);
  //Intercom('update', {"email": formData.email});
  //Intercom('trackEvent', 'signedup');
  //jQuery.ajaxSetup({async:true});
return false;
})
