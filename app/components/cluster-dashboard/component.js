import C from 'ui/utils/constants';
import Component from '@ember/component';
import { set, get, computed, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from './template';

export default Component.extend({
  intl:   service(),
  scope:  service(),
  router: service(),

  layout,

  nodes:             null,
  components:        null,
  monitoringEnalbed: alias('scope.currentCluster.enableClusterMonitoring'),
  componentStatuses: alias('scope.currentCluster.componentStatuses'),

  init() {
    this._super(...arguments);
    this.setComponents();
    this.getGrafanaUrl();
  },

  actions: {
    enalbeMonitoring() {
      get(this, 'router').transitionTo('authenticated.cluster.monitoring');
    },
  },

  updateComponentsStatus: observer('componentStatuses.@each.conditions', 'nodes.@each.{state}', function() {
    this.setComponents();
  }),

  showDashboard:     computed('scope.currentCluster.isReady', 'nodes.[]', function() {
    return get(this, 'nodes').length && get(this, 'scope.currentCluster.isReady')
  }),

  inactiveNodes: computed('nodes.@each.state', function() {
    return get(this, 'nodes').filter( (n) => C.ACTIVEISH_STATES.indexOf(get(n, 'state')) === -1 );
  }),

  unhealthyComponents: computed('componentStatuses.@each.conditions', function() {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => !s.conditions.any((c) => c.status === 'True'));
  }),

  setComponents() {
    set(this, 'etcdHealthy', this.isHealthy('etcd'));
    set(this, 'controllerHealthy', this.isHealthy('controller-manager'));
    set(this, 'schedulerHealthy', this.isHealthy('scheduler'));
    set(this, 'nodesHealthy', get(this, 'inactiveNodes.length') === 0);
  },

  getGrafanaUrl() {
    const rootUrl = get(this, 'scope.currentCluster.monitoringStatus.grafanaEndpoint');

    set(this, 'rootUrl', rootUrl);
    get(this, 'globalStore').rawRequest({
      url:    `${ rootUrl }/api/search`,
      method: 'GET',
    }).then((xhr) => {
      const dashboards = xhr.body;

      this.setGrafanaUrl(dashboards, 'ETCD', 'etcd');
      this.setGrafanaUrl(dashboards, 'Scheduler', 'scheduler');
      this.setGrafanaUrl(dashboards, 'Controller Manager', 'controller');
      this.setGrafanaUrl(dashboards, 'Kubernetes Cluster Nodes', 'nodes');
    });
  },

  isHealthy(field) {
    return (get(this, 'componentStatuses') || [])
      .filter((s) => s.name.startsWith(field))
      .any((s) => s.conditions.any((c) => c.status === 'True'));
  },

  setGrafanaUrl(dashboards, title, id) {
    const target = dashboards.findBy('title', title);

    if ( target ) {
      set(this, `${ id }Url`, get(target, 'url'));
    }
  }
});
