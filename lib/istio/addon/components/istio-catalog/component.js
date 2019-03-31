import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import CrudCatalog from 'shared/mixins/crud-catalog';

const APP_VERSION = 'catalog://?catalog=istio&template=rancher-istio&version=1.1.0';

export default Component.extend(CrudCatalog, {
  layout,

  answers:    null,
  appName:    'cluster-istio',
  nsName:     'istio-system',
  appVersion: APP_VERSION,

  init() {
    this._super(...arguments);

    let customAnswers = {};

    if ( get(this, 'enabled') ) {
      const answers = get(this, 'app.answers') || {};

      Object.keys(answers).forEach((key) => {
        switch (key) {
        default:
          customAnswers[key] = answers[key];
        }
      });
    } else {
      customAnswers = {
        'enableCRDs':                           true,
        'galley.enabled':                       true,
        'grafana.enabled':                      true,
        'grafana.service.type':                 'ClusterIP',
        'kiali.dashboard.authStrategy':         'anonymous',
        'kiali.enabled':                        true,
        'kiali.service.type':                   'ClusterIP',
        'mixer.telemetry.enabled':              true,
        'mixer.enabled':                        true,
        'mixer.policy.enabled':                 true,
        'pilot.enabled':                        true,
        'prometheus.enabled':                   true,
        'prometheus.service.ClusterIP.enabled': true,
        'prometheus.service.ClusterIP.port':    32090,
        'security.enabled':                     true,
        'sidecarInjectorWebhook.enabled':       true,
        'tracing.enabled':                      true,
        'tracing.service.uiType':               'ClusterIP'
      }
    }
    set(this, 'customAnswers', customAnswers);
  },

  actions: {
    save(cb) {
      const answers = {};

      this.save(cb, answers);
    }
  },
});
