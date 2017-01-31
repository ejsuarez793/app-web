import Ember from 'ember';

export default Ember.Controller.extend({
	proyecto: {},
	presupuesto: {},
	ecs: [],
	pe: {},
	msg: {
	},
	etapa:{},
	preguntas: [
		{
			nro:"1",
			pregunta:"En general, ¿Cómo calificaría la calidad del servicio brindado?",
			resp:"",
		},
		{
			nro:"2",
			pregunta:"¿Cómo calificaría el trabajo realizado por nuestros técnicos?",
			resp:"",
		},
		{
			nro:"3",
			pregunta:"¿El personal técnico demuestra flexibilidad y capacidad para hacer frente a imprevistos y dificultades?",
			resp:"",
		},
		{
			nro:"4",
			pregunta:"¿El tiempo de ejecución del proyecto fue el más óptimo?",
			resp:"",
		},
		{
			nro:"5",
			pregunta:"¿Cómo calificarías la relación precio/valor de nuestros servicios?",
			resp:"",
		},
		{
			nro:"6",
			pregunta:"¿Qué tan probable es que soliciten nuestros servicios en el futuro?",
			resp:"",
		},
		{
			nro:"7",
			pregunta:"¿Qué tan probable es que recomienden la compañia?",
			resp:"",
		},
	],
	desglose:{},
	materiales_disponibles : [],
	materiales_usados_etapas: [],
	materiales_usados_totales:[],


	init(){
		this._super();
		if (this.get('codigo')!==null && this.get('codigo')!==undefined){
			if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
				this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
			}
			var method = "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('codigo') + '/';
		    this.getElements(method,url,this.setProyecto,this);
		}
	},
	validarCampos: function(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod("customemail", 
          function(value/*, element*/) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        }, "Por favor ingrese un correo válido");

		$("#formulario").validate({
			rules:{
				atencion_n:{
					required:true,
					maxlength: 75,
				},
				atencion_e:{
					required:true,
					customemail: true,
				},
				desc:{
					required:true,
					maxlength: 200,
				},
				observ:{
					maxlength: 300,
				},
				cond_g:{
					maxlength: 500,
				},
				validez_o:{
					required:true,
					number:true,
					min: 1,
				},
				cond_p:{
					maxlength: 500,
				},
				descuento:{
					required:true,
					number:true,
					range: [0, 100],
				}
			},
			messages:{
				atencion_n:{
					required:'Este campo es requerido.',
					maxlength: 'Longitud máxima de 75 caracteres',
				},
				atencion_e:{
					required:'Este campo es requerido.',
				},
				desc:{
					required:'Este campo es requerido.',
					maxlength: 'Longitud máxima de 200 caracteres',
				},
				observ:{	
					maxlength: 'Longitud máxima de 300 caracteres',
				},
				cond_g:{
					maxlength: 'Longitud máxima de 500 caracteres',
				},
				validez_o:{
					required:'Este campo es requerido.',
					number:'Por favor solo números',
					min: 'Al menos 1 día hábil de validez.',
				},
				cond_p:{
					maxlength: 'Longitud máxima de 500 caracteres',
				},
				descuento:{
					required:'Este campo es requerido.',
					number:'Por favor solo números',
					range: 'Rango no válido, rango válido del 0 - 100%',
				}
			},
			errorElement: 'small',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
				error.insertAfter(element);
				//element.parent().parent().find("small").css('display', 'inline');	 
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
	validarCausaRechazo(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$("#formulario_cr").validate({
			rules:{
				causa_rechazo:{
					required:true,
					maxlength: 200,
				}
			},
			messages:{
				causa_rechazo:{
					required:'Este campo es requerido.',
					maxlength: 'Longitud máxima de 200 caracteres',
				},
			},
			errorElement: 'small',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
				error.insertAfter(element);
				//element.parent().parent().find("small").css('display', 'inline');	 
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
	validarEncuesta(){
		$("#formulario_enc").validate({
			rules:{
				resp1:{
					required:true,
				},
				resp2:{
					required:true,
				},
				resp3:{
					required:true,
				},
				resp4:{
					required:true,
				},
				resp5:{
					required:true,
				},
				resp6:{
					required:true,
				},
				resp7:{
					required:true,
				},
			},
			messages:{
				resp1:{
					required:'Por favor responder pregunta.',
				},
				resp2:{
					required:'Por favor responder pregunta.',
				},
				resp3:{
					required:'Por favor responder pregunta.',
				},
				resp4:{
					required:'Por favor responder pregunta.',
				},
				resp5:{
					required:'Por favor responder pregunta.',
				},
				resp6:{
					required:'Por favor responder pregunta.',
				},
				resp7:{
					required:'Por favor responder pregunta.',
				},
			},
			errorElement: 'small',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
				error.insertAfter(element.closest('.form-group'));
				error.css('color', '#a94442');	
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
			console.log(response);
			context.init();
			callback('Exito: ',response.msg,1,context);
		})    
		.fail(function(response) { 
			console.log(response);
			callback('Error: ',response.responseText,-1,context);
		});
	},
	setProyecto(proyecto,context){
		console.log(proyecto);
		var _this = context;
		_this.set('proyecto',proyecto);
		var method = "GET";
		var url = window.serverUrl + '/proyecto/' + _this.get('proyecto.codigo') + '/materiales/' ;
		_this.getElements(method,url,_this.setDesglose,_this);

		$.each(proyecto.presupuestos,function(i,presupuesto){
			if (presupuesto.estatus ==="Aprobado"){
				presupuesto.noAprobado = false;
			}else{
				presupuesto.noAprobado = true;
			}
		});
		if (proyecto.estatus==="Preventa"){
			proyecto.preventa=true;
		}else if (proyecto.estatus==="Aprobado"){
			proyecto.aprobado=true;
		}else if(proyecto.estatus==="Ejecucion"){
			proyecto.ejecucion=true;
		}else if(proyecto.estatus==="Rechazado"){
			proyecto.rechazado=true;
		}
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

		var propValue;
		var materiales_x_etapa = [];
		for(var propName in usados_efectivamente) {
		    //propValue = nyc[propName]
		    $.each(this.get('proyecto.etapas'),function(i,etapa){
		    	//console.log(etapa);
		    	if (etapa.codigo === parseInt(propName)){
		    		//console.log(etapa.nombre);
		    		aux = $.extend(true,{},etapa); 
		    		aux['materiales'] = []
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
	openModalPresupuesto(presupuesto, editing){
		var ecs = [];
		var materiales;
		var servicios;
		var aux = {};
		var _this = this;
		var pe = {};
		if (!editing){
			this.set('editing',false);
		}else{
			this.set('editing', true);
		}
	//	if (!editing){
		pe = $.extend(true,pe,presupuesto);
			this.set('presupuesto',pe);
			this.set('pe',pe);
			//this.set('pe',presupuesto);
			materiales = presupuesto.materiales;
			servicios = presupuesto.servicios;
			$.each(materiales, function(i,material){
				aux = {};
				aux.codigo = material.codigo_mat;
				aux.desc = material.desc;
				aux.cantidad = material.cantidad;
				aux.precio_venta = material.precio_venta;
				aux.precio_total =  material.precio_venta * material.cantidad;
				ecs.pushObject(aux);
			});
			$.each(servicios, function(i,servicio){
				aux = {};
				aux.codigo = servicio.codigo_ser;
				aux.desc = servicio.desc;
				aux.cantidad = servicio.cantidad;
				aux.precio_venta = servicio.precio_venta;
				aux.precio_total =  servicio.precio_venta * servicio.cantidad;
				ecs.pushObject(aux);
			});
			this.set('ecs',ecs);
			$('#myModalPresupuesto').on('shown.bs.modal', function () {

	  			_this.calcularMontoTotal();
	  			
			});

			$("#myModalPresupuesto").modal('show');
		//}else if (editing){
			//console.log("editando");
		//}
	},
	guardarPresupuesto(presupuesto, estatus){
		var method;
		var url;
		var data = {};
		method = "PUT";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/presupuesto/' +presupuesto.codigo+'/';
		$.extend(true,data,this.get('pe'));
		data.estatus = estatus;
		data.ci_vendedor = Cookies.getJSON('current').ci;
		this.validarCampos();
        if ($("#formulario").valid()){
        	//console.log(Cookies.getJSON('current').ci);
        	this.llamadaServidor(method,url,data,this.msgRespuesta,this);
        }
        $("#myModalPresupuesto").modal('hide');
	},
	generarPDF(codigo){
		$("#modalBody").css('background', '#fff');

		function canvasSc(element){
		  var clone = element.cloneNode(true);
		  var style = clone.style;
		  style.position = 'relative';
		  style.top = window.innerHeight + 'px';
		  style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var modalBody = document.getElementById('modalBody');
		var clone = canvasSc(modalBody);
		var nombrepdf = "presupesto-"+codigo+".pdf";

		html2canvas(clone, {
		    onrendered: function(canvas) {
		     document.body.removeChild(clone);
		      var imgData = canvas.toDataURL(
                    'image/jpeg');             
                var doc = new jsPDF('1', 'pt',"letter");
                var width = doc.internal.pageSize.width;    
				//var height = doc.internal.pageSize.height;
                doc.addImage(imgData, 'jpeg', 0, 0,width,width);
                doc.save(nombrepdf);
		    },
		});
	},
	procesarProyecto(proyecto,estatus){
		var method;
		var url;
		var data = {};
		method = "PATCH";
		url = window.serverUrl + /proyecto/ + proyecto.codigo + '/estatus/';
		data.codigo=proyecto.codigo;
		data.estatus=estatus;
		if(proyecto.presupuestos===undefined || proyecto.presupuestos===null || proyecto.presupuestos.length===0){
			this.msgRespuesta("Error ", "No se puede completar la acción al no poseer presupuestos.",-1,this);
		}else{
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	},
	msgRespuesta(tipo,desc,estatus,context){
		var clases = ['alert-danger','alert-warning','alert-success'];
		var _this = context;
		/*if (estatus==-1){
			console.log(estatus);
		}else if (estatus==0){
			console.log(estatus);
		}else if(estatus==1){
			console.log(estatus);
		}*/
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
	guardarCausaRechazo(){
		var method;
		var url;
		var data = {};
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/causaRechazo/';
		data.codigo_pro=this.get('proyecto.codigo');
		data.desc = this.get('causa_rechazo');
		this.validarCausaRechazo();
		if ($("#formulario_cr").valid()){
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
	},
	verEncuesta(){
		var respuestas = this.get('proyecto.encuesta.preguntas').toArray();
		var radio_id;
		console.log(respuestas);
		$.each(respuestas,function(i,respuesta){
			radio_id = "#resp" +(i+1)+"_"+respuesta.respuesta;
			$(radio_id).prop("checked",true);
			for (var j = 1 ; j <= 5 ;j++ ){
				$("#resp"+(i+1)+"_"+j).prop("disabled",true);
			}
		});
	},
	guardarRespuestasEncuentas(){
		var encuesta = {
			nombre: "Encuesta de satisfación Proyecto"+this.get('proyecto.nombre'),
			codigo_pro:this.get('proyecto.codigo'),
			completado:true,
		};
		/*var pregunta = {
			pregunta:'',
			respuesta:'',
		};*/
		var preguntas =[];
		var aux_n;
		$.each(this.get('preguntas').toArray(), function(i,pregunta){
			aux_n = 'resp' + pregunta.nro;
			preguntas.push({
				'pregunta': pregunta.pregunta,
				'respuesta': $('input[name='+ aux_n +']:checked').val(),
			});
		});
		

		var method;
		var url;
		var data = {};
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/encuesta/';
		data.encuesta = encuesta;
		data.preguntas = preguntas;
		this.validarEncuesta();
		if($("#formulario_enc").valid()){
			//console.log("valido");
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			$("#myModalEncuesta").modal('hide');	
		}

	},
	selectEtapaFactura(){
		//console.log("select factura");
		var codigo_eta = $("#select_etapa").val();
		var etapas = this.get('proyecto.etapas').toArray();
		var _this = this;
		$.each(etapas,function(i,etapa){
			if (parseInt(codigo_eta) === etapa.codigo){
				$("#nombre_eta").val(etapa.nombre);
				_this.set('etapa', etapa);
			}
		});

		//console.log(codigo_eta);
	},
	openModalFactura(editing){
		this.set('editing',editing);
		$("#myModalFactura").modal('show');
		var factura = {
			nombre_cliente:'',
			rif_cliente:'',
			tlf1_c:'',
			tlf2_c:'',
			fax_c:'',
			dire_c:'',
			nro_factura:'',
			nro_control:'',
			f_emi:'',
			f_ven:'',
			nombre_v:'',
			cond_pago: '',
			persona_cc:'',
			email_cc:'',
			cargo_cc:'',
			departamento_cc:'',
			materiales:[],
			pagada:false,
			banco_dest:'',
			nro_ref:'',
			codigo_pre:'',
			codigo_eta:'',
		};
		var servicios = [];
		var materiales = [];
		var etapa = this.get('etapa');
		var reportes;
		if (etapa.reportes!==undefined){
			reportes = etapa.reportes.toArray();
		}
		$.each(reportes,function(i,reporte){
			$.each(reporte.servicios,function(i,servicio){
				var flag = false;
				$.each(servicios,function(i,serv_incluido){
					if (servicio.codigo ===serv_incluido.codigo){
						serv_incluido.cantidad += servicio.cantidad;
						flag=true;
					}
				});
				if (!flag){
					var aux = $.extend(true,{},servicio);
					servicios.push(aux);
				}
			});
		});
		//console.log(this.get('materiales_usados_etapas'));
		$.each(this.get('materiales_usados_etapas').toArray(),function(i,mue){
			if (mue.codigo===etapa.codigo){
				$.each(mue.materiales,function(i,material){
					var aux = $.extend(true,{},material);
					materiales.push(aux);
				});
			}
		});
		console.log(materiales);
		//console.log("iplementar");
		//console.log(editing);
	},
	actions:{
		openModalPresupuesto: function(presupuesto, editing){
			this.openModalPresupuesto(presupuesto, editing);
		},
		guardarPresupuesto: function(presupuesto, estatus){
			this.guardarPresupuesto(presupuesto,estatus);
		},
		generarPDF: function(codigo){
       		this.generarPDF(codigo);
		},
		procesarProyecto:function(proyecto,estatus){
			this.procesarProyecto(proyecto,estatus);
		},
		guardarCausaRechazo: function(){
			this.guardarCausaRechazo();
		},
		openModalEncuesta: function(llenando){
			if (!llenando){
				this.verEncuesta();
			}
			$("#myModalEncuesta").modal('show');
		},
		guardarRespuestasEncuentas: function(){
			this.guardarRespuestasEncuentas();
		},
		cerrarMsg:function(){
			$("#alertMsg").hide();
		},
		selectEtapaFactura(){
			this.selectEtapaFactura();
		},
		openModalFactura(editing){
			this.openModalFactura(editing);
		}
	}
});
