import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  model() {
    const store = get(this, 'store');

    return hash({ services: store.findAll('service'), });
  },

  actions: {
    cancel() {
      this.goToPrevious();
    },
  }
});
