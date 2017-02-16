import Ember from 'ember';

export default Ember.Controller.extend({
	filtro: null,
	tecnicos:[],
	tecnico:{},

	init(){
		this._super();
		if (!((Cookies.get('token')===undefined) || (Cookies.getJSON('current')===undefined))){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1);
		} 
		//console.log("epale");
		var method = "GET";
		var url = window.serverUrl + '/tecnicos/';
	    this.getElements(method,url,this.setTecnicos,this);
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
	setTecnicos(tecnicos,context){
		var _this = context;

		if (!Array.isArray(tecnicos)){// esto es para el filtrado, necesita ser un array si es un solo tecnico el que existe devuelve un objecto
			var aux = [];
			aux.push(tecnicos);
			tecnicos = aux;
		}
		$.each(tecnicos,function(i,tecnico){
			if (tecnico.proyectos.length > 0){
				tecnico.disponible = "No disponible";
			}else{
				tecnico.disponible = "Disponible";
			}
		});
		//console.log(tecnicos);
		_this.set('tecnicos',tecnicos);
		_this.paginationInitialize(10);	
	},
	openModalTecnico(tecnico){
		this.set('tecnico',tecnico);
		$("#myModalTecnico").modal("show");
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
	
		var aux = this.ordenar(property,asc,this.get('tecnicos').toArray());
		this.set('tecnicos',aux);
	},
	filtrar: function(theObject, str) {
    	var field, match;
    	match = false;
    	var camposFiltrables = ['ci','nombre'];
    	for (field in theObject) {
	     	if (theObject[field]!==null && ($.inArray(field,camposFiltrables)!==-1) && theObject[field].toString().toLowerCase().includes(str.toLowerCase())){
	        	match = true;
	      	}
    	}
    	return match;
  	},

  	filter: (function() {
    	return this.get("tecnicos").filter(

    	(
    		function(_this) {
      			return function(theObject/*, index, enumerable*/) {
			    	if (_this.get("filtro") && theObject.show){
			        	return _this.filtrar(theObject, _this.get("filtro"));
			        }else if (theObject.show){
			        	return true;
			        }

      			};
    		}
    	)(this)

    	);
  	}).property("filtro","tecnicos",'select'),

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

    		var tecnicos = _this.get('tecnicos').toArray();
			var totalTecnicos = tecnicos.length;
			var res = totalTecnicos % tamPagina;
			var nPaginas = 0;
			if (res!==0){
				nPaginas = Math.round((totalTecnicos/tamPagina) + 0.5);
			}else{
				nPaginas = totalTecnicos/tamPagina;
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
		            var mostrables = tecnicos.slice(showFrom, showTo);
		            $.each(tecnicos,function(i,tecnico){
		            	if($.inArray(tecnico, mostrables) !== -1){
		            		tecnico.show = true;
		            	}else{
		            		tecnico.show = false;
		            	}
		            });
		            _this.set('select',page);//AQUI ES IMPORTANTE ya que asi notifica a filter

		            _this.set('tecnicos',tecnicos);

		        }
    		});
    	});

	},

	actions:{
		openModalTecnico:function(tecnico){
			this.openModalTecnico(tecnico);
		},
		ordenarPor: function(property) {
			this.ordenarPor(property);
    	},
	}
});
