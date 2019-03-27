import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';

export default Controller.extend(ViewNewEdit, {
  router:             service(),
  globalStore:        service(),

  queryParams:        ['id'],
  id:                 null,

  mode:               'new',
  saveDisabled:       false,

  actions: {
    cancel() {
      this.router.transitionTo('global-admin.global-registry.registries.index');
    },
  },

  doneSaving() {
    this.send('cancel');
  },
});
