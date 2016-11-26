import Ember from 'ember';

export default Ember.Controller.extend({
	equipo:{},
	editing:false,
	equipos: [],
	filtro: null,
	alert: {},
	select:{},//notificacion a filter


	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/equipo/';
	    this.getElements(method,url,this.asignarEquipos,this);
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
					required:true,
				},
				serial:{
					maxlength:50,
				},
				nombre:{
					required:true,
					maxlength:50,
				},
				desc:{
					maxlength:200,
				},
				costo_uso:{
					required:true,
					number:true,
				},
				cantidad:{
					required:true,
					number:true,
				},
			},
			messages:{
				codigo:{
					required:'Este campo es requerido.',
				},
				serial:{
					maxlength:'Longitud máxima de 50 caracteres',
				},
				nombre:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 50 caracteres',
				},
				desc:{
					maxlength:'Longitud máxima de 200 caracteres',
				},
				costo_uso:{
					required:'Este campo es requerido.',
					number:'Por favor solo números',
				},
				cantidad:{
					required:'Este campo es requerido.',
					number:'Por favor solo números',
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
				this.set('alert.msg','equipo '+response.codigo+' editado exitosamente'); 
			} 
			else if (method==='POST'){
				this.set('alert.strong','Creado');
				this.set('alert.msg','Equipo '+response.codigo+' creado exitosamente'); 
			} 
			$("#alert").removeClass('hidden');
			$("#alert").removeClass('alert-danger');
			$("#alert").addClass('alert-success');
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
	asignarEquipos(equipos,context){
		var _this = context;

		if (!Array.isArray(equipos)){
			var aux = [];
			aux.push(equipos);
			equipos = aux;
		}	
		_this.set('equipos',equipos);
	 	_this.paginationInitialize(10);	
	},
	prepararModal(editing,equipo){
		if (editing==='false'){
			this.set('editing',false);
			$("#codigo").prop('disabled', false);
			this.set('equipo', {});
		}else{
			this.set('editing',true);
			var aux =  $.extend(true, {}, equipo);
			$("#codigo").prop('disabled', true);
			this.set('equipo',aux/*servicio*/);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},
	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	for (field in theObject) {
	     	if (theObject[field]!==null && theObject[field].toString().toLowerCase().includes(str.toLowerCase()) ){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("equipos").filter(

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
  	}).property("filtro","equipos","select"),

  	ordenar(prop, asc,array) {
			if (prop==="costo_uso" || prop==="cantidad" || prop==="codigo"){
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

    		var equipos = _this.get('equipos').toArray();
			var totalEquipos = equipos.length;
			var res = totalEquipos % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalEquipos/tamPagina) + 0.5);
			}else{
				nPaginas = totalEquipos/tamPagina;
			}

			if (nPaginas==0)
				return;

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
		            var mostrables = equipos.slice(showFrom, showTo);
		            $.each(equipos,function(i,equipo){
		            	if($.inArray(equipo, mostrables) !== -1){
		            		//console.log(servicio);
		            		equipo.show = true;
		            	}else{
		            		equipo.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('equipos',equipos);

		        }
    		});
    	});

	},

	actions: {

		openModal: function(editing,equipo){
			this.prepararModal(editing,equipo);

		},
		save: function(){
			var equipo = this.get('equipo');
			var method = "";
			var url = "";
			if (!this.get('editing')){
				 method = "POST";
				url = window.serverUrl + '/equipo/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/equipo/' + equipo.codigo +'/';
			}
			if (equipo.serial===""){
				equipo.serial=null;
			}
			var data = equipo;
			this.validarCampos();
			if ($("#formulario").valid()){
				this.llamadaServidor(method,url,data);
			}
			$('#myModal').modal('hide');
		},
		ordenarPor: function(property) {
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
			var aux = this.ordenar(property,asc,this.get('equipos').toArray());
			this.set('equipos',aux);
			//this.get('servicios').sortBy('codigo');

    	}
	}
});
