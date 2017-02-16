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
	filtro: null,
	solicitudes:[],
	//solicitud:{},

	//solicitudes: '',
	clientes: '',
	nombre_c: '',
	editing: '',
	nombresC: [],
	msg:{},

	init(){
		this._super();

		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 
			var method = 'GET';
		    var url = window.serverUrl + /cliente/;
		    this.getElements(method,url,this.asignarClientes,this);

		    url = window.serverUrl + /solicitud/;
		    this.getElements(method,url,this.asignarSolicitudes,this);					
		}

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
		$.each(solicitudes,function(i,solicitud){
			solicitud.fecha_mostrar = moment(solicitud.f_sol).format('L');
		});
		_this.set('solicitudes',solicitudes);
		_this.paginationInitialize(10);
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
    	var camposFiltrables = ['codigo','nombre_c','desc','estatus'];
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
	cerrarMsg(){
		$("#alertMsg").hide();
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
				this.llamadaServidor(method,url,data,this.msgRespuesta,this);
				$("#myModal").modal('hide');
			}
		},
		ordenarPor: function(property) {
			this.ordenarPor(property);
    	},
    	cerrarMsg:function(){
			this.cerrarMsg();
		},
	}
});
