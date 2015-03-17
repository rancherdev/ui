import Ember from 'ember';
import C from 'ui/utils/constants';

var DRIVERS = [
  {route: 'hosts.new.digitalocean',   label: 'DigitalOcean',      available: true },
  {route: 'hosts.new.openstack',      label: 'OpenStack',         available: false },
  {route: 'hosts.new.custom',         label: 'Custom/Bare Metal', available: true  },
];

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.custom',
  drivers: DRIVERS,

  isAdmin: function() {
    var userType = this.get('session').get(C.USER_TYPE_SESSION_KEY);
    var isAdmin = userType === undefined || userType === C.USER_TYPE_ADMIN;
    return isAdmin;
  }.property(),
});
