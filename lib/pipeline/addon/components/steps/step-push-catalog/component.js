import Component from '@ember/component';
import layout from './template';
import { set, get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = {
  gitBranch: 'master',
  gitAuthor: 'pipeline',
  gitEmail:  'pipeline@example.com'
};
const HTTP = 'https://';
const HTTPS = 'https://';
const HTTP_MODE = 'http';
const SSH_MODE = 'ssh';
const USERNAME = 'USERNAME';
const PASSWORD = 'PASSWORD';
const DEPLOY_KEY = 'DEPLOY_KEY';

export default Component.extend(Step, {
  scope: service(),
  layout,

  config:        null,
  field:         'publishCatalogConfig',
  defaultConfig: DEFAULT_CONFIG,

  init() {
    this._super(...arguments);

    this.initMode();
    this.initSecret();
  },

  modeDidChange: observer('mode', function() {
    if ( get(this, 'mode') === HTTP_MODE ) {
      set(this, 'username', {
        source:    'secret',
        sourceKey: null,
        targetKey: USERNAME
      });

      set(this, 'password', {
        source:    'secret',
        sourceKey: null,
        targetKey: PASSWORD
      });
    } else {
      set(this, 'deployKey', {
        source:    'secret',
        sourceKey: null,
        targetKey: DEPLOY_KEY
      });
    }
  }),

  initMode() {
    if ( !get(this, 'config.gitUrl') || get(this, 'config.gitUrl').startsWith(HTTP) || get(this, 'config.gitUrl').startsWith(HTTPS) ) {
      set(this, 'mode', HTTP_MODE);
    } else {
      set(this, 'mode', SSH_MODE);
    }
  },

  initSecret() {
    const projectId = get(this, 'scope.currentProject.id').split(':')[1];

    set(this, 'namespace', { id: `${ projectId }-pipeline` });
    const envFrom = get(this, 'config.envFrom') ;

    if ( !envFrom ) {
      this.modeDidChange();
    } else {
      if ( get(this, 'mode') === HTTP_MODE ) {
        this.setSecret(USERNAME);
        this.setSecret(PASSWORD);
      } else {
        this.setSecret(DEPLOY_KEY);
      }
    }
  },

  setSecret(key) {
    const envFrom = get(this, 'config.envFrom') ;
    let d = envFrom.findBy('targetKey', key);

    if ( !d ) {
      d = envFrom.filter((k) => !get(k, 'targetKey')).findBy('sourceKey', key);
    }

    if ( d ) {
      set(d, 'source', 'secret');
      switch (key) {
      case USERNAME:
        set(this, 'username', d);
        break;
      case PASSWORD:
        set(this, 'password', d);
        break;
      case DEPLOY_KEY:
        set(this, 'deployKey', d);
        break;
      }
    }
  },

  willSave() {
    const envFrom = [];

    if ( get(this, 'mode') === HTTP_MODE ) {
      envFrom.push(get(this, 'username'));
      envFrom.push(get(this, 'password'));
    } else {
      envFrom.push(get(this, 'deployKey'));
    }
    set(this, 'config.envFrom', envFrom);
  },

  validate() {
    const intl = get(this, 'intl');
    const errors = [];

    this.validateField('path', errors);
    this.validateField('catalog', errors);
    this.validateField('version', errors);
    this.validateField('gitUrl', errors);
    this.validateField('gitBranch', errors);
    this.validateField('gitAuthor', errors);
    this.validateField('gitEmail', errors);

    if ( get(this, 'mode') === HTTP_MODE ) {
      if ( !get(this, 'username.sourceKey') || !get(this, 'username.sourceName') ) {
        errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.auth.username.label`) }));
      }

      if ( !get(this, 'password.sourceKey') || !get(this, 'password.sourceName') ) {
        errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.auth.password.label`) }));
      }
    } else {
      if ( !get(this, 'deployKey.sourceKey') || !get(this, 'deployKey.sourceName') ) {
        errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.auth.deployKey.label`) }));
      }
    }

    return errors;
  },

  validateField(key, errors) {
    const intl = get(this, 'intl');
    const config = get(this, 'config.publishCatalogConfig');

    if ( !get(config, key) || get(config, key).trim() === '' ) {
      errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.publishCatalog.${ key }.label`) }));
    }
  }
});
