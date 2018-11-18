import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import Grafana from 'shared/mixins/grafana';
import { get, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Controller.extend(Grafana, {
  router:            service(),
  scope:             service(),
  monitoringEnabled: alias('scope.currentCluster.isMonitoringReady'),

  podStateDidChange: observer('model.state', function() {
    if ( C.REMOVEDISH_STATES.includes(get(this, 'model.state')) && get(this, 'router.currentRouteName') === 'pod' ) {
      const workloadId = get(this, 'model.workloadId');

      if ( workloadId ) {
        this.transitionToRoute('workload', workloadId);
      } else {
        this.transitionToRoute('authenticated.project.index');
      }
    }
  }),
});
