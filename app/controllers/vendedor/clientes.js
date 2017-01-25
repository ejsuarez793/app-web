import Ember from 'ember';

export default Ember.Controller.extend({

	currentName:'',
	registro: {
		rif: '',
		nombre: '',
		tlf1: '',
		tlf2: '',
		fax: '',
		dire: '',
		act_eco: '',
		cond_contrib: '',
	},
	editing: false,
	filtro: null,
	clientes:[],
	cliente:{},
	msg: {},
          

	init(){
		this._super();

		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 
			
			var method = "GET";
			var url = window.serverUrl + '/cliente/';
		    this.getElements(method,url,this.setClientes,this);
						
		}
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
					remote: {
						url: window.serverUrl + '/validar/cliente/',
						type: "GET",
						data: {
							rif: function() {
								return $( "#rif" ).val();
							}
						}
					}
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
				fax:{
						nowhitespace: true,
						maxlength: 15,
						number: true,
				},
				act_eco:{
						maxlength: 100,
				},
				cond_contrib:{
						nowhitespace: true,
						lettersonly: true,
				}
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
				fax:{
						nowhitespace: 'No dejar espacios en blanco',
						maxlength: 'Longitud máxima de 15 caracteres',
						number: 'Por favor solo números',
				},
				act_eco:{
						maxlength: 'Longitud máxima de 100 caracteres',
				},
				cond_contrib:{
						nowhitespace: 'No dejar espacios en blanco',
						lettersonly: 'Sin caracteres especiales o números',
				}
			},
			errorElement: 'small',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
				error.insertAfter(element.parent());
			},
			highlight: function(element) {
				$(element).closest('.form-group').removeClass('has-success').addClass('has-error');
			},
			success: function(element) {
				$(element).addClass('valid').closest('.form-group').removeClass('has-error').addClass('has-success');
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
	setClientes(clientes,context){
		var _this = context;

		// esto es para el filtrado, necesita ser un array si es uno solo el que existe devuelve un objecto
		if (!Array.isArray(clientes)){
			var aux = [];
			aux.push(clientes);
			clientes = aux;
		}
		//console.log(clientes);
		_this.set('clientes',clientes);
		_this.paginationInitialize(10);	
	},
	prepararModal(editing,cliente){
		if (editing==='false'){
			this.set('editing',false);
			$("#rif").prop('disabled', false);
			$('#selectcond').prop('selectedIndex',0);
			this.set('registro', {});
		}else{
			this.set('editing',true);
			$("#rif").prop('disabled', true);
			var registro =  $.extend(true, {}, cliente);
			$("#selectcond").val(registro.cond_contrib);
			this.set('registro',registro);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},
	salvar(method,url,data){
		this.validarCampos();
		if ($("#formulario").valid()){
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);

		}
	},
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
	
		var aux = this.ordenar(property,asc,this.get('clientes').toArray());
		this.set('clientes',aux);
	},
	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	var camposFiltrables = ['rif','nombre','act_eco','cond_contrib'];
    	for (field in theObject) {
	     	if (theObject[field]!==null && ($.inArray(field,camposFiltrables)!==-1) && theObject[field].toString().toLowerCase().includes(str.toLowerCase())){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("clientes").filter(

    	(
    		function(_this) {
      			return function(theObject) {
      				//console.log(theObject);
			    	if (_this.get("filtro") && theObject.show){
			        	return _this.filtrar(theObject, _this.get("filtro"));
			        }else if (theObject.show){
			        	return true;
			        }

      			};
    		}
    	)(this)

    	);
  	}).property("filtro","clientes","select"),

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

    		var clientes = _this.get('clientes').toArray();
			var total = clientes.length;
			var res = total % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((total/tamPagina) + 0.5);
			}else{
				nPaginas = total/tamPagina;
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
		            var mostrables = clientes.slice(showFrom, showTo);
		            $.each(clientes,function(i,cliente){
		            	if($.inArray(cliente, mostrables) !== -1){
		            		cliente.show = true;
		            	}else{
		            		cliente.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('clientes',clientes);

		        }
    		});
    	});

	},
	cerrarMsg(){
		$("#alertMsg").hide();
	},
	actions: {
		cerrarMsg:function(){
			this.cerrarMsg();
		},
		openModal: function(editing,cliente){
			this.prepararModal(editing,cliente);
		},

		save: function(){
			var registro = null;
			var method = "";
			var url = "";
			if (!this.get('editing')){
				method = "POST";
				url = window.serverUrl + '/cliente/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/cliente/' + this.get('registro.rif') +'/';
			}

			//agarro el dato del select y lo asigno a mi registro
			var selects = document.getElementById("selectcond");
			var  selectcond = selects.options[selects.selectedIndex].value;
			registro = this.get('registro');
			registro.cond_contrib = selectcond;

			var data = registro;
			this.salvar(method,url,data);
		},
		ordenarPor: function(property) {
			this.ordenarPor(property);
    	},
	}
});
