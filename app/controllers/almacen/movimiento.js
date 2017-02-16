import Ember from 'ember';

export default Ember.Controller.extend({
	movimiento: {
		ingreso:{},
		retorno:{},
		egreso:{},
	},
	aux_retorno_inicial:{
		codigo_pro:"",
		nombre_pro:"",
		codigo_eta:"",
		nombre_eta:"",
		ci_tecnico:"",
		nombre_tec:"",
	},
	aux_ingreso_inicial:{
		rif_prove:"",
		nombre_prove:"",
		codigo_ne:"",
		codigo_oc:"",
		nombre_t:"",
		nombre_e:"",
	},
	msg: {},
	//codigo pro :P02112016-1
	//codigo sol: 10
	//rif_prove: J-5-5
	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		//agrego el evento on change al radio button del tipo movimiento
	},
	validarEgreso(){
		$("#formulario_eg").validate({
			rules:{
				codigo_sol:{
					required:true,
					number:true,
				},
			},
			messages:{
				codigo_sol:{
					required:'Ingrese un código de solicitud.',
					number:'Por favor solo números',
				},
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
	validarRetorno(){
		$("#formulario_re").validate({
			rules:{
				codigo_pro:{
					required:true,
				},
				etapas:{
					required:true,
				},
				tecnicos:{
					required:true,
				},
			},
			messages:{
				codigo_pro:{
					required:'Ingrese un código de proyecto.',
				},
				etapas:{
					required:'Seleccione una etapa.',
				},
				tecnicos:{
					required:'Seleccione un técnico.',
				},
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
	validarIngreso(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});
		$("#formulario_ni").validate({
			rules:{
				rif_prove:{
					required:true,
				},
				codigo_ne:{
					required:true,
					maxlength:50,
				},
				codigo_oc:{
					required:true,
					maxlength:50,
				},
				persona_t:{
					required:true,
					maxlength:60,
					//lettersonly: true
				},
				persona_e:{
					required:true,
					maxlength:60,
					//lettersonly: true
				},
			},
			messages:{
				rif_prove:{
					required:'Este campo es requerido.',
				},
				codigo_ne:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 50 caracteres.',
				},
				codigo_oc:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 50 caracteres.',
				},
				persona_t:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 60 caracteres.',
					//lettersonly: 'Por favor solo letras.',
				},
				persona_e:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 60 caracteres.',
					//lettersonly: 'Por favor solo letras.',
				},
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
				//data: data,
		})    
		.done(function(response){ callback(response, context); })    
		.fail(function(response) { console.log(response); context.msgRespuesta('Error: ',response.responseText,-1,context);}); 
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
	setInfoMovimiento(info_movimiento,context){
		var tipo_mov = context.get('tipo_mov');
		//console.log(info_movimiento);
		if(tipo_mov === 'ni'){
			context.set('movimiento.ingreso',info_movimiento);
			$.each(info_movimiento.materiales,function(i,material){
				material['cantidad_seleccion'] = 0;
				material['cantidad_sin_seleccion'] = Number.MAX_VALUE;
				material['mostrar_seleccion'] = false;
				material['mostrar_sin_seleccion'] = true; 
			});
			context.set('movimiento.materiales',info_movimiento.materiales);
		}else if(tipo_mov === 're'){
			context.set('movimiento.retorno',info_movimiento);
			$.each(info_movimiento.materiales,function(i,material){
				material['cantidad_seleccion'] = 0;
				material['cantidad_sin_seleccion'] = material['cantidad'];
				material['mostrar_seleccion'] = false;
				material['mostrar_sin_seleccion'] = true; 
			});
			context.set('movimiento.materiales',info_movimiento.materiales);
			//console.log(context.get('movimiento.materiales'));
		}else if(tipo_mov === 'eg'){
			context.set('movimiento.egreso',info_movimiento);
			context.set('movimiento.materiales',info_movimiento.materiales);
		}
		//context.set('info_movimiento',info_movimiento);
	},
	selectTipoMov(){
		var tipo_mov = $("#select_tipo_mov").val();
		this.set('tipo_mov',tipo_mov);
		this.set('movimiento.ingreso',{});
		this.set('movimiento.egreso',{});
		this.set('movimiento.retorno',{});
		this.set('movimiento.materiales',[]);

		if(tipo_mov === 'ni'){
			//url = window.serverUrl + '/materiales/';
			this.set('movimiento.ni',true);
			this.set('movimiento.re',false);
			this.set('movimiento.eg',false);
		}else if(tipo_mov === 're'){
			//url = window.serverUrl + '/proyecto/' +this.get('movimiento.retorno.codigo_pro')+'/materiales/' ;
			this.set('movimiento.ni',false);
			this.set('movimiento.re',true);
			this.set('movimiento.eg',false);
		}else if(tipo_mov === 'eg'){
			//url = window.serverUrl + '/solicitud/' +this.get('movimiento.egreso.codigo_sol')+'/materiales/' ;
			this.set('movimiento.ni',false);
			this.set('movimiento.re',false);
			this.set('movimiento.eg',true);
		}

		//console.log(url);
		//this.getElements(method,url,this.setMateriales,this);
	},
	selectEtapaRetorno(){
		var codigo_eta = $("#select_etapa").val();
		$.each(this.get('movimiento.retorno.etapas'),function(i,etapa){
			if (parseInt(codigo_eta) === etapa.codigo_eta){
				$("#nombre_eta").val(etapa.nombre_eta);
			}
		});
	},
	selectTecnicoRetorno(){
		var ci_tecnico = $("#select_tecnico").val();
		$.each(this.get('movimiento.retorno.tecnicos'),function(i,tecnico){
			if (ci_tecnico === tecnico.ci_tecnico){
				$("#nombre_tec").val(tecnico.nombre_t);
			}
		});
	},
	openModalMateriales(){
		$("#myModalMateriales").modal('show');
	},
	agregarMaterial(){

		/*material['cantidad_seleccion'] = 0;
				material['cantidad_sin_seleccion'] = material['cantidad'];
				material['mostrar_seleccion'] = false;
				material['mostrar_sin_seleccion'] = true; */
		var checkbox = '#myModalMateriales input:checked';
		var codigo;
		var input_cantidad = "#cant_sel_";
		var materiales = $.extend(true,[],this.get('movimiento.materiales').toArray());
		//console.clear();
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(materiales,function(i,material){
				if(codigo === material.codigo){
					var cantidad = parseInt($(input_cantidad+codigo).val());
					if (material.serial !== null && cantidad >0){// si el material tiene serial, la cantidad seleciconada ajuro sera 1
						cantidad = 1;
					}
					//console.log(cantidad);
					//console.log(material.cantidad_sin_seleccion);
					if (!isNaN(cantidad) && cantidad <= material.cantidad_sin_seleccion){
						material.cantidad_seleccion += cantidad;
						material.cantidad_sin_seleccion -= cantidad;
						if (material.cantidad_sin_seleccion === 0 ){
							material.mostrar_sin_seleccion = false;
						}
						if(material.cantidad_seleccion > 0 ){
							material.mostrar_seleccion = true;
						}
					}

				}
			});
			//console.log(codigo + ": "+ $(input_cantidad+codigo).val());
		});
		this.set('movimiento.materiales',materiales);
	},
	eliminarMaterialesSeleccionados(){
		var checkbox = '#tabla input:checked';
		var codigo;
		var materiales = $.extend(true,[],this.get('movimiento.materiales').toArray());
		var _this = this;
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(materiales,function(i,material){
				if(codigo === material.codigo){
					material.cantidad_seleccion = 0 ;
					if (_this.get('movimiento.ni')){
						material.cantidad_sin_seleccion = Number.MAX_VALUE;
					}else if(_this.get('movimiento.re')){
						material.cantidad_sin_seleccion = material.cantidad;
					}
					//material.cantidad_sin_seleccion = material.cantidad;
					material.mostrar_seleccion = false;
					material.mostrar_sin_seleccion = true;
				}
			});
		});
		this.set('movimiento.materiales',materiales);
	},
	buscar(){
		console.log(this.get('movimiento.ingreso'));
		var method = "GET";
		var url;
		var tipo_mov = this.get('tipo_mov');
		if(tipo_mov === 'ni'){
			url = window.serverUrl + '/almacen/movimiento/ingreso/'+ this.get('movimiento.ingreso.rif_prove') +'/';
			this.set('movimiento.ingreso',this.get('aux_ingreso_inicial'));
			this.set('movimiento.ingreso.rif',"");
			this.getElements(method,url,this.setInfoMovimiento,this);
		}else if(tipo_mov === 're'){
			var codigo_pro = this.get('movimiento.retorno.codigo_pro');
			if (codigo_pro === undefined || codigo_pro===null || codigo_pro===""){
				 this.msgRespuesta('Error: ',"Ingresa un código de proyecto",-1,this);
			}else{
				url = window.serverUrl + '/almacen/movimiento/retorno/'+ codigo_pro +'/';
				//reiniciamos los campos de texto y los select
				this.set('movimiento.retorno',this.get('aux_retorno_inicial'));
				$("#select_etapa").prop('selectedIndex', 0);
	    		$("#select_tecnico").prop('selectedIndex', 0);
	    		this.getElements(method,url,this.setInfoMovimiento,this);
    		}
		}else if(tipo_mov === 'eg'){
			var codigo_sol = this.get('movimiento.egreso.codigo_sol');
			if (codigo_sol === undefined || codigo_sol===null || codigo_sol===""){
				 this.msgRespuesta('Error: ',"Ingresa un código de solicitud",-1,this);
			}else{
				url = window.serverUrl + '/almacen/movimiento/egreso/'+ this.get('movimiento.egreso.codigo_sol') +'/';
				this.getElements(method,url,this.setInfoMovimiento,this);
			}
		}
		//this.getElements(method,url,this.setInfoMovimiento,this);
	},
	prepararDataMovimiento(){
		var data={};
		data.fecha = moment().format("YYYY-MM-DD");
		data.ci_almace = Cookies.getJSON('current').ci;

		var tipo_mov = this.get('tipo_mov');
		if(tipo_mov === 'ni'){
			data.tipo="Ingreso";
			data.rif_prove =this.get('movimiento.ingreso.rif_prove');
			data.codigo_ne =this.get('movimiento.ingreso.codigo_ne');
			data.codigo_oc =this.get('movimiento.ingreso.codigo_oc');
			data.persona_t =this.get('movimiento.ingreso.persona_t');
			data.persona_e =this.get('movimiento.ingreso.persona_e');
			data.materiales = [];
			data.completado = true;
			$.each(this.get('movimiento.materiales').toArray(),function(i,material){
				if (material.mostrar_seleccion===true){
					var aux = {};
					aux.codigo = material.codigo;
					aux.cantidad = material.cantidad_seleccion;
					data.materiales.push(aux);
				}
			});
		}else if(tipo_mov === 're'){
			data.tipo="Retorno";
			data.ci_tecnico = $("#select_tecnico").val();
			data.codigo_eta = $("#select_etapa").val();
			data.codigo_pro = this.get('movimiento.retorno.codigo_pro');
			data.materiales = [];
			data.completado = true;
			$.each(this.get('movimiento.materiales').toArray(),function(i,material){
				if (material.mostrar_seleccion===true){
					var aux = {};
					aux.codigo = material.codigo;
					aux.cantidad = material.cantidad_seleccion;
					data.materiales.push(aux);
				}
			});
		}else if(tipo_mov === 'eg'){
			data.tipo="Egreso";
		}
		return data;
	},
	procesarMovimiento(){
		var method = "POST";
		var url;
		var data={};

		data = this.prepararDataMovimiento();

		var tipo_mov = this.get('tipo_mov');
		if(tipo_mov === 'ni'){
			url = window.serverUrl + '/almacen/movimiento/ingreso/'+ this.get('movimiento.ingreso.rif_prove') +'/';
			this.validarIngreso();
			if ($("#formulario_ni").valid()){
        		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        		//console.log(data);
        	}

		}else if(tipo_mov === 're'){
 			url = window.serverUrl + '/almacen/movimiento/retorno/'+ this.get('movimiento.retorno.codigo_pro') +'/';
			this.validarRetorno();
			if ($("#formulario_re").valid()){
        		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        	}
		}else if(tipo_mov === 'eg'){
			url = window.serverUrl + '/almacen/movimiento/egreso/'+ this.get('movimiento.egreso.codigo_sol') +'/';
			this.validarEgreso();
			if ($("#formulario_eg").valid()){
        		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        	}
		}
		//console.log(data);
	},
	cerrarMsgAlert(){
		$("#alertMsg").hide();
	},
	actions:{
		selectTipoMov:function(){
			this.selectTipoMov();
		},
		selectEtapaRetorno:function(){
			this.selectEtapaRetorno();
		},
		selectTecnicoRetorno:function(){
			this.selectTecnicoRetorno();
		},
		openModalMateriales(){
			this.openModalMateriales();
		},
		agregarMaterial(){
			this.agregarMaterial();
		},
		eliminarMaterialesSeleccionados(){
			this.eliminarMaterialesSeleccionados();
		},
		buscar:function(){
			this.buscar();
		},
		procesarMovimiento(){
			this.procesarMovimiento();
		},
		cerrarMsgAlert(){
			this.cerrarMsgAlert();
		}
	},
});
