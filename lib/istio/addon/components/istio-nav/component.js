import Component from '@ember/component';
import { get, computed } from '@ember/object';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  scope: service(),

  layout,

  owner: computed('scope.currentCluster.systemProject', function() {
    return !!get(this, 'scope.currentCluster.systemProject');
  }),
});
