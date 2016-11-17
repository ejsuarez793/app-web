import Ember from 'ember';

export default Ember.Component.extend({
		actions: {
        logout: function() {
            Cookies.remove('current');
            Cookies.remove('token');
            window.location.reload(true);
        }
    }
});
