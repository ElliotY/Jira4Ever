var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

var JQL = require('./JQL.js');

var clientId = '';
var clientSecret = '';

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const PORT = 4370;

app.listen(PORT, function() {
  console.log("Jira4Ever listening on port: " + PORT);
});

app.get('/', function(req, res) {
  res.send('Jira4Ever is working! Path Hit: ' + req.url);
});

app.get('/oauth', function(req, res) {
  if (!req.query.code) {
    res.status(500);
    res.send({
      "Error": "OAuth seems to be having some issues."
    });
  } else {
    request({
      url: 'https://slack.com/api/oauth.access', //URL to hit
      qs: {
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret
      }, //Query string data
      method: 'GET',

    }, function(error, response, body) {
      if (error) {
        console.log(error);
      } else {
        res.json(body);
      }
    })
  }

  app.post('/command', function(req, res) {
    res.status('200').send('Retrieving Jiras . . . :robot_face:');

    var response_url = req.body.response_url;
    //console.log(response_url);

    var output = JQL.parseInputString(req.body.text.toLowerCase(), req.body.user_name);

    var url = output.url,
      userString = output.assignee,
      statusString = output.status,
      typeString = output.type;

    request({
      url: url
    }, function(error, response, body) {
      var res_json = JSON.parse(response.body);

      /* Creating response obj to Slack*/
      var attachments = [];
      var text = "";
      for (var i = 0; i < res_json.issues.length; i++) {

        var fix_versions_name = "";
        if (res_json.issues[i].fields.fixVersions.length != 0)
          fix_versions_name = " (" + res_json.issues[i].fields.fixVersions[0].name + ")";

        var components = "";
        if (res_json.issues[i].fields.components.length != 0)
          components = res_json.issues[i].fields.components[0].name;

        var label = res_json.issues[i].fields.labels;
        if (label.length == 0)
          label = " | ";
        else {
          label = " | " + label.toString() + " | ";
        }

        var obj_to_slack = {};
        obj_to_slack['title'] = "[" + res_json.issues[i].fields.issuetype.name + "] " + res_json.issues[i].key + " - " + res_json.issues[i].fields.summary;
        obj_to_slack['title_link'] = "https://jira.jira.com/browse/" + res_json.issues[i].key;
        obj_to_slack['color'] = '#3AA3E3';
        obj_to_slack['text'] = components + label + fix_versions_name;
        obj_to_slack['attachment_type'] = 'default';
        obj_to_slack['mrkdwn_in'] = ['text', 'fields'];
        attachments.push(obj_to_slack);

        //text += res_json.issues[i].key + " - " + res_json.issues[i].fields.summary + "\n\n";
      }
      var vstr = "";
      if (req.body.text.toLowerCase().includes('-v'))
        vstr = "in_channel";

      var obj_to_slack = {

        "response_type": vstr,
        "text": "Jiras for " + output.assignee,
        "attachments": attachments
      };

      //console.log(obj_to_slack);

      /* Send message obj to slack */
      request({
        url: response_url,
        method: 'POST',
        json: obj_to_slack
      }, function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
          console.log(response.statusCode, body);
        }
      });
    });
  });
});