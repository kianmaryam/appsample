var apigatewayendpoint =
  "https://b0s2tpg4u4.execute-api.ca-central-1.amazonaws.com/test/search";
var loadingdiv = $("#loading");
var noresults = $("#noresults");
var resultdiv = $("#results");
var searchbox = $("input#search");
var timer = 0;

// Executes the search function 250 milliseconds after the user stops
searchbox.keyup(function () {
  clearTimeout(timer);
  timer = setTimeout(search, 250);
});

async function search() {
  // Clear results before searching
  noresults.hide();
  resultdiv.empty();
  loadingdiv.show();
  // Get the query from the user
  let query = searchbox.val();
  // Only run a query if the string contains at least three characters
  if (query.length > 2) {
    // Make the HTTP request with the query as a parameter and wait for the JSON results
    try {
      let response = await $.get(
        apigatewayendpoint,
        { q: query, size: 25 },
        "json"
      );
      console.log("API Response:", response.responseText);

      // Extract valid JSON data from the responseText
      let jsonData = extractJSON(response.responseText);

      // Check if the response content is a valid JSON
      let isJSON = isValidJSON(jsonData);

      if (isJSON) {
        // Get the part of the JSON response that we care about
        let results = jsonData["hits"]["hits"];
        if (results.length > 0) {
          loadingdiv.hide();
          // Iterate through the results and write them to HTML
          resultdiv.append("<p>Found " + results.length + " results.</p>");
          for (var item in results) {
            let url = "https://www.imdb.com/title/" + results[item]._id;
            let image = results[item]._source.image_url;
            let title = results[item]._source.title;
            let plot = results[item]._source.plot;
            let year = results[item]._source.year;
            // Construct the full HTML string that we want to append to the div
            resultdiv.append(
              '<div class="result">' +
                '<a href="' +
                url +
                '"><img src="' +
                image +
                '" onerror="imageError(this)"></a>' +
                '<div><h2><a href="' +
                url +
                '">' +
                title +
                "</a></h2><p>" +
                year +
                " &mdash; " +
                plot +
                "</p></div></div>"
            );
          }
        } else {
          noresults.show();
        }
      } else {
        // Handle the case when the response is not a valid JSON format
        console.error("Invalid JSON format in the response:", jsonData);
        noresults.show();
      }
    } catch (error) {
      console.error("Error during API request:", error);
      noresults.show();
    } finally {
      loadingdiv.hide();
    }
  }
}

// Tiny function to catch images that fail to load and replace them
function imageError(image) {
  image.src = "images/no-image.png";
}

// Function to check if a string is a valid JSON
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Function to extract valid JSON data from the responseText
function extractJSON(responseText) {
  // Extract the valid JSON part from the responseText
  let startIndex = responseText.indexOf("{");
  let endIndex = responseText.lastIndexOf("}");
  return responseText.substring(startIndex, endIndex + 1);
}
