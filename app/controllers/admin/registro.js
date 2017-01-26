import Ember from 'ember';

export default Ember.Controller.extend({
	registro:{
		usuario:'sianfung',
		ci:'4',
		nombre1:'sinfungn',
		nombre2:'sianfungn',
		apellido1:'sianfunga',
		apellido2:'sianfunga',
		tlf:'4',
		correo:'sianfung@lol.com',
		cargo:'t',
		password1:'e1234567',
		password2:'e1234567',
	},
	//registro:{},
	msg:{},

	validarCampos: function(){
        $.validator.addMethod('strongPassword', function(value, element){
            return this.optional(element) ||   value.length >= 6 && /\d/.test(value) && /[a-z]/i.test(value);
        }, 'Contraseña debe ser al menos 8 caracteres y al menos 1 letra');

        $.validator.addMethod("maxlength", function (value, element, len) {
            return value === "" || value.length <= len;
        });
        $.validator.addMethod("customemail", 
          function(value/*, element*/) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        }, "Por favor ingrese un correo válido");

        $("#formulario").validate(
             {
              rules: {
                usuario: {
                  required: true,
                  nowhitespace: true,
                  remote: {
                    url: window.serverUrl + "/validar/usuario/",
                    type: "GET",
                    data: {
                      username: function() {
                        return $( "#usuario" ).val();
                      }
                    }
                  }
                },
                ci:{
                 required: true,
                 maxlength: 10,
                 number: true,
                 nowhitespace: true,
                 remote: {
                    url: "http://localhost:8000/validar/trabajador/",
                    type: "GET",
                    data: {
                      ci: function() {
                        return $( "#ci" ).val();
                      }
                    }
                  }
                },
                cargo:{
                    required: true,
                },
                nombre1:{
                    required: true,
                    maxlength: 15,
                    nowhitespace: true,
                    lettersonly: true,
                },
                nombre2:{
                    nowhitespace: true,
                    maxlength: 15,
                    lettersonly: true,
                },
                apellido1:{
                    required: true,
                    maxlength: 15,
                    nowhitespace: true,
                    lettersonly: true,
                },
                apellido2:{
                    nowhitespace: true,
                    maxlength: 15,
                    lettersonly: true,
                },
                tlf:{
                    required: true,
                    maxlength: 15,
                    number: true

                },
                dire:{
                    maxlength: 200,
                },
                correo:{
                    required: true,
                    customemail: true,
                },
                password1:{
                    required: true,
                    strongPassword: true,
                    minlength: 8,
                },
                password2:{
                    required: true,
                    equalTo: '#password1',
                },
              },
              messages:{
                usuario: {
                  required: 'Este campo es requerido',
                  nowhitespace: 'No dejar espacios en blanco',
                },
                ci:{
                  required: 'Este campo es requerido',
                  nowhitespace: 'No dejar espacios en blanco',
                  number:'Por favor solo números',
                  maxlength: 'Longitud máxima de 10 caracteres',
                },
                cargo:{
                    required: 'Este campo es requerido',
                },
                nombre1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                nombre2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                apellido1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                apellido2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                tlf:{
                    required: 'Este campo es requerido',
                    number:'Por favor solo números',
                },
                dire:{
                    maxlength: 'Longitud máxima de 50 caracteres',
                },
                correo:{
                    required: 'Este campo es requerido',
                    customemail: 'Por favor ingrese un correo válido',
                    email: 'Por favor ingrese un correo válido',
                },
                password1:{
                    required: 'Este campo es requerido',
                    minlength: 'Al menos 8 caracteres',
                },
                password2:{
                    required: 'Este campo es requerido',
                    equalTo: 'las contraseñas no coinciden',
                },
              },
              errorElement: 'small',
              errorClass: 'help-block',
              errorPlacement: function(error, element) {
                error.insertAfter(element.parent().parent().find("small"));
                element.parent().parent().find("small").css('display', 'inline');
               
              },
              highlight: function(element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
              },
              success: function(element) {
                $(element)
                .addClass('valid')
                .closest('.form-group').removeClass('has-error').addClass('has-success');
              }
        });

    },
    llamadaServidor(method,url,data,callback,context){
		$.ajax({
			type: method,
			url: url,
			context: this,
			headers:{
				Authorization: "Token "+ Cookies.get('token'),
			},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(data),
		})    
		.done(function(response) {
			//console.log(response);
			context.init();
			callback('Exito: ',response.msg,1,context);
		})    
		.fail(function(response) { 
			console.log(response);
			callback('Error: ',response.responseText,-1,context);
		});
	},
	msgRespuesta(tipo,desc,estatus,context){
		var clases = ['alert-danger','alert-warning','alert-success'];
		var _this = context;
		_this.set('msg.tipo',tipo);
		_this.set('msg.desc',desc);
		$.each(clases,function(i/*,clase*/){
			if (i === (estatus+1)){
				$("#alertMsg").addClass(clases[i]);
			}else{
				$("#alertMsg").removeClass(clases[i]);
			}

		});
		$("#alertMsg").show();

	},
	cerrarMsg(){
		$("#alertMsg").hide();
	},
	actions:{
		cerrarMsg:function(){
			this.cerrarMsg();
		},
		registrar:function(){
			var registro = null;
            var selects = document.getElementById("selectcargo");
            var  selectedCargo = selects.options[selects.selectedIndex].value;
            registro = this.get('registro');
            registro.cargo = selectedCargo;
            //var data = $.extend(true,{},registro);
            var method = "POST"
            var url = window.serverUrl + '/usuarios/'
            this.validarCampos();
            if ($("#formulario").valid()){
            	var data = {
                    user:{
                        username: registro.usuario,
                        password: registro.password1,
                        password2: registro.password2,
                        email: registro.correo,
                    },
                    trabajador:{
                        ci: registro.ci,
                        nombre1: registro.nombre1,
                        nombre2: registro.nombre2,
                        apellido1: registro.apellido1,
                        apellido2: registro.apellido2,
                        tlf: registro.tlf,
                        correo: registro.correo,
                        dire: registro.dire,
                        cargo: registro.cargo,
                    }
                };
            	console.log("valido");
            	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
            }
			//console.log("implementar");
		},
	},
});
