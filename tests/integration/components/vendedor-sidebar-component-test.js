import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('vendedor-sidebar-component', 'Integration | Component | vendedor sidebar component', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{vendedor-sidebar-component}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#vendedor-sidebar-component}}
      template block text
    {{/vendedor-sidebar-component}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
