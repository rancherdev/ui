import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmbObject, { get, set } from '@ember/object';
import { hash } from 'rsvp';

// Lots and lots of hard coded stuff
const name = 'artifactory-embedded';
const externalId ='catalog://?catalog=artifactory&template=artifactory&version=7.1.2';

export default Route.extend({
  globalStore: service(),
  clusterStore: service(),

  model(params, transition) {
    const globalStore = get(this, 'globalStore');
    const clusterStore = get(this, 'clusterStore');
    const clusterId = transition.params['authenticated.cluster'].cluster_id;
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

    const namespace = clusterStore.findAll('namespace').then(ns => {
        return ns.filterBy('name', name).get('firstObject');
    });

    return hash({project, namespace}).then(({project: p, namespace}) => {

      const projectId = get(p, 'id');

      const artifactoryWorkload = globalStore.rawRequest({
        url: `project/${projectId}/workloads`,
      }).then(res => {
        return res.body.data.filter(item => {
          // harded artifactory workload id
          const id = 'deployment:artifactory-embedded:artifactory-embedded-artifactory';
          return get(item, 'id') === id;
          // && get(item, 'namespaceId') === name;
        }).get('firstObject');
      });

      return globalStore.rawRequest({
        url: `project/${projectId}/apps`,
      }).then(res => {
        const data = res.body.data || [];
        let app = data.filter(item => {
          console.log(item, get(item, 'projectId'));
          return get(item, 'projectId') === projectId
            && item.externalId === externalId
            && item.targetNamespace === name
            && item.state !== 'removing';
        }).get('firstObject');

        if (!namespace) {
          namespace = clusterStore.createRecord({
            type: 'namespace',
            name,
            projectId: projectId,
          });
        }

        if (!app) {
          app = EmbObject.create({
            type: 'app',
            name,
            targetNamespace: name,
            projectId,
            externalId,
            answers: null,
          });
        }
        return hash({
          artifactoryWorkload,
          catalogApp: app,
          namespace,
          project: p,
        });

      });
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    set(controller, 'refreshModel', this.refresh.bind(this));
    if (get(model.catalogApp, 'id')) {
      set(controller, 'type', 'artifactory');
    }

    const answers = get(model, 'catalogApp.answers') || {};
    const requestsCpu = answers['artifactory.resources.requests.cpu'];
    const limitsCpu = answers['artifactory.resources.limits.cpu'];
    const password = answers['artifactory.newInitPassword'];
    debugger
    set(controller, 'passwordAgain', password);
    set(controller, 'answers', {
      serviceType: answers['artifactory.service.type'] || 'NodePort',
      licenses: answers['artifactory.licenses'] ,
      newInitPassword: password,
      enablePersistence: answers['artifactory.persistence.enabled'] === 'true',
      requestsMemory: answers['artifactory.resources.requests.memory'],
      limitsMemory: answers['artifactory.resources.limits.memory'],
      requestsCpu: requestsCpu ? parseInt(requestsCpu) / 1000 : null,
      limitsCpu: limitsCpu ? parseInt(limitsCpu) / 1000 : null,
    });
  }
});
