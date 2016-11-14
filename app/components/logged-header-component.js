import Ember from 'ember';

export default Ember.Component.extend({

		redirect: function(){
			this.transitionToRoute('login');
		},
		actions: {
        logout: function() {
           /* $.ajax({url: '/session/', type: 'delete'});*/
            /*Cookies.remove('current');
            Cookies.remove('token');*/
            this.redirect();
        }
    }
});
