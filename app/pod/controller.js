import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, observer, computed } from '@ember/object';

export default Controller.extend({
  router: service(),
  scope:  service(),

  podStateDidChange: observer('model.state', function() {
    if ( get(this, 'model.state') === 'removed' && get(this, 'router.currentRouteName') === 'pod' ) {
      const workloadId = get(this, 'model.workloadId');

      if ( workloadId ) {
        this.transitionToRoute('workload', workloadId);
      } else {
        this.transitionToRoute('authenticated.project.index');
      }
    }
  }),

  monitoringEnabled: computed('scope.currentCluster.isMonitoringReady', function() {
    return get(this, 'scope.currentCluster.isMonitoringReady');
  }),
});
