import {
  scheduleOnce
} from '@ember/runloop';
import {
  inject as service
} from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import {
  get,
  set,
  observer,
  computed
} from '@ember/object'


// Remember the last value and use that for new one
var lastContainer = 'ubuntu:xenial';

export default Component.extend({
  layout,
  scope: service(),

  // Inputs
  initialValue: null,
  errors: null,

  userInput: null,
  tagName: '',
  value: null,
  allPods: null,

  actions: {
    setInput(str) {
      set(this, 'userInput', str);
    },
  },

  init() {
    this._super(...arguments);
    set(this, 'allPods', get(this, 'store').all('pod'));

    let initial = get(this, 'initialValue') || '';

    if (!initial) {
      initial = lastContainer;
    }

    scheduleOnce('afterRender', () => {
      this.send('setInput', initial);
      this.userInputDidChange();
    });
  },

  userInputDidChange: observer('userInput', function () {
    var input = (get(this, 'userInput') || '').trim();
    var out;

    if (input && input.length) {
      lastContainer = input;
      out = input;
    } else {
      out = null;
    }

    set(this, 'value', out);
    this.sendAction('changed', out);
    this.validate();
  }),

  validate() {
    var errors = [];
    if (!get(this, 'value')) {
      errors.push('Image is required');
    }

    set(this, 'errors', errors);
  },

  suggestions: computed('userInput', 'allPods.@each.containers', 'projectDockerCredentials.[]', 'namespacedDockerCredentials.[]', 'namespace.id', function () {
    let inUse = [];
    get(this, 'allPods').forEach((pod) => {
      inUse.addObjects(pod.get('containers') || []);
    });

    inUse = inUse.map((obj) => (obj.get('image') || ''))
      .filter((str) => !str.includes('sha256:') && !str.startsWith('rancher/'))
      .uniq()
      .sort();

    const projectDockerCredentials = get(this, 'projectDockerCredentials') || [];
    const namespacedDockerCredentials = get(this, 'namespacedDockerCredentials') || [];
    const namespace = get(this, 'namespace');

    let allRegistries = [];
    const userInput = get(this, 'userInput');

    projectDockerCredentials.forEach((registry) => {
      const registries = get(registry, 'registries');
      Object.keys(registries).forEach((key) => {
        allRegistries.push(key);
      })
    });

    namespacedDockerCredentials.filter((registry) => get(registry, 'namespaceId') === (namespace, 'id')).forEach((registry) => {
      const registries = get(registry, 'registries');
      Object.keys(registries).forEach((key) => {
        allRegistries.push(key);
      })
    });

    const result = {
      'Used by other containers': inUse,
    };

    if ( !allRegistries.any((r) => (userInput || '').startsWith(r)) ) {
      result['From resgistry'] = allRegistries.map((r) => `${r}/docker-local/${userInput}`);
    }

    return result;
  }),

});
