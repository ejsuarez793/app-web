import Ember from 'ember';

export default Ember.Controller.extend({
	currentName: '',
	proyectos:[],
	proyecto:{},
	filtro: null,
	select:{},
	reporteini: '',

	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		var method = "GET";
		var url = window.serverUrl + '/proyecto/';
	    this.getElements(method,url,this.setProyectos,this);
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
		.done(function(response){ callback(response, context); })    
		.fail(function(response) { console.log(response); }); 
	},
	setProyectos(proyectos,context){
		var _this = context;

		if (!Array.isArray(proyectos)){
			var aux = [];
			aux.push(proyectos);
			proyectos = aux;
		}	
		_this.set('proyectos',proyectos);
	 	_this.paginationInitialize(10);
	},

	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	var camposFiltrables = ['codigo','nombre','nombre_c','estatus'];
    	for (field in theObject) {
	     	if (theObject[field]!==null && ($.inArray(field,camposFiltrables)!==-1) && theObject[field].toString().toLowerCase().includes(str.toLowerCase())){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("proyectos").filter(

    	(
    		function(_this) {
      			return function(theObject) {
			    	if (_this.get("filtro") && theObject.show){
			        	return _this.filtrar(theObject, _this.get("filtro"));
			        }else if (theObject.show){
			        	return true;
			        }

      			};
    		}
    	)(this)

    	);
  	}).property("filtro","proyectos","select"),

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

    		var proyectos = _this.get('proyectos').toArray();
			var totalProyectos = proyectos.length;
			var res = totalProyectos % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalProyectos/tamPagina) + 0.5);
			}else{
				nPaginas = totalProyectos/tamPagina;
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
		            var mostrables = proyectos.slice(showFrom, showTo);
		            $.each(proyectos,function(i,proyecto){
		            	if($.inArray(proyecto, mostrables) !== -1){
		            		//console.log(servicio);
		            		proyecto.show = true;
		            	}else{
		            		proyecto.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('proyectos',proyectos);

		        }
    		});
    	});

	},


	actions:{
		openModal: function(proyecto){
			this.prepararModal(proyecto);

		},
		openModalDetalle: function(/*proyecto*/){
			//this.prepararModal(proyecto);
			$("#myModalDetalle").modal('show');

		},
		ordenarPor: function(property) {
			var asc = null;
			var th = '#th-'+property;
			if ($(th).hasClass('glyphicon-chevron-down')){
				asc = true;
				$(th).removeClass('glyphicon-chevron-down');
				$(th).addClass('glyphicon-chevron-up');
			}else{
				asc = false;
				$(th).removeClass('glyphicon-chevron-up');
				$(th).addClass('glyphicon-chevron-down');
			}
			var aux = this.ordenar(property,asc,this.get('proyectos').toArray());
			this.set('proyectos',aux);
    	},
    	
	},
});