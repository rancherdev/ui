import { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  data: null,

  sortBy:     'time',
  descending: true,
  labelArray: null,

  headers: [
    {
      name:           'host',
      sort:           ['host'],
      translationKey: 'ingressResponse.host',
    },
    {
      name:           'path',
      sort:           ['path', 'host'],
      translationKey: 'ingressResponse.path',
    },
    {
      name:           'time',
      sort:           ['time', 'path', 'host'],
      translationKey: 'ingressResponse.responseTime',
    },
  ],

  init() {
    this._super(...arguments);

    set(this, 'data', [{
      path: '/app-1',
      host: 'app.mydomain.com',
      time: 102
    },
    {
      path: '/app-2',
      host: 'app.mydomain.com',
      time: 873
    },
    {
      path: '/app-3',
      host: 'app.mydomain.com',
      time: 607
    },
    {
      path: '/hello',
      host: 'hello.mydomain.com',
      time: 121
    },
    {
      path: '/hello-3',
      host: 'hello.mydomain.com',
      time: 631
    },
    {
      path: '/hello-2',
      host: 'hello.mydomain.com',
      time: 403
    },
    {
      path: '/hello-4',
      host: 'hello.mydomain.com',
      time: 4525
    },
    {
      path: '/hello-5',
      host: 'hello.mydomain.com',
      time: 2123
    },
    {
      path: '/app-4',
      host: 'app.mydomain.com',
      time: 313
    },
    {
      path: '/app-5',
      host: 'app.mydomain.com',
      time: 98
    }]);
  },
});
