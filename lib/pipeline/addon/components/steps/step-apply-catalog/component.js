import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'ui/utils/constants';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = { path: './deployment.yaml',  };

export default Component.extend(Step, {
  catalog:     service(),
  scope:       service(),
  globalStore: service(),

  layout,

  config:        null,
  field:         'applyAppConfig',
  defaultConfig: DEFAULT_CONFIG,
  loading:       false,
  isYaml:        false,

  init() {
    this._super(...arguments);
    this.initNamespace();
    this.initCatalog();
    this.initAnswers();
  },

  appDidChange: observer('config.applyAppConfig.catalog', function() {
    set(this, 'versions', null);
    set(this, 'config.applyAppConfig.version', null);

    const name = get(this, 'config.applyAppConfig.catalog');

    if ( !name ) {
      return;
    }
    const app = get(this, 'apps').findBy('id', name);

    const versions = [];

    if ( app ) {
      Object.keys(get(app, 'versionLinks') || {}).forEach((v) => {
        versions.push({
          id:   v,
          name: v
        });
      });
    }
    set(this, 'versions', versions);

    if ( get(versions, 'length') ) {
      set(this, 'config.applyAppConfig.version', get(this, 'versions.lastObject.id'));
    }
  }),

  catalogDidChange: observer('catalogStore', function() {
    const catalogStore = get(this, 'catalogStore');
    const apps = get(this, 'allApps').filterBy('catalogId', catalogStore);

    set(this, 'apps', apps);

    if ( !apps.findBy('id', get(this, 'config.applyAppConfig.catalog')) ) {
      set(this, 'config.applyAppConfig.catalog', null);
    }
  }),

  namespaceDidChange: observer('namespace.id', 'namespace.name', function() {
    set(this, 'config.applyAppConfig.targetNamespace', get(this, 'namespace.id') || get(this, 'namespace.name'));
  }),

  initNamespace() {
    const namespaceId = get(this, 'config.applyAppConfig.targetNamespace');

    if ( namespaceId ) {
      set(this, 'namespace', {
        name: namespaceId,
        id:   namespaceId
      });
    }
  },

  initCatalog() {
    const catalogs = get(this, 'globalStore').all('catalog')

    if ( get(catalogs, 'length') === 0 ) {
      set(this, 'loading', true);
      get(this, 'catalog').fetchCatalogs({ headers: { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') } }).then((catalogs) => {
        get(this, 'catalog').fetchTemplates()
          .then((res) => {
            set(this, 'allApps', res.catalog);
            this.setCatalogs(catalogs);
          }).finally(() => {
            set(this, 'loading', false);
          });
      })
    } else {
      set(this, 'loading', true);
      get(this, 'catalog').fetchTemplates()
        .then((res) => {
          set(this, 'allApps', res.catalog);
          this.setCatalogs(catalogs);
        }).finally(() => {
          set(this, 'loading', false);
        });
    }
  },

  initAnswers() {
    let answers = get(this, 'config.applyAppConfig.answers');

    if ( answers ) {
      try {
        answers = JSON.parse(answers);
        set(this, 'isYaml', false);
      } catch (e) {
        set(this, 'isYaml', true);
      }
      set(this, 'config.applyAppConfig.answers', answers);
    }
  },

  setCatalogs(catalogs) {
    set(this, 'catalogs', catalogs.map((obj) => {
      return {
        name: (get(obj, 'name') || '').capitalize(),
        id:   get(obj, 'id')
      }
    }));

    const template = get(this, 'config.applyAppConfig.catalog');

    const app = get(this, 'allApps').findBy('id', template);

    if ( app ) {
      const found = catalogs.findBy('id', get(app, 'catalogId'));

      if ( found ) {
        set(this, 'catalogStore', get(found, 'id'));
      }
    }
  },

  validate() {
    const errors = [];

    this.validateField('catalog', errors);
    this.validateField('name', errors);
    this.validateField('version', errors);
    this.validateField('targetNamespace', errors);

    return errors;
  },

  validateField(key, errors) {
    const intl = get(this, 'intl');
    const config = get(this, 'config.applyAppConfig');

    if ( !get(config, key) || get(config, key).trim() === '' ) {
      errors.push(intl.t('generic.required', { key: intl.t(`newPipelineStep.stepType.applyApp.${ key }.label`) }));
    }
  }
});
