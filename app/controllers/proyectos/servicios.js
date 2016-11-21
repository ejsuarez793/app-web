import Ember from 'ember';

export default Ember.Controller.extend({
	servicio:{},
	editing:false,
	servicios: [],
	sortProperties: ['codigo'],
	theFilter: null,
	alert: {},


	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/servicio/';
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
		_this.set('servicios',servicios);
	 	_this.paginationInitialize(1);	
	},

	checkFilterMatch: function(theObject, str) {
    	var field, match;
    	match = false;
    	for (field in theObject) {
      	//if (theObject[field].toString().slice(0, str.length).toLowerCase() === str.toLowerCase()) {
     	if ( theObject[field].toString().toLowerCase().includes(str.toLowerCase()) ){
        	match = true;
      	}
    	}
    	return match;
  	},

  	filterPeople: (function() {
    	return this.get("servicios").filter(

    	(
    		function(_this) {
      			return function(theObject, index, enumerable) {
			        if (_this.get("theFilter")) {
			          return _this.checkFilterMatch(theObject, _this.get("theFilter"));
			        } else {
			          return true;
			        }
      			};
    		}
    	)(this)

    	);
  	}).property("theFilter", "sortProperties","servicios"),

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
			});
			this.paginate(tamPagina);
		},
		paginate(tamPagina){
			console.log("paginate");
						
			$( document ).ready(function(){


				var servicios = $("table tbody tr");
				var totalServicios = servicios.length;
				var nPaginas = Math.round((totalServicios/tamPagina) + 0.5);

				$('#pagination').twbsPagination('destroy');
				$('#pagination').twbsPagination({
		        	totalPages: nPaginas,
		        	visiblePages: 10,
		        	first: 'Primera',
		        	prev: 'Prev',
		        	next: 'Sig',
		        	last: 'Última',

			        onPageClick: function (event, page) {
			           // console.log(page);
			             // someone changed page, lets hide/show trs appropriately
			            var showFrom = tamPagina * (page - 1);
			            var showTo = showFrom + tamPagina;
			            console.log(tamPagina);
			            console.log("from: "+showFrom);
			            console.log("to: "+showTo);
			            servicios.hide() // first hide everything, then show for the new page
			                 .slice(showFrom, showTo).show();
			        }
	    		})
	    	});

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
