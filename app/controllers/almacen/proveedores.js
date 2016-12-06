import Ember from 'ember';

export default Ember.Controller.extend({
	editing:false,
	proveedores: [],
	filtro: null,
	alert: {},
	select:{},
	proveedor: {},


	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/proveedor/';
	    this.getElements(method,url,this.setProveedores,this);
	},
	validarCampos: function(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod('rifValido', function(value, element){
				return this.optional(element) ||   value.length <= 15 && /[J]\-\d+\-\d/.test(value);
		}, 'Rif no válido');


		$("#formulario").validate({
			rules:{
				rif: {
					required: true,
					maxlength: 15,
					nowhitespace: true,
					rifValido: true,
					/*remote: {
						url: window.serverUrl + '/validar/cliente/',
						type: "GET",
						data: {
							rif: function() {
								return $( "#rif" ).val();
							}
						}
					}*/
				},
				nombre:{
					required: true,
					maxlength: 75,
				},
				dire:{
					required: true,
					maxlength: 200,
				},
				tlf1:{
					required: true,
					maxlength: 15,
					nowhitespace: true,
					number: true,
				},
				tlf2:{
					nowhitespace: true,
					maxlength: 15,
					number: true,
				},
			},
			messages:{
				rif: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 15 caracteres',
					nowhitespace: 'No dejar espacios en blanco',
				},
				nombre:{
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 75 caracteres',
				},
				dire:{
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 200 caracteres',
				},
				tlf1:{
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 15 caracteres',
					nowhitespace: 'No dejar espacios en blanco',
					number: 'Por favor solo números',
				},
				tlf2:{
					nowhitespace: 'No dejar espacios en blanco',
					maxlength: 'Longitud máxima de 15 caracteres',
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
		console.log(data);
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
			this.alertMsg(true,method,response);
			this.init(); 
		})    
		.fail(function(response) {
			this.alertMsg(false,method,response); 
			console.log(response);
		});
	},
	alertMsg(success,method,response){
		if (success){
			if(method==="PATCH"){
				this.set('alert.strong','Editado'); 
				this.set('alert.msg','Proveedor '+response.rif+' editado exitosamente'); 
			} 
			else if (method==='POST'){
				this.set('alert.strong','Creado');
				this.set('alert.msg','Proveedor '+response.rif+' creado exitosamente'); 
			} 
			$("#alert").removeClass('hidden');
			$("#alert").removeClass('alert-danger');
			$("#alert").addClass('alert-success');
		}else{
			this.set('alert.strong','Error'); 
			this.set('alert.msg','Ocurrio un error en el servidor'); 

			$("#alert").removeClass('hidden');
			$("#alert").removeClass('alert-success');
			$("#alert").addClass('alert-danger');
		}
	},
	setProveedores(proveedores,context){
		var _this = context;

		if (!Array.isArray(proveedores)){
			var aux = [];
			aux.push(proveedores);
			proveedores = aux;
		}
		_this.set('proveedores',proveedores);
	 	_this.paginationInitialize(10);	
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
    	return this.get("proveedores").filter(

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
  	}).property("filtro","proveedores","select"),

  	ordenar(prop, asc,array) {
	    array = array.sort(function(a, b) {
	        if (asc) {
	            return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
	        } else {
	            return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
	        }
	    });	
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

    		var proveedores = _this.get('proveedores').toArray();
			var totalProveedores = proveedores.length;
			var res = totalProveedores % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalProveedores/tamPagina) + 0.5);
			}else{
				nPaginas = totalProveedores/tamPagina;
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
		            var mostrables = proveedores.slice(showFrom, showTo);
		            $.each(proveedores,function(i,proveedor){
		            	if($.inArray(proveedor, mostrables) !== -1){
		            		proveedor.show = true;
		            	}else{
		            		proveedor.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('proveedores',proveedores);

		        }
    		});
    	});

	},
	prepararModal(editing,proveedor){
		if (editing==='false'){
			this.set('editing',false);
			$("#rif").prop('disabled', false);
			this.set('proveedor', {});
		}else{
			this.set('editing',true);
			var aux =  $.extend(true, {}, proveedor);
			$("#rif").prop('disabled', true);
			this.set('proveedor',aux);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},
	actions: {

		openModal: function(editing,proveedor){
			this.prepararModal(editing,proveedor);
		},
		save:function(){
			var method = "";
			var url = "";
			var proveedor = this.get('proveedor');
			if (!this.get('editing')){
				method = "POST";
				url = window.serverUrl + '/proveedor/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/proveedor/' + proveedor.rif +'/';
			}
			var data = proveedor;
			this.validarCampos();
			if ($("#formulario").valid()){
				this.llamadaServidor(method,url,data);
				$('#myModal').modal('hide');
			}
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
			var aux = this.ordenar(property,asc,this.get('proveedores').toArray());
			this.set('proveedores',aux);
    	}
	},
});
