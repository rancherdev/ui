import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    const store = get(this, 'store');

    return hash({ services: store.findAll('service') });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CONTAINER_ROUTE }`, 'virtual-services');
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, undefined);
  }),
});
