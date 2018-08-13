import Component from '@ember/component';
import { get, set, observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  intl:        service(),
  globalStore: service(),
  scope:       service(),

  layout,

  resourceType:  'cluster',
  duration:      null,
  dashboardName: null,

  loading:    false,
  rootUrl:    null,
  grafanaUrl: null,

  init() {
    this._super(...arguments);

    this.query();
    this.getGrafanaUrl();
  },

  actions: {
    refresh() {
      this.query();
    }
  },

  durationDidChange: observer('duration', function() {
    this.query();
  }),

  showDashboardLink: computed('workloadType', 'resourceType', function() {
    if ( get(this, 'resourceType') === 'workload' && ['deployment', 'daemonSet', 'statefulSet'].indexOf(get(this, 'workloadType')) === -1 ) {
      return false;
    }

    return true;
  }),

  getGrafanaUrl() {
    const clusterId = get(this, 'scope.currentCluster.id');
    const rootUrl = `${ location.origin }/k8s/clusters/${ clusterId }/api/v1/namespaces/prometheus/services/http:prometheus-grafana:80/proxy`;

    set(this, 'rootUrl', rootUrl);
    get(this, 'globalStore').rawRequest({
      url:    `${ rootUrl }/api/search`,
      method: 'GET',
    }).then((xhr) => {
      let dashboardName = get(this, 'resourceType') === 'workload' ? (get(this, 'workloadType') || '').capitalize() : get(this, 'dashboardName');

      const dashboard = xhr.body.findBy('title', dashboardName);

      if (!dashboard) {
        return;
      }

      let grafanaUrl = dashboard.url;

      switch (get(this, 'resourceType')) {
      case 'node':
        grafanaUrl += `?var-node=${ get(this, 'id') }&var-port=9100`;
        break;
      case 'workload':
        grafanaUrl += this.getWorkloadGrafanaUrl();
        break;
      case 'pod':
        grafanaUrl += `?var-namespace=All&var-pod=${ get(this, 'id') }&var-container=All`;
        break;
      }

      set(this, 'grafanaUrl', grafanaUrl);
    });
  },

  getWorkloadGrafanaUrl() {
    const workloadType = get(this, 'workloadType');

    switch (workloadType) {
    case 'deployment':
      return `?var-deployment_namespace=${ get(this, 'namespace') }&var-deployment_name=${ get(this, 'id') }`;
    case 'daemonSet':
      return `?var-daemonset_namespace=${ get(this, 'namespace') }&var-daemonset_name=${ get(this, 'id') }`;
    case 'statefulSet':
      return `?var-statefulset_namespace=${ get(this, 'namespace') }&var-statefulset_name=${ get(this, 'id') }`;
    }
  },

  query() {
    set(this, 'loading', true);
    let query;

    switch ( get(this, 'duration') ) {
    case 'min':
      query = 'from=now-5m&end=now&interval=5s';
      break;
    case 'hour':
      query = 'from=now-1h&end=now&interval=60s';
      break;
    case 'day':
      query = 'from=now-24h&end=now&interval=1440s';
      break;
    case 'week':
      query = 'from=now-168h&end=now&interval=10080s';
      break;
    }

    this.sendAction('queryAction', {
      cb: () => {
        set(this, 'loading', false);
      },
      query,
    });
  },

});
