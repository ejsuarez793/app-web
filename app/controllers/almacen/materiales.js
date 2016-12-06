import Ember from 'ember';

export default Ember.Controller.extend({
	//material:{},
	editing:false,
	materiales: [],
	proveedores: [],
	filtro: null,
	alert: {},
	select:{},
	pcs: [],
	pss: [],
	material:{
		codigo: '',
		serial: '',
		desc: '',
		presen: '',
		precio_act: '',
		cantidad: '',
		marca: '',
		modelo: '',
		color: '',
		alto: '',
		largo: '',
		ancho: '',
	},
	/*material:{
		'codigo': 'codigo',
		serial: 'Serial',
		desc: 'Descripcion',
		presen: 'Presentacion',
		precio_act: 'Precio Actual',
		cantidad: 'Cantidad',
		marca: 'Marca',
		modelo: 'Modelo',
		color: 'Color',
		alto: 'Alto',
		largo: 'Largo',
		ancho: 'Ancho',
	},*/
	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/material/';
	    this.getElements(method,url,this.asignarMateriales,this);

	    url = window.serverUrl + '/proveedor/';
	    this.getElements(method,url,this.setProveedores,this);
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
					maxlength:10,
				},
				serial:{
					maxlength:50,
				},
				nombre:{
					required:true,
					maxlength:100,
				},
				desc:{
					maxlength:300,
				},
				presen:{
					maxlength:50,
				},
				precio_act:{
					required:true,
					number: true,
				},
				cantidad:{
					required:true,
					number: true,
				},
				marca:{
					required:true,
					maxlength:50,
				},
				modelo:{
					maxlength:50,
				},
				color:{
					maxlength:20,
				},
				alto:{
					maxlength:20,
				},
				largo:{
					maxlength:20,
				},
				ancho:{
					maxlength:20,
				}
			},
			messages:{
				codigo:{
					required:'Este campo es requerido',
					maxlength:'10',
				},
				serial:{
					maxlength:'Longitud máxima de 50 caracteres',
				},
				nombre:{
					required:'Este campo es requerido',
					maxlength:'Longitud máxima de 100 caracteres',
				},
				desc:{
					maxlength:'Longitud máxima de 300 caracteres',
				},
				presen:{
					maxlength:'Longitud máxima de 50 caracteres',
				},
				precio_act:{
					required:'Este campo es requerido',
					number: 'Por favor solo números',
				},
				cantidad:{
					required:'Este campo es requerido',
					number: 'Por favor solo números',
				},
				marca:{
					required:'Este campo es requerido',
					maxlength:'Longitud máxima de 50 caracteres',
				},
				modelo:{
					maxlength:'Longitud máxima de 50 caracteres',
				},
				color:{
					maxlength:'Longitud máxima de 20 caracteres',
				},
				alto:{
					maxlength:'Longitud máxima de 20 caracteres',
				},
				largo:{
					maxlength:'Longitud máxima de 20 caracteres',
				},
				ancho:{
					maxlength:'Longitud máxima de 20 caracteres',
				}
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
				this.set('alert.msg','Material '+response.codigo+' editado exitosamente'); 
			} 
			else if (method==='POST'){
				this.set('alert.strong','Creado');
				this.set('alert.msg','Material '+response.codigo+' creado exitosamente'); 
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
	asignarMateriales(materiales,context){
		var _this = context;

		if (!Array.isArray(materiales)){
			var aux = [];
			aux.push(materiales);
			materiales = aux;
		}
		$.each(materiales, function(i,material){
			
			material.precio_act = numeral(material.precio_act).format('0,0.00');
			material.f_act = moment(material.f_act).format('l');
		});
		_this.set('materiales',materiales);
	 	_this.paginationInitialize(10);	
	},
	setProveedores(proveedores,context){
		var _this = context;

		if (!Array.isArray(proveedores)){
			var aux = [];
			aux.push(proveedores);
			proveedores = aux;
		}
		_this.set('proveedores',proveedores);	
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
    	return this.get("materiales").filter(

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
  	}).property("filtro","materiales","select"),

  	ordenar(prop, asc,array) {
			if (prop==="precio_act" || prop==="cantidad"){
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

    		var materiales = _this.get('materiales').toArray();
			var totalMateriales = materiales.length;
			var res = totalMateriales % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalMateriales/tamPagina) + 0.5);
			}else{
				nPaginas = totalMateriales/tamPagina;
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
		            var mostrables = materiales.slice(showFrom, showTo);
		            $.each(materiales,function(i,material){
		            	if($.inArray(material, mostrables) !== -1){
		            		material.show = true;
		            	}else{
		            		material.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('materiales',materiales);

		        }
    		});
    	});

	},

	prepararModal(editing,material){
		if (editing==='false'){
			this.set('editing',false);
			//$("#codigo").prop('disabled', false);
			this.set('material', {});
			this.set('pss',this.get('proveedores').toArray());
		}else{
			this.set('editing',true);
			var aux =  $.extend(true, {}, material);
			//$("#codigo").prop('disabled', true);
			this.set('material',aux);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},

	actions: {

		openModal: function(editing,material){
			this.prepararModal(editing,material);
		},
		openModalDetail: function(editing,material){
			$("#myModalDetail").modal('show');
			this.set('material',material);
		},
		save:function(){
			var material = this.get('material');
			var method = "";
			var url = "";
			if (!this.get('editing')){
				method = "POST";
				url = window.serverUrl + '/material/';
			}else{
				method = "PATCH";
				url = window.serverUrl +'/material/' + material.codigo +'/';
			}
			material.serial=null;
			var data = material;
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
			var aux = this.ordenar(property,asc,this.get('materiales').toArray());
			this.set('materiales',aux);
			//this.get('servicios').sortBy('codigo');

    	},
    	openModalProveedores: function(){
    		$('#myModalProveedores').modal('show');
    	},
    	agregarProveedores: function(){
    		console.log("agregar");
    		var pcs = [];
    		var pss = [];
    		var _this = this;


			$('#myModalProveedores input:checked').each(function() {
			    pcs.push($(this).val());
			});
			//console.log(this.get('proveedores').toArray());
			var aux =  $.extend(true, {}, this.get('proveedores').toArray())
			$.each(aux, function(i,proveedor){
				if ($.inArray(proveedor.rif, pcs) !== -1){
					_this.get('pcs').pushObject(proveedor);
				}
			});

			$.each(this.get('pss').toArray(),function(i,pss){
				if($.inArray(pss.rif, pcs) !== -1){
					_this.get('pss').removeObject(pss);
				}
			});

    	},
    	eliminarProveedores: function(){
    		console.log("eliminar");

    		var pcs = [];
    		var pss = [];
    		var _this = this;


			$('#myModal input:checked').each(function() {
			    pss.push($(this).val());
			});
			//console.log(pss);
			console.log(this.get('proveedores').toArray());
			var aux =  $.extend(true, {}, this.get('proveedores').toArray())
			$.each(aux, function(i,proveedor){
				//dconsole.log(proveedor);
				if ($.inArray(proveedor.rif, pss) !== -1){
					_this.get('pss').pushObject(proveedor);
				}
			});

			$.each(this.get('pcs').toArray(),function(i,pcs){
				if($.inArray(pcs.rif, pss) !== -1){
					_this.get('pcs').removeObject(pcs);
				}
			});

			/*console.log(this.get('pcs').toArray());
			console.log(this.get('pss').toArray());*/
    	}
	}
});
