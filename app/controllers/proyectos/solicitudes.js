import Ember from 'ember';

export default Ember.Controller.extend({
	currentName: '',
	solicitudes: [],
	clientes: [],
	tecnicos:[],
	solicitud: {},
	cliente: {},
	proceso: {},
	init(){
		this._super();
		this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 

		var method = 'GET';

		var url = window.serverUrl + /solicitud/;
		this.getElements(method,url,this.asignarSolicitudes,this);

		var url = window.serverUrl + /cliente/;
	    this.getElements(method,url,this.asignarClientes,this);

	    var url = window.serverUrl + '/proyectos/tecnicos/';
	    this.getElements(method,url,this.asignarTecnicos,this);
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
	asignarSolicitudes(solicitudes,context){
		var _this = context;
		_this.set('solicitudes',solicitudes);
	},
	asignarClientes(clientes,context){
		var _this = context;
		_this.set('clientes',clientes);
	},
	asignarTecnicos(tecnicos,context){
		var _this = context;
		_this.set('tecnicos',tecnicos);

		if (!Array.isArray(tecnicos)){
			var aux = [];
			aux.push(tecnicos);
			_this.set('tecnicos',aux);
			tecnicos = aux;
		}

		$("#ci_tecnico").focusout(function() {
    		var ci_tecnico = $("#ci_tecnico").val();
    		var flag = false;
    		$.each(tecnicos, function(i,tecnico){
    			if (tecnico.ci === ci_tecnico){
    				flag = true;
    				$("#nombre_t").val(tecnico.nombre1 +" "+  tecnico.apellido1);
    			}
    		});
    		if (!flag){
    			$("#nombre_t").val('Cedula no registrada.');
    		}
    	});
	},
	prepararModal(solicitud){
		var aux;

		this.set('solicitud',solicitud);
		$.each(this.get('clientes'), function(i,cliente){
			if (cliente.rif === solicitud.rif_c)
				aux=cliente;
		});
		this.set('cliente',aux);
		
		//se reinician los errores
		$(".input-group").removeClass('has-success');
		$(".input-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');

	},
	actions: {
		openModal: function(solicitud){
			this.prepararModal(solicitud);
		},
		save: function(){
			console.log(this.get('proceso'));
		}
	}

});
