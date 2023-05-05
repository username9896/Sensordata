const Sensor_URL = 'https://sensordata1.onrender.com';

$('#loginbutton').on('click', () => {
  const username = $('#username').val();
  const password = $('#password').val();

  const body = {
    username,
    password
  }
  $.post(`${Sensor_URL}/sensor-data`, body)
    .then(response => {
      location.href = 'water.html';
    })
});

var lastwatervalue = 0;
var lasttdsvalue = 0;
var waterquality = null;
var lastconsumed = null;

$.get(`${Sensor_URL}/send-data/sensor-data`)
  .then(response => {
    response.forEach(device => {

      lastwatervalue = device.loadcelldata;
      lasttdsvalue = device.data;
      if (lasttdsvalue > 0 && lasttdsvalue < 150) {
        waterquality = 'Excellent for drinking';
      }
      else if (lasttdsvalue > 150 && lasttdsvalue < 250) {
        waterquality = 'Good';
      }
      else if (lasttdsvalue > 250 && lasttdsvalue < 300) {
        waterquality = 'Fair';
      }
      else if (lasttdsvalue > 300 && lasttdsvalue < 500) {
        waterquality = 'Poor, not good for drinking';
      }
      else {
        waterquality = 'Not safe for drinking';
      }
    });

    document.getElementById("water-remaining").textContent = lastwatervalue;
    document.getElementById("water-quality").textContent = lasttdsvalue;
    document.getElementById("water-quality1").textContent = waterquality;
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });

let yArray = [];
let xArray = [];
let zArray = [];
let timevalue = [];
let loadcellvalue = [];
let tdsvalue = [];

$.get(`${Sensor_URL}/send-data/sensor-data`)
  .then(response => {
    response.forEach(device => {
      xArray.push(device.date);
    });
    response.forEach(device => {
      yArray.push(device.data);
    })
    response.forEach(device => {
      zArray.push(device.loadcelldata);
    })

    tdsvalue = yArray.slice(-20);
    timevalue = xArray.slice(-20);
    loadcellvalue = zArray.slice(-20);

    for (let i = 0; i < timevalue.length; i++) {
      const newRow = $('<tr>');
      newRow.append(`<td>${tdsvalue[i]}</td>`);
      newRow.append(`<td>${loadcellvalue[i]}</td>`);
      newRow.append(`<td>${timevalue[i]}</td>`);
      $('#send-sensordata tbody').append(newRow);
    }

    let hoursArray = xArray.map(function (time) {
      let timeParts = time.split(":");
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]);
      let seconds = parseInt(timeParts[2]);

      return Math.floor(hours + minutes / 60 + seconds / 3600);
    });

    yArray.forEach((currentValue, i) => {
      if (i < yArray.length - 1 && i >= yArray.length - 100) {
        const nextFifteenthValue = yArray[i - 15];

        if (Math.abs(currentValue - nextFifteenthValue) >= 200) {
          lastconsumed = 'You have drank the water!';
        }
        else {
          lastconsumed = 'You have not drank the water!';
        }
      }
    });

    document.getElementById("last-consumed").textContent = lastconsumed;

    const numericYArray = yArray.map(val => parseFloat(val));

    Highcharts.chart('my-plot', {
      title: {
        text: 'Graph b/w tds value and time'
      },
      xAxis: {
        title: {
          text: 'Time (in hours)'
        },
        categories: hoursArray
      },
      yAxis: {
        title: {
          text: 'tds value'
        },
      },
      series: [{
        data: numericYArray
      }]
    });

    const numericYArray1 = zArray.map(val => parseFloat(val));

    Highcharts.chart('plot', {
      title: {
        text: 'Graph b/w loadcell value and time'
      },
      xAxis: {
        title: {
          text: 'Time (in hours)'
        },
        categories: hoursArray
      },
      yAxis: {
        title: {
          text: 'Load cell value'
        },
      },
      series: [{
        data: numericYArray1
      }]
    });
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });
