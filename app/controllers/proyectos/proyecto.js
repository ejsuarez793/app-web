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

	prueba: {}, //usado en la prueba de crear solicidut borrar despues
	solicitud_material_prueba: [],

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

		    url = window.serverUrl + '/material/';
		    this.getElements(method,url,this.setMateriales,this);

		    url = window.serverUrl + '/servicio/';
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
			proyecto.accion = "Culminar";
		}else if(proyecto.estatus === "Culminado"){
			proyecto.accion = "Generar Acta";
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
		console.log(proyecto);
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
		//console.log(desglose);
		context.set('desglose',desglose);
		context.listadoMateriales();
	},
	listadoMateriales(){
		//console.log(this.get('desglose'));
		var desglose = this.get('desglose');
		var disponibles = [];
		var usados_e = {};
		var usados_efectivamente = {};
		var total_usados = [];
		var flag = false; // usada para saber si un material no fue sumado/restado en la iteracion de usados efectivamente
		var aux;

		//aqui organizo los egresados y retornados por etapas, para luego sacar los usados efectivamente en cada etapa.
		$.each(desglose.egresados.toArray(),function(i,egresado){
			if (usados_e[egresado.codigo_eta]===null || usados_e[egresado.codigo_eta]===undefined){
				//console.log(egresado.codigo_eta);
				usados_e[egresado.codigo_eta] = [];
			}
			usados_e[egresado.codigo_eta].push(egresado);
		});

		$.each(desglose.retornados.toArray(),function(i,retornado){
			if (usados_e[retornado.codigo_eta]===null || usados_e[retornado.codigo_eta]===undefined){
				usados_e[retornado.codigo_eta] = [];
			}
			usados_e[retornado.codigo_eta].push(retornado);
		});

		//hasta este punto me deberian salir un json con un campo de cada etapa y sus egresados y retornados, para luego restar los eleentos
		/*console.log("usados antes proce");
		console.log(usados_e);*/

		//ahora resto los elementos
		$.each(usados_e,function(i,usado_e){
			//flag = false;
			//console.log(usado_e);
			$.each(usado_e,function(i, usado){
				flag = false;
				//console.log(usado);
				if (usados_efectivamente[usado.codigo_eta]===null || usados_efectivamente[usado.codigo_eta]===undefined){
					usados_efectivamente[usado.codigo_eta] = [];
					//usados_efectivamente['letra_eta'] = usado.letra_eta;
					//usados_efectivamente['nombre_eta'] = usado.nombre_eta;
				}
				$.each(usados_efectivamente[usado.codigo_eta],function(i,usado_efectivamente){
					if(usado_efectivamente.codigo_mat === usado.codigo_mat){
						if(usado.tipo_mov === "Egreso"){
							usado_efectivamente.cant = usado_efectivamente.cant + usado.cant;
						}else if(usado.tipo_mov === "Retorno"){
							usado_efectivamente.cant = usado_efectivamente.cant - usado.cant;
						}
						flag=true;
					}
				});
				if(!flag){
					aux = $.extend(true,{},usado);
					if(aux.tipo_mov === "Retorno"){
						aux.cant = aux.cant * (-1);
					}
					usados_efectivamente[usado.codigo_eta].push(aux);
				}
			});
			
		});

		/*console.log("usados efectivamente");
		console.log(usados_efectivamente);*/

		//por ultimo sumo los materiales disponibles de los presupuestos
		$.each(desglose.presupuestos.toArray(),function(i,material){
			flag = false;
			$.each(disponibles,function(i,disponible){
				if (material.codigo_mat === disponible.codigo_mat){
					disponible.cant += material.cant;
					flag = true;
				}
			});
			if(!flag){
				aux = $.extend(true,{},material);
				disponibles.push(aux);
			}
		});

		//aqui agregamos los usados efectivamente por etapa y los agrupamos en otro arreglo para poder mostrar otra categoria
		//de usados totales

		$.each(usados_efectivamente,function(i, etapa){
			$.each(etapa,function(i, usado_efectivamente){
				flag = false;
				$.each(total_usados,function(i,material_tu){
					if (usado_efectivamente.codigo_mat === material_tu.codigo_mat){
						material_tu.cant = material_tu.cant + usado_efectivamente.cant;
						flag = true;
					}
				});
				if(!flag && usado_efectivamente.cant>0){
					aux = $.extend(true,{},usado_efectivamente);
					total_usados.push(aux);
				}
			});
		});

		/*console.log("total usados");
		console.log(total_usados);*/

		//finalizando restamos los disponibles del presupuesto con los usados efectivamente en cada etapa
		
		$.each(disponibles,function(i,disponible){
			$.each(usados_efectivamente, function(i,etapa){
				$.each(etapa, function(i, material){
					if(disponible.codigo_mat === material.codigo_mat){
			  			disponible.cant = disponible.cant - material.cant;
			  		}
				});
				
			});
		});

		
		var materiales_x_etapa = [];
		for(var propName in usados_efectivamente) {
		    $.each(this.get('proyecto.etapas'),function(i,etapa){
		    	//console.log(etapa);
		    	if (etapa.codigo === parseInt(propName)){
		    		//console.log(etapa.nombre);
		    		aux = $.extend(true,{},etapa); 
		    		aux['materiales'] = [];
		    		$.each(usados_efectivamente[propName],function(i,mat){
		    			if (mat.cant>0){
		    				aux['materiales'].push(mat);
		    			}
		    		});
		    		materiales_x_etapa.push(aux);


		    	}
		    });
		    //console.log(propName);
		}
		//console.log(materiales_x_etapa);
		/*console.log("disponibles");
		console.log(disponibles);*/

		this.set('materiales_disponibles',disponibles);
		this.set('materiales_usados_etapas',materiales_x_etapa);
		this.set('materiales_usados_totales',total_usados);

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

		if (proyecto.accion === "Generar Acta"){
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
		var materiales_etapas = this.get('materiales_usados_etapas').toArray();
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

		$.each(materiales_etapas,function(i,material_etapa){
			if (material_etapa.codigo === etapa.codigo){
				$.each(material_etapa.materiales,function(i,material){
					aux = {};
					aux.codigo = material.codigo_mat;
					aux.desc = material.desc;
					aux.cantidad = material.cant;
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
	prepararModalPresupuesto(editing,presupuesto){
		var proyecto = this.get('proyecto');
		var cont = 0;
		var arrayLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //array de letras para colocar al final del nuevo presupuesto
		var nuevo_p ={
			codigo:'',
			codigo_pro:'',
			fecha: '',
			fecha_mostrar:moment().format("LL"),
			validez_o: '5',
			descuento: '50',
			observ: 'Observaciones del presupuesto, a ser llenado por un agente de ventas.',
			desc: 'Descripción del presupuesto, a ser llenado por un agente de ventas.',
			atencion_n: 'a ser llenadopor un agente de ventas.',
			atencion_e: 'a ser llenado por un agente de ventas.',
			materiales: [],
			servicios:[],
			cond_g:'Del fabricante.-',
			cond_p: 'Precio sujeto a cambios sin previo aviso, dependerá de la alta rotación de inventario y disponibilidad.-\nEstos precios no incluyen transporte fuera del área metropolitana de Caracas.-\nEstos precios incluyen el Impuesto al Valor Agregado (IVA).-\n',
			t_ent: 'Previa planificación con el cliente final.-',
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
				this.set('ecs',[]);
			}else{
				console.log("El proyecto tiene mas de 26 presupuestos no se puede crear más");
			}
		}else{
			this.set('editing',true);
			presupuesto = $.extend(true, {}, presupuesto);
			presupuesto.fecha_mostrar = moment(presupuesto.fecha).format("LL");
			var presupuesto_servicios =presupuesto.servicios;
			var presupuesto_materiales = presupuesto.materiales;
			this.set('ecs',[]);
			var ecs = this.get('ecs');
			var servicios = this.get('servicios').toArray();
			var materiales = this.get('materiales').toArray();
			var _this = this;
			//a continuacion se asignan a los elementos con seleccion 'ecs' los servicios y materiales que posee el presupuesto
			$.each(presupuesto_servicios,function(i,servicio){
				servicio.tag="servicio";
				servicio.codigo = servicio.codigo_ser;
				servicio.precio_act = servicio.precio_venta;
				servicio.precio_total = servicio.precio_venta * servicio.cantidad;
				$.each(servicios,function(i,s){
					if (servicio.codigo=== s.codigo){
						servicio.desc = s.desc;
					}
				});
				ecs.pushObject(servicio);
			});
			$.each(presupuesto_materiales,function(i,material){
				material.tag="material";
				material.codigo = material.codigo_mat;
				material.precio_act = material.precio_venta;
				material.precio_total = material.precio_venta * material.cantidad;
				$.each(materiales,function(i,m){
					if (material.codigo=== m.codigo){
						material.desc = m.desc;
					}
				});
				ecs.pushObject(material);
			});
			this.set('presupuesto',presupuesto);
			
			$('#myModalPresupuesto').on('shown.bs.modal', function () {
	  			// cuando se muestra el modal se calcula el precio total de cada elemento y el monto total
	  			//ya que depende de que se renderize los td de la tabla
	  			$.each(_this.get('ecs').toArray(),function(i,elemento){
					_this.calcularPrecioTotal(elemento.codigo);
				});
	  			_this.calcularMontoTotal();
	  			
			});
			
		}
		$("#myModalPresupuesto").modal('show');
		//this.calcularMontoTotal();

	},
	openModalSolicitud(solicitud){
		this.set('solicitud',solicitud);
		$("#myModalSolicitudes").modal('show');
		var method = "GET";
		var url = window.serverUrl +'/almacen/disponibilidad/' +solicitud.codigo+'/';
		this.getElements(method,url,this.msgDisponibilidadMaterial,this);
		//console.log("abriendo");
	},
	msgDisponibilidadMaterial(response,context){
		//console.log(response);
		if (response.tipo === "Sin Disponibilidad"){
			response.sin_disponibilidad = true;
		}
		context.set('disponibilidad_material',response);
	},
	aprobarSolicitud(solicitud){
		//console.log(solicitud);
		var disp = this.get('disponibilidad_material');

		if(disp.tipo === "Disponibilidad"){
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
		agregarElementos: funcion que permite agregar los materiales o servicios que fueron seleccionados y los incorpora
		a elementos con seleccion 'ecs' y los elimina de servicios sin seleccion o materiales sin seleccion segun
		sea el caso
	*/
	agregarElementos(tipo_e){
		var checkbox='';
		var elementos=[];
		var elementos_cs =this.get('ecs');
		var elementos_ss=[];
		var modal = '';
		var tag = '';

		var cod_cs = [];
		if (tipo_e === 'servicio'){
			checkbox = '#myModalServicios input:checked';
			elementos = this.get('servicios').toArray();
			elementos_ss = this.get('sss');
			modal = "#myModalServicios";
			tag  = 'servicio';
		}else if(tipo_e === 'material'){
			checkbox = '#myModalMateriales input:checked';
			elementos = this.get('materiales').toArray();
			elementos_ss = this.get('mss');
			modal = "#myModalMateriales";
			tag  = 'material';
		}

		//guardamos los codigos de los elementos seleccionados/checkeados en un arreglo
		$(checkbox).each(function() {
		    cod_cs.push($(this).val());
		});

		//verificamos el total de elementos, y si su codigo esta en el array de codigos lo
		//agregamos al arreglo elementos con seleccion o ecs
		var aux =  $.extend(true, {}, elementos);
		$.each(aux, function(i,elemento){
			if ($.inArray(elemento.codigo, cod_cs) !== -1){
				elemento.tag = tag;
				//if (tag ==='servicio'){
				elemento.cantidad = 0;
				//}
				elemento.precio_venta = elemento.precio_act;
				elemento.precio_total = elemento.cantidad * elemento.precio_act;
				elementos_cs.pushObject(elemento);
			}
		});

		//luego verificamos el arreglo de elementos sin seleccion (sss o mss)  y si el codigo de un
		//elemento se encuentra en codigos con seleccion cod_cs lo retiramos
		$.each(elementos_ss.toArray(),function(i,elemento_ss){
			if($.inArray(elemento_ss.codigo, cod_cs) !== -1){
				elementos_ss.removeObject(elemento_ss);
			}
		});
		$(modal).modal('hide');
	},
	/*
		prepararModalElementos: prepara el modal donde aparecen los materiales o servicios que se pueden agregar al presupuesto
		los cuales son todos aquellos elementos (materiales o servicios) que no se encuentran ya incluidos en el presupuesto.
	*/
	prepararModalElementos(tipo_e){
		var elementos = [];
		var elementos_cs = this.get('ecs').toArray();
		var aux = [];
		var elementos_ss = [];
		var modal = '';
		var ss = '';
		if (tipo_e==='servicio'){
			elementos = this.get('servicios').toArray();
			ss = 'sss';
			modal = "#myModalServicios";
		}else if(tipo_e==='material'){
			elementos = this.get('materiales').toArray();
			ss = 'mss';
			modal = "#myModalMateriales";
		}
		this.set(ss,[]);
		elementos_ss = this.get(ss);
		aux =  $.extend(true, [], elementos);
		this.prepararSinSeleccion(aux,elementos_cs,elementos_ss);
		$(modal).modal('show');
	},
	/*
		prepararSinSeleccion: verifica uno a uno todos los elementos (materiales o servicios) para verificar que no se encuentran
		incluidos en los elementos con seleccion (elementos_cs), si no estan inluidos se añaden a los elementos sin seleccion 
		(elementos_ss).
	*/
	prepararSinSeleccion(elementos,elementos_cs,elementos_ss){
		var flag = false;
		$.each(elementos,function(i, elemento){
			flag=false;
			$.each(elementos_cs, function(i,elemento_cs){
				if (elemento.codigo === elemento_cs.codigo){
					flag=true;
				}

			});
			if (flag===false){
				elementos_ss.pushObject(elemento);
			}
		});
	},
	/*
		eliminarElementos: cuando el usuario selecciona del presupuesto elementos, y clickea el boton de eliminar seleccionados
		esta función es llamada. Se encarga de eliminarlos de los elementos con selección 'ecs' y de añadirlos a su respectivo
		arreglo de sin selección segun el tipo de elemento.
	*/
	eliminarElementos(){
		var checkbox = '#myModalPresupuesto input:checked';
		var elementos_cs = this.get('ecs');
		var servicios = this.get('sss');
		var materiales = this.get('mss');
		var codigo = '';
		//console.clear();
		$(checkbox).each(function() {
			codigo = $(this).val();
			$.each(elementos_cs.toArray(), function(i,elemento_cs){
				if (elemento_cs.codigo === codigo){
					if (elemento_cs.tag === 'servicio'){
						servicios.pushObject(elemento_cs);
					}else if(elemento_cs.tag === 'material'){
						materiales.pushObject(elemento_cs);
					}
					elementos_cs.removeObject(elemento_cs);
				}
			});

		});
		this.calcularMontoTotal();
	},
	/*
		calcularPrecioTotal: calcula la columna de precio total, se una fila del presupuesto, se le pasa el código del elemento
		para que pueda referenciar a los td input correspondientes.
	*/
	calcularPrecioTotal(codigo){
		var cant = "#cantidad_"+codigo;
		var pu = "#pu_"+codigo;
		var pt = "#pt_"+codigo;
		var ecs = this.get('ecs').toArray();
		//console.log($(cant).val() + " * " + $(pu).val());
		//console.log("hola");
		var precio_total =$(cant).val() * $(pu).val();
		$(pt).text(precio_total);

		var aux = $.extend(true, [], ecs.toArray());
		
		$.each(aux.toArray(),function(i,elemento){
			//console.log(elemento);
			if (elemento.codigo === codigo){
				elemento.cantidad = $(cant).val();
				elemento.precio_venta = $(pu).val();
				elemento.precio_act = elemento.precio_venta;
				elemento.precio_total = elemento.cantidad * elemento.precio_venta;
			}
		});
		this.set('ecs',aux);
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

		var elementos_cs = this.get('ecs');

		var cod_cs = [];
		//agregamos los codigos a un arreglo donde le agregamos "pt_" al inicio, para poder referenciar
		//la td en el precio total
		$.each(elementos_cs.toArray(),function(i,elemento_cs){
			cod_cs.push("pt_"+elemento_cs.codigo);
		});

		$("td[name='precio_total']").each(function(){
			if($.inArray($(this).attr('id'), cod_cs) !== -1){
				pt = parseFloat($(this).text());
				cont += pt;
			}
		});

		subtotal1 = cont;
		descuento = cont *(parseFloat(this.get('presupuesto.descuento') / 100));
		subtotalfinal =subtotal1 - descuento;
		iva = subtotalfinal * (0.12);
		total = subtotalfinal + iva;

		$("#subtotal1").text(subtotal1);
		$("#descuento").text(descuento);
		$("#subtotalfinal").text(subtotalfinal);
		$("#iva").text(iva);
		$("#total").text(total);

	},
	/*
		prepararPresupuesto: cuando el presupuesto va a ser guardado en el servidor, se debe preparar los datos antes de ser
		enviados, esta función realiza la preparacion de datos, sobre todo de materiales y servicios asociados.
	*/
	prepararPresupuesto(){
		var presupuesto = this.get('presupuesto');
		var proyecto = this.get('proyecto');
		var ecs = this.get('ecs').toArray();
		var aux = {
			codigo: '',
			cantidad: '',
			precio_venta: '',
		};

		presupuesto.codigo_pro = proyecto.codigo;
		presupuesto.fecha = moment().format("YYYY-MM-DD");
		presupuesto.servicios = [];
		presupuesto.materiales = [];
		$.each(ecs,function(i,elemento){
			aux.codigo = elemento.codigo;
			aux.cantidad = elemento.cantidad;
			aux.precio_venta = elemento.precio_venta;
			if (elemento.tag === 'servicio'){
				presupuesto.servicios.push($.extend(true, {}, aux));
			}else if(elemento.tag === 'material'){
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
		if(data.estatus === "Aprobado"){
			this.msgRespuesta("Error: ","Presupuesto ya aprobado no se puede editar.",-1,this);
		}else{
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			this.init();
		}
		$("#myModalPresupuesto").modal('hide');
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
		var checkbox = '#myModalReportes input:checked';
		var codigo_eta = this.get('etapa.codigo');
		var codigos = [];

		$(checkbox).each(function() {
			codigos.push($(this).val());
		});
		//console.log(codigos);
		var data = {
			'codigos':codigos,
		};
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
	generarPDF(tipo){
		//$("#modalBody").css('background', '#fff');

		function canvasSc(element){
		  var clone = element.cloneNode(true);
		  var style = clone.style;
		  style.position = 'relative';
		   style.top = window.innerHeight + 'px';
		  // style.width ='300 px';
		  style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var panel = document.getElementById(tipo);
		var clone = canvasSc(panel);
		var nombrepdf = this.get('proyecto.codigo')+"-listado-materiales-"+tipo+".pdf";
		//console.log($("#"+tipo).width());
		html2canvas(clone, {
		    onrendered: function(canvas) {
		     document.body.removeChild(clone);
		      var imgData = canvas.toDataURL(
                    'image/jpeg');             
                var doc = new jsPDF('p', 'mm', [320,480]);
                //var width = doc.internal.pageSize.width;    
				//var height = doc.internal.pageSize.height;
                doc.addImage(imgData, 'jpeg', 0, 0);//,width,height);
                doc.save(nombrepdf);
		    },
		});
	},
	generarPDFActa(nombre,modal){
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
			this.prepararModalPresupuesto(editing,presupuesto);
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
		openModalAgregarMS: function(){
			var seleccion = $("#anadir").val();
			this.prepararModalElementos(seleccion);
		},
		agregarElementos: function(tipo_e){
			this.agregarElementos(tipo_e);
		},
		eliminarElementos: function(){
			this.eliminarElementos();
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
		generarPDF:function(tipo){
			$("#exportar_mat_"+tipo).hide();
			this.generarPDF(tipo);
			$("#exportar_mat_"+tipo).show();
		},
		materialDesglose: function(){
			var method= "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/materiales/' ;
		    this.getElements(method,url,this.setDesglose,this);
		},
		generarPDFActa:function(tipo,modal){
			var nombre = nombre;
			if(tipo==="Entrega"){
				nombre = "acta entrega-"+this.get('proyecto.codigo') + '-'+this.get('etapa.letra') +'.pdf';
			}else if (tipo==="Culminacion"){
				nombre = "acta culminacion-" +this.get('proyecto.codigo') + '.pdf';
			}
			this.generarPDFActa(nombre,modal);
		}
	}
});
