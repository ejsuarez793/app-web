import Ember from 'ember';

export default Ember.Controller.extend({
	ci:'',
	nuevoCargo:'',
	msg:{},
	init(){
		this._super();
		if (this.get('codigo')!==null && this.get('codigo')!==undefined){
			if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
				this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
			} 
			/*var method = "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('codigo') + '/';
		    this.getElements(method,url,this.setProyecto,this);*/
		}
	},
	validar: function(tipo){
        $.validator.addMethod('strongPassword', function(value, element){
            return this.optional(element) ||   value.length >= 6 && /\d/.test(value) && /[a-z]/i.test(value);
        }, 'Contraseña debe ser al menos 8 caracteres y al menos 1 letra');

        $.validator.addMethod("maxlength", function (value, element, len) {
            return value === "" || value.length <= len;
        });
        if (tipo === 'clave'){
        	$("#form_clave").validate(
	             {
	              rules: {
	                ci_cc:{
	                 required: true,
	                 maxlength: 10,
	                 number: true,
	                 nowhitespace: true,
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
	                ci_cc:{
	                  required: 'Este campo es requerido',
	                  nowhitespace: 'No dejar espacios en blanco',
	                  number:'Por favor solo números',
	                  maxlength: 'Longitud máxima de 10 caracteres',
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
        }else if(tipo==='gestion'){
        	$("#form_gestion").validate(
	             {
	              rules: {
	                ci:{
	                 required: true,
	                 maxlength: 10,
	                 number: true,
	                 nowhitespace: true,
	                },
	                cargo:{
                    	required: true,
                	},
	              },
	              messages:{
	                ci:{
	                  required: 'Este campo es requerido',
	                  nowhitespace: 'No dejar espacios en blanco',
	                  number:'Por favor solo números',
	                  maxlength: 'Longitud máxima de 10 caracteres',
	                },
	                cargo:{
	                	required: 'Este campo es requerido',
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
        }

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
	guardar(){
		console.log("guardando");
		console.log(this.get('ci'));
		console.log(this.get('nuevoCargo'));
		var ci = this.get('ci');
		var method = "PATCH";
		var url = window.serverUrl + '/admin/gestion/' + ci + '/';
		var data = this.get('nuevoCargo');
		this.validar('gestion');
		if ($("#form_gestion").valid()){
			console.log("valido gestion");
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	},
	cambiarClave(){
		console.log("cabiando");
		console.log(this.get('ci_cc'));
		console.log(this.get('password1'));
		console.log(this.get('password2'));
		var ci = this.get('ci_cc');
		var method = "PATCH";
		var url = window.serverUrl + '/admin/clave/' + ci + '/';
		var data = {};
		data.password1 = this.get('password1');
		data.password2 = this.get('password2');
		this.validar('clave');
		if ($("#form_clave").valid()){
			console.log("valido clave");
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	},
	cerrarMsg(){
		$("#alertMsg").hide();
	},
	actions:{
		cerrarMsg(){
			this.cerrarMsg();
		},
		guardar:function(){
			this.guardar();
		},
		cambiarClave:function(){
			this.cambiarClave();
		},
		selectNuevoCargo(){
			this.set('nuevoCargo',$("#selectcargo").val());
		},
	},
});
