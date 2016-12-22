import Ember from 'ember';

export default Ember.Controller.extend({
	proyecto: {},
	presupuesto: {},
	ecs: [],
	pe: {},

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
	llamadaServidor(method,url,data){
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
		})    
		.fail(function(response) { 
			console.log(response);
		});
	},
	setProyecto(proyecto,context){
		var _this = context;
		_this.set('proyecto',proyecto);
		console.log(proyecto.presupuestos);
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
		if (!editing){
			this.set('editing',false);
		}else{
			this.set('editing', true);
		}
	//	if (!editing){
			this.set('presupuesto',presupuesto);
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
	guardar(presupuesto){
		//console.log(this.get('pe'));
		var method;
		var url;
		var data;
		method = "PUT";
		url = window.serverUrl + /proyecto/ + this.get('proyecto.codigo') + '/presupuesto/' +presupuesto.codigo+'/';
		this.llamadaServidor(method,url,data);
	},
	actions:{
		openModalPresupuesto: function(presupuesto, editing){
			this.openModalPresupuesto(presupuesto, editing);
		},
		guardar: function(presupuesto){
			this.guardar(presupuesto);

		}
	}
});
