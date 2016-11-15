import Ember from 'ember';

export default Ember.Controller.extend({
	bears: ['grizzly','polar','brown'],

	currentName:'',
	linkProfile: "www.google.com",
	clientes: '',
	registro: {
		rif: '',
		nombre: '',
		tlf1: '',
		tlf2: '',
		fax: '',
		dire: '',
		act_eco: '',
		cond_contrib: '',
	},
	editing: false,

	beforeModel: function(transition) {
		console.log("epale");
			if (Cookies.get('token')===undefined || Cookies.getJSON('current')===undefined) {
				this.transitionTo('login');
			}
			else {
				var current = Cookies.getJSON('current');
				if (current.cargo === 'v'){
					this.transitionTo('/vendedor/clientes');
				}
			}
		},          

	init(){
		this._super();

		if (!(Cookies.get('token')===undefined) || !(Cookies.getJSON('current')===undefined)){
			this.set('currentName', Cookies.getJSON('current').nombre1 + " " +Cookies.getJSON('current').apellido1); 
			$.ajax({
						type: "GET",
						context:this,
						url: window.serverUrl + '/cliente/',
						headers:{
								Authorization: "Token "+ Cookies.get('token'),
						},
						contentType: "application/json; charset=utf-8",
				})    
						.done(function(response) { 
							this.set('clientes',response);
						})    
						.fail(function(response) { console.log(response); })
						
		}
	},

	/*llenarTabla(clientes,context) {

			$("#tbody").empty();
			var $table = $('#clientes');
			var body = $table.find('tbody');
			var contribuyente = "";
			$.each(clientes, function(i, cliente) {
					var $tr = $('<tr>').append(
							$('<td>').text(cliente.rif),
							$('<td>').text(cliente.nombre),
							$('<td>').append($('<div>').text(cliente.tlf1),$('<div>').text(cliente.tlf2),),
							$('<td>').text(cliente.fax),
							$('<td>').text(cliente.dire),
							$('<td>').text(cliente.act_eco),
							$('<td>').text((cliente.cond_contrib==="o") ? "Ordinario":(cliente.cond_contrib==="e") ? "Especial":(cliente.cond_contrib==="f") ? "Formal":"No especificado"   ),
							$('<td>').append($('<button/>', {
									text: 'editar', 
									id: clientes[i].rif,
									class: 'btn btn-success btn-xs',
									click: function(){ context.editarCliente(clientes[i].rif)},
						}))
					); //.appendTo('#records_table');
					body.append($tr);
			});
	},*/
	validarCampos: function(fields){
		$.validator.addMethod("maxlength", function (value, element, len) {
				return value == "" || value.length <= len;
		});

		$.validator.addMethod('rifValido', function(value, element){
				return this.optional(element)
				||   value.length <= 15
				&& /[J]\-\d+\-\d/.test(value);
		}, 'Rif no válido');

		$("#formulario").validate({
			rules:{
				rif: {
					required: true,
					maxlength: 15,
					nowhitespace: true,
					rifValido: true,
					remote: {
						url: window.serverUrl + '/validar/cliente/',
						type: "GET",
						data: {
							rif: function() {
								return $( "#rif" ).val();
							}
						}
					}
				},
				nombre:{
				 required: true,
				 maxlength: 75,
				},
				dire:{
						required: true,
						maxlength: 200,
				},
				tlf1:{
						required: true,
						maxlength: 15,
						nowhitespace: true,
						number: true,
				},
				tlf2:{
						nowhitespace: true,
						maxlength: 15,
						number: true,
				},
				fax:{
						nowhitespace: true,
						maxlength: 15,
						number: true,
				},
				act_eco:{
						maxlength: 100,
				},
				cond_contrib:{
						nowhitespace: true,
						lettersonly: true,
				}
			},
			messages:{
				rif: {
					required: 'Este campo es requerido.',
					maxlength: 'Longitud máxima de 15 caracteres',
					nowhitespace: 'No dejar espacios en blanco',
				},
				nombre:{
				 required: 'Este campo es requerido.',
				 maxlength: 'Longitud máxima de 75 caracteres',
				},
				dire:{
						required: 'Este campo es requerido.',
						maxlength: 'Longitud máxima de 15 caracteres',
				},
				tlf1:{
						required: 'Este campo es requerido.',
						maxlength: 'Longitud máxima de 15 caracteres',
						nowhitespace: 'No dejar espacios en blanco',
						number: 'Por favor solo números',
				},
				tlf2:{
						nowhitespace: 'No dejar espacios en blanco',
						maxlength: 'Longitud máxima de 15 caracteres',
						number: 'Por favor solo números',
				},
				fax:{
						nowhitespace: 'No dejar espacios en blanco',
						maxlength: 'Longitud máxima de 15 caracteres',
						number: 'Por favor solo números',
				},
				act_eco:{
						maxlength: 'Longitud máxima de 100 caracteres',
				},
				cond_contrib:{
						nowhitespace: 'No dejar espacios en blanco',
						lettersonly: 'Sin caracteres especiales o números',
				}
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
	llamadaServidor(method,url,data){
		$.ajax({
			type: method,
			url: url,
			context:this,
			headers:{
				Authorization: "Token "+ Cookies.get('token'),
			},
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(data),
		})    
		.done(function(response) { /*console.log(response);*/ this.init();})    
		.fail(function(response) { console.log(response); }); 
	},
	prepararModal(editing,cliente){
		if (editing==='false'){
			this.set('editing',false);
			$("#rif").prop('disabled', false);
			$('#selectcond').prop('selectedIndex',0);
			this.set('registro', {});
		}else{
			this.set('editing',true);
			$("#rif").prop('disabled', true);
			var registro =  jQuery.extend(true, {}, cliente);
			$("#selectcond").val(registro.cond_contrib);
			this.set('registro',registro);
		}
		//se reinician los errores
		$(".form-group").removeClass('has-success');
		$(".form-group").removeClass('has-error');
		$(".help-block").text("");  

		$("#myModal").modal('show');
	},
	salvar(method,url,data){
		this.validarCampos();
		if ($("#formulario").valid()){
			this.llamadaServidor(method,url,data);

		}
	},
	actions: {

		openModal: function(editing,cliente){
			this.prepararModal(editing,cliente);
		},

		save: function(){
			var registro = null;
			var method = "";
			var url = "";
			if (!this.get('editing')){
				var method = "POST";
				var url = window.serverUrl + '/cliente/';
				console.log("creando save");
			}else{
				var method = "PATCH";
				var url = window.serverUrl +'/cliente/' + this.get('registro.rif') +'/';
				console.log("editando save");
			}

			//agarro el dato del select y lo asigno a mi registro
			var selects = document.getElementById("selectcond");
			var  selectcond = selects.options[selects.selectedIndex].value;
			registro = this.get('registro');
			registro.cond_contrib = selectcond;

			var data = registro;
			this.salvar(method,url,data);
		},
		logout: function() {
					Cookies.remove('current');
					Cookies.remove('token');

					this.transitionToRoute('login');
					window.location.reload(true);
		},
		}
});
