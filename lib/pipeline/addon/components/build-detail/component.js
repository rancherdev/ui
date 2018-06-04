import Component from '@ember/component';
import { get, computed } from '@ember/object';

export default Component.extend({
  build: computed('model.executions.@each.run', 'model.run', function() {

    return get(this, 'model.executions').find((exe) => get(exe, 'pipelineId') === get(this, 'model.pipeline.id') && get(exe, 'run') === parseInt(get(this, 'model.run'), 10));

  }),
});
