function fetchGPMList(){
  $.get(
    'http://digital-triplet.net:3030/akiyama', 
    {query:`\
    PREFIX pd3: <http://DigitalTriplet.net/2021/08/ontology#>\
    PREFIX d3: <http://digital-triplet.net/>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    select distinct ?gen\
    where {\
      graph ?gen {\
        ?s ?p ?o;\
      }\
    }\
    `},
    addGPMList,
    "json"
  );
}

function addGPMList(data){
  modelList = data["results"]["bindings"];
  modelList.forEach(model => {
    /// option要素を動的に生成＆追加
    var option = $('<option>')
      .text(model['gen']['value'].replace('http://digital-triplet.net/',''))
      .val(model['gen']['value']);
    $("#selectModel").append(option);
  });
  fetchActionList();
}

function fetchActionList(){
  model = $("#selectModel").val();
  $.get(
    'http://digital-triplet.net:3030/akiyama', 
    {query:`\
    PREFIX pd3: <http://DigitalTriplet.net/2021/08/ontology#>\
    PREFIX d3: <http://digital-triplet.net/>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    select ?actionName\
    where {\
      graph <` + model + `> {\
        ?s a pd3:Action;\
        pd3:value ?actionName\
        FILTER (?actionName != "Start" && ?actionName != "end" && ?actionName != "End")
      }\
    }\
    `},
    addActionList,
    "json"
  );
}

function addActionList(data){
  actionList = data["results"]["bindings"];
  $('#selectAction *').remove();
  actionList.forEach(action => {
    /// option要素を動的に生成＆追加
    var option = $('<option>')
      .text(action['actionName']['value'].replace('<br>',''))
      .val(action['actionName']['value']);
    $("#selectAction").append(option);
  });
}

function searchAction(actionName)
{
  actionName = $("#selectAction").val()
  model = $("#selectModel").val();
  $.get(
    'http://digital-triplet.net:3030/akiyama', 
    {query:`\
    PREFIX pd3: <http://DigitalTriplet.net/2021/08/ontology#>\
    PREFIX d3: <http://digital-triplet.net/>\
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
    select distinct ?log\
      where {\
        GRAPH <`+ model +`>\
        {\
          ?s ?p ?o;\
          rdfs:seeAlso ?log_action;\
          pd3:value ?action_name.\
          filter(?action_name = "`+actionName+`")\
        }\
        GRAPH ?log\
        {\
          ?log_action ?log_p ?log_o.\
        }\
      }\
    `},
    success,
    "json"
  );
}
    
function success(data) {
  logArray = data["results"]["bindings"]
  $('tbody *').remove();
  logArray.forEach(log => {
    $("tbody").append(
      $("<tr></tr>")
        .append($("<td></td>").text(log["log"]["value"].replace('http://digital-triplet.net/','')))
        .append($("<td></td>").append($("<a href='#'></a>").text("リンク（未実装）")))
    )
  })
}

fetchGPMList();

