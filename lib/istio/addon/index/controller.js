import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  scope:  service(),

  cluster: alias('scope.currentCluster'),

  kialiUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/`
  }),

  jaegerUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:tracing:80/proxy/`
  }),

  grafanaUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:grafana:80/proxy/`
  }),

  prometheusUrl: computed('cluster.id', function() {
    return `/k8s/clusters/${ get(this, 'cluster.id') }/api/v1/namespaces/istio-system/services/http:prometheus:80/proxy/`
  }),

});
