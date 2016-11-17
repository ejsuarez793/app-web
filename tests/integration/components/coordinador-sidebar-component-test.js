import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('coordinador-sidebar-component', 'Integration | Component | coordinador sidebar component', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{coordinador-sidebar-component}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#coordinador-sidebar-component}}
      template block text
    {{/coordinador-sidebar-component}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
