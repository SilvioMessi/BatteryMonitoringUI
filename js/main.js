var globalReqId = 0;
var samples = [];
var columns = [ "ID", "TIMESTAMP", "BATTERY_PERCENTAGE", "BATTERY_IS_CHARGING" ];

function dateTimeToPrettyString(dateTime) {
	var month = dateTime.substring(5, 7);
	var day = dateTime.substring(8, 10);
	var hour = dateTime.substring(11, 13);
	var minute = dateTime.substring(14, 16);
	var dateTimeString = day + "/" + month + " " + hour + ":" + minute;
	return dateTimeString;
}

function successCb(result, id) {
	console.log("getValueSuccessCB result.length: " + result.length);
	if (result.length > 0) {
		for (var i = 0; i < result.length; i++) {
			samples.push({
				"id" : result[i].values[0],
				"dateTime" : result[i].values[1],
				"batteryPercentage" : result[i].values[2],
				"batteryIsCharging" : result[i].values[3]
			});
		}
		// the service returns 20 samples at time
		// keep asking until all the samples have been retrieved
		getBatteryInfo(samples[samples.length - 1].dateTime);
	} else {
		var html = "</br></br>";
		var length = samples.length;
		if (length > 0) {
			for (var i = 0; i < length; i++) {
				var dateTimePretty = dateTimeToPrettyString(samples[i].dateTime);
				var batteryPercentage = samples[i].batteryPercentage;
				var batteryIsCharging = samples[i].batteryIsCharging;
				html += dateTimePretty + " | " + batteryPercentage + "% | "
						+ batteryIsCharging + "</br>";
			}
			html += "</br></br>";
		} else {
			html = "No data available!";
		}
		var box = document.querySelector('#textbox');
		box.innerHTML = html;
	}
}

function errorCb(id, error) {
	console.log("error id : " + id + ", error msg : " + error.message);
}

function getBatteryInfo(dateTime) {
	// data control
	// thanks to https://www.tizen.org/ko/tv/web_device_api/datacontrol
	try {
		// get SQL type DataControlConsumerObject
		var globalSQLConsumer = tizen.datacontrol
				.getDataControlConsumer(
						"http://batterymonitoringservice.com/datacontrol/provider/batterymonitoringservice",
						"battery_status_samples", "SQL");
		globalReqId++;
		var whereClause = "1";
		if (dateTime) {
			whereClause = "TIMESTAMP < '" + dateTime + "'";
			dateTime + "'"
		}
		globalSQLConsumer.select(globalReqId, columns, whereClause, successCb,
				errorCb, null, null, "TIMESTAMP DESC");
	} catch (err) {
		console.log(err.name + ": " + err.message);
	}
}

window.onload = function() {
	// add eventListener for tizenhwkey
	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {
			}
		}
	});
	document.getElementById('textbox').addEventListener("click", function() {
		samples = [];
		getBatteryInfo();
	});
};
