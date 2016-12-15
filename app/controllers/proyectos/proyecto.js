import Ember from 'ember';

export default Ember.Controller.extend({

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
			this.set('np_cod',np_cod);
		}else{
			console.log("El proyecto tiene mas de 26 presupuestos no se puede crear más");
		}
	},
	prepararModalMateriales(){
		$("#myModalMateriales").modal('show');
		var materiales = this.get('materiales');
		console.log(materiales);
		this.set('mss',materiales);
	},
	actions: {

		openModalPresupuesto: function(){
			this.prepararModalPresupuesto();
			$("#myModalPresupuesto").modal('show');
			/*console.log(this.get('servicios'));
			console.log(this.get('materiales'));
			console.log(this.get('proyecto'));*/
			//console.log("abriendo");
		},
		openModalAgregarMS: function(){
			var seleccion = $("#anadir").val();
			if (seleccion === "servicio"){
				console.log('s');
			}else if (seleccion === "material"){
				this.prepararModalMateriales();
			}
		}
	}
});
