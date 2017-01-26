import Ember from 'ember';

export default Ember.Controller.extend({
	ci:'',
	nuevoCargo:'',
	msg:{},
	guardar(){
		console.log("guardando");
		console.log(this.get('ci'));
		console.log(this.get('nuevoCargo'));
	},
	cambiarClave(){
		console.log("cabiando");
		console.log(this.get('ci_cc'));
		console.log(this.get('password1'));
		console.log(this.get('password2'));
	},
	actions:{
		guardar:function(){
			this.guardar();
		},
		cambiarClave:function(){
			this.cambiarClave();
		},
		selectNuevoCargo(){
			this.set('nuevoCargo',$("#selectcargo").val());
		},
	},
});
