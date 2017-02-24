import Ember from 'ember';

export default Ember.Controller.extend({
	tipo:"",
	codigo:"",
	msg:{},
	validar: function(tipo){

    	$("#form_borrar").validate(
             {
              rules: {
                tipo:{
                 required: true,
                },
                codigo:{
                 required: true,
                },

              },
              messages:{
              	tipo:{
                 required: 'Este campo es requerido.',
                },
                codigo:{
                 required: 'Este campo es requerido.',
                },
              },
              errorElement: 'small',
              errorClass: 'help-block',
              errorPlacement: function(error, element) {
                error.insertAfter(element.parent().parent().find("small"));
                element.parent().parent().find("small").css('display', 'inline');
               
              },
              highlight: function(element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
              },
              success: function(element) {
                $(element)
                .addClass('valid')
                .closest('.form-group').removeClass('has-error').addClass('has-success');
              }
        });


    },
    llamadaServidor(method,url,data,callback,context){
		$.ajax({
			type: method,
			url: url,
			context: this,
			headers:{
				Authorization: "Token "+ Cookies.get('token'),
			},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(data),
		})    
		.done(function(response) {
			//console.log(response);
			context.init();
			callback('Exito: ',response.msg,1,context);
		})    
		.fail(function(response) { 
			console.log(response);
			callback('Error: ',response.responseText,-1,context);
		});
	},
	msgRespuesta(tipo,desc,estatus,context){
		var clases = ['alert-danger','alert-warning','alert-success'];
		var _this = context;
		_this.set('msg.tipo',tipo);
		_this.set('msg.desc',desc);
		$.each(clases,function(i/*,clase*/){
			if (i === (estatus+1)){
				$("#alertMsg").addClass(clases[i]);
			}else{
				$("#alertMsg").removeClass(clases[i]);
			}

		});
		$("#alertMsg").show();

	},
	cerrarMsg(){
		$("#alertMsg").hide();
	},
	actions:{
		cerrarMsg(){
			this.cerrarMsg();
		},
		borrar:function(){
			var tipo  = this.get('tipo');
			var codigo = this.get('codigo');
			var method = "DELETE";
			var url = window.serverUrl + '/admin/borrar/' + tipo + '/' + codigo + '/';
			var data = {}
			this.validar();
			if ($("#form_borrar").valid()){
				console.log("borrando ..");
				this.llamadaServidor(method,url,data,this.msgRespuesta,this);
			}
		},
		selectNuevoTipo:function(){
			this.set('tipo',$("#select_tipo").val());
		},
	}
});
