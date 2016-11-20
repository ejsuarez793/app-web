import Ember from 'ember';

export default Ember.Controller.extend({

	solicitud: {
		rif_c: '',
		disp: '',
		referido_p: '',
		desc: '',
		ubicacion: '',
		estatus: '',
		nombre_cc: '',
		tlf_cc: '',
		correo_cc: '',
		cargo_cc: '',
	},
	/*solicitud: {
		rif_c: 'J-20803814-5',
		disp: 'Martes y Miercóles 6:00',
		referido_p: 'Anuncio Radio',
		desc: 'Se requiere cableado estructurado para centro comercial',
		ubicacion: 'Valencia',
		nombre_cc: 'Enrique',
		tlf_cc: '04164879877',
		correo_cc: 'enrique@enrique.com',
		cargo_cc: 'Logistica',
	},*/
	solicitudes: '',
	clientes: '',
	nombre_c: '',
	editing: '',
	nombresC: [],

	init(){
	    this._super();
	    var method = 'GET';
	    var url = window.serverUrl + /cliente/;
	    this.getElements(method,url,this.asignarClientes,this);

	    url = window.serverUrl + /solicitud/;
	    this.getElements(method,url,this.asignarSolicitudes,this);
	},
	prepararModal(){

		this.set('solicitud',{});
		
		//se reinician los errores
		$(".input-group").removeClass('has-success');
		$(".input-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');

	},
	validarCampos: function(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod('rifValido', function(value, element){
				return this.optional(element) ||   value.length <= 15 && /[J]\-\d+\-\d/.test(value);
		}, 'Rif no válido');

		$.validator.addMethod("customemail", 
          function(value/*, element*/) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        }, "Por favor ingrese un correo válido");

		$("#formulario").validate({
			rules:{
				rif_c: {
					required: true,
					rifValido: true,
				},
				nombre_c:{
					required: true,
				},
				disp: {
					maxlength: 100,
				},
				referido_p: {
					maxlength: 50,
				},
				desc: {
					required: true,
					maxlength: 300,
				},
				ubicacion: {
					required: true,
					maxlength: 150,
				},
				nombre_cc: {
					required: true,
					maxlength: 75,
				},
				tlf_cc: {
					required: true,
					maxlength: 15,
					number: true,
				},
				correo_cc: {
					required: true,
					customemail: true,
				},
				cargo_cc: {
					required: true,
					maxlength: 50,
				},
			},
			messages:{
				rif_c: {
					required: 'Este campo es requerido.',
					rifValido: 'Favor introduzca un rif válido',
				},
				nombre_c:{
					required: 'Este campo es requerido.'
				},
				disp: {
					maxlength: 'Longitud máxima de 100 caracteres',
				},
				referido_p: {
					maxlength: 'Longitud máxima de 50 caracteres',
				},
				desc: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 300 caracteres',
				},
				ubicacion: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 150 caracteres',
				},
				nombre_cc: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 75 caracteres',
				},
				tlf_cc: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 15 caracteres',
					number: 'Por favor solo números'
				},
				correo_cc: {
					required: 'Este campo es requerido.',
				},
				cargo_cc: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 50 caracteres',
				},
			},
			errorElement: 'small',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
				error.insertAfter(element.closest('.input-group'));
				error.css('color', '#a94442');
				/*element.parent().parent().find("small").css('display', 'inline');*/
			 
			},
			highlight: function(element) {
				$(element).closest('.input-group').removeClass('has-success').addClass('has-error');
			},
			success: function(element) {
				$(element)
				.addClass('valid')
				.parent().find('.input-group').removeClass('has-error').addClass('has-success');
				
			}
		});
	},
	getElements(method,url,callback,context){
		$.ajax({
			type: method,
			url: url,
			headers:{
				Authorization: "Token "+ Cookies.get('token'),
			},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
		})    
		.done(function(response){callback(response, context); })    
		.fail(function(response) { console.log(response); }); 
	},
	postSolicitud(method,url,data){
		$.ajax({
			type: method,
			url: url,
			headers:{
				Authorization: "Token "+ Cookies.get('token'),
			},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(data),
		})    
		.done(function(response){ console.log(response); })    
		.fail(function(response) { console.log(response); }); 
	},
	asignarClientes(clientes,context){
		var _this = context;
		var array = [];
		//console.log(clientes);
		$.each(clientes,function(i,cliente){
			array[i] = cliente.nombre;
		});
		_this.set('nombresC',array);
		_this.set('clientes',clientes);
		$( "#nombre_c" ).autocomplete({
      		source: _this.get('nombresC'),
      		messages: {
		        noResults: '',
		        results: function() {}
		    },
		    appendTo:null,
    	});

    	$("#nombre_c").focusout(function() {
    		var nombre = $("#nombre_c").val();
    		var flag = false;
    		$.each(clientes, function(i,cliente){
    			if (cliente.nombre === nombre){
    				flag = true;
    				$("#rif_c").val(cliente.rif);
    			}
    		});
    		if (!flag){
    			$("#rif_c").val('Cliente no existe');
    		}
    	});
	},
	asignarSolicitudes(solicitudes,context){
		var _this = context;
		//console.log(solicitudes);
		_this.set('solicitudes',solicitudes);
	},

	actions: {
		openModal: function(){
			this.prepararModal();
		},
		save: function(){
			//console.log(this.get('solicitud'));
			var data = this.get('solicitud');
			data.rif_c = $("#rif_c").val();
			var method = 'POST';
			var url = window.serverUrl + '/solicitud/';
			this.validarCampos();
			if ($("#formulario").valid()){
				this.postSolicitud(method,url,data);
			}
		}
	}
});
