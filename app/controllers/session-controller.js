import Ember from 'ember';

export default Ember.Controller.extend({
   /* isExpanded: false,
    showMyModal: false,*/
    msg: {},
    username:'',
    password:'',

    /*init() {
	    this._super(...arguments);

	    this.username = '';
	    this.password = '';
  	},*/

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
   /* cargos: [
        {nombre: "Almacenista", letra: 'a'},
        {nombre: "Coordinador de Proyectos", letra: 'c'},
        {nombre: "Técnico", letra: 't'},
        {nombre: "Vendedor", letra: 'v'},
    ],*/

    validarCampos: function(){

        $("#loginForm").validate(
            {
                rules: {
                    usuario:{
                        required:true,
                        nowhitespace: true,
                    },
                    clave:{
                        required: true,
                    },
                },
                messages:{
                    usuario:{
                        required:'Este campo es requerido.',
                        nowhitespace: 'Sin espacios en blanco.',
                },
                    clave:{
                        required: 'Este campo es requerido.',
                    },
                },
                errorElement: 'small',
                errorClass: 'help-block',
                errorPlacement: function(error, element) {
                    error.insertAfter(element.parent());
                },
                highlight: function(element) {
                    $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                },
                success: function(element) {
                    $(element).addClass('valid').closest('.form-group').removeClass('has-error').addClass('has-success');
                }
        });

    },
    getCurrent(){
        var url = window.serverUrl + '/usuario/actual/';
        var method = "GET";

         $.ajax( {
            type: method,
            context:this,
            url: url,
            headers:{
                Authorization: "Token "+ Cookies.get('token'),
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        })    
        .done(function(response) { 
            Cookies.set("current", response);
            if(response.cargo === 'v'){
                this.transitionToRoute('/vendedor/clientes/');
            }else if (response.cargo === 'c'){
                this.transitionToRoute('/proyectos/proyectos/');
            }else if (response.cargo === 'a'){
                this.transitionToRoute('/almacen/materiales/');
            }else if (response.cargo === 'admin'){
                console.log("admin");
                this.transitionToRoute('/admin/registro/');
                //console.log(response);
            }
            document.getElementById("loginForm").reset();
        })    
        .fail(function(response) { console.log(response); }); 

    },
    llamadaServidor(method,url,data,callback,context){
        $.ajax({
            type: method,
            url: url,
            context: this,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(data),
        })    
        .done(function(response) {
            //console.log(response);
            var token = response.token;
            Cookies.set("token", token);
            context.getCurrent();
        })    
        .fail(function(response) { 
            console.log(response);
            if (response.responseText === '{"non_field_errors":["Unable to log in with provided credentials."]}'){
                 callback('Error: ',"No es posible logear con las credenciales suministradas.",-1,context);    
            }
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
    actions: {
        cerrarMsg:function(){
            this.cerrarMsg();
        },
    	login: function () {
            var data = {};
            //var token = '';
            var username = this.get('username');
            var password = this.get('password');
            data.username = username;
            data.password = password;
            var method = "POST";
            var url = window.serverUrl + /login/;
            this.validarCampos();
            if ($("#loginForm").valid()){
                this.llamadaServidor(method,url,data,this.msgRespuesta,this);
            }
            //this.llamadaServidor(method,url,data,this.msgRespuesta,this);
           /* $.ajax( {
                type: "POST",
                context:this,
                contentType: "application/json; charset=utf-8",
                 dataType: "json",
                 data: JSON.stringify(data),
            })    
                .done(function(response) { 
                    //console.log(response);
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
                            }else if (response.cargo === 'admin'){
                                console.log("admin");
                                this.transitionToRoute('/admin/registro/');
                                //console.log(response);
                            }
                            document.getElementById("loginForm").reset();
                        })    
                        .fail(function(response) { console.log(response); });    
                })    
                .fail(function(response) { console.log(response); });*/   
        },
    }
});
