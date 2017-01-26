import Ember from 'ember';

export default Ember.Route.extend({

	beforeModel: function() {
	    if (!Cookies.get('token') || !Cookies.getJSON('current')) {
	      this.transitionTo('login');
	    }
	    else {
	    	var current = Cookies.getJSON('current');
	    	if (current.cargo !== 'admin'){
	    		this.transitionTo('login');
	    	}
	    }
  	}
});
