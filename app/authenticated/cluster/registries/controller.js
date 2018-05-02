import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Controller.extend(NewOrEdit, {
  globalStore: service(),
  queryParams: ['type'],
  type: 'none',

  catalogApp: alias('model.catalogApp'),
  enabled: alias('catalogApp.id'),  
  publicEndpoints: alias('model.artifactoryWorkload.publicEndpoints'),

  intl: service(),
  answers: null,
  more: false,
  errors: null,
  primaryResource: alias('model.catalogApp'),
  confirmDisable: false,
  disabling: false,
  enabling: false,
  passwordAgain: null,

  artifactoryUrl: function () {
    const endpoint = (get(this, 'publicEndpoints') || []).get('firstObject');
    if (!endpoint) {
      return null;
    }
    const address = (get(endpoint, 'addresses') || []).get('firstObject');
    const port = get(endpoint, 'port');

    if (!address || !port) {
      return null;
    }

    return `http://${address}:${port}`;
  }.property('publicEndpoints.@.{address,port}'),

  types: function() {
    return [
      {
        type: 'none',
        label: 'artifactoryPage.types.none',
        css: 'none',
        disabled: false,
      },
      {
        type: 'artifactory',
        css: `artifactory ${get(this, 'enabled') ? 'current' : ''}` ,
        disabled: false,
      },
    ];
  }.property('type', 'enabled'),

  validatePassword() {
    const p = get(this, 'answers.newInitPassword') || '';
    const p1 = get(this, 'passwordAgain') || '';
    const errors = [] ;

    if (p.trim() !== p1.trim()) {
      errors.push('artifactoryPage.password don\'t match');
      set(this, 'errors', errors);
      return false;
    }
    return true;
  },

  saveDisabled: function() {
    return get(this, 'type') === 'none' && !get(this, 'enabled');
  }.property('type', 'enabled'),

  willSave() {
    set(this, 'errors', null);
    const ok = this.validatePassword();

    if (!ok) {
      return false;
    }

    const {
      newInitPassword,
      enablePersistence,
      serviceType,
      limitsMemory,
      requestsMemory,
      limitsCpu,
      requestsCpu,
      licenses,
    } = get(this, 'answers');

    const outAnswers = {
      'artifactory.licenses': licenses,
      'artifactory.newInitPassword': newInitPassword,
      'artifactory.service.type': serviceType,
      'nginx.enabled': false,
      'artifactory.persistence.enabled': enablePersistence,
      'postgresql.persistence.enabled': enablePersistence,
    };

    if (requestsMemory) {
      outAnswers['artifactory.resources.requests.memory'] = requestsMemory;
    }

    if (limitsMemory) {
      outAnswers['artifactory.resources.limits.memory'] = limitsMemory;
    }

    if (requestsCpu) {
      outAnswers['artifactory.resources.requests.cpu'] = requestsCpu * 1000 + 'm';
    }

    if (limitsCpu) {
      outAnswers['artifactory.resources.limits.cpu'] = limitsCpu * 1000 + 'm';
    }

    set(this, 'catalogApp.answers', outAnswers);
    return true;
  },
  actions: {
    toggle() {
      set(this, 'more', !get(this, 'more'));
    },

    delete(cb) {
      setTimeout(() => {
        set(this, 'enabled', false);
        cb();
      }, 3000);
    },

    save(cb) {
      const type = get(this, 'type');
      const enabled = get(this, 'enabled');
      const ok = this.willSave();

      if (!ok) {
        cb();
        return;
      }

      const app = get(this, 'catalogApp');
      const projectId = get(this, 'model.project.id');

      if (enabled && type === 'artifactory') {
        // upgrade
        get(this, 'globalStore').rawRequest({
          method: 'put',
          url: `project/${projectId}/apps/${get(app, 'id')}`,
          data: app,
        }).then(() => {
          this.refreshModel();
          cb(true);
        }).catch(err => {
          cb();
          set(this, 'errors', [err.body.message]);
        });

      } else if (!enabled && type === 'artifactory') {
        // create
        const nsId = get(this, 'model.namespace.id');

        if (!nsId) {
          // if namespace for artifactory doesn't exists, create one first
          get(this, 'model.namespace').save().then(() => {
            return get(this, 'globalStore').rawRequest({
              method: enabled ? 'put' : 'post',
              url: `projects/${projectId}/app`,
              data: get(this, 'catalogApp'),
            }).then(() => {
              this.refreshModel();
              cb(true);
            });
          }).catch(err => {
            cb();
            set(this, 'errors', [err.body.message]);
          });
        } else {
           get(this, 'globalStore').rawRequest({
            method: enabled ? 'put' : 'post',
            url: `projects/${projectId}/app`,
            data: get(this, 'catalogApp'),
          }).then(() => {
            this.refreshModel();
            cb(true);
          }).catch(err => {
            cb();
            set(this, 'errors', [err.body.message]);
          });
        }
        return;
      }

      if (type === 'none' && enabled) {
        // delete
        get(this, 'globalStore').rawRequest({
          method: 'delete',
          url: `project/${projectId}/apps/${get(app, 'id')}`,
        }).then(() => {
          this.refreshModel();
          cb(true);
        }).catch(err => {
          cb();
          set(this, 'errors', [err.body.message]);
        });
      }
    },
  },

});
