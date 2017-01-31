import Ember from 'ember';

export default Ember.Route.extend({
	controllerName: 'session-controller',
	beforeModel: function(/*transition*/) {
	    if (Cookies.get('token') || Cookies.getJSON('current')) {
	      var current = Cookies.getJSON('current');
	      if(current!==null && current!==undefined){
	      	if (current.cargo === 'v'){
	    		this.transitionTo('vendedor.clientes');
	    	}
	    	else if (current.cargo === 'c'){
	    		this.transitionTo('proyectos.solicitudes');
	    	}
	    	else if (current.cargo === 'a'){
	    		this.transitionTo('almacen.materiales');
	    	}else if (current.cargo === 'admin'){
	    		this.transitionTo('admin.registro');
	    	}
	      }    
	    }
  	}
});

