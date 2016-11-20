import Ember from 'ember';

export default Ember.Controller.extend({
	servicio:{},
	editing:false,
	servicios: [],


	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/servicio/';
	    this.getElements(method,url,this.asignarServicios,this);
	    this.inicializarTabla();
	},
	validarCampos: function(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod('codigoServicio', function(value, element){
				return this.optional(element) ||   value.length <= 15 && /[S][T][-]\d{3}/.test(value);
		}, 'Código no válido');


		$("#formulario").validate({
			rules:{
				codigo:{
					codigoServicio: true,
					required:true,
					maxlength:6,
				},
				desc:{
					required: true,
					maxlength:200,
				},
				precio_act:{
					required: true,
					number: true,
				},
			},
			messages:{
				codigo:{
					required:'Este campo es requerido.',
					maxlength:6,
				},
				desc:{
					required: 'Este campo es requerido.',
					maxlength:'Longitud máxima de 200 caracteres',
				},
				precio_act:{
					required: 'Este campo es requerido.',
					number: 'Por favor solo números',
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
	prepararModal(editing,servicio){
		 $("#tabla").tablesorter();
		if (editing==='false'){
			this.set('editing',false);
			$("#codigo").prop('disabled', false);
			this.set('servicio', {});
		}else{
			this.set('editing',true);
			var aux =  $.extend(true, {}, servicio);
			$("#codigo").prop('disabled', true);
			this.set('servicio',aux/*servicio*/);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
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
		.done(function(response){ callback(response, context); })    
		.fail(function(response) { console.log(response); }); 
	},
	llamadaServidor(method,url,data){
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
		.done(function(response) { if(method==="PATCH"){alert('Servicio editado con exito!');} else if (method==="POST"){alert('Servicio creado con exito!');} console.log(response); })    
		.fail(function(response) { console.log(response); alert("Ocurrio un problema en la llamada al servidor"); }); 
	},
	asignarServicios(servicios,context){
		var _this = context;

		if (!Array.isArray(servicios)){
			var aux = [];
			aux.push(servicios);
			servicios = aux;
		}
		_this.set('servicios',servicios);
		
		
	},
	inicializarTabla(){

		setTimeout(function(){ 

			var table = $('#tabla').DataTable({"bLengthChange": false}); //quitamos el buton por defecto

			$('#serv').on( 'keyup', function (){ table.search( this.value).draw(); } ); //button de filtrado

			$('#page').on( 'change', function (){ table.page.len(this.value).draw(); }); //buton de tamanio de pagina

			table.draw();
		},1000);

	},

	actions: {

		openModal: function(editing,cliente){
			this.prepararModal(editing,cliente);
		},
		save: function(){
			var servicio = this.get('servicio');
			var method = "";
			var url = "";
			if (!this.get('editing')){
				 method = "POST";
				url = window.serverUrl + '/servicio/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/servicio/' + servicio.codigo +'/';
			}

			var data = servicio;
			this.validarCampos();
			if ($("#formulario").valid()){
				this.llamadaServidor(method,url,data);
			}
			//this.salvar(method,url,data);
		},
	}
});
