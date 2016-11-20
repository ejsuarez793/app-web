import Ember from 'ember';

export default Ember.Route.extend({


	beforeModel: function(/*transition*/) {
	    if (!Cookies.get('token') || !Cookies.getJSON('current')) {
	      //console.log("no logeado");
	      this.transitionTo('login');
	    }
	    else {
	    	var current = Cookies.getJSON('current');
	    	if (current.cargo !== 'v'){
	    		this.transitionTo('login');
	    	}
	    }
  	}


});
