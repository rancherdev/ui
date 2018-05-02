import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  scope: service(),
  globalStore: service(),

  model: function(/*params, transition*/) {
    const globalStore = get(this, 'globalStore');
    const clusterId = get(this, 'scope.currentCluster.id')
    const project = globalStore.findAll('project').then(collection => {
      // If default project exists, use defualt project.
      // If defualt project doesn't exists, use the projects.firstObject
      let project = collection.filter(item => {
        return get(item, 'clusterId') === clusterId
          && (get(item, 'name') || '').toLowerCase() === 'default';
      }).get('firstObject');

      if (!project) {
        project = get(collection, 'firstObject');
      }
      return project;
    });


    return hash({project}).then(({project: p}) => {
      const projectId = get(p, 'id');
      const artifactoryWorkload = globalStore.rawRequest({
        url: `project/${projectId}/workloads`,
      }).then(res => {
        return res.body.data.filter(item => {
          const id = 'deployment:artifactory-embedded:artifactory-embedded-artifactory';
          return get(item, 'id') === id;
        }).get('firstObject');
      });
      debugger
      return hash({
        artifactoryWorkload,
        dockerCredential: this.get('store').createRecord({
          type: 'dockerCredential',
          registries: {
            'index.docker.io': {
              username: '',
              password: '',
            }
          }
        }),
      });
    });
  },
});
