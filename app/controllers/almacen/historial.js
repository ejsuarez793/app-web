import Ember from 'ember';

export default Ember.Controller.extend({
	msg: {},
	tipo_consulta:"",
	consulta:{
		mes:false,
		rango:false,
	},
	movimientos:[],
	movimiento:{},
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
	validarConsultaMes(){
		$("#formulario_mes").validate({
			rules:{
				mes:{
					required:true,
				},
			},
			messages:{
				mes:{
					required:'Seleccione un mes.',
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
	validarConsultaRango(){
		$.validator.addMethod("mayorQue", function (value, element, params) {
				return new Date(value) >= new Date($(params).val());
		});
		$("#formulario_rango").validate({
			rules:{
				desde:{
					required:true,
				},
				hasta:{
					required:true,
					mayorQue:"#desde",
				}
			},
			messages:{
				desde:{
					required:'Seleccione inicio del rango.',
				},
				hasta:{
					required:'Seleccione el final del rango.',
					mayorQue:'La fecha seleccionada no es mayor o igual que la fecha de inicio.'
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
				//data: data,
		})    
		.done(function(response){ callback(response, context); })    
		.fail(function(response) { console.log(response); context.msgRespuesta('Error: ',response.responseText,-1,context); }); 
	},
	setMovimientos(response,context){
		var _this = context;
		$.each(response.data.movimientos,function(i,movimiento){
			movimiento.fecha_mostrar = moment(movimiento.fecha).format('L');
		});
		_this.set('movimientos',response.data.movimientos);
		_this.msgRespuesta("Exito: ", response.msg,1,context);
		//console.log(response.data.movimientos);
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
	selectTipoConsulta(){
		var tipo_consulta = $("#select_consulta").val();
		this.set('tipo_consulta',tipo_consulta);
		this.set('consulta',{});
		if(tipo_consulta === 'mes'){
			//console.log(tipo_consulta);
			this.set('consulta.mes',true);
			this.set('consulta.rango',false);
		}else if(tipo_consulta === 'rango'){
			//console.log(tipo_consulta);
			this.set('consulta.mes',false);
			this.set('consulta.rango',true);
		}
	},
	selectMesConsulta(){
		var mes_consulta = $("#select_mes").val();
		this.set('consulta.mes_consulta',mes_consulta);		
	},
	filtrarMovimientos(){
		var checkbox = '#filtro_tipo_mov input:checked';
		var tipo_mov = [];
		//var materiales = $.extend(true,[],this.get('movimiento.materiales').toArray());
		//console.clear();
		var flag = false;
		$(checkbox).each(function() {
			flag = true;
			tipo_mov.push($(this).val());
			
		});
		//console.log(tipo_mov);
		if (flag === false){
			tipo_mov = ['Egreso','Retorno','Ingreso'];
		}
		var movimientos = $.extend(true,[],this.get('movimientos').toArray());
		$.each(movimientos,function(i,movimiento){
			if ($.inArray(movimiento.tipo,tipo_mov)!==-1){
				//console.log("entra");
				movimiento.mostrar = true;
			}else{
				movimiento.mostrar = false;
			}
		});
		this.set('movimientos',movimientos);
		//console.log(movimientos);
	},	
	cerrarMsgAlert(){
		$("#alertMsg").hide();
	},
	openModalDetalleMovimiento(movimiento){
		var mov = $.extend(true,{},movimiento);
		//console.log(movimiento);
		mov.fecha_mostrar = moment(movimiento.fecha).format('LL');
		if (mov.tipo === "Ingreso"){
			mov.ingreso = true;
		}else{
			mov.ingreso = false;
		}
		this.set('movimiento',mov);
		$("#myModalMovimiento").modal('show');
	},
	openModalGenerarActa(movimiento){
		var fecha = new Date();
		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
		var acta_movimiento = {}
		acta_movimiento = $.extend(true,{},movimiento);
		acta_movimiento.dias = fecha.getDate();
		acta_movimiento.mes =  nombre_meses[fecha.getMonth()];
		acta_movimiento.anio = fecha.getFullYear();
		acta_movimiento.fecha_mostrar = moment(acta_movimiento.fecha).format('LL');

		//console.log(movimiento);

		if (movimiento.tipo == "Egreso"){
			acta_movimiento.nombre_tipo = "ENTREGA DE MATERIAL";
			acta_movimiento.egreso = true;
		}else if (movimiento.tipo == "Retorno"){
			acta_movimiento.nombre_tipo = "RETORNO DE MATERIAL";
			acta_movimiento.retorno = true;
		}else if (movimiento.tipo == "Ingreso"){
			acta_movimiento.nombre_tipo = "INGRESO DE MATERIAL";
			acta_movimiento.ingreso = true;
		}


		this.set('acta_movimiento',acta_movimiento);
		$("#myModalActaMovimiento").modal('show');
	},
	consultar(){
		var url;
		var method = "GET";
		var tipo_consulta = this.get('tipo_consulta');
		if (tipo_consulta==="mes"){
			//console.log(this.get('consulta.mes'));
			this.validarConsultaMes();
			if ($("#formulario_mes").valid()){
				url = window.serverUrl + '/almacen/consulta/'+tipo_consulta+'/' + this.get('consulta.mes_consulta') + '/'+this.get('consulta.mes_consulta')+'/';
				this.getElements(method,url,this.setMovimientos,this);	
			}
		}else if(tipo_consulta==="rango"){
			this.validarConsultaRango();
			if ($("#formulario_rango").valid()){
				//console.log("rango");
				//console.log(this.get('consulta'));	
				url = window.serverUrl + '/almacen/consulta/'+tipo_consulta+'/' + this.get('consulta.desde') + '/'+this.get('consulta.hasta')+'/';
				//console.log(url);
				this.getElements(method,url,this.setMovimientos,this);
			}
		}else{
			this.msgRespuesta('Error: ',"Seleccione un tipo de consulta.",-1,this);
		}
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
	generarPDFActaMovimiento(){
		var datosPDF = {};
		datosPDF.materiales = [];
		var acta_movimiento = this.get('acta_movimiento');
		/*console.log("generando");
		console.log(this.get('acta_movimiento'));*/
		datosPDF.codigo_movimiento = acta_movimiento.codigo;
		datosPDF.tipo = acta_movimiento.tipo;
		datosPDF.fecha = acta_movimiento.fecha_mostrar;

		datosPDF.almacenista_nombre = acta_movimiento.nombre_almace;
		//datosPDF.materiales = acta_movimiento.materiales;
		if (datosPDF.tipo === "Ingreso"){
			
			datosPDF.proveedor_nombre = acta_movimiento.nombre_prove;
			datosPDF.proveedor_rif = acta_movimiento.rif_prove;
			datosPDF.nro_orden = acta_movimiento.codigo_oc;
			datosPDF.nota_entrega = acta_movimiento.codigo_ne;
			datosPDF.dias = acta_movimiento.dias;
			datosPDF.mes = acta_movimiento.mes;
			datosPDF.anio = acta_movimiento.anio;
			
		}else if (datosPDF.tipo === "Egreso" || datosPDF.tipo === "Retorno"){
			datosPDF.tecnico_nombre = acta_movimiento.nombre_tec;
			datosPDF.tecnico_ci = acta_movimiento.ci_tecnico;
			datosPDF.etapa_letra  = acta_movimiento.letra_eta;
			datosPDF.etapa_nombre = acta_movimiento.nombre_eta;
			datosPDF.proyecto_codigo = acta_movimiento.codigo_pro;
			datosPDF.proyecto_nombre = acta_movimiento.nombre_pro;
		}

		var nombre_meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
		var fecha = new Date(acta_movimiento.fecha);
		datosPDF.dias = "0" + (fecha.getDate() + 1);
		datosPDF.dias = datosPDF.dias.substring( datosPDF.dias.length-2, datosPDF.dias.length);
		datosPDF.mes =  nombre_meses[fecha.getMonth()];
		datosPDF.anio = fecha.getFullYear();

		var aux;
		var descripcion;
		var serial = "";
		$.each(acta_movimiento.materiales,function(i,material){
			if (material.serial === null){
				serial = "N/A";
			}
			aux = [{text:material.codigo, noWrap: true}, 
			{text: material.nombre}, 
			{text: material.desc},
			{text: serial, alignment:'center'},
			{text: material.cantidad, noWrap: true, alignment:'center'}];
			datosPDF.materiales.push($.extend(false,[],aux));
		});

		
		var body = [];
		$.each(datosPDF.materiales,function(i,detalle){

				body.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
		
		});

		body.unshift([
			{text: 'Código', style: 'tableHeader'}, 
			{text: 'Nombre', style: 'tableHeader'}, 
			{text: 'Descripción', style: 'tableHeader'},
			{text: 'S/N', style: 'tableHeader'},
			{text: 'Cantidad', style: 'tableHeader'}, 
		]);

		/*console.log(datosPDF);*/
		var content = [];
		if (datosPDF.tipo === "Ingreso"){
			content.push(
				{
					text:'Acta de ' + datosPDF.tipo + " de Material",
					style: 'titulo',
				},
				{ 
	           		text: [
	                    { text: 'Por medio de la presente, se hace constar que se recibe del proveedor '},
	                    { text: datosPDF.proveedor_nombre + " RIF " + datosPDF.proveedor_rif , bold:true},
	                    { text: ', según orden de compra '},
	                    { text: datosPDF.nro_orden , bold:true},
	                    { text: ' y nota de entrega '},
	                    { text: datosPDF.nota_entrega , bold:true},
	                    { text: ' en el almacén de '},
	                    { text: 'SISTELRED, C.A. RIF: J-30994445-2', bold:true},
	                    { text: '. Los materiales adquiridos se listan a continuación: '},
	                ],style:'texto'
	            },
	            {
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', 'auto','*','auto','auto'],
						body:body,
					}
				},

	            { 
	           		text: [
	                    { text: 'Acta que se efectúa en la ciudad de Guatire, '},
	                    { text: 'a los ' + datosPDF.dias + ' dias del mes de ' + datosPDF.mes + ' del año ' + datosPDF.anio + "."},
	                ],style:'texto'
	            },

				{
				    columns: [
				        { width: '*', text: '' },
				        {
				            width: 'auto',
				               	table: {
								headerRows: 4,
								keepWithHeaderRows: 1,
								style:'tablaFirma',
								body: [
									[
										{
											text: [
							                    { text: 'Por ' , style:'encabezado'},
							                    { text: 'SISTELRED: \n' , bold:true, style:'encabezado'},
							                    { text: datosPDF.almacenista_nombre, bold: true, style:'encabezado'},
							            	],
							            	
							            	//fillColor: '#00952e',
							            	style:'marginFirmaEncabezado',
							            	/*alignment:'left',*/
							            	fillColor: '#337ab7',
							        	}, 

						            ],
						            [


							            {
							            	rowSpan: 3, 
							            	text: [
							                    { text: 'Nombre: \r\r', style:'firma'},
							                    { text: 'Cargo: \r\r', style:'firma'},
							                    { text: 'Firma y Sello: \r\r', style:'firma'},
						            		],
							            	/*alignment:'center'*/
							            	style:'marginFirma',
							            	/*,margin:[0,6,0,6]*/
							            },
						            ],

						            [ ''],
						            [ ''],
								]
							}
				        },
				        { width: '*', text: '' },
				    ]
				}
			);
		}else if (datosPDF.tipo === "Egreso"){
			content.push(
				{
					text:'Acta de ' + datosPDF.tipo + " de Material",
					style: 'titulo',
				},
				{ 
	           		text: [
	                    { text: 'Por medio de la presente, '},
	                    { text: 'SISTELRED C.A. RIF J-30994445-2' , bold:true},
	                    { text: ' hace constar la entrega de materiales al técnico '},
	                    { text: datosPDF.tecnico_nombre , bold:true},
	                    { text: ' C.I. '},
	                    { text: 'V-' + datosPDF.tecnico_ci , bold:true},
	                    { text: ', para ser utilizados en la etapa '},
	                    { text: datosPDF.etapa_letra, bold:true},
	                    { text: ' del proyecto '},
	                    { text: datosPDF.proyecto_codigo, bold:true},
	                    { text: ' que tiene por nombre '},
	                    { text: datosPDF.proyecto_nombre, bold:true},
	                    { text: '. Los materiales que se entregan se listan a continuación: '},
	                ],style:'texto'
	            },
	            {
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', 'auto','*','auto','auto'],
						body:body,
					}
				},

	            { 
	           		text: [
	                     { text: 'Acta que se efectúa en la ciudad de Guatire, '},
	                    { text: 'a los ' + datosPDF.dias + ' dias del mes de ' + datosPDF.mes + ' del año ' + datosPDF.anio + "."},
	                ],style:'texto'
	            },
	            {
					table: {
						widths: ['*', '*'],
						headerRows: 4,
						keepWithHeaderRows: 1,
						style:'tablaFirma',
						body: [
							[
								{
									text: [
					                    { text: 'Técnico Responsable: \n' , style:'encabezado',},
					                    { text: datosPDF.tecnico_nombre, bold: true, style:'encabezado', },
					            	],

					            	/*margin:[10,10,10,10],*/
					            	/*style:'marginFirmaEncabezado',*/

					            	style:'marginFirmaEncabezadoAmbas',
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por SISTELRED, C.A.: \n' , style:'encabezado', },
					                    { text: datosPDF.almacenista_nombre, bold: true, style:'encabezado', },
					           	 	],
					           	 	/*margin:[10,10,10,10],*/
					           	 	/*style:'marginFirmaEncabezado',*/
					           	 	style:'marginFirmaEncabezadoAmbas',
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: '\rCédula: ', style:'firma'},
					                    { text: '\r\rFirma: \r', style:'firma'},
				            		],
					            	alignment:'center',
					            	style:'margenFirma'
					            },

					            {
					            	rowSpan: 3, 
					            	text: [
					                    { text: '\rCédula: ', style:'firma'},
					                    { text: '\r\r    Firma y Sello: \r\r', style:'firma'},
				            		],
					            	alignment:'center',
					            	style:'margenFirma',
					            },
				            ],

				            [ '', ''],
				            [ '', ''],

							/*['Sample value 1', {colSpan: 2, rowSpan: 2, text: 'Both:\nrowSpan and colSpan\ncan be defined at the same time'}, ''],
							['Sample value 1', '', ''],*/
						]
					}
				}
			);
		}else if(datosPDF.tipo === "Retorno"){
			content.push(
				{
					text:'Acta de ' + datosPDF.tipo + " de Material" + datosPDF.codigo_movimiento,
					style: 'titulo',
				},
				{ 
	           		text: [
	                    { text: 'Por medio de la presente, '},
	                    { text: 'SISTELRED, C.A. RIF J-30994445-2' , bold:true},
	                    { text: ' recibe del técnico '},
	                    { text: datosPDF.tecnico_nombre , bold:true},
	                    { text: ' C.I. '},
	                    { text: 'V-' + datosPDF.tecnico_ci , bold:true},
	                    { text: ', asignado al proyecto '},
	                    { text: datosPDF.proyecto_codigo, bold:true},
	                    { text: ' que tiene por nombre '},
	                    { text: datosPDF.proyecto_nombre, bold:true},
	                    { text: ', el material sobrante de la etapa '},
	                    { text: datosPDF.etapa_letra , bold:true},
	                    { text: '. Los materiales que se entregan se listan a continuación: '},
	                ],style:'texto'
	            },
	            {
					style: 'tablaMateriales',
					table: {
						headerRows: 1,
						// dontBreakRows: true,
						// keepWithHeaderRows: 1,
						widths: ['auto', 'auto','*','auto','auto'],
						body:body,
					}
				},

	            { 
	           		text: [
	                    { text: 'Acta que se efectúa en la ciudad de Guatire, '},
	                    { text: 'a los ' + datosPDF.dias + ' dias del mes de ' + datosPDF.mes + ' del año ' + datosPDF.anio + "."},
	                ],style:'texto'
	            },
	            {
	            	style:'tablaFirma',
					table: {
						widths: ['*', '*'],
						headerRows: 3,
						keepWithHeaderRows: 1,

						body: [
							[
								{
									text: [
					                    { text: 'Técnico Responsable: \n' , style:'encabezado'},
					                    { text: datosPDF.tecnico_nombre, bold: true, style:'encabezado'},
					            	],
					            	/*margin:[10,10,10,10],*/
					            	style: 'marginFirmaEncabezadoAmbas',
					            	//fillColor: '#00952e',
					            	fillColor: '#337ab7',
					        	}, 

					            { 	
					            	text: [
					                    { text: 'Por SISTELRED, C.A.: \n' , style:'encabezado'},
					                    { text: datosPDF.almacenista_nombre, bold: true, style:'encabezado'},
					           	 	],
					           	 	/*margin:[10,10,10,10],*/
					           	 	style:'marginFirmaEncabezadoAmbas',
					           	 	//fillColor: '#00952e',
					           	 	fillColor: '#337ab7'
					        	}
				            ],
				            [
					            {
					            	rowSpan: 2, 
					            	text: [
					                    { text: '\rCédula: ', style:'firma'},
					                    { text: '\r\r    Firma: \r\r', style:'firma'},
				            		],
					            	alignment:'center',
					            	/*margin:[10,10,10,10]*/
					            	style:'marginFirmaAmbas'
					            },

					            {
					            	rowSpan: 2, 
					            	text: [
					                    { text: '\rCédula: ', style:'firma'},
					                    { text: '\r\rFirma: \r\r', style:'firma'},
				            		],
					            	alignment:'center',
					            	style:'marginFirmaAmbas'
					            	/*,margin:[10,10,10,10]*/
					            },
				            ],
				            [ '', ''],

							/*['Sample value 1', {colSpan: 2, rowSpan: 2, text: 'Both:\nrowSpan and colSpan\ncan be defined at the same time'}, ''],
							['Sample value 1', '', ''],*/
						]
					}
				}
			);
		}

		var docDefinition = {
			info: {
			    title: 'Acta de ' + datosPDF.tipo + " de Material " + datosPDF.codigo_movimiento ,
			    author: datosPDF.almacenista_nombre,
			    /*subject: 'subject of document',
			    keywords: 'keywords for document',*/
			},
			content:content,
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
					margin:[0,6,0,6]
				},
				firma: {
					fontSize: 12,
					alignment:'left',
					margin:[10,0,10,0]
				},
				tablaFirma:{
					margin:[0,2,0,2]
				},
				encabezado:{
					color:"#FFFFFF"
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
					margin: [0, 6 , 0, 6],
				},
				marginFirmaEncabezado:{
					margin:[10,6,170,6],
				},
				marginFirmaEncabezadoAmbas:{
					margin:[10,6,10,6],
					/*alignment:'center'*/
				},
				marginFirmaAmbas:{
					margin:[10,6,6,6],
				},
				marginFirma:{
					margin:[10,6,0,6],
				}

			},
			footer: function(page, pages) { 
				    return { 
				        columns: [ 
				            { text: 'Acta Movimiento', italics: true , fontSize:8},
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
	actions:{
		cerrarMsgAlert:function(){
			this.cerrarMsgAlert();
		},
		openModalDetalleMovimiento(movimiento){
			this.openModalDetalleMovimiento(movimiento);
		},
		openModalGenerarActa(movimiento){
			this.openModalGenerarActa(movimiento);
		},
		selectTipoConsulta:function(){
			this.selectTipoConsulta();
		},
		selectMesConsulta:function(){
			this.selectMesConsulta();
		},
		filtrarMovimientos: function(){
			this.filtrarMovimientos();
		},
		consultar:function(){
			this.consultar();
		},
		generarPDFActa:function(modal){
			var nombre = nombre;
			var movimiento = this.get('acta_movimiento');
			if (movimiento.tipo == "Egreso"){
				nombre = "ACTA DE ENTREGA DE MATERIAL-CODIGO "+movimiento.codigo;
			}else if (movimiento.tipo == "Retorno"){
				nombre = "ACTA DE RETORNO DE MATERIAL "+movimiento.codigo;;
			}else if (movimiento.tipo == "Ingreso"){
				nombre = "ACTA DE INGRESO DE MATERIAL "+movimiento.codigo;;
			}
			this.generarPDFActa(nombre,modal);
		},
		generarPDFActaMovimiento: function(){
			this.generarPDFActaMovimiento();
		},
	}
});
