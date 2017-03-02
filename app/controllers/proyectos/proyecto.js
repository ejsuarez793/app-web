import Ember from 'ember';

export default Ember.Controller.extend({
	ecs: [],
	sss: [],
	mss: [],
	presupuesto: {

	},
	editing:false,
	accion:'Iniciar Proyecto',
	pg:{},
	pe:{},
	msg: {},
	editing_pe:false,
	reporte_detalle: '',
	disponibilidad_material: {},//usado para chequear la disponibilidad de materiales en la solicitud y luego para poder aprobar

	//prueba: {}, //usado en la prueba de crear solicidut borrar despues
	//solicitud_material_prueba: [],

	presupuesto_agregar_servicio:false,
	presupuesto_agregar_material:false,

	proyecto_activo:false, //se utiliza para mostrar el boton de generar acta de inicio y de estado del proyecto
 	//3 arreglos usados para generar el listado de materiales usados (total y por etapas) y disponibles
	materiales_disponibles : [],
	materiales_usados_etapas: [],
	materiales_usados_totales:[],


	sin_actividades:false,//variable para saber si hay que definir actividades en una etapa o solo imprimirlas
	na:{
		nro:'',
		desc:'',
	},//variable para definir una nueva actividad na = nueva actividad
	nuevas_actividades: [], //arreglo para almacenar las nuevas actividades definidas antes de  guardarlas en el servidor

	init(){
		this._super();
		if (this.get('codigo')!==null && this.get('codigo')!==undefined){
			if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
				this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
			} 
			var method = "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('codigo') + '/';
		    this.getElements(method,url,this.setProyecto,this);

		    url = window.serverUrl + '/proyecto/' + this.get('codigo') + '/tecnico/';
		    this.getElements(method,url,this.setTecnicos,this);

		    url = window.serverUrl + '/almacen/material/';
		    this.getElements(method,url,this.setMateriales,this);

		    url = window.serverUrl + '/coordinador/servicio/';
		    this.getElements(method,url,this.setServicios,this);

		    this.set('presupuesto.fecha',moment().format("DD/MM/YYYY"));//esta no es tan necesaria, ya que para mostrar esta fecha_f
		    this.set('presupuesto.fecha_m',moment().format("LL"));

		    
		}
		$("#link_proyectos").addClass('active');
	},
	validarPG(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod("mayorQue", function (value, element, params) {
				return new Date(value) >= new Date($(params).val());
		});

		$("#formulario_pg").validate({
			rules:{
				nombre:{
					required:true,
					maxlength:100,
				},
				desc:{
					required:true,
					maxlength:500,
				},
				ubicacion:{
					maxlength:150,
				},
				f_est:{
					required:true,
					date:true,
					mayorQue:"#f_hoy_pg",
				},
			},
			messages:{
				nombre:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
				},
				desc:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 500 caracteres.',
				},
				ubicacion:{
					maxlength:'Longitud máxima de 150 caracteres.',
				},
				f_est:{
					required:'Este campo es requerido.',
					date:'Ingrese una fecha válida.',
					mayorQue: 'La fecha estimada debe ser mayor o igual que la actual.'
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
	validarPE(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod("mayorQue", function (value, element, params) {
				return new Date(value) >= new Date($(params).val());
		});

		$("#formulario_pe").validate({
			rules:{
				nombre:{
					required:true,
					maxlength:100,
				},
				f_est:{
					required:true,
					date:true,
					mayorQue:'#f_hoy',
				},
			},
			messages:{
				nombre:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
				},
				f_est:{
					required:'Este campo es requerido.',
					date:'Ingrese una fecha válida.',
					mayorQue: 'La fecha estimada debe ser mayor o igual que la actual.'
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
	validarNuevasActividades(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$("#formulario_na").validate({
			rules:{
				desc:{
					required:true,
					maxlength:200,
				},
			},
			messages:{
				desc:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 200 caracteres.',
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
			//console.log(response);
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
	setProyecto(proyecto,context){
		//console.log(proyecto);
		var _this = context;
		var no_definida = "(Fecha no definida)";
		proyecto.f_inicio = no_definida;
		proyecto.f_estimada = no_definida;
		proyecto.t_faltante = no_definida;
		proyecto.f_finalizada = "";

		if (proyecto.f_ini !==null && proyecto.f_ini!==undefined){
			proyecto.f_inicio = moment(proyecto.f_ini).format('LL');
		}
		if (proyecto.f_est !==null && proyecto.f_est !== undefined){
			proyecto.f_estimada = moment(proyecto.f_est).format('LL');
			proyecto.t_faltante = moment(proyecto.f_est, "YYYY-MM-DD").fromNow();
		}
		if (proyecto.f_fin !==null && proyecto.f_fin !== undefined){
			proyecto.f_finalizada = moment(proyecto.f_fin).format('LL');
		}

		if (proyecto.estatus === "Preventa"){
			proyecto.accion = "Proyecto Preventa";
			$("#accion").prop('disabled',true);
		}else if(proyecto.estatus === "Aprobado"){
			
			proyecto.accion = "Iniciar Proyecto";
		}else if(proyecto.estatus === "Ejecucion"){
			_this.set('proyecto_activo',true);
			proyecto.accion = "Culminar";
		}else if(proyecto.estatus === "Culminado"){
			_this.set('proyecto_activo',true);
			proyecto.accion = "Acta Culminacion";
		}else if(proyecto.estatus === "Rechazado"){
			proyecto.accion = "Proyecto Rechazado";
			$("#accion").prop('disabled',true);
		}
		$.each(proyecto.etapas,function(i,etapa){
			etapa.f_est_mostrar = moment(etapa.f_est).format('L');
			if(etapa.estatus==="Pendiente"){
				etapa.accion="Iniciar";
			}else if(etapa.estatus ==="Ejecucion"){
				etapa.accion="Culminar";
			}else if (etapa.estatus ==="Culminado"){
				etapa.accion = "Acta Entrega";
			}
		});

		$.each(proyecto.solicitudes,function(i,solicitud){
			solicitud.f_sol_mostrar = moment(solicitud.f_sol).format('L');
		});

		$.each(proyecto.presupuestos,function(i,presupuesto){
			presupuesto.fecha_m =  moment(presupuesto.fecha).format('LL');
			presupuesto.fecha_mostrar = moment(presupuesto.fecha).format('L');
		});
		_this.set('proyecto',proyecto);
		//console.log(proyecto);
		var method = "GET";
		var url = window.serverUrl + '/proyecto/' + _this.get('proyecto.codigo') + '/materiales/' ;
		_this.getElements(method,url,_this.setDesglose,_this);
		_this.prepararProgreso();

	},
	prepararProgreso(){
		//var aux = ['progress-bar-success','progress-bar-success','progress-bar-info','progress-bar-info','progress-bar-warning','progress-bar-warning','progress-bar-warning','progress-bar-danger','progress-bar-danger','progress-bar-danger'];

		var etapas = this.get('proyecto.etapas').toArray();
		var tCulminadas=0;
		$.each(etapas,function(i,etapa){
			if(etapa.estatus==="Culminado"){
				tCulminadas++;
			}
		});
		var pwidth = tCulminadas * 100 / (etapas.length);
		//var pclass = aux[1];
		pwidth = Math.round( pwidth );
		this.set('progreso_porcentaje',pwidth);
		$("#progreso").css("width", pwidth+"%");
		//$('#progreso').addClass(pclass);
	},
	setTecnicos(tecnicos,context){
		var _this = context;
		_this.set('tecnicos',tecnicos);
		//console.log(tecnicos);
	},
	setServicios(servicios,context){
		var _this = context;

		if (!Array.isArray(servicios)){
			var aux = [];
			aux.push(servicios);
			servicios = aux;
		}	
		_this.set('servicios',servicios);
	},
	setMateriales(materiales,context){
		var _this = context;

		if (!Array.isArray(materiales)){
			var aux = [];
			aux.push(materiales);
			materiales = aux;
		}	
		_this.set('materiales',materiales);
	},
	setDesglose(desglose,context){
		context.set('desglose',desglose);
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
	ordenarPor(property,presupuestos){
		var asc = null;
		var th;
		var elemento;
		if (presupuestos){//si estamos ordenando todos los presupuestos.
			elemento = "proyecto.presupuestos";
			th = '#th-'+property;
		}else{ //sino estamos ordenando los renglones de un presupuesto, es decir sus materiales y servicios.
			elemento = "ecs";
			th = '#th-'+property +'1';
		}
		if ($(th).hasClass('glyphicon-chevron-down')){
			asc = true;
			$(th).removeClass('glyphicon-chevron-down');
			$(th).addClass('glyphicon-chevron-up');
		}else{
			asc = false;
			$(th).removeClass('glyphicon-chevron-up');
			$(th).addClass('glyphicon-chevron-down');
		}
	
		var aux = this.ordenar(property,asc,this.get(elemento).toArray());
		this.set(elemento,aux);
	},
	accionProyecto(){
		var method = "PATCH";
		var url;
		var data = {};
		var proyecto = this.get('proyecto');
		var estatus = this.get('proyecto.estatus');
		url = window.serverUrl + '/proyecto/' + proyecto.codigo + '/';
		data = $.extend(true,{},proyecto);

		if (proyecto.accion === "Acta Culminacion"){
			this.prepararActaCulminacion();
		}else{
			if(estatus === "Aprobado"){
				data.f_ini = moment().format("YYYY-MM-DD");
				data.estatus = "Ejecucion";
				data.accion = "Iniciar";
				this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			}else if(estatus=== "Ejecucion"){
				data.f_fin = moment().format("YYYY-MM-DD");
				data.estatus = "Culminado";
				data.accion = "Culminar";
				//console.log("ejecucion");
				this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			}else{
				this.msgRespuesta("Error: ","El estado del proyecto no permite realizar esa acción",-1,this);
			}
		}		
	},
	accionEtapa(etapa){
		//console.log(etapa);
		this.set('etapa',etapa);
		if (etapa.accion === "Acta Entrega"){
			//console.log("implementar acta de entrega");
			$("#myModalActaEntrega").modal('show');
			this.prepararActaEntrega(etapa);
		}else{
			var method = "PATCH";
			var url;
			var data = {};
			var estatus = etapa.estatus;
			url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/etapa/' + etapa.codigo + '/';
			data = $.extend(true,{},etapa);
			if(estatus === "Pendiente"){
				data.f_ini = moment().format("YYYY-MM-DD");
				data.estatus = "Ejecucion";
				data.accion = "Iniciar";
			}else if(estatus=== "Ejecucion"){
				data.f_fin = moment().format("YYYY-MM-DD");
				data.estatus = "Culminado";
				data.accion = "Culminar";
			}else{
				this.msgRespuesta("Error: ","El estado de la etapa no permite realizar esa acción",-1,this);
			}
			//console.log(data);
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	},
	prepararActaEntrega(etapa){
		if (etapa.estatus==="Culminado"){
			var acta_entrega = {};
		var elementos = [];
		var actividades = [];
		//var fecha;
		var proyecto = this.get('proyecto');
		var etapas = this.get('desglose.etapas').toArray();
		var aux;

		//console.log(proyecto);
		//console.log(etapa);
		//console.log(materiales_etapas);
		acta_entrega.codigo_pro = proyecto.codigo;
		acta_entrega.nombre_pro = proyecto.nombre;
		acta_entrega.codigo_eta = etapa.letra;
		acta_entrega.nombre_eta = etapa.nombre;
		acta_entrega.nombre_cliente = proyecto.cliente.nombre;
		acta_entrega.rif_c = proyecto.cliente.rif;
		acta_entrega.fecha = moment(etapa.f_fin).format('LL');

		$.each(etapa.actividades,function(i,actividad){
			aux = {};
			aux.nro  =actividad.nro;
			aux.desc = actividad.desc;
			actividades.push($.extend(true,{},aux));
		});

		$.each(etapa.reportes,function(i,reporte){
			$.each(reporte.servicios,function(i,servicio){
				aux = {};
				aux.codigo = servicio.codigo;
				aux.desc = servicio.desc;
				aux.cantidad = servicio.cantidad;
				elementos.push($.extend(true,{},aux));
			});
		});

		//console.log(etapa);
		$.each(etapas,function(i,eta){
			if (eta.codigo_eta === etapa.codigo){
				$.each(eta.materiales,function(i,material){
					aux = {};
					aux.codigo = material.codigo;
					aux.desc = material.nombre + " " + material.desc + " " +material.marca;
					//console.log(material);
					aux.cantidad = material.cantidad;
					elementos.push($.extend(true,{},aux));
				});
			}
		});

		acta_entrega.actividades = actividades;
		acta_entrega.elementos = elementos;

		this.set('acta_entrega',acta_entrega);
		}else{
			this.msgRespuesta("Error: ","La etapa no ha culmiado, no se puede generar su acta de entrega.",-1,this);
		}
		

	},
	prepararActaCulminacion(){
		var acta_culminacion = {};
		var proyecto = this.get('proyecto');
		var fecha = new Date();
		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

		acta_culminacion.nombre_cliente = proyecto.cliente.nombre;
		acta_culminacion.rif_cliente = proyecto.cliente.rif;
		acta_culminacion.nombre_pro = proyecto.nombre;
		acta_culminacion.codigo_pro = proyecto.codigo;
		acta_culminacion.desc_pro = proyecto.desc;
		acta_culminacion.f_ini = moment(proyecto.f_ini).format("LL");
		acta_culminacion.f_fin = moment(proyecto.f_fin).format("LL");
		acta_culminacion.dias = fecha.getDate();
		acta_culminacion.mes =  nombre_meses[fecha.getMonth()];
		acta_culminacion.anio = fecha.getFullYear();

		this.set('acta_culminacion',acta_culminacion);
		$("#myModalActaCulminacion").modal('show');
	},
	/*funcion que prepara el contenido del modal de presupuesto, de acuerdo a si es una nueva solicitud o
	es un presupuesto que se esta editanto*/
	openModalPresupuesto(editing,presupuesto){
		var proyecto = this.get('proyecto');
		var cont = 0;
		var arrayLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //array de letras para colocar al final del nuevo presupuesto
		var nuevo_p ={
			codigo:'',
			codigo_pro:'',
			fecha: moment().format("YYYY-MM-DD"),
			fecha_mostrar:moment().format("LL"),
			validez_o: 0,
			descuento: 0,
			observ: '.',
			desc: '',
			atencion_n: '',
			atencion_e: '',
			materiales: [],
			servicios:[],
			cond_g:'',/*'Del fabricante.-',*/
			cond_p: '',/*'Precio sujeto a cambios sin previo aviso, dependerá de la alta rotación de inventario y disponibilidad.-\nEstos precios no incluyen transporte fuera del área metropolitana de Caracas.-\nEstos precios incluyen el Impuesto al Valor Agregado (IVA).-\n',*/
			cond_pago:'',
			t_ent: '',/*'Previa planificación con el cliente final.-',*/
		};
		//console.log(presupuesto);
		if (!editing){
			this.set('editing',false);
			var cod_presupuestos = [];
			$.each(proyecto.presupuestos, function(i,presupuesto){
				cont++;
				cod_presupuestos.push(presupuesto.codigo);
			});
			if (cont < 26){
				var np_cod = 'P'+arrayLetras[cont]+'-'+proyecto.codigo;
				while ($.inArray(np_cod, cod_presupuestos) !== -1){//verificamos que no se encuentre ya en los arreglos de codigos
					np_cod = 'P'+arrayLetras[cont]+'-'+proyecto.codigo;
					cont++;
				}
				nuevo_p.codigo =np_cod;
				this.set('presupuesto',nuevo_p);

				var servicios = $.extend(true,[],this.get('servicios').toArray());
				var materiales = $.extend(true,[],this.get('materiales').toArray());
				//console.log(materiales);
				//var elementos = [];
				$.each(servicios,function(i,elemento){
					/*elemento['cantidad_seleccion'] = 0;
					elemento['cantidad_sin_seleccion'] = Number.MAX_VALUE;*/
					elemento['mostrar_seleccion'] = false;
					elemento['mostrar_sin_seleccion'] = true;
					elemento['tipo'] = "Servicio";
					elemento['cantidad'] = 0;
					//elementos.push($.extend(true,{},elemento));
				});

				$.each(materiales,function(i,elemento){
					/*elemento['cantidad_seleccion'] = 0;
					elemento['cantidad_sin_seleccion'] = elemento['cantidad'];*/
					elemento['desc_mostrar'] = elemento['nombre'] + " " + elemento['desc'] +" "+ elemento['marca'];
					
					elemento['mostrar_seleccion'] = false;
					elemento['mostrar_sin_seleccion'] = true;
					elemento['cantidad'] = 0;
					elemento['tipo'] = "Material"
					//elementos.push($.extend(true,{},elemento)); 
				});
				//console.log(this.get('materiales'));
				//this.set('ecs',[]);
				this.set('servicios',servicios);
				this.set('materiales',materiales);
				//this.set('elementos',elementos);
			}else{
				this.msgRespuesta("Error","El proyecto tiene mas de 26 presupuestos no se puede crear más",-1,this);
			}
		}else{
			this.set('editing',true);
			presupuesto = $.extend(true, {}, presupuesto);
			presupuesto.fecha_mostrar = moment(presupuesto.fecha).format("LL");
			var _this = this;
			var presupuesto_servicios =presupuesto.servicios;
			var presupuesto_materiales = presupuesto.materiales;
			var servicios = $.extend(true,[],this.get('servicios').toArray());
			var materiales = $.extend(true,[],this.get('materiales').toArray());
			var flag = false;
			$.each(servicios,function(i,elemento){
				flag = false;
				$.each(presupuesto_servicios,function(i,ps){
					if (elemento.codigo === ps.codigo_ser){
						elemento['mostrar_seleccion'] = true;
						elemento['mostrar_sin_seleccion'] = false;
						elemento['tipo'] = "Servicio";
						elemento['cantidad'] = ps.cantidad;
						elemento['precio_act'] = ps.precio_venta;
						flag = true;
						//console.log(elemento.codigo);
					}
				});
				if (flag === false){
					elemento['mostrar_seleccion'] = false;
					elemento['mostrar_sin_seleccion'] = true;
					elemento['tipo'] = "Servicio";
					elemento['cantidad'] = 0;
				}
			});

			$.each(materiales,function(i,elemento){
				flag = false;
				$.each(presupuesto_materiales,function(i,pm){
					if (elemento.codigo === pm.codigo_mat){
						elemento['mostrar_seleccion'] = true;
						elemento['desc_mostrar'] = elemento['nombre'] + " " + elemento['desc'] +" "+ elemento['marca'] + " (" + elemento['presen'] + ")";
						elemento['mostrar_sin_seleccion'] = false;
						elemento['tipo'] = "Material";
						elemento['cantidad'] = pm.cantidad;
						elemento['precio_act'] = pm.precio_venta;
						flag = true;

					}
				});
				if (flag === false){
					elemento['mostrar_seleccion'] = false;
					elemento['desc_mostrar'] = elemento['nombre'] + " " + elemento['desc'] +" "+ elemento['marca'] + " (" + elemento['presen'] + ")";
					elemento['mostrar_sin_seleccion'] = true;
					elemento['tipo'] = "Material";
					elemento['cantidad'] = 0;
				}
			});
			//console.log(materiales);
			this.set('materiales',materiales);
			this.set('servicios',servicios);
			this.set('presupuesto',presupuesto);

			/*console.log(presupuesto);*/
			
			$('#myModalPresupuesto').on('shown.bs.modal', function () {
	  			// cuando se muestra el modal se calcula el precio total de cada elemento y el monto total
	  			//ya que depende de que se renderize los td de la tabla
	  			$.each(_this.get('materiales').toArray(),function(i,elemento){
					_this.calcularPrecioTotal(elemento.codigo);
				});
				$.each(_this.get('servicios').toArray(),function(i,elemento){
					_this.calcularPrecioTotal(elemento.codigo);
				});
	  			_this.calcularMontoTotal();
	  			
			});
			
		}
		$("#myModalPresupuesto").modal('show');
		//this.calcularMontoTotal();

	},
	openModalSolicitud(solicitud){
		console.log(solicitud);
		this.set('solicitud',solicitud);
		$("#myModalSolicitudes").modal('show');
		var method = "GET";
		var url = window.serverUrl +'/almacen/disponibilidad/' +solicitud.codigo+'/';
		this.getElements(method,url,this.msgDisponibilidadMaterial,this);
		//console.log("abriendo");
	},
	msgDisponibilidadMaterial(response,context){
		//console.log(response);
		/*if (response.tipo === "Sin Disponibilidad"){
			response.sin_disponibilidad = true;
		}*/
		context.set('disponibilidad_material',response);
	},
	aprobarSolicitud(solicitud){
		//console.log(solicitud);
		var disp = this.get('disponibilidad_material');

		if(disp.disponible === true){
			var codigo_pro = this.get('proyecto.codigo');
			var method = "POST";
			var url = window.serverUrl +'/proyecto/'+codigo_pro+'/solicitud/' +solicitud.codigo+'/aprobar/';
			var data = this.get('disponibilidad_material.disponible');
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}else{
			this.msgRespuesta("Error: ", "No se puede aprobar la solicitud, ya que no hay disponibilidad de material o existe disponibilidad limitada.",-1,this);
		}
		$("#myModalSolicitudes").modal('hide');
	},
	/*
		agregarElementosPresupuesto: funcion que permite agregar los materiales o servicios que fueron seleccionados y los incorpora
		a elementos con seleccion 'ecs' y los elimina de servicios sin seleccion o materiales sin seleccion segun
		sea el caso
	*/
	agregarElementosPresupuesto(){
		var checkbox = "#myModalPresupuestoAgregarMS input:checked";
		var modal = "#myModalPresupuestoAgregarMS";
		var elementos; //pendiente
		var tipo_e;
		var codigo;
		if (this.get('presupuesto_agregar_material') === true){
			elementos = $.extend(true,[],this.get('materiales').toArray());
		}else if (this.get('presupuesto_agregar_servicio') === true){
			elementos = $.extend(true,[],this.get('servicios').toArray());
		}
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(elementos,function(i,elemento){
				if(codigo === elemento.codigo){
					elemento.mostrar_sin_seleccion = false;
					elemento.mostrar_seleccion = true;
					elemento.precio_venta = elemento.precio_act;

				}
			});
			//console.log(codigo + ": "+ $(input_cantidad+codigo).val());
		});
		if (this.get('presupuesto_agregar_material') === true){
			this.set('materiales',elementos);
		}else if (this.get('presupuesto_agregar_servicio') === true){
			this.set('servicios',elementos);
		}
		$(modal).modal('hide');
	},

	/*
		eliminarElementosPresupuesto: cuando el usuario selecciona del presupuesto elementos, y clickea el boton de eliminar seleccionados
		esta función es llamada. Se encarga de eliminarlos de los elementos con selección 'ecs' y de añadirlos a su respectivo
		arreglo de sin selección segun el tipo de elemento.
	*/
	eliminarElementosPresupuesto(){
		var checkbox = '#myModalPresupuesto input:checked';
		var elementos; //pendiente
		var tipo_e;
		var codigo;
		var	materiales = $.extend(true,[],this.get('materiales').toArray());
		var	servicios = $.extend(true,[],this.get('servicios').toArray());
		
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(materiales,function(i,material){
				if(codigo === material.codigo){
					material.mostrar_sin_seleccion = true;
					material.mostrar_seleccion = false;

				}
			});

			$.each(servicios,function(i,servicio){
				if(codigo === servicio.codigo){
					servicio.mostrar_sin_seleccion = true;
					servicio.mostrar_seleccion = false;

				}
			});

			//console.log(codigo + ": "+ $(input_cantidad+codigo).val());
		});
		this.set('materiales',materiales);
		this.set('servicios',servicios);

	},


	/*
		openModalPresupuestoAgregarMS: prepara el modal donde aparecen los materiales o servicios que se pueden agregar al presupuesto
		los cuales son todos aquellos elementos (materiales o servicios) que no se encuentran ya incluidos en el presupuesto.
	*/
	openModalPresupuestoAgregarMS(tipo_e){
		//var elementos;
		if (tipo_e === "material"){
			this.set('presupuesto_agregar_material',true);
			this.set('presupuesto_agregar_servicio',false);
			//elementos = $.extend(true,[],this.get('materiales').toArray());
		}else if(tipo_e === "servicio"){
			this.set('presupuesto_agregar_servicio',true);
			this.set('presupuesto_agregar_material',false);
			//elementos = $.extend(true,[],this.get('servicios').toArray());
		}
		//this.set('elementos',elementos);
		//console.log(this.get('elementos'));
		
		$("#myModalPresupuestoAgregarMS").modal('show');
	},
	
	
	/*
		calcularPrecioTotal: calcula la columna de precio total, se una fila del presupuesto, se le pasa el código del elemento
		para que pueda referenciar a los td input correspondientes.
	*/
	calcularPrecioTotal(codigo){
		var cant = "#cantidad_"+codigo;
		var pu = "#pu_"+codigo;
		var pt = "#pt_"+codigo;
		var cantidad;
		//var ecs = this.get('ecs').toArray();
		//console.log($(cant).val() + " * " + $(pu).val());
		//console.log("hola");
		var precio_total =$(cant).val() * $(pu).val();
		$(pt).text(precio_total);

		var materiales = $.extend(true, [], this.get('materiales').toArray());
		var servicios = $.extend(true, [], this.get('servicios').toArray());
		
		$.each(servicios.toArray(),function(i,elemento){
			//console.log(elemento);
			if (elemento.codigo === codigo && elemento.mostrar_seleccion===true){
				//console.log(elemento.cantidad);
				//console.log(elemento.precio_venta)
				cantidad = parseInt($(cant).val());
				elemento.cantidad = cantidad;
				elemento.precio_venta = parseFloat($(pu).val());
				elemento.precio_act = elemento.precio_venta;
				elemento.precio_total = elemento.cantidad * elemento.precio_venta;
				elemento.precio_total_mostrar =  numeral(elemento.precio_total).format('0,0.00');
			}
		});

		$.each(materiales.toArray(),function(i,elemento){
			//console.log(elemento);
			if (elemento.codigo === codigo && elemento.mostrar_seleccion===true){
				elemento.cantidad =  parseInt($(cant).val());
				elemento.precio_venta =  parseFloat($(pu).val());
				elemento.precio_act = elemento.precio_venta;
				elemento.precio_total = elemento.cantidad * elemento.precio_venta;
				elemento.precio_total_mostrar = numeral(elemento.precio_total).format('0,0.00');
			}
		});

		this.set('materiales',materiales);
		this.set('servicios',servicios);
		this.calcularMontoTotal();
	},
	/*
		calcularMontoTotal: calcula la sección del presupuesto que incluye el subtotal, descuento, iva, y el total final.
	*/
	calcularMontoTotal(){
		var subtotal1; //= parseFloat($("#subtotal1").text())*/;
		var descuento; //= parseFloat($("#descuento").text())*/;
		var subtotalfinal; /*= parseFloat($("#subtotalfinal").text())*/
		var iva; /*= parseFloat($("#iva").text())*/
		var total; /*= parseFloat($("#total").text())*/
		var cont = 0.0;
		var pt = 0.0;

		var materiales = $.extend(true, [], this.get('materiales').toArray());
		var servicios = $.extend(true, [], this.get('servicios').toArray());

		var codigos = [];
		//agregamos los codigos a un arreglo donde le agregamos "pt_" al inicio, para poder referenciar
		//la td en el precio total
		$.each(materiales,function(i,elemento){
			if (elemento.mostrar_seleccion===true){
				codigos.push("pt_"+elemento.codigo);
			}
		});
		$.each(servicios,function(i,elemento){
			if (elemento.mostrar_seleccion===true){
				codigos.push("pt_"+elemento.codigo);
			}
		});

		$("td[name='precio_total']").each(function(){
			if($.inArray($(this).attr('id'), codigos) !== -1){
				pt = parseFloat(numeral($(this).text()).value());
				//console.log(numeral($(this).text()).value() );
				if (!isNaN(pt)){
					cont += pt;
				}
			}
		});

		subtotal1 = cont;
		descuento = cont *(parseFloat(this.get('presupuesto.descuento') / 100));
		subtotalfinal =subtotal1 - descuento;
		iva = subtotalfinal * (0.12);
		total = subtotalfinal + iva;

		$("#subtotal1").text( numeral(subtotal1).format('0,0.00') );
		$("#descuento").text(numeral(descuento).format('0,0.00'));
		$("#subtotalfinal").text(numeral(subtotalfinal).format('0,0.00'));
		$("#iva").text(numeral(iva).format('0,0.00'));
		$("#total").text(numeral(total).format('0,0.00'));

	},
	/*
		prepararPresupuesto: cuando el presupuesto va a ser guardado en el servidor, se debe preparar los datos antes de ser
		enviados, esta función realiza la preparacion de datos, sobre todo de materiales y servicios asociados.
	*/
	prepararPresupuesto(){
		var presupuesto = this.get('presupuesto');
		var proyecto = this.get('proyecto');
		var materiales = this.get('materiales').toArray();
		var servicios = this.get('servicios').toArray();
		var aux = {
			codigo: '',
			cantidad: '',
			precio_venta: '',
		};

		presupuesto.codigo_pro = proyecto.codigo;
		presupuesto.fecha = moment().format("YYYY-MM-DD");
		presupuesto.servicios = [];
		presupuesto.materiales = [];
		$.each(servicios,function(i,elemento){
			if (elemento.mostrar_seleccion){
				aux.codigo = elemento.codigo;
				aux.cantidad = elemento.cantidad;
				aux.precio_venta = elemento.precio_venta;
				presupuesto.servicios.push($.extend(true, {}, aux));
			}
		});

		$.each(materiales,function(i,elemento){
			if (elemento.mostrar_seleccion){
				aux.codigo = elemento.codigo;
				aux.cantidad = elemento.cantidad;
				aux.precio_venta = elemento.precio_venta;
				presupuesto.materiales.push($.extend(true, {}, aux));
			}
		});

		this.set('presupuesto',presupuesto);
	},
	/*
		procesarPresupuesto: procesa la llamada al servidor para salvar el presupuesto.
	*/
	procesarPresupuesto(){
		var method;
		var url;
		var data;

		this.prepararPresupuesto();
		if (this.get('editing')===true){
			method = "PATCH";
			url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo')+'/presupuesto/'+this.get('presupuesto.codigo')+'/';
		}else{
			method = "POST";
			url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo')+'/presupuesto/';
		}
		data = this.get('presupuesto');
		if(data.estatus === "Aprobado" || data.estatus === "Cerrado"){
			this.msgRespuesta("Error: ","Presupuesto ya aprobado o cerrado, no se puede editar.",-1,this);
		}else{
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			this.init();
		}
		$("#myModalPresupuesto").modal('hide');
	},
	openModalActaInicio(){
		var acta_inicio ={};
		var proyecto = this.get('proyecto');
		var fecha = new Date();
		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

		acta_inicio.nombre_cliente = proyecto.cliente.nombre;
		acta_inicio.rif_cliente = proyecto.cliente.rif;
		acta_inicio.nombre_pro = proyecto.nombre;
		acta_inicio.codigo_pro = proyecto.codigo;
		acta_inicio.desc_pro = proyecto.desc;
		acta_inicio.f_ini = moment(proyecto.f_ini).format("LL");
		//acta_inicio.f_fin = moment(proyecto.f_fin).format("LL");
		acta_inicio.dias = fecha.getDate();
		acta_inicio.mes =  nombre_meses[fecha.getMonth()];
		acta_inicio.anio = fecha.getFullYear();
		acta_inicio.codigo_presupuesto = proyecto.presupuestos[0].codigo;

		this.set('acta_inicio',acta_inicio);
		$("#myModalActaInicio").modal('show');
	},
	openModalActaEstado(){
		//console.log("epaleeee");
		this.prepararActaEstado();
		$("#myModalActaEstado").modal('show');
	},
	prepararActaEstado(){
		var acta_estado = {};
		var proyecto = this.get('proyecto');
		var fecha = new Date();
		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
		var aux;
		var aux2;

		acta_estado.nombre_cliente = proyecto.cliente.nombre;
		acta_estado.rif_cliente = proyecto.cliente.rif;
		acta_estado.nombre_pro = proyecto.nombre;
		acta_estado.codigo_pro = proyecto.codigo;
		acta_estado.desc_pro = proyecto.desc;
		acta_estado.f_ini = moment(proyecto.f_ini).format("LL");
		//acta_inicio.f_fin = moment(proyecto.f_fin).format("LL");
		acta_estado.dias = fecha.getDate();
		acta_estado.mes =  nombre_meses[fecha.getMonth()];
		acta_estado.anio = fecha.getFullYear();

		acta_estado.etapas = [];

		$.each(proyecto.etapas.toArray(),function(i,etapa){
			aux = {};
			aux['letra_eta'] = etapa.letra;
			aux['nombre_eta'] = etapa.nombre;

			if (etapa.estatus == "Culminado"){
				aux['estatus'] = "Culminada";
			}else if(etapa.estatus === "Ejecucion"){
				aux['estatus'] = "En Ejecución";
			}else{
				aux['estatus'] = etapa.estatus;
			}

			aux['actividades'] = [];
			$.each(etapa.actividades,function(i, actividad){
				aux2 = {};
				aux2.nro = actividad.nro;
				aux2.desc = actividad.desc;
				aux2.completada = actividad.completada;
				aux['actividades'].push($.extend(true,{},aux2));
			});

			acta_estado.etapas.push($.extend(true,{},aux));
		});

		/*console.log(acta_estado.etapas);*/
		this.set('acta_estado',acta_estado);

	},
	openModalGeneral(){
		this.set('pg.nombre',this.get('proyecto.nombre'));
		this.set('pg.desc',this.get('proyecto.desc'));
		this.set('pg.ubicacion',this.get('proyecto.ubicacion'));
		this.set('pg.f_est',this.get('proyecto.f_est'));

		$("#myModalGeneral").modal('show');
	},
	openModalTecnicos(){
		$("#myModalTecnicos").modal('show');
	},
	openModalEtapa(etapa,editing){
		if(!editing){
			var arrayLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //array de letras para identificar la nueva etapa
			var cont = 0;
			$.each(this.get('proyecto.etapas').toArray(),function(/*i,etapa*/){
				cont++;
			});
			this.set('pe',{});
			this.set('pe.letra',arrayLetras[cont]);
			this.set('pe.codigo_pro',this.get('proyecto.codigo'));
		}else{
			this.set('pe',etapa);
		}
		this.set('editing_pe',editing);
		$("#myModalEtapa").modal('show');
	},
	openModalReporteDetalle(etapa){
		this.set('reporte_detalle',etapa.reporte_detalle);
		//console.log("implementar modal reporte detalle");
		$("#myModalReporteDetalle").modal('show');
	},
	openModalReportes(etapa){
		//console.log(etapa.reportes);
		var aux = $.extend(true,{},etapa);
		$.each(aux.reportes,function(i,reporte){
			reporte.fecha_mostrar = moment(reporte.fecha).format('L');
			if (reporte.leido){
				reporte.estado = "";
			}else{
				reporte.estado = "Nuevo!";
			}
		});
		this.set('etapa',aux);
		//console.log(aux.reportes);
		$("#myModalReportes").modal('show');
	},
	openModalActividades:function(etapa){
		//console.log(etapa);
		this.set('etapa',etapa);
		if (etapa.actividades===null || etapa.actividades===undefined || etapa.actividades.length === 0){
			this.set('sin_actividades',true);
			var nuevas_actividades = this.get('nuevas_actividades');
			this.set('na.nro',nuevas_actividades.length + 1);
		}else{
			this.set('sin_actividades',false);
		}
		$("#myModalActividades").modal('show');
	},
	guardarProyectoGeneral(){
		var method;
		var url;
		var data = {};
		method = "PATCH";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/';
		$.extend(true,data,this.get('pg'));
		data.estatus = this.get('proyecto.estatus');
		data.f_ini = this.get('proyecto.f_ini');
		//data.f_est = this.get('proyecto.f_est');
		data.f_fin = this.get('proyecto.f_fin');
		data.accion = "Editar";
		$("#f_hoy_pg").val(moment().format("YYYY-MM-DD"));
		this.validarPG();
        if ($("#formulario_pg").valid()){
        	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        	$("#myModalGeneral").modal('hide');
        }

	},
	guardarEtapa(){
		var method;
		var url;
		var data = {};
		$.extend(true,data,this.get('pe'));
		$("#f_hoy").val(moment().format("YYYY-MM-DD"));
		if (this.get('editing_pe')){
			method = "PATCH";
			data.accion = "Editar";
			url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/' +data.codigo+'/';
		}else{
			method = "POST";
			data.accion = "Crear";
			url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/';
		}
		this.validarPE();
        if ($("#formulario_pe").valid()){
        	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        	$("#myModalEtapa").modal('hide');
        }
       // $("#myModalEtapa").modal('hide');
	},
	guardarReportesLeidos(){
		//var checkbox = '#myModalReportes input:checked';
		var codigo_eta = this.get('etapa.codigo');
		var codigos = [];
		var reportes = this.get('etapa.reportes').toArray();
		
		var data_reportes = [];
		var aux;
		/*$(checkbox).each(function() {
			var codigo = $(this).val();
			codigos.push(codigo);*/
			$.each(reportes,function(i,reporte){
				var checkbox_reporte = "#rep_"+reporte.codigo;
				if ($(checkbox_reporte).is(":checked")){
					aux = {};
					aux['codigo'] = reporte.codigo;
					aux['servicios'] = [];
					$.each(reporte.servicios,function(i,servicio){
						var checkbox = "#"+reporte.codigo+"_"+servicio.codigo;
						if ($(checkbox).is(":checked")){
							aux['servicios'].push(servicio.codigo);
						}
						
					});
					data_reportes.push($.extend(true,{},aux));
				}	
			});
		/*});*/
		console.log(data_reportes);
		var data = data_reportes;
		var method = "PATCH";
		var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') +'/etapa/' +codigo_eta+'/reporte/';
		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		$("#myModalReportes").modal('hide');
	},
	agregarActividad(){
		//console.log("agregar actividad");
		var nuevas_actividades = this.get('nuevas_actividades');

		this.validarNuevasActividades();
        if ($("#formulario_na").valid()){
        	nuevas_actividades.pushObject(this.get('na'));
        }

		this.set('na',{});
		this.set('na.nro',nuevas_actividades.length + 1);
		this.set('na.desc','');

		//console.log(this.get('nuevas_actividades'));
	},
	eliminarActividad(actividad){
		var nuevas_actividades = this.get('nuevas_actividades');
		nuevas_actividades.removeObject(actividad);

		var aux = [];
		$.extend(true,aux,nuevas_actividades);
		$.each(aux,function(i,nueva_actividad){
			nueva_actividad.nro = i + 1;
		});
		this.set('nuevas_actividades',aux);

		this.set('na.nro',nuevas_actividades.length + 1);
	},
	guardarActividades(){
		var method;
		var url;
		var data = [];
		var codigo_eta = this.get('etapa.codigo');
		$.each(this.get('nuevas_actividades').toArray(),function(i,actividad){
			
			actividad.codigo_eta = codigo_eta;
			//console.log(codigo_eta);
		});

		$.extend(true,data,this.get('nuevas_actividades').toArray());
		//console.log(data);
		if (data.length > 0 && this.get('etapa.codigo_rd')!==null){
			method = "POST";
			url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/' +this.get('etapa.codigo')+'/actividad/';
	        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
	        this.init();
		}else if(data.length===0){
			this.msgRespuesta("Error: ","No hay ninguna actividad definida.",-1,this);
		}else if(this.get('etapa.codigo_rd')===null){
			this.msgRespuesta("Error: ","No se pueden definir actividades si no hay un reporte de detalle completado.",-1,this);
		}
        $("#myModalActividades").modal('hide');
	},
	cerrarMsg(){
		$("#alertMsg").hide();
	},
	agregarTecnico(){
		var checkbox = "#tabla_tecnicos_ss input:checked";
		var cedulas_t = [];
		var tecnicos = $.extend(true,[],this.get('tecnicos').toArray());
		$(checkbox).each(function() {
			cedulas_t.push($(this).val());
		});

		$.each(tecnicos,function(i,tecnico){
			if ($.inArray(tecnico.ci,cedulas_t)!==-1){
				tecnico.mostrar_asociado = true;
			}
		});
		this.set('tecnicos',tecnicos);
		$("#myModalTecnicos").modal('hide');
		//console.log("agregar tecnico");
	},
	eliminarTecnicosSeleccionados(){
		var checkbox = "#tabla_tecnicos input:checked";
		var cedulas_t = [];
		var tecnicos = $.extend(true,[],this.get('tecnicos').toArray());
		$(checkbox).each(function() {
			cedulas_t.push($(this).val());
		});

		$.each(tecnicos,function(i,tecnico){
			if ($.inArray(tecnico.ci,cedulas_t)!==-1){
				tecnico.mostrar_asociado = false;
			}
		});
		this.set('tecnicos',tecnicos);

	},
	guardarTecnicos(){
		console.log("guardando...");
		var method;
		var url;
		var data = [];
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/tecnico/';
		var tecnicos = this.get('tecnicos');

		$.each(tecnicos, function(i,tecnico){
			if (tecnico.mostrar_asociado===true){
				data.push(tecnico);
			}
		});
		//$.extend(true,data,this.get('tecnicos'));
        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        this.init();
	},
	/*generarPDFActa(nombre,modal){
		$("#"+modal).css('background', '#fff');
		function canvasSc(element){
			//console.log(element.style);
		  var clone = element.cloneNode(true);
		  var style = clone.style;
		  style.position = 'relative';
		  //style.top = window.innerHeight + 'px';
		  //style.width =element.style.width;//'794 px';
		  //style.height =element.style.height;// '1054 px';
		  //style.width = '600 px';
		  style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var panel = document.getElementById(modal);
		var originalStyle = panel.style; //copiamos el estilo original ya que una vez finalizado la generacion debemos devolverle al panel
								 //su ancho y largo original

		//modificamos el ancho y largo del modal
		panel.style.width = '794px';
		panel.style.height = '1054px';
		//console.log(panel);
		var clone = canvasSc(panel);
		var nombrepdf = nombre;
		//console.log($("#"+tipo).width());
		html2canvas(clone, {
		    onrendered: function(canvas) {
		     document.body.removeChild(clone);
		      var imgData = canvas.toDataURL(
                    'image/jpeg');             
                var doc = new jsPDF('p', 'mm', [210, 297]);
                //var width = doc.internal.pageSize.width;    
				//var height = doc.internal.pageSize.height;
                doc.addImage(imgData, 'jpeg', 0, 0);
                doc.save(nombrepdf);
		    },
		});

		//por ultimo importante, devolvemos el estilo original del panel, para que no afecte en la pagina web
		panel.style = originalStyle;
	},*/
	generarPDFActa(tipo){
		var datosPDF ={};
		var proyecto = this.get('proyecto');
		var etapa = this.get('etapa');
		var acta_entrega = this.get('acta_entrega');
		var fecha = new Date();
		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

		var content = [];
		if (tipo === "Inicio" || tipo === "Estado"){
			datosPDF.cliente_nombre = proyecto.cliente.nombre;
			datosPDF.cliente_rif = proyecto.cliente.rif;
			datosPDF.proyecto_nombre = proyecto.nombre;
			datosPDF.proyecto_codigo = proyecto.codigo;
			datosPDF.proyecto_desc = proyecto.desc;
			datosPDF.proyecto_fecha = moment(proyecto.f_ini).format("LL");
			datosPDF.dias = fecha.getDate();
			datosPDF.mes =  nombre_meses[fecha.getMonth()];
			datosPDF.anio = fecha.getFullYear();
			datosPDF.presupuesto_codigo = proyecto.presupuestos[0].codigo;
			datosPDF.coordinador_nombre = Cookies.getJSON('current').nombre1 + " " + Cookies.getJSON('current').apellido1; 


		}else if(tipo === "Culminacion"){
			datosPDF.cliente_nombre = proyecto.cliente.nombre;
			datosPDF.cliente_rif = proyecto.cliente.rif;
			datosPDF.proyecto_nombre = proyecto.nombre;
			datosPDF.proyecto_codigo = proyecto.codigo;
			datosPDF.proyecto_desc = proyecto.desc;
			datosPDF.proyecto_fecha_inicio = moment(proyecto.f_ini).format("LL");
			datosPDF.proyecto_fecha_fin = moment(proyecto.f_fin).format("LL");
			datosPDF.dias = fecha.getDate();
			datosPDF.mes =  nombre_meses[fecha.getMonth()];
			datosPDF.anio = fecha.getFullYear();
		}else if (tipo === "Entrega"){
			/*console.log("entrega");*/
			datosPDF.cliente_nombre = proyecto.cliente.nombre;
			datosPDF.cliente_rif = proyecto.cliente.rif;
			datosPDF.proyecto_nombre = proyecto.nombre;
			datosPDF.proyecto_codigo = proyecto.codigo;
			datosPDF.dias = fecha.getDate();
			datosPDF.mes =  nombre_meses[fecha.getMonth()];
			datosPDF.anio = fecha.getFullYear();
			datosPDF.etapa_codigo = etapa.letra;
			datosPDF.etapa_nombre = etapa.nombre;
			datosPDF.actividades = acta_entrega.actividades;
			datosPDF.elementos = acta_entrega.elementos;
			/*console.log(datosPDF);*/
		}


		if (tipo === "Inicio"){
			content.push(
				{
					text:'Acta de Inicio',
					style: 'titulo',
				},
				{ 
	           		text: [
	                    { text: 'Entre '},
	                    { text: 'SISTELRED C.A. RIF: J-30994445-2', bold:true},
	                    { text: ' y el cliente '},
	                    { text: datosPDF.cliente_nombre + " RIF: " + datosPDF.cliente_rif, bold:true},
	                    { text: ' se da inicio al proyecto '},
	                    { text: datosPDF.proyecto_nombre, bold:true},
	                    { text: ' registrado bajo el código '},
	                    { text: datosPDF.proyecto_codigo, bold:true},
	                    { text: ' de fecha ' + datosPDF.proyecto_fecha + ', cuyo objeto se define como '},
	                    { text: datosPDF.proyecto_desc, bold:true},
	                    { text: ', el cual se regirá según el presupuesto Nro '},
	                    { text: datosPDF.presupuesto_codigo, bold:true},
	                ],style:'texto'
	            },

	            { 
	           		text: [
	                    { text: 'Acta que se efectúa en la ciudad de Guatire, a los '},
	                    { text: datosPDF.dias},
	                    { text: ' del mes de '},
	                    { text: datosPDF.mes},
	                    { text: ' del año '},
	                    { text: datosPDF.anio + '.'},
	                ],style:'texto'
	            },
	            {
					table: {
						widths: ['*', '*'],
						headerRows: 4,
						keepWithHeaderRows: 1,

						body: [
							[
								{
									text: [
					                    { text: 'Por el Cliente: \n' , style:'encabezado'},
					                    { text: datosPDF.cliente_nombre, bold: true, style:'encabezado'},
					            	],
					            	margin:[10,10,10,10],
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por: \n' , style:'encabezado'},
					                    { text: 'SISTELRED, C.A.',bold: true, style:'encabezado'},
					           	 	],
					           	 	margin:[10,10,10,10],
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },

					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },
				            ],

				            [ '', ''],
				            [ '', ''],
						]
					}
				},
			);
		}else if (tipo === "Culminacion"){
			content.push(
				{
					text:'Acta de Culminacion',
					style: 'titulo',
				},
				{ 
	           		text: [
	                    { text: 'Mediante la presente '},
	                    { text: 'SISTELRED C.A. RIF: J-30994445-2', bold:true},
	                    { text: ' hace entrega al cliente '},
	                    { text: datosPDF.cliente_nombre + " RIF: " + datosPDF.cliente_rif, bold:true},
	                    { text: ' el proyecto '},
	                    { text: datosPDF.proyecto_nombre, bold:true},
	                    { text: ' registrado bajo el código '},
	                    { text: datosPDF.proyecto_codigo, bold:true},
	                    { text: ' de fecha ' + datosPDF.proyecto_fecha_inicio + ' y culminado el ' + datosPDF.proyecto_fecha_fin},
	                    { text: ', cuyo objecto fue '},
	                    { text: datosPDF.proyecto_desc, bold:true},
	                    { text: ', el cual se entrega a entera satisfacción de ambas partes y dando por culminado el servicio prestado por parte de la empresa '},
	                    { text: datosPDF.presupuesto_codigo, bold:true},
	                ],style:'texto'
	            },

	            { 
	           		text: [
	                    { text: 'Acta que se efectúa en la ciudad de Guatire, a los '},
	                    { text: datosPDF.dias},
	                    { text: ' del mes de '},
	                    { text: datosPDF.mes},
	                    { text: ' del año '},
	                    { text: datosPDF.anio + '.'},
	                ],style:'texto'
	            },
	            { 
	           		text: [
	                    { text: 'NOTA: ', bold:true},
	                    { text: ' Este documento indica la recepción definitiva de los trabajos realizados a entera satisfacción de '},
	                    { text: datosPDF.cliente_nombre /*+ " RIF: " + datosPDF.cliente_rif*/, bold:true},
	                    { text: ' liberando cualquier fianza o retención generada como producto del fiel cumplimiento, presentada por la empresa '},
	                    { text: 'SISTELRED, C.A.', bold:true},
	                    { text: ' y aceptados por el cliente. '},
	                ],style:'nota'
	            },
	            {
					table: {
						widths: ['*', '*'],
						headerRows: 4,
						keepWithHeaderRows: 1,

						body: [
							[
								{
									text: [
					                    { text: 'Por el Cliente: \n' , style:'encabezado'},
					                    { text: datosPDF.cliente_nombre, bold: true, style:'encabezado'},
					            	],
					            	margin:[10,10,10,10],
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por: \n' , style:'encabezado'},
					                    { text: 'SISTELRED, C.A.',bold: true, style:'encabezado'},
					           	 	],
					           	 	margin:[10,10,10,10],
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },

					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },
				            ],

				            [ '', ''],
				            [ '', ''],
						]
					}
				},
			);
		} else if (tipo ==="Estado"){

			var tablaEtapas = {};
			var aux_etapa = {};
			var aux_actividad = {};
			var aux_tabla_eta = {};
			var bodyEtapa = [];
			var aux = {};
			var body = [];
			var estatus;

			//primera parte del pdf
			content.push(
					{
						text:'Acta de Estado',
						style: 'titulo',
					},
					{ 
		           		text: [
		                    { text: 'Mediante la presente, '},
		                    { text: 'SISTELRED C.A. RIF: J-30994445-2', bold:true},
		                    { text: ' deja constancia del estado del proyecto registrado bajo el código '},
		                    { text: datosPDF.proyecto_codigo, bold:true},
		                    { text: ', de fecha ' + datosPDF.proyecto_fecha_inicio},
		                    { text: ', cuyo objeto se define como '},
		                    { text: datosPDF.proyecto_desc, bold:true},
		                    { text: '.A continuación se listan las etapas y sus actividades:'},
		                ],style:'texto'
		            },
		    );



			//segunda parte del pdf
			$.each(proyecto.etapas,function(i,etapa){
				bodyEtapa = []; //se reinicia para que no se repitan las actividades
				aux_etapa = {
					text: etapa.letra + " - " + etapa.nombre + " - " + etapa.estatus,
					style: 'subheader1',
					alignment:'center'
				};
				aux_actividad = {
					text: 'Actividades',
					style:'subheader1',
					alignment:'left'
				};
				
				$.each(etapa.actividades,function(i, actividad){
					if (actividad.completada === true){
						estatus = "Completada";
					}else{
						estatus = "Pendiente";
					}
					aux = [{text:actividad.nro, noWrap: true}, 
					{text: actividad.desc}, 
					{text: estatus},];
					bodyEtapa.push($.extend(false,[],aux));
				});

				

				var bodyUsados = []; //$.extend(true,[],[]);
				$.each(bodyEtapa,function(i,detalle){
					bodyUsados.push([detalle[0],detalle[1],detalle[2]]);	
				});

				bodyUsados.unshift([
					{text: 'Nro', style: 'tableHeader'}, 
					{text: 'Descripción', style: 'tableHeader'}, 
					{text: 'Estado', style: 'tableHeader'},
				]);

				aux_tabla_eta = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto'],
						body:bodyUsados,
					}
				};
				content.push($.extend(true,{},aux_etapa),$.extend(true,{},aux_actividad),$.extend(true,{},aux_tabla_eta));
			});

			//tercera parte del pdf
			content.push(
	            { 
	           		text: [
	                    { text: 'Acta que se efectúa a petición del cliente ' },
	                    { text: datosPDF.cliente_nombre, bold:true },
	                    { text:' en la ciudad de Guatire, a los '},
	                    { text: datosPDF.dias},
	                    { text: ' días del mes de '},
	                    { text: datosPDF.mes},
	                    { text: ' del año '},
	                    { text: datosPDF.anio + '.'},
	                ],style:'texto'
	            },
	            {
					table: {
						widths: ['*', '*'],
						headerRows: 4,
						keepWithHeaderRows: 1,

						body: [
							[
								{
									text: [
					                    { text: 'Por el Cliente: \n' , style:'encabezado'},
					                    { text: datosPDF.cliente_nombre, bold: true, style:'encabezado'},
					            	],
					            	margin:[10,10,10,10],
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por: \n' , style:'encabezado'},
					                    { text: 'SISTELRED, C.A.',bold: true, style:'encabezado'},
					           	 	],
					           	 	margin:[10,10,10,10],
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },

					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },
				            ],

				            [ '', ''],
				            [ '', ''],
						]
					}
				},
			);
		}else if (tipo === "Entrega"){
			var tablaEtapas = {};
			var aux_etapa = {};
			var aux_actividad = {};
			var aux_tabla_eta = {};
			var bodyEtapa = [];
			var aux = {};
			var body = [];
			var estatus;

			//primera parte del pdf
			content.push(
					{
						text:'Acta de Entrega',
						style: 'titulo',
					},
					{ 
		           		text: [
		                    { text: 'Mediante la presente, '},
		                    { text: 'SISTELRED C.A. RIF: J-30994445-2', bold:true},
		                    { text:' hace constar la entrega de los trabajos, pertenecientes a la etapa '},
		                    { text: datosPDF.etapa_codigo + " - " + datosPDF.etapa_nombre, bold:true},
		                    { text: ', del proyecto registrado bajo el código '},
		                    { text: datosPDF.proyecto_codigo, bold:true},
		                    { text: ', cuyo objeto se define como '},
		                    { text: datosPDF.proyecto_nombre, bold:true},
		                    { text: '.En los trabajos se utilizaron los siguientes materiales y/o servicios, los mismos fueron instalados y se encuentran totalmente operativos:'},
		                    /*{text: 'hacemos constar la entrega de los siguientes trabajos utilizando los materiales y servicios a entera satisfacción del cliente, los mismos fueron instalados y se encuentran totalmente operativos'},*/
		                    /*{ text: 'SISTELRED C.A. RIF: J-30994445-2', bold:true},
		                    { text: ' deja constancia del estado del proyecto registrado bajo el código '},
		                    { text: datosPDF.proyecto_codigo, bold:true},
		                    { text: ', de fecha ' + datosPDF.proyecto_fecha_inicio},
		                    { text: ', cuyo objeto se define como '},
		                    { text: datosPDF.proyecto_desc, bold:true},
		                    { text: '.A continuación se listan las etapas y sus actividades:'},*/
		                ],style:'texto'
		            },
		            {
						text: 'Actividades',
						style:'subheader1',
						alignment:'left'
					}
		    );



			//segunda parte del pdf
			bodyEtapa = []; //se reinicia para que no se repitan las actividades
			$.each(datosPDF.actividades,function(i,actividad){
				aux = [{text:actividad.nro, noWrap: true}, 
				{text: actividad.desc},];
				bodyEtapa.push($.extend(false,[],aux));

			});

			var bodyUsados = []; //$.extend(true,[],[]);
			$.each(bodyEtapa,function(i,detalle){
				bodyUsados.push([detalle[0], detalle[1]]);	
			});

			bodyUsados.unshift([
				{text: 'Nro', style: 'tableHeader'}, 
				{text: 'Descripción', style: 'tableHeader'}, 
			]);

			aux_tabla_eta = {
				style:'tablaMateriales',
				table:{
					headerRows:1,
					widths: ['auto','*'],
					body:bodyUsados,
				}
			};
			content.push($.extend(true,{},aux_tabla_eta));

			content.push(
				{ 
					text: 'Materiales y/o Servicios',
					style:'subheader1',
					alignment:'left'
				}
			);

			bodyEtapa = []; //se reinicia para que no se repitan las actividades
			$.each(datosPDF.elementos,function(i,elemento){
				aux = [{text:elemento.codigo, noWrap: true}, 
				{text: elemento.desc},
				{text: elemento.cantidad}];
				bodyEtapa.push($.extend(false,[],aux));

			});

			var bodyUsados = []; //$.extend(true,[],[]);
			$.each(bodyEtapa,function(i,detalle){
				bodyUsados.push([detalle[0], detalle[1],detalle[2]]);	
			});

			bodyUsados.unshift([
				{text: 'Código', style: 'tableHeader'}, 
				{text: 'Descripción', style: 'tableHeader'},
				{text: 'Cantidad', style: 'tableHeader'},  
			]);

			aux_tabla_eta = {
				style:'tablaMateriales',
				table:{
					headerRows:1,
					widths: ['auto','*','auto'],
					body:bodyUsados,
				}
			};
			content.push($.extend(true,{},aux_tabla_eta));


			//tercera parte del pdf
			content.push(
				 { 
	           		text: [
	                    { text: 'NOTA: ', bold:true},
	                    { text: ' Este documento indica la recepción definitiva de los trabajos realizados a entera satisfacción de '},
	                    { text: datosPDF.cliente_nombre /*+ " RIF: " + datosPDF.cliente_rif*/, bold:true},
	                    { text: ' liberando cualquier fianza o retención generada como producto del fiel cumplimiento, presentada por la empresa '},
	                    { text: 'SISTELRED, C.A.', bold:true},
	                    { text: ' y aceptados por el cliente. '},
	                ],style:'nota'
	            },
	            { 
	           		text: [
	                    { text: 'Acta que se efectúa' },
	                    { text:' en la ciudad de Guatire, a los '},
	                    { text: datosPDF.dias},
	                    { text: ' días del mes de '},
	                    { text: datosPDF.mes},
	                    { text: ' del año '},
	                    { text: datosPDF.anio + '.'},
	                ],style:'texto'
	            },
	            {
					table: {
						widths: ['*', '*'],
						headerRows: 4,
						keepWithHeaderRows: 1,

						body: [
							[
								{
									text: [
					                    { text: 'Por el Cliente: \n' , style:'encabezado'},
					                    { text: datosPDF.cliente_nombre, bold: true, style:'encabezado'},
					            	],
					            	margin:[10,10,10,10],
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por: \n' , style:'encabezado'},
					                    { text: 'SISTELRED, C.A.',bold: true, style:'encabezado'},
					           	 	],
					           	 	margin:[10,10,10,10],
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },

					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: 'Firma y Sello: ', alignment:'center' , style:'texto'},
					                    { text: '\r\r    Nombre: ', style:'firma'},
					                    { text: '\r\r    Cargo: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center'
					            	,margin:[10,10,10,10]
					            },
				            ],

				            [ '', ''],
				            [ '', ''],
						]
					}
				},
			);
		}

		var docDefinition = {
			info: {
			    title: 'Acta ' + tipo + " " +  datosPDF.proyecto_codigo,
			    author: datosPDF.vendedor_nombre,
			    /*subject: 'subject of document',
			    keywords: 'keywords for document',*/
			},
			content: content,

			styles: {
				titulo:{
					fontSize:24,
					alignment:'center',
					bold:true,
					margin:[0,0,0,20]
				},
				texto: {
					fontSize: 12,
					alignment:'justify',
					margin:[0,20,0,20]
				},
				nota:{
					fontSize: 10,
					alignment:'justify',
					margin:[0,20,0,20]
				},
				firma: {
					fontSize: 12,
					alignment:'left',
					margin:[10,0,10,0]
				},
				encabezado:{
					color:"#FFFFFF"
				},
				subheader:{
					fontSize:14,
					alignment:'justify',
					margin:[0,0,0,20]
				},
				subheader1:{
					fontSize:12,
					alignment:'center',
					bold:true,
					margin:[0,15,0,15]
				},
				tableHeader: {
					fontSize: 12,
					alignment: 'left',
					bold: true,
					fillColor: '#337ab7',
					color:"#FFFFFF",
					noWrap:true,
					/*margin: [0, 0, 0, 10]*/
				},
				tablaMateriales: {
					fontSize:9,
					margin: [0, 15 , 0, 15],
				},


			},
			footer: function(page, pages) { 
				    return { 
				        columns: [ 
				            { text: 'Acta ' + tipo + ' Proyecto-' + datosPDF.proyecto_codigo, italics: true , fontSize:8},
				            { 
				                alignment: 'right',
				                text: [
				                    { text: 'Página '+ page.toString(), italics: true , fontSize:8},
				                    { text: ' de ', fontSize:8},
				                    { text: pages.toString(), italics: true , fontSize:8}
				                ]
				            }
				        ],
				        margin: [15, 15 , 15, 15]
				    };
				},
		}

		pdfMake.createPdf(docDefinition).open();
	},
	generarPDFListadoMateriales(){
		var datosPDF ={};
		var proyecto = this.get('proyecto');
		var desglose = this.get('desglose');
		datosPDF.proyecto_nombre = proyecto.nombre;
		datosPDF.proyecto_codigo = proyecto.codigo;
		datosPDF.coordinador_nombre = Cookies.getJSON('current').nombre1 + " " + Cookies.getJSON('current').apellido1;
		datosPDF.disponibles = []; 
		datosPDF.usados = [];
		datosPDF.etapas = []; 

		/*console.log(desglose);*/
		var aux;
		var descripcion;
		$.each(desglose.disponibles,function(i,material){
			descripcion = material.desc + " " + material.marca + " (" + material.presen + ") ";
			if (material.serial !== null){
				descripcion = descripcion + " -SE: " +material.serial;
			}
			aux = [{text:material.codigo, noWrap: true}, 
			{text: material.nombre}, 
			{text: descripcion}, 
			{text: material.cantidad, noWrap: true, alignment:'center'}];
			datosPDF.disponibles.push($.extend(false,[],aux));
		});

		
		var bodyDisponibles = [];
		$.each(datosPDF.disponibles,function(i,detalle){

				bodyDisponibles.push([detalle[0],detalle[1],detalle[2],detalle[3]]);	
		
		});

		bodyDisponibles.unshift([
			{text: 'Código', style: 'tableHeader'}, 
			{text: 'Nombre', style: 'tableHeader'}, 
			{text: 'Descripción', style: 'tableHeader'},
			{text: 'Cantidad', style: 'tableHeader'}, 
		]);

		/*console.log(bodyDisponibles);*/


		$.each(desglose.usados,function(i,material){
			descripcion = material.desc + " " + material.marca + " (" + material.presen + ") ";
			if (material.serial !== null){
				descripcion = descripcion + " -SE: " +material.serial;
			}
			aux = [{text:material.codigo, noWrap: true}, 
			{text: material.nombre}, 
			{text: descripcion}, 
			{text: material.cantidad, noWrap: true, alignment:'center'}];
			datosPDF.usados.push($.extend(false,[],aux));
		});

		
		var bodyUsados = [];
		$.each(datosPDF.usados,function(i,detalle){

				bodyUsados.push([detalle[0],detalle[1],detalle[2],detalle[3]]);	
		
		});

		bodyUsados.unshift([
			{text: 'Código', style: 'tableHeader'}, 
			{text: 'Nombre', style: 'tableHeader'}, 
			{text: 'Descripción', style: 'tableHeader'},
			{text: 'Cantidad', style: 'tableHeader'}, 
		]);

		var content = [];
		var i=0;
		content.push({
					text:'Listado de Materiales Proyecto ' + datosPDF.proyecto_codigo,
					style: 'titulo',
				},
				{
					text: datosPDF.proyecto_nombre+".",
					style: 'subheader',
				},
				{
					text: 'Disponibles:',
					style: 'subheader1',
				},
				{
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', 'auto','*','auto'],
						body:bodyDisponibles,
					}
				},
				{
					text: 'Usados:',
					style: 'subheader1',
				},
				{
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', 'auto','*','auto'],
						body:bodyUsados,
					}
				},
				{
					text: 'Usados por etapa:',
					style: 'subheader1',
				});
		
		var tablaEtapas = {};
		var aux_etapa = {};
		var aux_tabla_eta = {};
		var bodyEtapa = [];
		var bodyEtapaJson = [];
		$.each(desglose.etapas,function(i,etapa){
			bodyEtapa = []; //se reinicia para que no se repitan los materiales
			aux_etapa = {
				text: etapa.letra_eta + " - " + etapa.nombre_eta,
				style: 'subheader1',
				alignment:'left'
			};
			
			$.each(etapa.materiales,function(i, material){
				descripcion = material.desc + " " + material.marca + " (" + material.presen + ") ";
				if (material.serial !== null){
					descripcion = descripcion + " -SE: " +material.serial;
				}
				aux = [{text:material.codigo, noWrap: true}, 
				{text: material.nombre}, 
				{text: descripcion}, 
				{text: material.cantidad, noWrap: true, alignment:'center'}];
				bodyEtapa.push($.extend(false,[],aux));
			});

			

			var bodyUsados = []; //$.extend(true,[],[]);
			$.each(bodyEtapa,function(i,detalle){
				bodyUsados.push([detalle[0],detalle[1],detalle[2],detalle[3]]);	
			});

			bodyUsados.unshift([
				{text: 'Código', style: 'tableHeader'}, 
				{text: 'Nombre', style: 'tableHeader'}, 
				{text: 'Descripción', style: 'tableHeader'},
				{text: 'Cantidad', style: 'tableHeader'}, 
			]);

			aux_tabla_eta = {
				style:'tablaMateriales',
				table:{
					headerRows:1,
					widths: ['auto', 'auto','*','auto'],
					body:bodyUsados,
				}
			};
			content.push($.extend(true,{},aux_etapa),$.extend(true,{},aux_tabla_eta));
		});

		/*console.log(content);*/
		var docDefinition = {
			info: {
			    title: 'Listado Materiales Proyecto ' + datosPDF.proyecto_codigo,
			    author: datosPDF.vendedor_nombre,
			    /*subject: 'subject of document',
			    keywords: 'keywords for document',*/
			},
			content:content,
			styles: {
				titulo:{
					fontSize:18,
					alignment:'center',
					bold:true,
					margin:[0,0,0,20]
				},
				subheader:{
					fontSize:14,
					alignment:'justify',
					margin:[0,0,0,20]
				},
				subheader1:{
					fontSize:12,
					alignment:'center',
					bold:true,
					margin:[0,15,0,15]
				},
				tableHeader: {
					fontSize: 12,
					alignment: 'left',
					bold: true,
					fillColor: '#337ab7',
					color:"#FFFFFF",
					noWrap:true,
					/*margin: [0, 0, 0, 10]*/
				},
				tablaMateriales: {
					fontSize:9,
					margin: [0, 15 , 0, 15],
				},

			},
			footer: function(page, pages) { 
				    return { 
				        columns: [ 
				            { text: 'Listado Materiales Proyecto-' + datosPDF.proyecto_codigo, italics: true , fontSize:8},
				            { 
				                alignment: 'right',
				                text: [
				                    { text: 'Página '+ page.toString(), italics: true , fontSize:8},
				                    { text: ' de ', fontSize:8},
				                    { text: pages.toString(), italics: true , fontSize:8}
				                ]
				            }
				        ],
				        margin: [15, 15 , 15, 15]
				    };
				},
		}

		pdfMake.createPdf(docDefinition).open();
	},
	actions: {
		cerrarMsg:function(){
			this.cerrarMsg();
		},
		accionProyecto(){
			this.accionProyecto();
		},
		accionEtapa(etapa){
			this.accionEtapa(etapa);
		},
		procesarPresupuesto:function(){
			this.procesarPresupuesto();
		},
		ordenarPor: function(property,presupuestos) {
			this.ordenarPor(property,presupuestos);
    	},
    	openModalActaInicio(){
    		this.openModalActaInicio();
    	},
    	openModalActaEstado(){
    		this.openModalActaEstado();
    	},
    	openModalGeneral:function(){
    		this.openModalGeneral();
    	},
    	openModalTecnicos: function(){
    		this.openModalTecnicos();
    	},
    	agregarTecnico:function(){
    		this.agregarTecnico();
    	},
    	eliminarTecnicosSeleccionados:function(){
    		this.eliminarTecnicosSeleccionados();
    	},
    	guardarTecnicos:function(){
    		this.guardarTecnicos();
    	},

    	openModalEtapa:function(etapa,editing){
    		this.openModalEtapa(etapa,editing);
    	},

		openModalPresupuesto: function(editing,presupuesto){
			this.openModalPresupuesto(editing,presupuesto);
		},
		openModalSolicitud: function(solicitud){
			this.openModalSolicitud(solicitud);
		},
		aprobarSolicitud: function(solicitud){
			this.aprobarSolicitud(solicitud);
		},
		openModalReporteDetalle:function(etapa){
			this.openModalReporteDetalle(etapa);
		},
		openModalReportes:function(etapa){
			this.openModalReportes(etapa);
		},
		guardarReportesLeidos:function(){
			this.guardarReportesLeidos();
		},
		openModalActividades:function(etapa){
			this.openModalActividades(etapa);
		},
		agregarActividad:function(){
			this.agregarActividad();
		},
		eliminarActividad: function(actividad){
			this.eliminarActividad(actividad);
		},
		openModalPresupuestoAgregarMS: function(){
			var seleccion = $("#anadir").val();
			this.openModalPresupuestoAgregarMS(seleccion);
		},
		agregarElementosPresupuesto: function(){
			this.agregarElementosPresupuesto();
		},
		eliminarElementosPresupuesto: function(){
			this.eliminarElementosPresupuesto();
		},
		calcularPrecioTotal: function(codigo){
			this.calcularPrecioTotal(codigo);
		},
		calcularMontoTotal: function(){
			this.calcularMontoTotal();
		},
		guardarProyectoGeneral:function(){
			this.guardarProyectoGeneral();
		},
		guardarEtapa: function(){
			this.guardarEtapa();
		},
		guardarActividades:function(){
			this.guardarActividades();
		},
		/*generarPDF:function(tipo){
			$("#exportar_mat_"+tipo).hide();
			//console.log(tipo);
			var nombrepdf = this.get('proyecto.codigo')+"-listado-materiales-"+tipo+".pdf";
			this.generarPDFActa(nombrepdf,tipo);
			$("#exportar_mat_"+tipo).show();
		},*/
		materialDesglose: function(){
			var method= "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/materiales/' ;
		    this.getElements(method,url,this.setDesglose,this);
		},
		generarPDFActa: function(tipo){
			this.generarPDFActa(tipo);
		},
		generarPDFListadoMateriales: function(){
			this.generarPDFListadoMateriales();
		},
		/*generarPDFActa:function(tipo,modal){
			var nombre = nombre;
			if(tipo==="Entrega"){
				nombre = "acta entrega-"+this.get('proyecto.codigo') + '-'+this.get('etapa.letra') +'.pdf';
			}else if (tipo==="Culminacion"){
				nombre = "acta culminacion-" +this.get('proyecto.codigo') + '.pdf';
			}else if (tipo ==="Inicio"){
				nombre =  "acta inicio-" +this.get('proyecto.codigo') + '.pdf';
			}
			else if (tipo ==="Estado"){
				nombre =  "acta estado-" +this.get('proyecto.codigo') + '.pdf';
			}
			this.generarPDFActa(nombre,modal);
		}*/
	}
});
