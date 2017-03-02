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
	resumen:{},
	msg: {},
          

	init(){
		this._super();

		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 
			
			var method = "GET";
			var url = window.serverUrl + '/ventas/cliente/';
		    this.getElements(method,url,this.setClientes,this);

		    method = "GET";
			url = window.serverUrl + '/ventas/resumen/';
		    this.getElements(method,url,this.setResumen,this);
						
		}
	},
	validarCampos: function(){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value === "" || value.length <= len;
		});

		$.validator.addMethod('rifValido', function(value, element){
				return this.optional(element) ||   value.length <= 15 && /([J]|[G]|[V])\-\d+\-\d/.test(value);
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
	openModal(editing,cliente){
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
	save(){
		var registro = null;
		var method = "";
		var url = "";
		if (!this.get('editing')){
			method = "POST";
			url = window.serverUrl + '/ventas/cliente/';
		}else{
			method = "PATCH";
			url = window.serverUrl +'/ventas/cliente/' + this.get('registro.rif') +'/';
		}

		//agarro el dato del select y lo asigno a mi registro
		var selects = document.getElementById("selectcond");
		var  selectcond = selects.options[selects.selectedIndex].value;
		registro = this.get('registro');
		registro.cond_contrib = selectcond;

		var data = registro;
		this.validarCampos();
		if ($("#formulario").valid()){
			this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			$("#myModal").modal('hide');

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
	openModalResumen(){
		//console.log("implementar resumen");
		this.prepararResumen();
		$("#myModalResumen").modal('show');
	},
	setResumen(resumen, context){
		//console.log(resumen);
		$.each(resumen,function(i,resumen){
			resumen.monto_total_mostrar = numeral(resumen.monto_total).format('0,0.00');
			resumen.promedio_monto_mostrar = numeral(resumen.promedio_monto).format('0,0.00');
		});
		context.set('resumen',resumen);
		
	},
	prepararResumen(){
		var resumen = this.get('resumen').toArray();

		/*var resumen = [{
  "nro_proyectos": 992,
  "monto_total": 3424.64,
  "promedio_monto": 7152.97,
  "nro_encuestas": 586,
  "promedio_encuestas": 2.44,
  "rif": "807-01-3490",
  "nombre": "Shanghai Dainji University",
  "act_eco": "Design Engineer"
}, {
  "nro_proyectos": 109,
  "monto_total": 6701.09,
  "promedio_monto": 7469.13,
  "nro_encuestas": 423,
  "promedio_encuestas": 3.49,
  "rif": "195-69-5243",
  "nombre": "Caritas University",
  "act_eco": "Nurse"
}, {
  "nro_proyectos": 658,
  "monto_total": 7475.57,
  "promedio_monto": 388.37,
  "nro_encuestas": 278,
  "promedio_encuestas": 4.09,
  "rif": "443-58-0544",
  "nombre": " L.D.College of Engineering",
  "act_eco": "Health Coach III"
}, {
  "nro_proyectos": 781,
  "monto_total": 349.37,
  "promedio_monto": 1718.3,
  "nro_encuestas": 813,
  "promedio_encuestas": 4.66,
  "rif": "762-52-1048",
  "nombre": "Seton Hall University",
  "act_eco": "Database Administrator III"
}, {
  "nro_proyectos": 334,
  "monto_total": 4277.34,
  "promedio_monto": 8595.73,
  "nro_encuestas": 831,
  "promedio_encuestas": 4.76,
  "rif": "306-77-5908",
  "nombre": "University of Massachusetts at Dartmouth",
  "act_eco": "Computer Systems Analyst III"
}, {
  "nro_proyectos": 820,
  "monto_total": 8135.9,
  "promedio_monto": 1450.97,
  "nro_encuestas": 161,
  "promedio_encuestas": 2.84,
  "rif": "348-53-5245",
  "nombre": "Bangabandhu Sheikh Mujibur Rahman Agricultural University",
  "act_eco": "Research Assistant IV"
}, {
  "nro_proyectos": 833,
  "monto_total": 7108.46,
  "promedio_monto": 6187.37,
  "nro_encuestas": 792,
  "promedio_encuestas": 4.21,
  "rif": "557-26-9257",
  "nombre": "Copenhagen Business School",
  "act_eco": "Librarian"
}, {
  "nro_proyectos": 362,
  "monto_total": 2409.07,
  "promedio_monto": 4730.48,
  "nro_encuestas": 499,
  "promedio_encuestas": 1.62,
  "rif": "443-78-0247",
  "nombre": "University of Gastronomic Sciences",
  "act_eco": "Database Administrator II"
}, {
  "nro_proyectos": 377,
  "monto_total": 3332.18,
  "promedio_monto": 5694.48,
  "nro_encuestas": 103,
  "promedio_encuestas": 2.92,
  "rif": "501-05-5713",
  "nombre": "Saybrook Institute",
  "act_eco": "Automation Specialist IV"
}, {
  "nro_proyectos": 867,
  "monto_total": 925.88,
  "promedio_monto": 6140.02,
  "nro_encuestas": 328,
  "promedio_encuestas": 4.4,
  "rif": "991-12-4532",
  "nombre": "Universidad Nacional de Córdoba",
  "act_eco": "Social Worker"
}, {
  "nro_proyectos": 563,
  "monto_total": 3773.78,
  "promedio_monto": 9828.32,
  "nro_encuestas": 869,
  "promedio_encuestas": 4.83,
  "rif": "791-65-7078",
  "nombre": "Université du Québec en Outaouais",
  "act_eco": "Database Administrator II"
}, {
  "nro_proyectos": 908,
  "monto_total": 4002.79,
  "promedio_monto": 4232.26,
  "nro_encuestas": 664,
  "promedio_encuestas": 3.56,
  "rif": "713-89-3751",
  "nombre": "Universitas Simalungun",
  "act_eco": "Project Manager"
}, {
  "nro_proyectos": 332,
  "monto_total": 4221.04,
  "promedio_monto": 9636.53,
  "nro_encuestas": 629,
  "promedio_encuestas": 3.87,
  "rif": "711-69-2941",
  "nombre": "Université de Djibouti",
  "act_eco": "Assistant Professor"
}, {
  "nro_proyectos": 338,
  "monto_total": 2375.19,
  "promedio_monto": 4817.47,
  "nro_encuestas": 24,
  "promedio_encuestas": 2.83,
  "rif": "544-32-6845",
  "nombre": "Darul Takzim Institute of Technology",
  "act_eco": "Automation Specialist IV"
}, {
  "nro_proyectos": 886,
  "monto_total": 7906.69,
  "promedio_monto": 1271.89,
  "nro_encuestas": 96,
  "promedio_encuestas": 2.12,
  "rif": "372-90-2138",
  "nombre": "University of Indianapolis",
  "act_eco": "Research Associate"
}, {
  "nro_proyectos": 878,
  "monto_total": 7609.29,
  "promedio_monto": 3246.84,
  "nro_encuestas": 804,
  "promedio_encuestas": 1.52,
  "rif": "282-34-4196",
  "nombre": "International University College of Technology Twintech (IUCTT)",
  "act_eco": "Professor"
}, {
  "nro_proyectos": 764,
  "monto_total": 5279.9,
  "promedio_monto": 21.55,
  "nro_encuestas": 622,
  "promedio_encuestas": 4.66,
  "rif": "473-68-3502",
  "nombre": "Malaysia University of Science and Technology (MUST)",
  "act_eco": "Automation Specialist III"
}, {
  "nro_proyectos": 345,
  "monto_total": 6379.02,
  "promedio_monto": 1592.32,
  "nro_encuestas": 194,
  "promedio_encuestas": 1.93,
  "rif": "712-62-2630",
  "nombre": "Duksung Women's University",
  "act_eco": "Research Assistant I"
}, {
  "nro_proyectos": 871,
  "monto_total": 9351.91,
  "promedio_monto": 1757.79,
  "nro_encuestas": 321,
  "promedio_encuestas": 4.88,
  "rif": "855-07-3695",
  "nombre": "Kokugakuin University",
  "act_eco": "Desktop Support Technician"
}, {
  "nro_proyectos": 564,
  "monto_total": 8625.58,
  "promedio_monto": 4392.34,
  "nro_encuestas": 638,
  "promedio_encuestas": 1.7,
  "rif": "263-16-0153",
  "nombre": "Universidad Nacional de Tucumán",
  "act_eco": "Desktop Support Technician"
}];*/

		var mayores_montos = [];
		var menores_montos = [];
		var mayores_proyectos = [];
		var menores_proyectos = [];
		var mayores_encuestas = [];
		var menores_encuestas = [];
		var campos_ordenar = ['nro_proyectos','monto_total','promedio_encuestas'];
		var aux_asc = [];
		var aux_des = [];
		var aux;
		var numero = 5; //numero de elementos que se desean mostrar, en este caso un top 5 de clientes.

		/*console.log(resumen);*/
		for (var campo in campos_ordenar) {
		    if (campos_ordenar.hasOwnProperty(campo)) {
		        aux = _.sortBy(resumen,campos_ordenar[campo]); //devuele un array ordenado ascendientemente
		        aux_asc = _.take(aux,numero); //toma los primero 5 elementos del array, (van de menor a mayor)
		        aux_des = _.reverse(_.takeRight(aux,numero)); //invierte el arreglo retornado por takeRight 
		        											  //que son los ultimos 5 de menor a mayor

		        if (campos_ordenar[campo]==="nro_proyectos"){
		        	mayores_proyectos = $.extend(true,[],aux_des);
		        	menores_proyectos = $.extend(true,[],aux_asc);
		        }else if (campos_ordenar[campo]==="monto_total"){
		        	mayores_montos = $.extend(true,[],aux_des);
		        	menores_montos = $.extend(true,[],aux_asc);
		        }else if (campos_ordenar[campo]==="promedio_encuestas"){
		        	mayores_encuestas = $.extend(true,[],aux_des);
		        	menores_encuestas = $.extend(true,[],aux_asc);
		        }
		    }
		}
		this.set('mayores_montos',mayores_montos);
		this.set('menores_montos',menores_montos);
		this.set('mayores_proyectos',mayores_proyectos);
		this.set('menores_proyectos',menores_proyectos);
		this.set('mayores_encuestas',mayores_encuestas);
		this.set('menores_encuestas',menores_encuestas);
		this.set('fecha_resumen',moment().format("LL"));
		//console.log(resumen);
		//console.log(_.sortBy(resumen,['nro_proyectos']));
		//console.log(resumen);
	},
	/*generarPDF(){
		$("#resumen").css('background', '#fff');

		function canvasSc(element){
		  var clone = element.cloneNode(true);
		  var style = clone.style;
		  style.position = 'relative';
		 // style.top = window.innerHeight + 'px';
		  //style.left = 0;
		  document.body.appendChild(clone);
		  return clone;
		}

		var modalBody = document.getElementById('resumen');
		var originalStyle = modalBody.style; //copiamos el estilo original ya que una vez finalizado la generacion debemos devolverle al panel
								 //su ancho y largo original

		//modificamos el ancho y largo del modal
		modalBody.style.width = '754px';
		modalBody.style.height = '1054px';
		var clone = canvasSc(modalBody);
		var nombrepdf = "Resumen clientes Sistelred.pdf";

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
	},*/
	generarPDFResumen(){
		console.log("generando...");
		/*
		var resumen = this.get('resumen');
		console.log(resumen);
		*/
		var mayores_montos = this.get('mayores_montos');
		var menores_montos = this.get('menores_montos');
		var mayores_proyectos = this.get('mayores_proyectos');
		var menores_proyectos = this.get('menores_proyectos');
		var mayores_encuestas = this.get('mayores_encuestas');
		var menores_encuestas = this.get('menores_encuestas');
		var fecha_resumen = this.get('fecha_resumen');
		var vendedor_nombre = Cookies.getJSON('current').nombre1 + " " + Cookies.getJSON('current').apellido1;
		
		/*console.log(mayores_montos);*/
		var content = [];
		var aux_titulo;
		var body = [];
		var aux_tabla;
		var aux;

			//primera parte del pdf
			content.push(
					{
						text:'Resumen Clientes Sistelred, C.A. ',
						style: 'titulo',
					},
					{
						text: fecha_resumen,
						style: 'subheader',
					},
		    );

			//MAYOR NÚMERO DE PROYECTOS RESUMEN
			aux_titulo = {
				text: 'Mayor número de proyectos',
				style: 'subheader1',
				alignment:'left'
			};
			$.each(mayores_proyectos,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_proyectos, noWrap: true, color:'#3c763d', bold:true},
				{text: cliente.promedio_monto_mostrar, noWrap: true, style: 'numero'}];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
				});

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Proyectos', style: 'tableHeader'},
					{text: 'Promedio Monto', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}



			//MENOR NÚMERO DE PROYECTOS RESUMEN
			aux_titulo = {
				text: 'Menor número de proyectos',
				style: 'subheader1',
				alignment:'left'
			};
			body = [];
			$.each(menores_proyectos,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_proyectos, noWrap: true, color:'#a94442', bold:true,},
				{text: cliente.promedio_monto_mostrar, noWrap: true, style: 'numero'}];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);
				});
				/*console.log(tabla);*/

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Proyectos', style: 'tableHeader'},
					{text: 'Promedio Monto', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}




			//MAYOR MONTO TOTAL EN PROYECTOS
			aux_titulo = {
				text: 'Mayor monto total en proyectos',
				style: 'subheader1',
				alignment:'left'
			};
			body = [];
			$.each(mayores_montos,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_proyectos, noWrap: true},
				{text: cliente.monto_total_mostrar, noWrap: true, style:'numero', color:'#3c763d', bold:true,}];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
				});
				/*console.log(tabla);*/

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Proyectos', style: 'tableHeader'},
					{text: 'Monto Total', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}







			//MENOR MONTO TOTAL EN PROYECTOS
			aux_titulo = {
				text: 'Menor monto total en proyectos',
				style: 'subheader1',
				alignment:'left'
			};
			body = [];
			$.each(menores_montos,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_proyectos, noWrap: true},
				{text: cliente.monto_total_mostrar, noWrap: true, style:'numero', color:'#a94442', bold:true}];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
				});
				/*console.log(tabla);*/

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Proyectos', style: 'tableHeader'},
					{text: 'Monto Total', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}








			//MAYOR PROMEDIO EN ENCUESTAS
			aux_titulo = {
				text: 'Mayor promedio en encuestas',
				style: 'subheader1',
				alignment:'left'
			};
			body = [];
			$.each(mayores_encuestas,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_encuestas, noWrap: true},
				{text:
					[{text: cliente.promedio_encuestas, noWrap: true, color:'#3c763d', bold:true,},
					{text: ' /5', noWrap: true}]
				}];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
				});
				/*console.log(tabla);*/

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Encuestas', style: 'tableHeader'},
					{text: 'Promedio Encuestas', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}







			//MENOR PROMEDIO EN ENCUESTAS
			aux_titulo = {
				text: 'Menor promedio en encuestas',
				style: 'subheader1',
				alignment:'left'
			};
			body = [];
			$.each(menores_encuestas,function(i,cliente){
				
				aux = [{text:cliente.rif, noWrap: true}, 
				{text: cliente.nombre}, 
				{text: cliente.act_eco},
				{text: cliente.nro_encuestas, noWrap: true},
				{text:
					[{text: cliente.promedio_encuestas, noWrap: true, color:'#a94442', bold:true},
					{text: ' /5', noWrap: true}]
				}
				];
				body.push($.extend(false,[],aux));
				
			});

			if(true){
				var tabla = [];
				$.each(body,function(i,detalle){
					tabla.push([detalle[0],detalle[1],detalle[2],detalle[3],detalle[4]]);	
				});
				/*console.log(tabla);*/

				tabla.unshift([
					{text: 'RIF', style: 'tableHeader'}, 
					{text: 'Nombre', style: 'tableHeader'}, 
					{text: 'Act. Eco.', style: 'tableHeader'},
					{text: 'Nro Encuestas', style: 'tableHeader'},
					{text: 'Promedio Encuestas', style: 'tableHeader'},
				]);

				aux_tabla = {
					style:'tablaMateriales',
					table:{
						headerRows:1,
						widths: ['auto','*','auto','auto','auto'],
						body:tabla,
					}
				};
				content.push($.extend(true,{},aux_titulo),$.extend(true,{},aux_tabla));
			}









			var docDefinition = {
			info: {
			    title: 'Resumen Clientes Sistelred ' + fecha_resumen,
			    author: vendedor_nombre,
			    /*subject: 'subject of document',
			    keywords: 'keywords for document',*/
			},
			content: content,

			styles: {
				/*success:{
					color:'#3c763d',
					bold:true,
				},
				danger:{
					color:'#a94442',
					bold:true,
				},*/
				titulo:{
					fontSize:24,
					alignment:'center',
					bold:true,
					margin:[0,0,0,10]
				},
				numero:{
					noWrap: true, 
					alignment:'right'
				},
				encabezado:{
					color:"#FFFFFF"
				},
				subheader:{
					fontSize:14,
					alignment:'center',
					margin:[0,0,0,10]
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
				            { text: 'Resumen Clientes Sistelred ' + fecha_resumen, italics: true , fontSize:8},
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
		openModal: function(editing,cliente){
			this.openModal(editing,cliente);
		},

		save: function(){
			this.save();
		},
		ordenarPor: function(property) {
			this.ordenarPor(property);
    	},
    	openModalResumen:function(){
    		this.openModalResumen();
    	},
    	generarPDFResumen:function(){
    		this.generarPDFResumen();
    	}
    	/*generarPDF:function(){
    		this.generarPDF();
    	}*/
	}
});
