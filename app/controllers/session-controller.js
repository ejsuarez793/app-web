import Ember from 'ember';

export default Ember.Controller.extend({
	username: null,
    password: null,
    errorMessage: null,

    fname: 'epale',
    lname: '',

    isExpanded: false,
    showMyModal: false,

    registro : {
        usuario : '',
        constrasenia: '',
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

    reset: function() {
        this.setProperties({
            username: null,
            password: null,
            errorMessage: null,
            model: null
        });
    },

    isAuthenticated: function() {
        return (!Ember.isEmpty(this.get('model')));
    }.property('model'),

    setCurrentUser: function(user_id) {
        if (!Ember.isEmpty(user_id)) {
            var currentUser = this.store.find('user', user_id);
            this.set('model', currentUser);
        }
    },

    validarCampos: function(fields){
        //console.log(fields);
       /* if (fields.usuario === ''  || fields.nombre1 === '' || fields.apellido1 === '' || fields.tlf === '' || fields.correo === '' , fields.password1 === '' )
          ; // alert("hay un campo sin definir"); */
          $.validator.addMethod('strongPassword', function(value, element){
            return this.optional(element)
            ||   value.length >= 6
            && /\d/.test(value)
            && /[a-z]/i.test(value);
          }, 'Contraseña debe ser al menos 6 caracteres y al menos 1 letra');
          console.log("validar");
        $("#formulario").validate(
             {
              rules: {
                usuario: {
                  required: true,
                  nowhitespace: true,
                },
                cargo:{
                    required: true,
                },
                nombre1:{
                    required: true,
                    nowhitespace: true,
                    lettersonly: true,
                },
                nombre2:{
                    nowhitespace: true,
                    lettersonly: true,
                },
                apellido1:{
                    required: true,
                    nowhitespace: true,
                    lettersonly: true,
                },
                apellido2:{
                    nowhitespace: true,
                    lettersonly: true,
                },
                tlf:{
                    required: true,
                },
                correo:{
                    email: true,
                    required: true,
                },
                password1:{
                    required: true,
                    strongPassword: true,
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
                cargo:{
                    required: 'Este campo es requerido',
                },
                nombre1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                },
                nombre2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                },
                apellido1:{
                    required: 'Este campo es requerido',
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                },
                apellido2:{
                    nowhitespace: 'No dejar espacios en blanco',
                    lettersonly: 'Sin caracteres especiales o números',
                },
                tlf:{
                    required: 'Este campo es requerido',
                },
                correo:{
                    required: 'Este campo es requerido',
                    email: 'Por favor ingrese un correo válido',
                },
                password1:{
                    required: 'Este campo es requerido',
                },
                password2:{
                    required: 'Este campo es requerido',
                    equalTo: 'las contraseñas no coinciden',
                },
              },
              errorElement: 'small',
              errorClass: 'help-block',
              errorPlacement: function(error, element) {
                //console.log(element);#a94442
                /*console.log(error);*/
                error.insertAfter(element.parent().parent().find("small"));
                /* element.parent().parent().find("small").css('color', '#a94442');*/
                element.parent().parent().find("small").css('display', 'inline');
               
              },
              highlight: function(element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
              },
              success: function(element) {
                console.log(element);
                $(element)
                .addClass('valid')
                .closest('.form-group').removeClass('has-error').addClass('has-success');
                console.log("entra");
              }
              /*highlight: function(element) {
                $(element).closest('.input-group').removeClass('has-success').addClass('has-error');
              },
              success: function(element) {
                element
                .text('OK!').addClass('valid')
                .closest('.input-group').removeClass('has-error').addClass('has-success');
            }*/
        });

        console.log($("#formulario").valid());
    },
    actions: {
    	save: function () {
        var data = {};
        var username = this.get('username');
        var password = this.get('password');
        alert(username + ',' + password);
        data.username = username;
        data.password = password;
        console.log(data);
            $.ajax( {
                type: "POST",
                url: "http://localhost:8000/api-token-auth/",
                contentType: "application/json; charset=utf-8",
                 dataType: "json",
                 data: JSON.stringify(data),
            }
            )    
                .done(function() { alert("success"); })    
                .fail(function() { alert("error"); })    
                .always(function() { alert("complete"); }); 
            },
        toggleShow() {
            this.set('showMyModal', !this.get('showMyModal'));
            /*if (!this.get('showMyModal'))
                $("#formulario").get(0).reset()*/

        },
        register: function(){
            console.log('registro');
            var registro = null;
            var selects = document.getElementById("selectcargo");
            var  selectedCargo = selects.options[selects.selectedIndex].value;
            registro = this.get('registro');
            registro.cargo = selectedCargo;
          //  console.log(registro);
            this.validarCampos(registro);

           /*var data = {
                'username': registro.usuario,
                'password': registro.password1
            };
             $.ajax( {
                type: "POST",
                url: "http://localhost:8000/users/register/",
                contentType: "application/json; charset=utf-8",
                 dataType: "json",
                 data: JSON.stringify(data),
            }
            )    
                .done(function(response) { alert("success"); console.log(response); })    
                .fail(function(response) {  console.log(response); })    
                .always(function(response) {}); */
        },

        login: function() {
            var self = this, data = this.getProperties('username', 'password');
            /*$.post('/session/', data, null, 'json').then(function (response) {
                Ember.run(function() {
                    self.set('errorMessage', response.message);
                    self.setCurrentUser(response.user_id);
                });
            });*/
        },
        logout: function() {
           /* $.ajax({url: '/session/', type: 'delete'});*/
            this.reset();
            this.transitionToRoute('login');
        }
    }
});
