/**
 * Created by s_pou on 7/27/2017.
 */

function stringToDate(_date,_format,_delimiter)
{
    var formatLowerCase=_format.toLowerCase();
    var formatItems=formatLowerCase.split(_delimiter);
    var dateItems=_date.split(_delimiter);
    var monthIndex=formatItems.indexOf("mm");
    var dayIndex=formatItems.indexOf("dd");
    var yearIndex=formatItems.indexOf("yyyy");
    var month=parseInt(dateItems[monthIndex]);
    month-=1;
    var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
    return formatedDate;
}


alert(stringToDate("12:11:2017","dd:mm:yyyy",":"))



                    //var row = $(this).find("tr");

                    //alert(stringToDate($("#datepicker1").val(),"dd:mm:yyyy",":"));
                    //var dt_s = (stringToDate(date_s,"dd:mm:yyyy",":"));
                    //var dt = Date.parseDate("12-11-2017","dd-mm-yyyy");
                    //var dt = Date.parseDate("d-m-Y", "12-11-2017");
                    //document.write(dt + "\n");
                    //var dt = new Date("13-01-2011".replace( /(\d{2})-(\d{2})-(\d{4})/,"$2/$1/$3"));
                    //alert(typeof date_s);
                    //var f = to_date($("#datepicker1").val());
                    //var f1 = to_date($("#datepicker2").val());
                    //var dt = to_date(date_s);
                    //alert(typeof f);

                    && re_n == $("#RE_drpB").val()