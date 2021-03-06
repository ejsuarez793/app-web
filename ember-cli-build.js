/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //minificar todo esto luego
  app.import('bower_components/jquery-validation/dist/jquery.validate.js');
  app.import('bower_components/jquery-validation/dist/additional-methods.js');
  app.import('bower_components/js-cookie/src/js.cookie.js');
  app.import('bower_components/jquery-ui/jquery-ui.js');
  app.import('bower_components/twbs-pagination/jquery.twbsPagination.js');
  app.import('bower_components/numeral/numeral.js');
  app.import('bower_components/moment/min/moment-with-locales.js');
  app.import('bower_components/lodash/dist/lodash.js');
  app.import('bower_components/jspdf/dist/jspdf.min.js');
  app.import('bower_components/html2canvas/build/html2canvas.min.js');
  app.import('bower_components/pdfmake/build/pdfmake.min.js');
  app.import('bower_components/pdfmake/build/vfs_fonts.js');
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.



    return app.toTree();
};
