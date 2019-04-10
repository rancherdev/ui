import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';
import { get, set, observer, setProperties } from '@ember/object';
import C from 'ui/utils/constants';

const DURATION = [60, 300, 600, 1800, 3600, 10800, 21600]

export default Component.extend({
  scope:       service(),
  globalStore: service(),
  growl:       service(),
  prefs:       service(),

  classNames:  ['istio-graph'],
  layout,

  loading:         false,
  durationContent: null,
  namespaces:      alias('scope.currentProject.namespaces'),

  init() {
    this._super(...arguments);

    let defaultDuration = 60;
    const periodPref = get(this, `prefs.${ C.PREFS.ISTIO_PERIOD }`);

    if ( periodPref ) {
      defaultDuration = periodPref;
    }

    setProperties(this, {
      duration:        defaultDuration,
      namespace:       get(this, 'namespaces.firstObject.id'),
      durationContent: DURATION.map((d) => ({
        label: `istio.trafficMonitoring.duration.${ d }`,
        value: `${ d }`
      }))
    });

    this.fetchData();
  },

  actions: {
    refresh() {
      this.fetchData();
    },
  },

  namespaceDidChange: observer('namespace', function() {
    set(this, 'forceFit', true);
    this.fetchData();
  }),

  durationDidChange: observer('duration',  function() {
    set(this, `prefs.${ C.PREFS.ISTIO_PERIOD }`, get(this, 'duration'));
    set(this, 'forceFit', true);
    this.fetchData();
  }),

  fetchData() {
    set(this, 'loading', true);
    let url = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/api/namespaces`
    const queryParams = `/graph?duration=${ get(this, 'duration') }s&graphType=versionedApp&injectServiceNodes=true&groupBy=app&appenders=deadNode,sidecarsCheck,serviceEntry,istio`

    url += `${ queryParams  }&namespaces=${ get(this, 'namespace') }`
    get(this, 'globalStore')
      .rawRequest({
        url,
        method:  'GET',
        headers: { 'X-Auth-Type-Kiali-UI': '1' },
      })
      .then((res) => {
        const { body = {} } = res

        set(this, 'elements', body.elements)
      })
      .catch((err) => {
        get(this, 'growl').fromError(get(err, 'body'))
      })
      .finally(() => {
        set(this, 'loading', false);
      })
  },
});
