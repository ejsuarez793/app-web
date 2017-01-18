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
	msg: {},
	//codigo pro :P02112016-1
	//codigo sol: 10
	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		//agrego el evento on change al radio button del tipo movimiento
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
		.fail(function(response) { console.log(response); context.msgRespuesta('Error: ',response.responseText,-1,context)}); 
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
		console.log(info_movimiento);
		if(tipo_mov === 'ni'){
			context.set('movimiento.ingreso',info_movimiento);
		}else if(tipo_mov === 're'){
			context.set('movimiento.retorno',info_movimiento);
			$.each(info_movimiento.materiales,function(i,material){
				material['cantidad_seleccion'] = 0;
				material['cantidad_sin_seleccion'] = material['cantidad'];
				material['mostrar_seleccion'] = false;
				material['mostrar_sin_seleccion'] = true; 
			});
			context.set('movimiento.materiales',info_movimiento.materiales);
			console.log(context.get('movimiento.materiales'));
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
					material.cantidad_seleccion += cantidad;
					material.cantidad_sin_seleccion -= cantidad;
					if (material.cantidad_sin_seleccion === 0 ){
						material.mostrar_sin_seleccion = false;
					}
					if(material.cantidad_seleccion > 0 ){
						material.mostrar_seleccion = true;
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
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(materiales,function(i,material){
				if(codigo === material.codigo){
					material.cantidad_seleccion = 0 ;
					material.cantidad_sin_seleccion = material.cantidad;
					material.mostrar_seleccion = false;
					material.mostrar_sin_seleccion = true;
				}
			});
		});
		this.set('movimiento.materiales',materiales);
	},
	buscar(){
		var method = "GET";
		var url;
		var tipo_mov = this.get('tipo_mov');
		if(tipo_mov === 'ni'){
			url = window.serverUrl + '/almacen/movimiento/ingreso/'+ this.get('movimiento.ingreso.rif_prove') +'/';
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
			url = window.serverUrl + '/almacen/movimiento/egreso/'+ this.get('movimiento.egreso.codigo_sol') +'/';
			this.getElements(method,url,this.setInfoMovimiento,this);
		}
		//this.getElements(method,url,this.setInfoMovimiento,this);
	},
	procesarMovimiento(){
		var method = "POST";
		var url;
		var data={};

		data.fecha = moment().format("YYYY-MM-DD");
		data.ci_almacenista = Cookies.getJSON('current').ci;

		var tipo_mov = this.get('tipo_mov');
		if(tipo_mov === 'ni'){
			data.tipo="Ingreso";
			url = window.serverUrl + '/almacen/movimiento/ingreso/'+ this.get('movimiento.ingreso.rif_prove') +'/';
		}else if(tipo_mov === 're'){
			data.tipo="Retorno";
			data.ci_tecnico = $("#select_tecnico").val();
			data.codigo_eta = $("#select_etapa").val();
			data.codigo_pro = this.get('movimiento.retorno.codigo_pro');
			data.materiales = [];
			data.completado = true;
			$.each(this.get('movimiento.materiales').toArray(),function(i,material){
				if (material.mostrar_seleccion==true){
					var aux = {}
					aux.codigo = material.codigo;
					aux.cantidad = material.cantidad_seleccion;
					data.materiales.push(aux);
				}
			});
 			url = window.serverUrl + '/almacen/movimiento/retorno/'+ this.get('movimiento.retorno.codigo_pro') +'/';
			this.validarRetorno();
			if ($("#formulario_re").valid()){
        		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        	}
		}else if(tipo_mov === 'eg'){
			data.tipo="Egreso";
			url = window.serverUrl + '/almacen/movimiento/egreso/'+ this.get('movimiento.egreso.codigo_sol') +'/';
		}
		console.log(data);
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
