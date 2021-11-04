const sparqlModule = (() => {
  const fetch = require('isomorphic-fetch');
  const SparqlHttp = require('sparql-http-client');
  SparqlHttp.fetch = fetch
  const endpoint = new SparqlHttp({endpointUrl: 'http://digital-triplet.net:3030/akiyama'})

  return {
    fetchAction: () => {
      const query = `
      select ?actionName
      where {
        GRAPH <http://digital-triplet.net/generalized-process-model>
        {
          ?s ?p ?o;
          rdfs:seeAlso ?log_action;
          pd3:value ?actionName.
        }
      }
      `
      endpoint.selectQuery(query)
              .then(res => res.text())
              .then(body => {
                const result = JSON.parse(body)
                return result
              }).catch(err => console.errot(err))
    },
    fetchLog: (actionName) => {
      const query = `
      select ?log
      where {
        GRAPH ?gen
        {
          ?s ?p ?o;
          rdfs:seeAlso ?log_action;
          pd3:value ` + actionName + `
        }
        GRAPH ?log
        {
          ?log_action ?log_p ?log_o.
        }
      }
      `
      endpoint.selectQuery(query)
              .then(res => res.text())
              .then(body => {
                const result = JSON.parse(body)
                return result
              }).catch(err => console.errot(err))
    }
  }
})();