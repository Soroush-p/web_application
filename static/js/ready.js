function to_date(dt_str) {

    var parts = dt_str.split(":");
    return new Date(parts[2], parts[1]-1, parts[0]);
    }

removeRow = function(el) {
    // remove the corresponding row of the table and
    // when the table is empty diables the submit button
    $(el).closest("tr").remove()
    var row = $("#tbl_schl > tbody > tr").length
    if (row == 1){
        $("#btn_sbmt").prop('disabled', true);
    }
}


	$(document).ready(function(){

        /*  disables the submit button on the page load
        */
	    $("#btn_sbmt").prop('disabled', true);
	    $("#datepicker1").datepicker({
			dateFormat : 'dd:mm:yy'
		});
        $("#datepicker2").datepicker({
			dateFormat : 'dd:mm:yy'
		});

		$(".datetxtbx").change(function () {

            var new_date_s = to_date($("#datepicker1").val());
            var new_date_e = to_date($("#datepicker2").val());
            var new_t_s = parseInt($("#tts").val());
            var new_t_e = parseInt($('#tte').val());
		    if (new_date_e < new_date_s && new_t_e < new_t_s){
		        $("#btn_add").prop('disabled', true);
            }
            else if (new_date_e > new_date_s && new_t_e < new_t_s){
		        $("#btn_add").prop('disabled', false);
		        //$("#adhoc").prop("disabled", true)
                //$("#daily").prop("checked", true)
            }
            else if (new_date_e == new_date_s && new_t_e < new_t_s){
                $("#btn_add").prop('disabled', true);
                //$("#adhoc").prop("checked", true)
                //$("#daily").prop("disabled", true)
                //$("#adhoc").atrr('checked', 'checked')
            }
        });


        $(".txtbx").change(function () {
            var new_t_s = parseInt($("#tts").val());
            var new_t_e = parseInt($('#tte').val());

		    if (new_t_e < new_t_s){
		        $("#btn_add").prop('disabled', true);
            }
            else if (new_t_e >= new_t_s){
		        $("#btn_add").prop('disabled', false);
            }

        });

        $("#CA_drpA").change(function()
        {
			// send selected value of drop box
			var CaVlue = $(this).serialize();
			$.ajax({url: "/api/view", data: CaVlue ,type: "POST", dataType: "json", success: function (data)
               {

                Object.keys(data).forEach(function(key,index,value) {
                    $("#" + key).nextAll().remove();
                    i = 23;
                    while (i >= 0)
                    {
                        if (data[key].hasOwnProperty(i)) {
                            //var stri = "" + i;
                            var to = parseInt(data[key][i][1]);
                            to = i + to;
                            $("#" + key).after("<td>" + data[key][i][0] + " - " + i + ":" + to +"</td>");
                        }
                        i--;
                    }

                });

               }})
		});



		$("#CA_drpB").change(function()
        {
			// send selected value of drop box the in return populates the REs drop box
			var CaVlue = $(this).serialize();
			$.ajax({url: "/api/Ca", data: CaVlue ,type: "POST", dataType: "json", success: function (data)
               {
                $("#RE_drpB").html("");
				for (var value in data)
                {
				    $("#RE_drpB").append("<option>" + data[value] + "</option><br>");
				}
               }})
		});


		$("#btn_add").on('click', function(event){
			/*
			    adds new row to the scheduling table of HTML DOM if
			    there is no confilt with other row in the table
		    */
		    event.preventDefault();
			if ( $("#RE_drpB").val() != null ) {
                var IS_duplicate = false;
                var chk = $('#tbl_schl tr td:first').text();
                var tt_s = parseInt($("#tts").val());
                var tt_e = parseInt($("#tte").val());
                var new_date_s = to_date($("#datepicker1").val());
                var new_date_e = to_date($("#datepicker2").val());
                if (chk == '' && new_date_s <= new_date_e && tt_e > tt_s)
                {
                    $("#tbl_schl").append("<tr class='tbl_row'><td style='width: 120px'>" + $("#CA_drpB").val() + "</td><td style='width: 120px'>" + $("#RE_drpB").val() +
                        "</td><td>" + $("#datepicker1").val() + "</td><td>" + $("#datepicker2").val() + "</td><td>" + $("input[name=radio]:checked").val() +
                        "</td><td>" + $("input[name=txtbx_SH]").val() + "</td><td>" + $("input[name=txtbx_EH]").val()+ '</td><td><button onclick="removeRow(this)">X</button></td></tr>');
                    IS_duplicate = true;
                    $("#btn_sbmt").prop('disabled', false);
                }
                else if (!(new_date_s < new_date_e || (tt_e > tt_s && tt_e != tt_s))) {
                    alert("incorrect date or time assignment");
                    IS_duplicate = true;
                }
                else {

                    $('#tbl_schl tr').each(function () {
                        // if row is non empty
                        // for each row in the table reading column's data
                        var row = $(this);
                        var ca_n = row.find("td:eq(0)").text();
                        var re_n = row.find("td:eq(1)").text();
                        var date_s = row.find("td:eq(2)").text();
                        var date_e = row.find("td:eq(3)").text();
                        var type_d = row.find("td:eq(4)").text();
                        var time_s = row.find("td:eq(5)").text();
                        var time_e = row.find("td:eq(6)").text();
                        // converting data to number that can be comparable (string to number and date)
                        var old_date_s = to_date(date_s);
                        var old_date_e = to_date(date_e);
                        var new_date_s = to_date($("#datepicker1").val());
                        var new_date_e = to_date($("#datepicker2").val());
                        var t_s = parseInt(time_s);
                        var t_e = parseInt(time_e);
                        var new_t_s = parseInt($("input[name=txtbx_SH]").val());
                        var new_t_e = parseInt($("input[name=txtbx_EH]").val());
                        // check if there is a conflict or incorrect time assignment
                        if  ((new_date_e < new_date_s || new_t_e < new_t_s || new_t_e == new_t_s) || (ca_n == $("#CA_drpB").val() &&
                            ((+old_date_s < +new_date_s && +new_date_s < +old_date_e) || (+old_date_s <= +new_date_e && +new_date_e <= +old_date_e) || (+new_date_s <= +old_date_s && +new_date_e >= +old_date_e)) &&
                            ((t_s < new_t_s && new_t_s < t_e) || (t_s < new_t_e && new_t_e < t_e) || (new_t_s <= t_s && new_t_e >= t_e ))))

                        {
                            IS_duplicate = true;
                            alert('there is a conflict or incorrect date or time assignment');
                            return false;
                        }
                    });
                }
                if (!IS_duplicate) {
                    $('#tbl_schl').append("<tr class=tbl_row><td style=width: 120px>" + $('#CA_drpB').val() + "</td><td style=width: 120px>" + $('#RE_drpB').val() +
                        "</td><td>" + $('#datepicker1').val() + "</td><td>" + $('#datepicker2').val() + "</td><td>" + $('input[name=radio]:checked').val() +
                        "</td><td>" + $('input[name=txtbx_SH]').val() + "</td><td>" + $('input[name=txtbx_EH]').val() + '</td><td><button onclick="removeRow(this)">X</button></td></tr>');
                }
            }
			else
			    {
			    alert("All fields are required ")
                }
    	});

    	//
    	$("#btn_sbmt").on('click', function (event) {
            event.preventDefault();
            $("#result").text("");
            $("#result1").text("");
            var arrData = [];
            //loop over each table row (tr)
            $("#tbl_schl tr").each(function () {
                var currentRow=$(this);
                var ca_nam = currentRow.find("td:eq(0)").text();
                var re_nam = currentRow.find("td:eq(1)").text();
                var date_st = currentRow.find("td:eq(2)").text();
                var date_ed = currentRow.find("td:eq(3)").text();
                var dt_type = currentRow.find("td:eq(4)").text();
                var time_st = currentRow.find("td:eq(5)").text();
                var time_ed = currentRow.find("td:eq(6)").text();
                // creates a object of table rows
                var obj={};
                obj.col1=ca_nam;
                obj.col2=re_nam;
                obj.col3=date_st;
                obj.col4=date_ed;
                obj.col5=dt_type;
                obj.col6=time_st;
                obj.col7=time_ed;
                arrData.push(obj);
            });
            
            var mydata = {'table': arrData};
            //var table = {'rows': JSON.stringify(arrData)};
            /*
            $.ajax({url: "/form", data: JSON.stringify(arrData) ,type: "POST", contentType: "application/json" ,dataType: "json", success: function ()
            {
                alert();
                //alert(arrData[0].col1);
                console.log(arrData);
            }});
            */
            $.post('/form', mydata ,function (data) {
                if (data[0] == "empty") {
                    $("#tbl_schl tr").remove();
                    $("#tbl_schl").append("<tr><th>CA name</th><th>Interface</th><th>From</th><th>To</th><th>Type</th><th>Start time</th><th>End time</th><th>Delete</th></tr>");
                    $("#btn_sbmt").prop('disabled', true);
                    alert('Scheduling was succesfully written in the file');
                }
                else {

                    $("#result1").html("");
                    for (var item in data) {
                        $("#result").text("There is a problem to write in the file, The following schedule/s exist");
                        //$("#result").blink();
                        $("#result1").append(data[item][0], " - ", data[item][1], " - ", data[item][2], " - ", data[item][4], " -- ", data[item][3], ":", data[item][5], " ", data[item][6], "<br>");
                    }
                }
            });
        });

	})