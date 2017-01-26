import Ember from 'ember';

export default Ember.Route.extend({
	redirect : function(){
        console.log("Error no existe dicha ruta");
        if (Cookies.getJSON('current')!==null && Cookies.getJSON('current')!==undefined){
        	var usuario = Cookies.getJSON('current');
            if(usuario.cargo === 'v'){
                this.transitionTo('/vendedor/clientes/');
            }else if (usuario.cargo === 'c'){
                this.transitionTo('/proyectos/proyectos/');
            }else if (usuario.cargo === 'a'){
                this.transitionTo('/almacen/materiales/');
            }else if (usuario.cargo === 'admin'){
                this.transitionTo('/admin/registro/');
            }
        }else{
        	this.transitionTo("login");
    	}
    }
});
