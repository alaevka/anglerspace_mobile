var myApp = new Framework7({
	onPageInit: function (page) {
		//alert(1);
	}
});
var $$ = Dom7;
var mainView = myApp.addView('.view-main');
var backend_url = 'http://anglerspace.ru/api/';

myApp.onPageBeforeInit('index', function (page) {
	if (!_checkIfUserAuth()) {
		mainView.router.loadPage({ url: 'templates/user/login.html', animatePages:false});
	} else {
		mainView.router.loadPage('templates/feed/index.html');
	}
}).trigger();

myApp.onPageInit('registration', function (page) {
    $$('#registration-form-submit').on('click', function () {
        var formData = myApp.formToJSON('#registration-form');
  		if (_registrationFormDataValidate(formData)) {
        	$$.ajax({
        		url: backend_url + 'user', 
        		method: 'POST',
        		data: {name: formData['name'], email: formData['email'], password: formData['password'], password_confirmation: formData['password_confirmation']},
        		success: function (data) {
        			localStorage.setItem("client_token", JSON.parse(data).meta.token);
        			mainView.router.loadPage('templates/feed/index.html');
        		},
        		error: function (jqXHR, textStatus, errorThrown) {
        			if(textStatus == 422) {
        				myApp.alert('Email адрес уже занят', 'Исправьте ошибки');
        			} else {
        				myApp.alert('Код ошибки: ' + textStatus, 'Что-то пошло не так');
        			}
			        
			    }
	        });
        }
    });
});

myApp.onPageInit('login', function (page) {
    $$('#login-form-submit').on('click', function () {
        var formData = myApp.formToJSON('#login-form');
        if(_loginFormDataValidate(formData)) {
        	$$.ajax({
        		url: backend_url + 'login', 
        		method: 'POST',
        		data: {email: formData['email'], password: formData['password']},
        		success: function (data) {
        			localStorage.setItem("client_token", JSON.parse(data).meta.token);
        			mainView.router.loadPage('templates/feed/index.html');
        		},
        		error: function (jqXHR, textStatus, errorThrown) {
			        myApp.alert('Код ошибки: ' + textStatus, 'Что-то пошло не так');
			    }
	        });
        }
    });
});

myApp.onPageInit('indexfeed', function (page) {
	$$('#logout-user').on('click', function () {
		localStorage.removeItem('client_token');	
		mainView.router.loadPage('templates/user/login.html');
	});
    $$('#link-create-post').on('click', function () {
        mainView.router.loadPage('templates/feed/create_post.html');
    });
});

function _registrationFormDataValidate(formData) {
	var constraints = {
    	name: {
    		presence: {message: function(value, attribute, validatorOptions, attributes, globalOptions) {
		        return "Имя не заполнено";
		    }},
    	},
    	email: {
    		presence: {message: function(value, attribute, validatorOptions, attributes, globalOptions) {
		        return "Email не заполнен";
		    }},
		    email : {message: "Введенный адрес не является верным"}
    	},
    	password: {
    		presence: {message: "Пароль не заполнен"},
    		length: {
    			minimum: 6,
    			message: "Пароль должен быть не менее 6 символов"
    		}
    	},
    	password_confirmation: {
    		presence: {message: function(value, attribute, validatorOptions, attributes, globalOptions) {
		        return "Пароль еще раз не заполнен";
		    }},
		    equality: {
		    	attribute: "password",
		    	message: "Пароли должны совпадать"
		    }
		}
    };
    var validation_result = validate(formData, constraints, {format: "flat", fullMessages: false});
	if (validation_result !== undefined) {
		var validation_result_str = '';
		for(var index in validation_result) { 
		    validation_result_str += validation_result[index]+'<br>';
		}
		myApp.alert(validation_result_str, 'Исправьте ошибки');
		return false;
	} else {
		return true;
	}
}

function _loginFormDataValidate(formData) {
	var constraints = {
    	email: {
    		presence: {message: function(value, attribute, validatorOptions, attributes, globalOptions) {
		        return "Email не заполнен";
		    }},
		    email : {message: "Введенный адрес не является верным"}
    	},
    	password: {
    		presence: {message: "Пароль не заполнен"},
    		length: {
    			minimum: 6,
    			message: "Пароль должен быть не менее 6 символов"
    		}
    	}
    };
    var validation_result = validate(formData, constraints, {format: "flat", fullMessages: false});
	if (validation_result !== undefined) {
		var validation_result_str = '';
		for(var index in validation_result) { 
		    validation_result_str += validation_result[index]+'<br>';
		}
		myApp.alert(validation_result_str, 'Исправьте ошибки');
		return false;
	} else {
		return true;
	}
}

function _checkIfUserAuth() {
	var token = localStorage.getItem("client_token");
	if(!token) {
		return false;
	} else {
		$$.ajax({
    		url: backend_url + 'refresh', 
    		method: 'GET',
			headers: {'Authorization' : "Bearer " + token},
    		success: function (data) {
    			localStorage.setItem("client_token", JSON.parse(data).token);
    		},
    		error: function (jqXHR, textStatus, errorThrown) {
    			return false;
		    }
        });
        return true;
	}
}
