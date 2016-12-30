import Ember from 'ember';

export default Ember.Controller.extend({
	proyecto: {},
	presupuesto: {},
	ecs: [],
	pe: {},
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


	init(){
		this._super();
		if (this.get('codigo')!==null && this.get('codigo')!==undefined){
			if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
				this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
			}
			var method = "GET";
			var url = window.serverUrl + '/proyecto/' + this.get('codigo') + '/';
		    this.getElements(method,url,this.setProyecto,this);

		    /*url = window.serverUrl + '/material/';
		    this.getElements(method,url,this.setMateriales,this);

		    url = window.serverUrl + '/servicio/';
		    this.getElements(method,url,this.setServicios,this);*/

		    /*this.set('presupuesto.fecha',moment().format("DD/MM/YYYY"));//esta no es tan necesaria, ya que para mostrar esta fecha_f
		    this.set('presupuesto.fecha_m',moment().format("LL"));*/
		    console.log(this.get('codigo'));
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
			 callback(response, context);
		})    
		.fail(function(response) { 
			console.log(response);
		});
	},
	setProyecto(proyecto,context){
		var _this = context;
		_this.set('proyecto',proyecto);
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
		console.log(proyecto);
	},
	setPresupuesto(pre,context){
		var _this = context;

		/*$.each(_this.get('proyecto.presupuestos'),function(i,presupuesto){
			if (presupuesto.codigo === pre.codigo){
				presupuesto = pre;
				console.log(presupuesto);
			}
		});*/
		_this.init();
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
	guardar(presupuesto, estatus){
		//console.log(estatus);
		var method;
		var url;
		var data = {};
		method = "PUT";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/presupuesto/' +presupuesto.codigo+'/';
		$.extend(true,data,this.get('pe'));
		data.estatus = estatus;
		this.validarCampos();
        if ($("#formulario").valid()){
        	this.llamadaServidor(method,url,data,this.setPresupuesto,this);
        }
        //console.log(data);
	},
	/*aprobar(presupuesto){
		console.log(presupuesto);
	},
	rechazar(presupuesto){
		console.log(presupuesto);
	},*/
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
        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
	},
	msgRespuesta(response,context){
		console.log(response);
	},
	guardarCausaRechazo(){
		var method;
		var url;
		var data = {};
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/causaRechazo/';
		data.codigo_pro=this.get('proyecto.codigo');
		data.desc = this.get('causa_rechazo');
        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
	},
	llenarEncuesta(){
		$("#myModalEncuesta").modal('show');
	},
	guardarRespuestasEncuentas(){
		var encuesta = {
			nombre: "Encuesta de satisfación Proyecto"+this.get('proyecto.nombre'),
			codigo_pro:this.get('proyecto.codigo'),
			completado:true,
		};
		var pregunta = {
			pregunta:'',
			respuesta:'',
		};
		var preguntas =[];
		var aux_n;
		$.each(this.get('preguntas').toArray(), function(i,pregunta){
			aux_n = 'resp' + pregunta.nro;
			preguntas.push({
				'pregunta': pregunta.pregunta,
				'respuesta': $('input[name='+ aux_n +']:checked').val(),
			})
		});
		

		var method;
		var url;
		var data = {};
		method = "POST";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/encuesta/';
		data.encuesta = encuesta;
		data.preguntas = preguntas;
        this.llamadaServidor(method,url,data,this.msgRespuesta,this);
	},
	actions:{
		openModalPresupuesto: function(presupuesto, editing){
			this.openModalPresupuesto(presupuesto, editing);
		},
		guardar: function(presupuesto, estatus){
			this.guardar(presupuesto,estatus);
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
		llenarEncuesta: function(){
			this.llenarEncuesta();
		},
		guardarRespuestasEncuentas: function(){
			this.guardarRespuestasEncuentas();
		}
	}
});
