var creds = require('./creds.js');

function createTypeSet() {
  var typeSet = new Set();

  //One Word Types
  typeSet.add("auto");
  typeSet.add("bug");
  typeSet.add("change");
  typeSet.add("deploy");
  typeSet.add("epic");
  typeSet.add("improvement");
  typeSet.add("security");
  typeSet.add("spike");
  typeSet.add("story");
  typeSet.add("sub-task");
  typeSet.add("task");
  typeSet.add("test");
  typeSet.add("toggle");
  //Two Word Types
  typeSet.add("new feature");
  typeSet.add("security review");
  typeSet.add("sub-task auto");
  typeSet.add("sub-task bug");
  typeSet.add("sub-task change");
  typeSet.add("sub-task doc");
  typeSet.add("sub-task test");
  typeSet.add("technical task");

  return typeSet;
}

function createStatusSet() {
  var statusSet = new Set();

  //One Word Statuses
  statusSet.add("answered");
  statusSet.add("backlog");
  statusSet.add("blocked");
  statusSet.add("canceled");
  statusSet.add("closed");
  statusSet.add("done");
  statusSet.add("failed");
  statusSet.add("hotpatch");
  statusSet.add("locked");
  statusSet.add("master");
  statusSet.add("open");
  statusSet.add("passed");
  statusSet.add("rc");
  statusSet.add("reopened");
  statusSet.add("resolved");
  statusSet.add("verified");
  //Two Word Statuses
  statusSet.add("cab review");
  statusSet.add("external draft");
  statusSet.add("in development");
  statusSet.add("in progress");
  statusSet.add("in review");
  statusSet.add("management review");
  statusSet.add("mgmt review");
  statusSet.add("on hold");
  statusSet.add("sec approved");
  statusSet.add("sec review");
  statusSet.add("technical review");
  statusSet.add("to do");
  statusSet.add("toggle verified");
  //Three Word Statuses
  statusSet.add("customer support review");
  statusSet.add("draft in progress");
  statusSet.add("final vp review");
  statusSet.add("hotpatch - revoke access");
  statusSet.add("in qa review");
  statusSet.add("publish to gold");
  statusSet.add("rc - revoke access");
  statusSet.add("ready for change");
  statusSet.add("returned for clarification");
  statusSet.add("selected for development");
  statusSet.add("waiting for qa");
  //Five Word Statuses
  statusSet.add("on hold pending more info");

  return statusSet;
}

function cleanInput(str) {
  str = str.toLowerCase();

  if (str.includes("subtask"))
    str = str.replace("subtask", "sub-task");
  if (str.includes("hotpatch revoke access"))
    str = str.replace("hotpatch revoke access", "hotpatch - revoke access");
  if (str.includes("rc revoke access"))
    str = str.replace("rc revoke access", "rc - revoke access");

  return str;
}

function findUsername(str, assignee) {
  var usernameRegex = new RegExp(/[\w]+\.[\w]+/g);
  var result = usernameRegex.exec(str);

  if (result !== null)
    return result[0];
  else
    return assignee;
}

function findFilterSet(str, itemSet) {
  var result = "";

  for (var item of itemSet) {
    if (str.includes(item)) {
      result = item;
    }
  }

  return result;
}

function printFilterSet(set) {
  for (item of set) {
    str += item + "\n";
  }

  return str;
}

function createURL(assignee, type, status) {
  var jira = "@jira.jira.com:443/rest/api/2/search?jql=";

  var username = encodeURIComponent(creds.user);
  var password = encodeURIComponent(creds.pw);

  var assigneeURL = "assignee = " + assignee;

  var typeURL = "";
  if (type !== "")
    typeURL = " AND type = " + type;

  var statusURL = "";
  if (status !== "")
    statusURL = " AND status = " + status;
  else
    statusURL = " AND status = " + '"' + "in progress" + '"';

  var url = 'https://' + username + ':' + password + jira + encodeURIComponent(assigneeURL + typeURL + statusURL);

  return url;
}

var methods = {
  parseInputString: function(str, defaultAssignee) {
    //Generating URL from input string
    str = cleanInput(str);

    var assignee = findUsername(str, defaultAssignee);

    var type = findFilterSet(str, createTypeSet());

    var status = findFilterSet(str, createStatusSet());

    var url = createURL(assignee, type, status);

    return {
      assignee: assignee,
      type: type,
      status: status,
      url: url
    };
  },

  printHelpText: function(str) {

    var typeSet = new Set();
    var typeSet = createTypeSet(typeSet);
    var statusSet = new Set();
    var statusSet = createStatusSet(statusSet);

    var output = printFilterSet(type);

    //return output;

    var attachments = [{
      "text": "Help Text Test!"
    }];

    var obj_to_slack = {
      "response_type": "ephemeral",
      "text": "How to use /jira:\n\n",
      "attachments": attachments
    };

    return obj_to_slack;
  }
};

module.exports = methods;