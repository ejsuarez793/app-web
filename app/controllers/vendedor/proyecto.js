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
			pregunta:"¿Qué tan probable es que recomienden la compañía?",
			resp:"",
		},
	],
	factura:{},
	pago:{},


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
					maxlength: 500,
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
					maxlength: 'Longitud máxima de 500 caracteres',
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
	validarFactura(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod("mayorQue", function (value, element, params) {
				return new Date(value) >= new Date($(params).val());
		});

		$("#formulario_factura").validate({
			rules:{
				nro_factura:{
					required:true,
					number:true,
				},
				nro_control:{
					required:true,
					number:true,
				},
				f_emi:{
					required:true,
					mayorQue:"#f_hoy",
				},
				f_ven:{
					required:true,
					mayorQue:"#f_emi",
				},
				cond_pago:{
					required:true,
				},
				codigo_pre:{
					required:true,
				},	
				persona_cc:{
					required:true,
					maxlength:100,
				},
				departamento_cc:{
					required:true,
					maxlength:100,
				},
				nro_orden:{
					required:true,
					maxlength:100,
				},
			},
			messages:{
				nro_factura:{
					required:'Este campo es requerido.',
					number:'Solo números por favor.',
				},
				nro_control:{
					required:'Este campo es requerido.',
					number:'Solo números por favor.',
				},
				f_emi:{
					required:'Este campo es requerido.',
					mayorQue:'La fecha seleccionada debe ser mayor o igual a la fecha de hoy.',
				},
				f_ven:{
					required:'Este campo es requerido.',
					mayorQue:'La fecha seleccionada debe ser mayor o igual que la fecha de emisión.',
				},
				cond_pago:{
					required:'Este campo es requerido.',
				},
				codigo_pre:{
					required:'Este campo es requerido.',
				},	
				persona_cc:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
				},
				departamento_cc:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
				},
				nro_orden:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
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
	validarPagoFactura(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$("#formulario_pago").validate({
			rules:{
				banco_dest:{
					required:true,
					maxlength:100,
				},
				nro_ref:{
					required:true,
					maxlength:100,
				},
			},
			messages:{
				banco_dest:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
				},
				nro_ref:{
					required:'Este campo es requerido.',
					maxlength:'Longitud máxima de 100 caracteres.',
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
		.fail(function(response) { context.msgRespuesta("Error: ",response.responseText,-1,context); }); 
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
	setProyecto(proyecto,context){
		//console.log(proyecto);
		var _this = context;
		_this.set('proyecto',proyecto);

		$.each(proyecto.presupuestos,function(i,presupuesto){
			if (presupuesto.estatus === "Aprobado" || presupuesto.estatus === "Cerrado" || proyecto.estatus === "Culminado" || proyecto.estatus === "Rechazado"){
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
		}else if (proyecto.estatus ==="Culminado"){
			proyecto.culminado=true;
		}
	},
	setFactura(response, context){
		//console.log(response);
		response.detalle.fecha_emi_mostrar = moment(response.detalle.fecha_emi).format('L');
		response.detalle.fecha_ven_mostrar = moment(response.detalle.fecha_ven).format('L');
		$.each(response.elementos,function(i,elemento){
			elemento.precio_unitario_mostrar = numeral(elemento.precio_unitario).format('0,0.00');
			elemento.precio_total_mostrar = numeral(elemento.precio_total).format('0,0.00');
		})
		response.subtotal1_mostrar = numeral(response.subtotal1).format('0,0.00');
		response.descuento_mostrar = numeral(response.descuento).format('0,0.00');
		response.subtotal_final_mostrar = numeral(response.subtotal_final).format('0,0.00');
		response.iva_mostrar = numeral(response.iva).format('0,0.00');
		response.total_mostrar = numeral(response.total).format('0,0.00');
		response.f_hoy = moment().format('YYYY-MM-DD');
		context.set('factura',response);
		//console.log(response);
		if (response.detalle.facturada!==undefined || response.detalle.facturada!==null){
			if (response.detalle.facturada===true){
				context.set('editing',false);
			}else{
				context.set('editing',true);
			}
		}else{
			context.set('editing',true);
		}
		//context.set('factura.f_hoy',moment().format('YYYY-MM-DD'));
		$("#myModalFactura").modal('show');
	},
	
	calcularMontoTotal(){
		var subtotal1; //= parseFloat($("#subtotal1").text())*/;
		var descuento; //= parseFloat($("#descuento").text())*/;
		var subtotalfinal; /*= parseFloat($("#subtotalfinal").text())*/
		var iva; /*= parseFloat($("#iva").text())*/
		var total; /*= parseFloat($("#total").text())*/
		var cont = 0.0;
		var pt = 0.0;
		//agregamos los codigos a un arreglo donde le agregamos "pt_" al inicio, para poder referenciar
		//la td en el precio total
		var materiales = $.extend(true, [], this.get('presupuesto.materiales').toArray());
		var servicios = $.extend(true, [], this.get('presupuesto.servicios').toArray());

		/*console.log(materiales);
		console.log(servicios);*/
		//console.log(this.get('presupuesto'));
		var codigos = [];
		//agregamos los codigos a un arreglo donde le agregamos "pt_" al inicio, para poder referenciar
		//la td en el precio total
		$.each(materiales,function(i,elemento){
			cont = cont +(elemento.cantidad * parseFloat(elemento.precio_venta)); /*codigos.push("pt_"+elemento.codigo_mat);*/
		});
		$.each(servicios,function(i,elemento){
			cont = cont +(elemento.cantidad * parseFloat(elemento.precio_venta)); /*codigos.push("pt_"+elemento.codigo_ser);*/
		});
		//console.log(codigos);
		/*$("td[name='precio_total']").each(function(){
			if($.inArray($(this).attr('id'), codigos) !== -1){
				pt = parseFloat($(this).text());
				//console.log(pt);
				cont += pt;
			}
		});*/

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
		pe = $.extend(true,pe,presupuesto);
		pe.fecha_mostrar = moment(pe.fecha).format('LL');


		$.each(pe.materiales ,function(i,elemento){
			elemento.precio_total = elemento.cantidad * elemento.precio_venta;
			elemento.precio_venta_mostrar = numeral(elemento.precio_venta).format('0,0.00');
			elemento.precio_total_mostrar = numeral(elemento.precio_total).format('0,0.00');
		});
		$.each(pe.servicios ,function(i,elemento){
			elemento.precio_total = elemento.cantidad * elemento.precio_venta;
			elemento.precio_venta_mostrar = numeral(elemento.precio_venta).format('0,0.00');
			elemento.precio_total_mostrar = numeral(elemento.precio_total).format('0,0.00');
		});
			this.set('presupuesto',pe);
			this.set('pe',pe);
			//this.set('pe',presupuesto);
			
			$('#myModalPresupuesto').on('shown.bs.modal', function () {

	  			_this.calcularMontoTotal();
	  			
			});

			$("#myModalPresupuesto").modal('show');
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
		//console.log(data);
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
		 // style.top = window.innerHeight + 'px';
		  //style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var modalBody = document.getElementById('modalBody');
		var originalStyle = modalBody.style; //copiamos el estilo original ya que una vez finalizado la generacion debemos devolverle al panel
								 //su ancho y largo original

		//modificamos el ancho y largo del modal
		modalBody.style.width = '754px';
		modalBody.style.height = '1054px';
		var clone = canvasSc(modalBody);
		var nombrepdf = "presupuesto-"+codigo+".pdf";

		html2canvas(clone, {
		    onrendered: function(canvas) {
		     document.body.removeChild(clone);
		      var imgData = canvas.toDataURL(
                    'image/jpeg');             
                var doc = new jsPDF('p', 'mm',[210, 297]);
                var width = doc.internal.pageSize.width;    
				var height = doc.internal.pageSize.height;
                doc.addImage(imgData, 'jpeg', 0, 0,width,height);
                doc.save(nombrepdf);
		    },
		});

		modalBody.style=originalStyle;
	},
	generarPDFNuevoMetodo(){
		var presupuesto = this.get('presupuesto');
		var cliente = this.get('proyecto.cliente');
		var datosPDF = {};
		datosPDF.fecha = moment(presupuesto.fecha).format('LL');
		datosPDF.codigo = presupuesto.codigo;
		datosPDF.cliente_rif = cliente.rif;
		datosPDF.cliente_nombre = cliente.nombre;
		datosPDF.cliente_tlf = cliente.tlf1;
		datosPDF.atencion = presupuesto.atencion_n;
		datosPDF.email = presupuesto.atencion_e;
		datosPDF.detalle = $.extend(true,[],[]); 
		//datosPDF.servicios
		datosPDF.observ  = presupuesto.observ;
		datosPDF.subtotal1 = 0.0;
		datosPDF.descuento_p;
		datosPDF.descuento;
		datosPDF.subtotalfinal;
		datosPDF.iva;
		datosPDF.total;
		datosPDF.condiciones_generales = presupuesto.cond_g
		//datosPDF.condiciones_pago = presupuesto.cond_pago
		datosPDF.dias = presupuesto.validez_o;
		datosPDF.condiciones_precios = presupuesto.cond_p
		datosPDF.tiempo_entrega = presupuesto.t_ent
		datosPDF.nombre = Cookies.getJSON('current').nombre1;
		datosPDF.apellido = Cookies.getJSON('current').apellido1;

		var aux;
		var subtotal1 = 0.0;
		var descuento_p;
		var descuento;
		var subtotalfinal;
		var iva;
		var total;

		
		$.each(presupuesto.materiales,function(i,material){
			//aux =;
			/*aux['codigo'] = material.codigo_mat;
			aux['desc'] = material.desc;
			aux['cantidad'] = material.cantidad;
			aux['pu'] = material.precio_venta_mostrar;
			aux['pt'] = material.precio_total_mostrar;*/
			datosPDF.subtotal1 += material.precio_total;

			aux = [{text:material.codigo_mat, noWrap: true}, 
			{text: material.desc}, 
			{text: material.cantidad, noWrap: true, alignment:'center'}, 
			{text: material.precio_venta_mostrar, style:'numero'}, 
			{text:material.precio_total_mostrar, style:'numero'}]
			datosPDF.detalle.push($.extend(false,[],aux));
		});

		$.each(presupuesto.servicios,function(i,servicio){
			/*aux = {};
			aux['codigo'] = servicio.codigo_ser;
			aux['desc'] = servicio.desc;
			aux['cantidad'] = servicio.cantidad;
			aux['pu'] = servicio.precio_venta_mostrar;
			aux['pt'] = servicio.precio_total_mostrar;*/
			datosPDF.subtotal1 += servicio.precio_total;
			aux = [{text:servicio.codigo_ser, noWrap: true}, 
			{text: servicio.desc}, 
			{text: servicio.cantidad, noWrap: true, alignment:'center'}, 
			{text: servicio.precio_venta_mostrar, style:'numero'}, 
			{text:servicio.precio_total_mostrar, style:'numero'}]
			datosPDF.detalle.push($.extend(false,[],aux));
		});

		
		var body = [];
		$.each(datosPDF.detalle,function(i,detalle){

				body.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
		
		});
		//console.log(detalles);

		datosPDF.descuento_p = presupuesto.descuento+"%"; 

		subtotal1 = datosPDF.subtotal1;
		descuento = datosPDF.subtotal1 *(parseFloat(presupuesto.descuento / 100));
		subtotalfinal =subtotal1 - descuento;
		iva = subtotalfinal * (0.12);
		total = subtotalfinal + iva;

		datosPDF.subtotal1 = numeral(subtotal1).format('0,0.00');
		datosPDF.descuento =  numeral(descuento).format('0,0.00');
		datosPDF.subtotalfinal =numeral (subtotalfinal).format('0,0.00');
		datosPDF.iva = numeral (iva).format('0,0.00');
		datosPDF.total = numeral(total).format('0,0.00');

		body.unshift([
			{text: 'Código', style: 'tableHeader'}, 
			{text: 'Descripción', style: 'tableHeader'}, 
			{text: 'Cant', style: 'tableHeader'},
			{text: 'Precio Unit.', style: 'tableHeader'}, 
			{text: 'Precio Total', style: 'tableHeader'}
		]);
		//console.log(detalles);
		//console.log(detalles.map(function(x){return x}));
		/*$.each(datosPDF.detalle,function(i,detalle){

		});*/
		//console.log(datosPDF.detalle =  JSON.parse(JSON.stringify(datosPDF.detalle.toString())))
		/*datosPDF.detalle.map(function(x) { console.log( x  ) });*/
		//console.log(datosPDF.detalle);
		
		//console.log(datosPDF.detalle);

		var docDefinition = {
			content: [
				/*{
				},*/
				{
					style: 'encabezado',
					table: {

						widths: ['*', 'auto'],
						body: [
							[
								{ text:'Sistelred, C.A.\rRIF J-30994445-2', bold: true}, 
								[
									{ text:'Cotización Nro:', bold: true},
									{ text:  datosPDF.codigo, bold:false}
								]
							],
							[
								'Guatire, ' + datosPDF.fecha,''
							],
							[
								[
									{ text:'Cotización a:', bold: true},
									{ text:datosPDF.cliente_rif + ', ' + datosPDF.cliente_nombre + ', tlf:' + datosPDF.cliente_tlf, bold:false}
								],
								''
							],
						],

					},
					layout: 'noBorders'
				},
				{text:'Atención: ' + datosPDF.atencion + ', e-mail: ' + datosPDF.email, style:'atencion'},
				{
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', '*','auto','auto','auto'],
						body:body,
					}
				},

				{
					style: 'tablaTotal',
					/*color: '#444',*/
					pageBreak: 'before',

					table: {
						widths: ['*', 'auto', 'auto'],
						//headerRows: 2,
						// keepWithHeaderRows: 1,

						body: [
							[{rowSpan: 5, text: [
				                    { text: 'Observaciones:\r', bold: true , fontSize:9},
				                    { text: datosPDF.observ , fontSize:9},
				                ]}, {text:'Sub Total 1:', bold:true,  style:'numero'}, {text:'Bs. ' + datosPDF.subtotal1,  style:'numero'}],
							['', {text:'Descuento (0%)', bold:true, style:'numero'},  {text:'Bs. ' + datosPDF.descuento,  style:'numero'}],
							['', {text:'Sub Total Final:', bold:true,  style:'numero'},  {text:'Bs. ' + datosPDF.subtotalfinal,  style:'numero'}],
							['', {text:'I.V.A (12%):', bold:true,  style:'numero'},  {text:'Bs. ' + datosPDF.iva,  style:'numero'}],
							['', {text:'TOTAL:', bold:true,  style:'numero'},  {text:'Bs. ' + datosPDF.total,  style:'numero'}],
							/*['Sample value 1', {colSpan: 2, rowSpan: 2, text: 'Both:\nrowSpan and colSpan\ncan be defined at the same time'}, ''],
							['Sample value 1', '', ''],*/
						]
					}
				},

				{text: 'Condiciones generales', style: 'condiciones'},
				{
					type: 'none',
					ol: [
						{text: datosPDF.condiciones_generales ,style:'elementoCondiciones'},
					]
						
				},
				{text: 'Validez de la oferta', style: 'condiciones'},
				{
					type: 'none',
					ol: [
						{text: '(' + datosPDF.dias + ') Días hábiles.-',style:'elementoCondiciones'},
					]
						
				},
				{text: 'Condiciones de precios', style: 'condiciones'},
				{
					type: 'none',
					ol: [
						{text: datosPDF.condiciones_precios ,style:'elementoCondiciones'},
					]
				},
				{text: 'Condiciones de pago', style: 'condiciones'},
				{
					type: 'none',
					ol: [
						{text: '70% Prepagado para adquisición de materiales, 30% Pagadero con la presentación de la factura final.-',style:'elementoCondiciones'},
						{text: 'Bs. Depositar en la CTA. CTE. # 0108-0989-42-0100009763, de Sistelred, C.A. en el Banco Provincial.-',style:'elementoCondiciones'},
						{text: 'Bs. Depositar en la CTA. CTE. # 0134-1085-200001000397, de Sistelred, C.A. en el Banco Banesco.-',style:'elementoCondiciones'},
						{text: 'Bs. Depositar en la CTA. CTE. # 0105-0225-01-1225042666, de Sistelred, C.A. en el Banco Mercantil.-',style:'elementoCondiciones'},
						{text: 'Bs. Depositar en la CTA. CTE. # 0163-0205-88-2052000177, de Sistelred, C.A. en el Banco del Tesoro.-',style:'elementoCondiciones'},
						{text: 'Bs. Depositar en la CTA. CTE. # 0115-0021-89-1004088046, de Sistelred, C.A. en el Banco Exterior.-',style:'elementoCondiciones'},
					]
				},
				{text: 'Tiempo de entrega', style: 'condiciones'},
				{
					type: 'none',
					ol: [
						{text: '100% Realizado.-',style:'elementoCondiciones'},
					]
						
				},
				{text: [
                    { text: 'Muy Atentamente,\n ' },
                    { text: 'Por: ',  style:'atentamente'},
                    { text: 'Sistelred, C.A.\n\n', bold: true },
                    { text: datosPDF.nombre + " " + datosPDF.apellido + '.\n' },
                    { text: 'Gerente de Ventas'},
                ],style:'atentamente'},

			],

			styles: {
				atencion:{
					fontSize:12,
					alignment: 'center'
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
				encabezado: {
					fontSize: 12,
					margin: [0, 5, 0, 5]
				},
				tablaTotal: {
					fontSize:9,
					margin: [0, 15 , 0, 15],
				},
				condiciones:{
					fontSize:9,
					bold:true,
					margin: [0, 10, 0, 10]
				},
				numero:{
					noWrap: true, 
					alignment:'right'
				},
				elementoCondiciones:{
					fontSize:9,
					margin: [0, 1, 0, 1]
				},
				atentamente:{
					fontSize:9,
					margin: [0, 10, 0, 10]
				}
			},
			footer: function(page, pages) { 
				    return { 
				        columns: [ 
				            { text: 'Presupuesto-PB27022017-2', italics: true , fontSize:8},
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
	generarFacturaPDF(nombre,modal){
		//console.log("entra");
		$("#"+modal).css('background', '#fff');
		function canvasSc(element){
		  var clone = element.cloneNode(true);
		  var style = clone.style;
		  style.position = 'relative';
		  //style.top = window.innerHeight + 'px';
		  //style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var modalBody = document.getElementById(modal);
		var originalStyle = modalBody.style; //copiamos el estilo original ya que una vez finalizado la generacion debemos devolverle al panel
								 			//su ancho y largo original

		//modificamos el ancho y largo del modal
		modalBody.style.width = '900px';
		modalBody.style.height = '1054px';
		var clone = canvasSc(modalBody);
		var nombrepdf = nombre;

		html2canvas(clone, {
		    onrendered: function(canvas) {
		     document.body.removeChild(clone);
		      var imgData = canvas.toDataURL(
                    'image/jpeg');             
                var doc = new jsPDF('p', 'mm',[239, 297]);
                //var width = doc.internal.pageSize.width;    
				//var height = doc.internal.pageSize.height;
                doc.addImage(imgData, 'jpeg', 0, 0);//,width,width);
                doc.save(nombrepdf);
		    },
		});

		modalBody.style  = originalStyle;
	},
	procesarProyecto(proyecto,estatus){
		var method;
		var url;
		var data = {};
		method = "PUT";
		url = window.serverUrl + /proyecto/ + proyecto.codigo + '/';
		data.codigo=proyecto.codigo;
		data.estatus=estatus;
		if((proyecto.presupuestos===undefined || proyecto.presupuestos===null || proyecto.presupuestos.length===0) && estatus==="Aprobado"){
			this.msgRespuesta("Error ", "No se puede completar la acción al no poseer presupuestos.",-1,this);
		}else{
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
		}
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
		//console.log(respuestas);
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
	selectPresupuestoFactura(){

		this.set('cod_pre',$("#select_presupuesto").val());
		//this.consultarFactura();
	},
	
	consultarFactura(){
		var method;
		var url;
		//var data = {};
		method = "GET";
		var codigo_eta = this.get('etapa.codigo');
		var codigo_pre =this.get('cod_pre');
		if (codigo_pre===undefined || this.get('etapa.facturada')===true){
			codigo_pre=null;
		}
		url = window.serverUrl + '/ventas/factura/consultar/' + codigo_eta + '/' +codigo_pre+'/';
		//this.validarCausaRechazo();
		//if ($("#formulario_cr").valid()){
			this.getElements(method,url,this.setFactura,this);
		//}
	},
	facturarEtapa(){
		//console.log(this.get('factura'));
		
		var factura = this.get('factura');
		var method = "POST";
		var url;
		var data = {};
		data.nro_factura = factura.nro_factura;
		data.nro_control = factura.nro_control;
		data.codigo_pre = factura.codigo_pre;
		data.codigo_eta = factura.codigo_eta;
		data.f_emi = factura.f_emi;
		data.f_ven  = factura.f_ven;
		data.persona_cc = factura.persona_cc;
		data.departamento_cc = factura.departamento_cc;
		data.nro_orden = factura.nro_orden;
		data.cond_pago = $("#select_cond_pago").val();
		data.pagada = false;
		data.monto_total = factura.total;
		url = window.serverUrl + '/ventas/factura/' + this.get('etapa.codigo') + '/';
		this.validarFactura();
		if ($("#formulario_factura").valid()){
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			$("#myModalFactura").modal('hide');
			this.init();
			//location.reload();
		}

	},
	/*openModalFactura(editing){
		this.set('editing',editing);
		$("#myModalFactura").modal('show');
		//var factura = {
		//	nombre_cliente:'',
		//	rif_cliente:'',
		//	tlf1_c:'',
		//	tlf2_c:'',
		//	fax_c:'',
		//	dire_c:'',
		//	nro_factura:'',
		//	nro_control:'',
		//	f_emi:'',
		//	f_ven:'',
		//	nombre_v:'',
		//	cond_pago: '',
		//	persona_cc:'',
		//	email_cc:'',
		//	cargo_cc:'',
		//	departamento_cc:'',
		//	elementos:[],
		//	pagada:false,
		//	banco_dest:'',
		//	nro_ref:'',
		//	codigo_pre:'',
		//	codigo_eta:'',
		//};
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

		$.each(this.get('materiales_usados_etapas').toArray(),function(i,mue){
			if (mue.codigo===etapa.codigo){
				$.each(mue.materiales,function(i,material){
					var aux = $.extend(true,{},material);
					materiales.push(aux);
				});
			}
		});

	},*/
	openModalPagoFactura(){
		$("#myModalPagoFactura").modal('show');

	},
	guardarPagoFactura(){
		var pago = this.get('pago');
		var method = "PATCH";
		var url;
		var data = {};
		data= $.extend(true,{},pago);
		data.pagada=true;
		//console.log(data);
		url = window.serverUrl + '/ventas/factura/' + this.get('etapa.codigo') + '/';
		this.validarPagoFactura();
		if ($("#formulario_pago").valid()){
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			$("#myModalPagoFactura").modal('hide');
			$('#myModalFactura').modal('hide');
		}
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
		generarPDFNuevoMetodo: function(codigo){
			this.generarPDFNuevoMetodo();
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
		selectPresupuestoFactura(){
			this.selectPresupuestoFactura();
		},
		/*openModalFactura(editing){
			this.openModalFactura(editing);
		},*/
		consultarFactura(){
			this.consultarFactura();
		},
		facturarEtapa(){
			this.facturarEtapa();
		},
		openModalPagoFactura(){
			this.openModalPagoFactura();
		},
		guardarPagoFactura(){
			this.guardarPagoFactura();
		},
		generarFacturaPDF(){
			//console.log("epale");
			var nombre = "facturaNro-"+this.get('factura.detalle.nro_factura')+'.pdf';
			this.generarFacturaPDF(nombre,"modalBodyFactura");
		}
	}
});
