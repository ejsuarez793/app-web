import Ember from 'ember';

export default Ember.Controller.extend({
    isExpanded: false,
    showMyModal: false,

    init() {
	    this._super(...arguments);

	    this.username = '';
	    this.password = '';
  	},

   /* registro : {
        usuario : 'nriqpro5',
        ci: '20803815',
        nombre1:'Enrique',
        nombre2:'Jose',
        apellido1:'Suarez',
        apellido2:'Mendoza',
        tlf: '04142900187',
        correo: 'asda@cas.com',
        dire: 'Direccion papa',
        cargo: 'a',
        password1: 'e1234567',
        password2: 'e1234567',
    },*/

     registro : {
        usuario : '',
        ci: '',
        nombre1:'',
        nombre2:'',
        apellido1:'',
        apellido2:'',
        tlf: '',
        correo: '',
        dire: '',
        cargo: '',
        password1: '',
        password2: '',
    },
    cargos: [
        {nombre: "Almacenista", letra: 'a'},
        {nombre: "Coordinador de Proyectos", letra: 'c'},
        {nombre: "Técnico", letra: 't'},
        {nombre: "Vendedor", letra: 'v'},
    ],

    validarCampos: function(){
        $.validator.addMethod('strongPassword', function(value, element){
            return this.optional(element) ||   value.length >= 6 && /\d/.test(value) && /[a-z]/i.test(value);
        }, 'Contraseña debe ser al menos 8 caracteres y al menos 1 letra');

        $.validator.addMethod("maxlength", function (value, element, len) {
            return value === "" || value.length <= len;
        });
        $.validator.addMethod("customemail", 
          function(value/*, element*/) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        }, "Por favor ingrese un correo válido");

        $("#formulario").validate(
             {
              rules: {
                usuario: {
                  required: true,
                  nowhitespace: true,
                  remote: {
                    url: "http://localhost:8000/validar/usuario/",
                    type: "GET",
                    data: {
                      username: function() {
                        return $( "#usuario" ).val();
                      }
                    }
                  }
                },
                ci:{
                 required: true,
                 maxlength: 10,
                 number: true,
                 nowhitespace: true,
                 remote: {
                    url: "http://localhost:8000/validar/trabajador/",
                    type: "GET",
                    data: {
                      ci: function() {
                        return $( "#ci" ).val();
                      }
                    }
                  }
                },
                cargo:{
                    required: true,
                },
                nombre1:{
                    required: true,
                    maxlength: 15,
                    nowhitespace: true,
                    lettersonly: true,
                },
                nombre2:{
                    nowhitespace: true,
                    maxlength: 15,
                    lettersonly: true,
                },
                apellido1:{
                    required: true,
                    maxlength: 15,
                    nowhitespace: true,
                    lettersonly: true,
                },
                apellido2:{
                    nowhitespace: true,
                    maxlength: 15,
                    lettersonly: true,
                },
                tlf:{
                    required: true,
                    maxlength: 15,
                    number: true

                },
                dire:{
                    maxlength: 200,
                },
                correo:{
                    required: true,
                    customemail: true,
                },
                password1:{
                    required: true,
                    strongPassword: true,
                    minlength: 8,
                },
                password2:{
                    required: true,
                    equalTo: '#password1',
                },
              },
              messages:{
                usuario: {
                  required: 'Este campo es requerido',
                  nowhitespace: 'No dejar espacios en blanco',
                },
                ci:{
                  required: 'Este campo es requerido',
                  nowhitespace: 'No dejar espacios en blanco',
                  number:'Por favor solo números',
                  maxlength: 'Longitud máxima de 10 caracteres',
                },
                cargo:{
                    required: 'Este campo es requerido',
                },
                nombre1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                nombre2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                apellido1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                apellido2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                    maxlength: 'Longitud máxima de 15 caracteres',
                },
                tlf:{
                    required: 'Este campo es requerido',
                    number:'Por favor solo números',
                },
                dire:{
                    maxlength: 'Longitud máxima de 50 caracteres',
                },
                correo:{
                    required: 'Este campo es requerido',
                    customemail: 'Por favor ingrese un correo válido',
                    email: 'Por favor ingrese un correo válido',
                },
                password1:{
                    required: 'Este campo es requerido',
                    minlength: 'Al menos 8 caracteres',
                },
                password2:{
                    required: 'Este campo es requerido',
                    equalTo: 'las contraseñas no coinciden',
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
    actions: {
    	login: function () {
            var data = {};
            var token = '';
            var username = this.get('username');
            var password = this.get('password');
            data.username = username;
            data.password = password;
            $.ajax( {
                type: "POST",
                url: "http://localhost:8000/api-token-auth/",
                context:this,
                contentType: "application/json; charset=utf-8",
                 dataType: "json",
                 data: JSON.stringify(data),
            })    
                .done(function(response) { 
                    token = response.token;
                    $.ajax( {
                        type: "GET",
                        context:this,
                        url: "http://localhost:8000/users/current/",
                        headers:{
                            Authorization: "Token "+ token,
                        },
                        contentType: "application/json; charset=utf-8",
                         dataType: "json",
                         data: JSON.stringify(data),
                    })    
                        .done(function(response) { 
                            Cookies.set("token", token);
                            Cookies.set("current", response);
                            if(response.cargo === 'v'){
                                this.transitionToRoute('/vendedor/clientes/');
                            }else if (response.cargo === 'c'){
                                this.transitionToRoute('/proyectos/proyectos/');
                            }else if (response.cargo === 'a'){
                                this.transitionToRoute('/almacen/materiales/');
                            }
                            document.getElementById("loginForm").reset();
                        })    
                        .fail(function(response) { console.log(response); });    
                })    
                .fail(function(response) { console.log(response); });   
        },
        toggleShow() {
            this.set('showMyModal', !this.get('showMyModal'));
        },
        register: function(){
            var registro = null;
            var selects = document.getElementById("selectcargo");
            var  selectedCargo = selects.options[selects.selectedIndex].value;
            registro = this.get('registro');
            registro.cargo = selectedCargo;
            this.validarCampos(registro);
            if ($("#formulario").valid()){
                var data = {
                    user:{
                        username: registro.usuario,
                        password: registro.password1,
                        password2: registro.password2,
                        email: registro.correo,
                    },
                    trabajador:{
                        ci: registro.ci,
                        nombre1: registro.nombre1,
                        nombre2: registro.nombre2,
                        apellido1: registro.apellido1,
                        apellido2: registro.apellido2,
                        tlf: registro.tlf,
                        correo: registro.correo,
                        dire: registro.dire,
                        cargo: registro.cargo,
                    }
                };
             $.ajax({
                type: "POST",
                url: "http://localhost:8000/users/",
                contentType: "application/json; charset=utf-8",
                 dataType: "json",
                 data: JSON.stringify(data),
            })    
                .done(function(response) { console.log(response); })    
                .fail(function(response) { console.log(response); });
            }
        },
    }
});
