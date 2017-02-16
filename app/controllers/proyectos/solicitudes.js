import Ember from 'ember';

export default Ember.Controller.extend({
	currentName: '',
	solicitudes: [],
	clientes: [],
	tecnicos:[],
	solicitud: {},
	cliente: {},
	proceso: {},
	f_hoy:moment().format("YYYY-MM-DD"),
	msg:{},
	init(){
		this._super();
		this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 

		var method = 'GET';

		var url = window.serverUrl + /solicitud/;
		this.getElements(method,url,this.asignarSolicitudes,this);

	    url = window.serverUrl + '/tecnicos/';
	    this.getElements(method,url,this.asignarTecnicos,this);
	},
	validarCampos: function(){
		var _this = this;
		$.validator.addMethod("ciValida", function (value/*, element, len*/) {
				var aux = [];
				$.each(_this.get('tecnicos').toArray(),function(i,tecnico){
					aux.push(tecnico.ci);
				});
				return ($.inArray(value, aux)!==-1);
		});

		$.validator.addMethod("mayorQue", function (value, element, params) {
				return new Date(value) >= new Date($(params).val());
		});

		$("#formulario").validate({
			rules:{
				ci_tecnico:{
					required:true,
					ciValida: true,
				},
				f_vis:{
					required:true,
					date: true,
					mayorQue: "#f_hoy",
				},
			},
			messages:{
				ci_tecnico:{
					required:'Este campo es requerido.',
					ciValida: 'Cédula no registrada',
				},
				f_vis:{
					required:'Este campo es requerido.',
					date: 'Fecha no válida.',
					mayorQue:'La fecha seleccionada ya paso.',
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
	asignarSolicitudes(solicitudes,context){
		var _this = context;

		if (!Array.isArray(solicitudes)){
			var aux = [];
			aux.push(solicitudes);
			solicitudes = aux;
		}

		//console.log(solicitudes);
		_this.set('solicitudes',solicitudes);
		_this.paginationInitialize(10);
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
	openModal(solicitud){
		//var aux;

		this.set('proceso',{});
		$("#nombre_t").val('');

		this.set('solicitud',solicitud);
		
		//se reinician los errores
		$(".input-group").removeClass('has-success');
		$(".input-group").removeClass('has-error');
		$(".help-block").text("");  
		if (solicitud.estatus!=="Nueva"){
			$('#submit-button').prop('disabled',true);
		}else{
			$('#submit-button').prop('disabled',false);
		}
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

		var solicitud_s = {
			'codigo': codigo_s,
			'estatus': 'Procesada', //procesada
			'f_vis': f_vis,
		};

		var data = {
			'proyecto': proyecto,
			'proyecto_tecnico': proyecto_tecnico,
			'solicitud': solicitud_s,
		};

		return data;
	},
	ordenar(prop, asc,array) {
		if (prop==="codigo"){
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
	ordenarPor(property){
		var asc = null;
		var th='#th-'+property;
		if ($(th).hasClass('glyphicon-chevron-down')){
			asc = true;
			$(th).removeClass('glyphicon-chevron-down');
			$(th).addClass('glyphicon-chevron-up');
		}else{
			asc = false;
			$(th).removeClass('glyphicon-chevron-up');
			$(th).addClass('glyphicon-chevron-down');
		}
	
		var aux = this.ordenar(property,asc,this.get('solicitudes').toArray());
		this.set('solicitudes',aux);
	},
	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	var camposFiltrables = ['codigo','nombre_cliente','estatus'];
    	for (field in theObject) {
	     	if (theObject[field]!==null && ($.inArray(field,camposFiltrables)!==-1) && theObject[field].toString().toLowerCase().includes(str.toLowerCase())){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("solicitudes").filter(

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
  	}).property("filtro","solicitudes",'select'),

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

    		var solicitudes = _this.get('solicitudes').toArray();
			var totalSolicitudes = solicitudes.length;
			var res = totalSolicitudes % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalSolicitudes/tamPagina) + 0.5);
			}else{
				nPaginas = totalSolicitudes/tamPagina;
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
		            var mostrables = solicitudes.slice(showFrom, showTo);
		            $.each(solicitudes,function(i,solicitud){
		            	if($.inArray(solicitud, mostrables) !== -1){
		            		solicitud.show = true;
		            	}else{
		            		solicitud.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('solicitudes',solicitudes);

		        }
    		});
    	});

	},
	actions: {
		openModal: function(solicitud){
			this.openModal(solicitud);
		},
		ordenarPor:function(property){
			this.ordenarPor(property);
		},
		save: function(){
			this.validarCampos();
			if ($('#formulario').valid()){
				var data = this.prepararDatos();
				//console.log(data);

				var method = 'PUT';
				var url = window.serverUrl + '/solicitud/procesar/';
				this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			}
		}
	}

});
