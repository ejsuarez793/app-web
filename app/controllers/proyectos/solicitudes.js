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
	postProcesarSolicitud(method,url,data){
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
	asignarSolicitudes(solicitudes,context){
		var _this = context;

		if (!Array.isArray(solicitudes)){
			var aux = [];
			aux.push(solicitudes);
			solicitudes = aux;
		}

		_this.set('solicitudes',solicitudes);
	},
	asignarClientes(clientes,context){
		var _this = context;

		if (!Array.isArray(clientes)){
			var aux = [];
			aux.push(clientes);
			clientes = aux;
		}

		_this.set('clientes',clientes);
	},
	asignarTecnicos(tecnicos,context){
		var _this = context;

		if (!Array.isArray(tecnicos)){
			var aux = [];
			aux.push(tecnicos);
			tecnicos = aux;
		}

		_this.set('tecnicos',tecnicos);

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
	prepararDatos(){
		var ci_coord = Cookies.getJSON("current").ci;
		var proceso = this.get('proceso');
		var ci_tecnico = proceso.ci_tecnico;
		var f_vis = proceso.f_vis;

		//se separa la fecha para luego pasarla a formato /dd/mm/aaaa en el codigo de proyecto
		var date = new Date( this.get('proceso.f_vis'));
		var dia =  "0" + (date.getDate() + 1);
		dia = dia.substring(dia.length-2,dia.length);
		var mes = "0" + (date.getMonth() + 1);
		mes = mes.substring(mes.length-2,mes.length);
		var anio = date.getFullYear();

		//se genera una información de proyecto genérica
		var solicitud = this.get('solicitud');
		var codigo = "P"+dia+mes+anio+"-"+solicitud.codigo;
		var nombre = "Nombre Proyecto Codigo: "+codigo+" Solicitud #"+solicitud.codigo;
		var desc = "Descripción Proyecto Codigo: "+codigo+" Solicitud #"+solicitud.codigo;
		var ubicacion = solicitud.ubicacion;
		var codigo_s = solicitud.codigo;

		var proyecto = {
			'codigo': codigo,
			'nombre': nombre,
			'desc': desc,
			'ubicacion': ubicacion,
			'codigo_s': codigo_s,
			'ci_coord': ci_coord,
		};

		var proyecto_tecnico = {
			'codigo_pro': codigo,
			'ci_tecnico': ci_tecnico,
		};

		var solicitud = {
			'codigo': codigo_s,
			'f_vis': f_vis,
		};

		var data = {
			'proyecto': proyecto,
			'proyecto_tecnico': proyecto_tecnico,
			'solicitud': solicitud,
		};

		return data;
	},
	actions: {
		openModal: function(solicitud){
			this.prepararModal(solicitud);
		},
		save: function(){
			var data = this.prepararDatos();
			console.log(data);

			var method = 'PUT';
			var url = window.serverUrl + '/proyectos/solicitud/';
			this.postProcesarSolicitud(method,url,data);
		}
	}

});
