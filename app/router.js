import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('vendedor', function() {
    this.route('clientes');
    this.route('solicitud');
    this.route('proyectos');
    this.route('proyecto', { path: '/proyecto/:codigo' });
  });

  this.route('proyectos', function() {
    this.route('solicitudes');
    this.route('servicios');
    this.route('proyectos');
    this.route('proyecto', { path: '/proyecto/:codigo' });
    this.route('tecnicos');
  });

  this.route('almacenista', function() {});

  this.route('almacen', function() {
    this.route('materiales');
    this.route('equipos');
    this.route('proveedores');
    this.route('movimiento');
    this.route('historial');
  });
  this.route('', function() {});
  this.route('404notfound', {path: "/*path"});


  this.route('admin', function() {
    this.route('registro');
    this.route('gestion');
    this.route('borrar');
  });
});

export default Router;
