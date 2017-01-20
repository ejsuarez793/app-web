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

		    url = window.serverUrl + '/material/';
		    this.getElements(method,url,this.setMateriales,this);

		    url = window.serverUrl + '/servicio/';
		    this.getElements(method,url,this.setServicios,this);

		    this.set('presupuesto.fecha',moment().format("DD/MM/YYYY"));//esta no es tan necesaria, ya que para mostrar esta fecha_f
		    this.set('presupuesto.fecha_m',moment().format("LL"));
		}
	},
	validarPG(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
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

		$("#formulario_pe").validate({
			rules:{
				nombre:{
					required:true,
					maxlength:100,
				},
				f_est:{
					required:true,
					date:true,
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
	setProyecto(proyecto,context){
		var _this = context;
		_this.set('proyecto',proyecto);
		//console.log(proyecto);
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
		console.log(this.get('desglose'));
		var desglose = this.get('desglose');
		var disponibles = [];
		var usados_e = {};
		var usados_efectivamente = {};
		var flag = false; // usada para saber si un material no fue sumado/restado en la iteracion de usados efectivamente
		var aux;

		//aqui organizo los egresados y retornados por etapas, para luego sacar los usados efectivamente en cada etapa.
		$.each(desglose.egresados.toArray(),function(i,egresado){
			if (usados_e[egresado.codigo_eta]===null || usados_e[egresado.codigo_eta]===undefined){
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
		console.log(usados_e);

		//ahora resto los elementos
		$.each(usados_e,function(i,usado_e){
			flag = false;
			if (usados_efectivamente[usado_e.codigo_eta]===null || usados_e[usado_e.codigo_eta]===undefined){
				usados_efectivamente[usado_e.codigo_eta] = [];
			}
			$.each(usados_efectivamente[usado_e.codigo_eta],function(i,usado_efectivamente){
				if(usado_efectivamente.codigo_mat === usado_e.codigo_mat){
					if(usado_e.tipo_mov === "Egreso"){
						usados_efectivamente.cant = usados_efectivamente.cant - usado_e.cant;
					}else if(usados_e.tipo_mov === "Retorno"){
						usados_efectivamente.cant = usados_efectivamente.cant + usado_e.cant;
					}
					flag=true;
				}
			});
			if(!flag){
				aux = $.extend(true,{},usado_e);
				usados_efectivamente[usado_e.codigo_eta].push(aux);
			}
		});

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


		//finalizando restamos los disponibles del presupuesto con los usados efectivamente en cada etapa
		$.each(disponibles,function(i,disponible){
			//for (var etapa in usados_efectivamente) {
			$.each(usados_efectivamente, function(i,etapa){
				if (usados_efectivamente.hasOwnProperty(etapa)) {
			  	$.each(usados_efectivamente[etapa],function(i,usado_efectivamente){
			  		if(disponible.codigo_mat === usado_efectivamente.codigo_mat){
			  			disponible.cant = disponible.cant - usado_efectivamente.cant;
			  		}
				});
			  }
			});
			  /*if (usados_efectivamente.hasOwnProperty(etapa)) {
			  	$.each(usados_efectivamente[etapa],function(i,usado_efectivamente){
			  		if(disponible.codigo_mat === usado_efectivamente.codigo_mat){
			  			disponible.cant = disponible.cant - usado_efectivamente.cant;
			  		}
				});
			  }*/
			//}
		});

		console.log(disponibles);

	},
	ordenar(prop, asc,array) {
			/*if (prop==="precio_act" || prop==="cantidad"){
				array = array.sort(function(a, b) {
		        if (asc) {
		            return ( parseFloat(a[prop]) > parseFloat(b[prop]) ) ? 1 : (( parseFloat(a[prop]) < parseFloat(b[prop]) )? -1 : 0);
		        } else {
		            return (parseFloat(b[prop]) > parseFloat(a[prop])) ? 1 : (( parseFloat(b[prop]) < parseFloat(a[prop])) ? -1 : 0);
		        }
		    });
			}else{*/
		    array = array.sort(function(a, b) {
		        if (asc) {
		            return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : ((a[prop].toLowerCase() < b[prop].toLowerCase()) ? -1 : 0);
		        } else {
		            return (b[prop].toLowerCase() > a[prop].toLowerCase()) ? 1 : ((b[prop].toLowerCase() < a[prop].toLowerCase()) ? -1 : 0);
		        }
		    });
		/*}*/
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
			fecha_m:'',
			validez_o: '5',
			descuento: '50',
			observ: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.',
			desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu',
			atencion_n: 'Ing Pedro Perez',
			atencion_e: 'pperez@provincial.com',
			materiales: [],
			servicios:[],
			cond_g:'Del fabricante.-',
			cond_p: 'Precio sujeto a cambios sin previo aviso, dependerá de la alta rotación de inventario y disponibilidad.-\nEstos precios no incluyen transporte fuera del área metropolitana de Caracas.-\nEstos precios incluyen el Impuesto al Valor Agregado (IVA).-\n',
			t_ent: 'Previa planificación con el cliente final.-',
		};
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
		console.log(response);
		if (response.tipo === "Sin Disponibilidad"){
			response.sin_disponibilidad = true;
		}
		context.set('disponibilidad_material',response);
	},
	aprobarSolicitud(solicitud){
		//console.log(solicitud);
		var codigo_pro = this.get('proyecto.codigo');
		var method = "POST";
		var url = window.serverUrl +'/proyecto/'+codigo_pro+'/solicitud/' +solicitud.codigo+'/aprobar/';
		var data = this.get('disponibilidad_material.disponible');
		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
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
		procesar: procesa la llamada al servidor para salvar el presupuesto.
	*/
	procesar(){
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
		this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		this.init();
	},
	openModalGeneral(){
		this.set('pg.nombre',this.get('proyecto.nombre'));
		this.set('pg.desc',this.get('proyecto.desc'));
		this.set('pg.ubicacion',this.get('proyecto.ubicacion'));
		this.set('pg.f_est',this.get('proyecto.f_est'));

		$("#myModalGeneral").modal('show');
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
		//console.log("implementar modal reportes");
		var aux = $.extend(true,{},etapa);
		$.each(aux.reportes,function(i,reporte){
			if (reporte.leido){
				reporte.estado = "";
			}else{
				reporte.estado = "Nuevo!";
			}
		});
		this.set('etapa',aux);
		$("#myModalReportes").modal('show');
	},
	openModalActividades:function(etapa){
		//console.log(etapa);
		this.set('etapa',etapa);
		if (etapa.actividades.length === 0){
			this.set('sin_actividades',true);
			var nuevas_actividades = this.get('nuevas_actividades');
			this.set('na.nro',nuevas_actividades.length + 1);
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
		this.validarPG();
        if ($("#formulario_pg").valid()){
        	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        }
	},
	guardarPE(){
		var method;
		var url;
		var data = {};
		$.extend(true,data,this.get('pe'));
		if (this.get('editing_pe')){
			method = "PATCH";
			url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/' +data.codigo+'/';
		}else{
			method = "POST";
			url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/';
		}
		this.validarPE();
        if ($("#formulario_pe").valid()){
        	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        }
        $("#myModalEtapa").modal('hide');
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
		var url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/' +codigo_eta+'/reporte/';
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

		console.log(this.get('nuevas_actividades'));
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
		console.log(data);
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') +'/etapa/' +this.get('etapa.codigo')+'/actividad/';
        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        $("#myModalActividades").modal('hide');
	},
	actions: {
		procesar:function(){
			this.procesar();
		},
		ordenarPor: function(property,presupuestos) {
			this.ordenarPor(property,presupuestos);
    	},
    	openModalGeneral:function(){
    		this.openModalGeneral();
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
		guardarPE: function(){
			this.guardarPE();
		},
		guardarActividades:function(){
			this.guardarActividades();
		},
		llenarReporteDetalle: function(){
			//console.log(this.get('proyecto.etapas'));
			var codigo = this.get('proyecto.etapas').toArray()[0].codigo;
			var data = {
				persona_a: 'Miguel Perez',
				cargo_a:'Vigilante',
				nombre_t: 'Enrique Suarez',
				vicios_ocu:'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu',
				observ:'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu',
				compleado:'true',
			};
			var method = "POST";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/etapa/' + codigo + '/reporteDetalle/';
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		},
		crearReporte: function(etapas){
			//console.log("creado" + etapas[0].codigo);
			var codigo_eta = etapas[0].codigo;
			var tipos = ['Avance','Problema','Otro'];
			var nombre_t = "Enrique Suarez";
			var observ = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.';
			//console.log(Math.floor(Math.random() * 2));
			var tipo = tipos[Math.floor(Math.random() * 3)];

			var data = {
				'codigo_eta' : codigo_eta,
				'tipo':tipo,
				'nombre_t':nombre_t,
				'observ':observ,
			};

			//console.log(data);

			var method = "POST";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/etapa/' + codigo_eta + '/reporte/';
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		},
		materialDesglose: function(){
			var method= "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/materiales/' ;
		    this.getElements(method,url,this.setDesglose,this);
		},
		agregarMaterialSolicitud: function(){
			var prueba = this.get('prueba');

			this.get('solicitud_material_prueba').pushObject(prueba);
			this.set('prueba',{});
			console.clear();
			console.log(this.get('solicitud_material_prueba'));
		},
		guardarSolicitud:function(){
			console.log("implemetar guardar solicitud");
			var data={};
			data.otros ={
				"ci_tecnico":208034,
				"codigo_eta":8,
			};
			data.materiales= [];
			var materiales = this.get('solicitud_material_prueba').toArray();
			$.extend(true,data.materiales,materiales);
			console.log(data);
			var method = "POST";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo') + '/etapa/' +8 +'/solicitud/';
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	}
});
