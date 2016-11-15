import Ember from 'ember';

export function formatAtrib(params/*, hash*/) {
  switch(params[0]) {
        case 'cond_contrib': 
        	switch(params[1]){
        		case 'e': return 'Especial'; break;
        		case 'o': return 'Ordinario'; break;
        		case 'f': return 'Formal'; break;
        		default: return 'No disponible'; break;
        	}
        case 'solicitud_estatus': 
            switch(params[1]){
                case 'n': return 'Nueva'; break;
                case 'p': return 'Procesada'; break;
                case 'a': return 'Atendida'; break;
                default: return 'No disponible'; break;
        }
        case 'solicitud_cliente': {
            var rif = params[1];
            var clientes = params[2];
            var nombre = 'No disponible';
            $.each(clientes, function(i,cliente){
                if (cliente.rif === rif){
                    nombre = cliente.nombre;
                }
            });
            return nombre;
            break;
        }
        //implementar aqui los demas format
        case 2: return "Callback";
            break;
        default: return params[0];
    }
}

export default Ember.Helper.helper(formatAtrib);
