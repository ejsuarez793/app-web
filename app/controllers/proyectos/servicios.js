import Ember from 'ember';

export default Ember.Controller.extend({
	servicio:{},
	editing:false,
	servicios: [],
	filtro: null,
	alert: {},
	select:{},//notificacion a filter


	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/coordinador/servicio/';
	    this.getElements(method,url,this.asignarServicios,this);
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
					remote: {
						url: window.serverUrl + '/validar/servicio/',
						type: "GET",
						data: {
							codigo: function() {
								return $( "#codigo" ).val();
							}
						}
					}
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
					maxlength:'Longitud máxima de 6 caracteres',
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
		.done(function(response) { 
			if(method==="PATCH"){
				this.set('alert.strong','Editado'); 
				this.set('alert.msg','Servicio '+response.codigo+' editado exitosamente'); 
			} 
			else if (method==='POST'){
				this.set('alert.strong','Creado');
				this.set('alert.msg','Servicio '+response.codigo+' creado exitosamente'); 
			} 
			$("#alert").removeClass('hidden');
			$("#alert").removeClass('alert-danger');
			$("#alert").addClass('alert-success');
			console.log(response); 
			this.init(); 
		})    
		.fail(function(response) { 
			console.log(response); this.set('alert.strong','Error'); 
			this.set('alert.msg','Ocurrio un error en el servidor'); 

			$("#alert").removeClass('hidden');
			$("#alert").removeClass('alert-success');
			$("#alert").addClass('alert-danger');
		});
	},
	asignarServicios(servicios,context){
		var _this = context;

		if (!Array.isArray(servicios)){
			var aux = [];
			aux.push(servicios);
			servicios = aux;
		}
		$.each(servicios,function(i,servicio){
			servicio.precio_act_mostrar = numeral(servicio.precio_act).format('0,0.00');
			servicio.f_act_mostrar = moment(servicio.f_act).format('l');
		});
		_this.set('servicios',servicios);
	 	_this.paginationInitialize(10);	
	},

	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	//console.log(str);
    	for (field in theObject) {
      	//if (theObject[field].toString().slice(0, str.length).toLowerCase() === str.toLowerCase()) {
	     	if ( theObject[field].toString().toLowerCase().includes(str.toLowerCase()) ){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("servicios").filter(

    	(
    		function(_this) {
      			return function(theObject/*, index, enumerable*/) {
			    	if (_this.get("filtro") && theObject.show){
			        	return _this.filtrar(theObject, _this.get("filtro"));
			        }else if (theObject.show){
			        	return true;
			        }

      			};
    		}
    	)(this)

    	);
  	}).property("filtro","servicios","select"),

		ordenar(prop, asc,array) {
			if (prop==="precio_act"){
				array = array.sort(function(a, b) {
		        if (asc) {
		            return ( parseFloat(a[prop]) > parseFloat(b[prop]) ) ? 1 : (( parseFloat(a[prop]) < parseFloat(b[prop]) )? -1 : 0);
		        } else {
		            return (parseFloat(b[prop]) > parseFloat(a[prop])) ? 1 : (( parseFloat(b[prop]) < parseFloat(a[prop])) ? -1 : 0);
		        }
		    });
			}else{
		    array = array.sort(function(a, b) {
		        if (asc) {
		            return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
		        } else {
		            return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
		        }
		    });
		}
	   	return array;
	},
	paginationInitialize(tamPagina){
		var _this = this;
		$('#page').on('change',function(){
			_this.paginate(parseInt(this.value));
			_this.set('tamPagina',this.value);
		});
		this.paginate(tamPagina);
	},
	paginate(tamPagina){
		var _this = this;
		$( document ).ready(function(){

    		var servicios = _this.get('servicios').toArray();
			var totalServicios = servicios.length;
			var res = totalServicios % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalServicios/tamPagina) + 0.5);
			}else{
				nPaginas = totalServicios/tamPagina;
			}

			$('#pagination').twbsPagination('destroy');
			$('#pagination').twbsPagination({
	        	totalPages: nPaginas,
	        	visiblePages: 10,
	        	first: 'Primera',
	        	prev: 'Prev',
	        	next: 'Sig',
	        	last: 'Última',

		        onPageClick: function (event, page) {

		            var showFrom = tamPagina * (page - 1);
		            var showTo = showFrom + tamPagina;
		            var mostrables = servicios.slice(showFrom, showTo);
		            $.each(servicios,function(i,servicio){
		            	if($.inArray(servicio, mostrables) !== -1){
		            		//console.log(servicio);
		            		servicio.show = true;
		            	}else{
		            		servicio.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('servicios',servicios);

		        }
    		});
    	});

	},

	actions: {

		openModal: function(editing,servicio){
			this.prepararModal(editing,servicio);

		},
		save: function(){
			var servicio = this.get('servicio');
			var method = "";
			var url = "";
			if (!this.get('editing')){
				 method = "POST";
				url = window.serverUrl + '/coordinador/servicio/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/coordinador/servicio/' + servicio.codigo +'/';
			}

			var data = servicio;
			this.validarCampos();
			if ($("#formulario").valid()){
				this.llamadaServidor(method,url,data);
				$("#myModal").modal('hide');
			}
			$('#modal').modal('hide');
			//this.salvar(method,url,data);
		},
		sortBy: function(property) {
			var asc = null;
			var th = '#th-'+property;
			if ($(th).hasClass('glyphicon-chevron-down')){
				asc = true;
				$(th).removeClass('glyphicon-chevron-down');
				$(th).addClass('glyphicon-chevron-up');
			}else{
				asc = false;
				$(th).removeClass('glyphicon-chevron-up');
				$(th).addClass('glyphicon-chevron-down');
			}
			var aux = this.ordenar(property,asc,this.get('servicios').toArray());
			this.set('servicios',aux);
			//this.get('servicios').sortBy('codigo');

    	}
	}
});
