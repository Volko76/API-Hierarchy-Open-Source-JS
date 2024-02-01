// Function to get the value of a query parameter from the URL
function getQueryParameterValue(parameter) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(parameter);
  }

  // Function to set the selected option based on the query parameter
  function setSelectedOptionFromQuery() {
    var cartoValue = getQueryParameterValue("carto");
    
    // Get the select element
    var selectElement = document.getElementById("cartoSelector");
    
    // Set the selected option based on the query parameter
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].text === cartoValue) {
        selectElement.value = selectElement.options[i].value;
        break;
      }
    }
  }

