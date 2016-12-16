import Ember from 'ember';

export default Ember.Controller.extend({
	ecs: [],
	sss: [],
	mss: [],
	presupuesto: {
		codigo:'',
		codigo_pro:'',
		fecha: '',
		fecha_m:'',
		validez_o: '7',
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
	},

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

		    this.set('presupuesto.fecha',moment().format("DD/MM/YYYY"));
		    this.set('presupuesto.fecha_m',moment().format("LL"));
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
	prepararModalPresupuesto(){
		var proyecto = this.get('proyecto');
		var cont = 0;
		var arrayLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //array de letras para colocar al final del nuevo presupuesto
		$.each(proyecto.presupuestos, function(i,presupuesto){
			cont++;
		});
		if (cont < 26){
			var np_cod = 'P'+arrayLetras[cont]+'-'+proyecto.codigo;
			this.set('presupuesto.codigo',np_cod);
		}else{
			console.log("El proyecto tiene mas de 26 presupuestos no se puede crear más");
		}
	},
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
	},
	calcularPrecioTotal(codigo){
		var cant = "#cantidad_"+codigo;
		var pu = "#pu_"+codigo;
		var pt = "#pt_"+codigo;
		var ecs = this.get('ecs').toArray();
		//console.log($(cant).val() + " * " + $(pu).val());

		var precio_total =$(cant).val() * $(pu).val();
		$(pt).text(precio_total);

		$.each(ecs,function(i,elemento){
			if (elemento.codigo ===codigo){
				elemento.cant_s = $(cant).val();
				elemento.precio_venta = $(pu).val();
			}
		});
		//this.calcularMontoTotal();
	},
	calcularMontoTotal(){
		var subtotal1 = parseFloat($("#subtotal1").text());
		var descuento = parseFloat($("#descuento").text());
		var subtotalfinal = parseFloat($("#subtotalfinal").text());
		var iva = parseFloat($("#iva").text());
		var total = parseFloat($("#total").text());
		var cont = 0.0;
		var pt = 0.0;

		var elementos_cs = this.get('ecs');

		$("td[name='precio_total']").each(function(i,item){
			pt = parseFloat($(this).text());
			cont += pt;
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
	prepararPresupuesto(){
		var presupuesto = this.get('presupuesto');
		var proyecto = this.get('proyecto');
		var ecs = this.get('ecs').toArray();
		var aux = {
			codigo: '',
			cantidad: '',
			precio_venta: '',
		}

		presupuesto.codigo_pro = proyecto.codigo;
		presupuesto.fecha = moment().format("YYYY-MM-DD");
		presupuesto.servicios = [];
		presupuesto.materiales = [];
		$.each(ecs,function(i,elemento){
			aux.codigo = elemento.codigo;
			aux.cantidad = elemento.cant_s;
			aux.precio_venta = elemento.precio_venta;
			if (elemento.tag === 'servicio'){
				presupuesto.servicios.push($.extend(true, {}, aux));
			}else if(elemento.tag === 'material'){
				presupuesto.materiales.push($.extend(true, {}, aux));
			}
		});

		this.set('presupuesto',presupuesto);
		console.log(proyecto);
	},
	actions: {
		procesar:function(){
			console.log("procesando..");
			this.prepararPresupuesto();

			var method = "POST";
			var url = window.serverUrl + '/proyecto/' + this.get('proyecto.codigo')+'/presupuesto/';
			var data = this.get('presupuesto');
			this.llamadaServidor(method,url,data);
		},
		openModalPresupuesto: function(){
			this.prepararModalPresupuesto();
			$("#myModalPresupuesto").modal('show');
		},
		openModalAgregarMS: function(){
			var seleccion = $("#anadir").val();
			this.prepararModalElementos(seleccion);
		},
		agregarElementos: function(tipo_e){
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
					if (tag ==='servicio'){
						elemento.cantidad = 0;
					}
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
		eliminarElementos: function(){
			//console.log("eliminar");
			this.eliminarElementos();
		},
		calcularPrecioTotal: function(codigo){
			this.calcularPrecioTotal(codigo);
		},
		calcularMontoTotal: function(){
			this.calcularMontoTotal();
		},
	}
});
