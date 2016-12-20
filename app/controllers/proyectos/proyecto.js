import Ember from 'ember';

export default Ember.Controller.extend({
	ecs: [],
	sss: [],
	mss: [],
	presupuesto: {

	},
	editing:false,

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
		//console.log(proyecto.presupuestos);
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
		this.llamadaServidor(method,url,data);
		this.init();
	},
	actions: {
		procesar:function(){
			this.procesar();
		},
		ordenarPor: function(property,presupuestos) {
			this.ordenarPor(property,presupuestos);
    	},
		openModalPresupuesto: function(editing,presupuesto){
			this.prepararModalPresupuesto(editing,presupuesto);
		},
		openModalAgregarMS: function(){
			var seleccion = $("#anadir").val();
			this.prepararModalElementos(seleccion);
		},
		agregarElementos: function(tipo_e){
			this.agregarElementos(tipo_e);
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