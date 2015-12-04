import Ember from 'ember';
import C from 'ui/utils/constants';

const NONE = 'none',
      LOADING = 'loading',
      CURRENT = 'current',
      AVAILABLE = 'available',
      ERROR = 'error';

var queue = async.queue(getUpgradeInfo, 2);

function getUpgradeInfo(task, cb) {
  var obj = task.obj;

  obj.get('store').request({url: task.url}).then((upgradeInfo) => {
    if ( obj._state !== 'destroying' )
    {
      upgradeInfo.id = task.id;
      obj.set('upgradeInfo', upgradeInfo);
      if ( upgradeInfo && upgradeInfo.upgradeVersionLinks && Object.keys(upgradeInfo.upgradeVersionLinks).length )
      {
        obj.set('upgradeStatus', AVAILABLE);
      }
      else
      {
        obj.set('upgradeStatus', CURRENT);
      }
    }
  }).catch((/*err*/) => {
    obj.set('upgradeStatus', ERROR);
  }).finally(() => {
    cb();
  });
}

export default Ember.Component.extend({
  environmentResource: null,
  upgradeStatus: null,

  tagName: 'button',
  classNames: ['btn','btn-sm'],
  classNameBindings: ['btnClass'],

  upgradeInfo: null,

  didInitAttrs() {
    this.updateStatus();
  },

  click: function() {
    var upgradeInfo = this.get('upgradeInfo');

    if ( this.get('upgradeStatus') === AVAILABLE && !this.get('isUpgradeState') )
    {
      // Hackery, but no good way to get the template from upgradeInfo
      var tpl = upgradeInfo.id;

      this.get('application').transitionToRoute('applications-tab.catalog.launch', tpl, {queryParams: {
        environmentId: this.get('environmentResource.id'),
        upgrade: this.get('upgradeInfo.id'),
      }});
    }
  },

  btnClass: function() {
    if ( this.get('isUpgradeState') )
    {
      return 'btn-disabled';
    }

    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return 'hide';
      case LOADING:
      case CURRENT:
      case ERROR:
        return 'btn-disabled';
      case AVAILABLE:
        return 'btn-warning';
    }
  }.property('upgradeStatus','isUpgradeState'),

  btnLabel: function() {
    if ( this.get('isUpgradeState') )
    {
      return 'Upgrade in progress';
    }

    switch ( this.get('upgradeStatus') ) {
      case NONE:
        return '';
      case LOADING:
        return 'Checking Upgrades...';
      case CURRENT:
        return 'Up to date';
      case AVAILABLE:
        return 'Upgrade Available';
      default:
        return 'Error checking upgrades';
    }
  }.property('upgradeStatus','isUpgradeState'),

  updateStatus() {
    var info = this.get('environmentResource.externalIdInfo');
    if ( info.kind === C.EXTERNALID.KIND_CATALOG )
    {
      this.set('upgradeStatus', LOADING);
      queue.push({
        id: info.id,
        url: this.get('app.catalogEndpoint')+'/templateversions/'+ info.id,
        obj: this
      });
    }
    else
    {
      this.set('upgradeStatus', NONE);
    }
  },

  isUpgradeState: function() {
    return [
      'uprading',
      'canceled-upgrade',
      'canceling-rollback',
      'canceling-upgrade',
      'finishing-upgrade',
      'rolling-back',
      'upgrading',
      'upgraded'
    ].indexOf(this.get('environmentResource.state')) >= 0;
  }.property('environmentResource.state'),

  externalIdChanged: function() {
    this.updateStatus();
  }.observes('environmentResource.externalId'),
});
