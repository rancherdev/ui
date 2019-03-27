import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { reject } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    if ( get(params, 'id') ) {
      return this.globalStore.find('globalregistry', params.id).then((resp) => {
        if (resp) {
          return resp.clone();
        } else {
          return reject('Global Registry Not Found');
        }
      });
    } else {
      return this.globalStore.createRecord({ type: 'globalregistry',  });
    }
  },

  setupController(controller, model) {
    if (model && get(model, 'id')) {
      controller.set('mode', 'edit');
    }

    this._super(controller, model);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      setProperties(controller, {
        id:             null,
        mode:           'new',
      })
    }
  },

  queryParams: { id: { refreshModel: true },  },
});
