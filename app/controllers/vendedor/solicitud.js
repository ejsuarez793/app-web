import Ember from 'ember';

export default Ember.Controller.extend({

	init(){
	    this._super();
	    console.log("init");
	},
	prepararModal(editing,cliente){
		if (editing==='false'){
			this.set('editing',false);
			/*$("#rif").prop('disabled', false);
			$('#selectcond').prop('selectedIndex',0);*/
			this.set('registro', {});
		}else{
			this.set('editing',true);
			/*$("#rif").prop('disabled', true);
			var registro =  jQuery.extend(true, {}, cliente);
			$("#selectcond").val(registro.cond_contrib);*/
			this.set('registro',{});
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},

	actions: {
		openModal: function(editing,cliente){
			this.prepararModal(editing,cliente);
		},
	}
});
