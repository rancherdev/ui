import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  advanced: false,
  showText: 'advancedSection.showText',
  tagName:  null,

  actions: {
    toggle() {
      this.set('advanced', !this.get('advanced'));
    },
  },
});
