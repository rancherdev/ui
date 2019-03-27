import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Resource.extend({
  router:   service(),

  canEdit: computed('links.update', function() {
    return !!get(this, 'links.update');
  }),

  canRemove: computed('links.remove', function() {
    return !!get(this, 'links.remove');
  }),

  actions: {
    edit() {
      this.router.transitionTo('global-admin.global-registry.registries.new', { queryParams: { id: this.id } } );
    }
  },

});
