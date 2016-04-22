$(function() {
	
	$('#payment-form').on('submit', function(e) {
		e.preventDefault();
		$('#loader').show();
		if(validForm()){
			getToken();
		}
	});
	
	function getToken(){
		
		$.ajax({
			type: 'GET',
			dataType: 'text',
			url: '/braintree_client_token',
			success: function(response) {
				returnNonce(response);
			},
			error: function(request, status, error) {  
				displayError(error);
			}
		});
	}
		
	
	function returnNonce(token){
		var client = new braintree.api.Client({clientToken: token});
		client.tokenizeCard({
		  number: $("input[name='number']").val(),
		  cardholderName: $("input[name='creditCardName']").val(),
		  expirationDate: $("input[name='expiration']").val(),
		  cvv: $("input[name='ccv']").val(),
		}, function (err, nonce) {
			submitForm(nonce);
		});
	}
	
	function validForm(){
		var patternName = new RegExp("^3[47][0-9]{5,}$");
		if($("input[name='name']").val().split(' ').length < 2){
			displayError("Format incorrect for field : 'name'" )
			return false;
		}
		if($("input[name='creditCardName']").val().split(' ').length < 2){
			displayError("Format incorrect for field : 'creditCardName'" )
			return false;
		}
		if(!/^[0-9]{13,16}/.test($("input[name='number']").val())){
			displayError("Format incorrect for field 'number' : 13 to 16 digits" )
			return false;
		}
		if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test($("input[name='expiration']").val())){
			displayError("Format incorrect for field 'date expiration' : MM/YY" )
			return false;
		}
		if(!/^[0-9]{3}$/.test($("input[name='ccv']").val())){
			displayError("Format incorrect for field 'ccv' : 3 digits" )
			return false;
		}
		return true;
	}
	
	function submitForm(nonce){
		var formData = $("#payment-form").serialize();
		$.ajax({
			type: 'POST',
			dataType: 'text',
			url: '/payment',
			data:   formData + '&nonce=' + nonce,
			success: function(response) {
				$('#loader').hide();
				$("#payment-message").removeClass("hide alert-danger");
				$("#payment-message").addClass("alert-success");
				$("#payment-message").text(response);
				$("#payment-form").trigger("reset");
			},
			error: function(request, status, error) {
				displayError(request.responseText);
			}
		});
	}
	
	function displayError(message){
		$('#loader').hide();
		$("#payment-message").removeClass("hide alert-success");
		$("#payment-message").addClass("alert-danger");
		$("#payment-message").text(message);
	}
		
});