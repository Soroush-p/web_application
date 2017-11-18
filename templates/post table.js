/**
 * Created by s_pou on 7/27/2017.
 */

                // Stop form from submitting normally
        		event.preventDefault();
        		// Get action URL
				var actionFile = $(this).attr("action");

        		// Serialize the submitted form control values to be sent to the web server with the request
        		var formValues = $(this).serialize();

        		// Send the form data using post
        		$.post(actionFile, formValues, function(data){
            		// Display the returned data in browser
            		//$("#result1").html(data);

            		$("#tbl_schl").append("<tr id='schl-d'><td style='width: 120px'>" + data[0] + "</td><td style='width: 120px' id='schl-ca-n'>" + data[1]+ "</td><td id='schl-re-n'>" + data[2] + "</td>" +
						"<td>" + data[3] + "</td><td>" + data[4] + "</td><td>"+ data[5] + "</td>><td>"+ data[6] +"</td></tr>");
					//document.getElementById("result1").innerHTML = xhttp.responseText;
					//$("#result2").text(data);
					//showValues();
        		});
