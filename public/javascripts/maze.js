// global storage of link elements
links = [];

// keys to be pressed
var keyMap = {
    // left
    37 : "west",
    // up
    38 : "north",
    // right
    39 : "east",
    // down
    40 : "south",
    //esc
    27 : "maze"
    };
/**
 * handle key events
 * @param {type} key event
 */
$(document).keydown(function(e) {    
    var code = e.keyCode;    
    if(code in keyMap) {
        select(keyMap[code]);       
        return false;
    }    
});
/**
 * maze action to be taken after user input
 * @param {String} direction where to go
 * @returns {undefined}
 */
function select(direction) {
    console.log("select for %s", direction);
    
    // running against a wall
    if ($("#" + direction).hasClass("disabled")) {        
        console.log("button %s is disabled !!", direction);
        // styling current cell
        var cell = $("#" + updatePlan());
        if (cell) {
            currentCellStyling(cell);
            cell.addClass("danger");
        }
        // show error
        $("#errorModal").modal();        
    }
    // start maze
    if (direction === "start") {
        // show navigation arrows
        $("#navigation").show();
        
        // clean up old maze
        $("#plan td").removeClass("north").removeClass("east")
                .removeClass("south").removeClass("west").removeClass("visited");
    }
    
    // exit maze
    if (direction === "maze") {
        $("#navigation").hide();
    }
    
    // where to go next
    var href = getLinkHref(direction);
    if (href !== '') {        
        $("#url").val(href);
        move();
    }
}
/**
 * 
 * @param {xml} data xml http response
 * @returns {processLinks}
 */
function processLinks(data) {
    // reset links array
    links = [];

    // process returned links
    $(data).find("link").each(function() {
        var rel = $(this).attr("rel");
        var link = {'rel': rel, 'href': $(this).attr("href")};
        links[links.length] = link;
        
        // find current cell
        var cell = $("#" + updatePlan());
        if (cell) {
            if (["north", "east", "south", "west", "exit"].indexOf(rel) >= 0) {
                // add corresponding style (orders)
                cell.addClass(rel);
                // if goal reached, show success message
                if(rel === 'exit'){
                    $("#successModal").modal();
                }
            }            
        }
        // enable all navigation/action buttons found
        $("#" + rel).removeClass("disabled").removeClass("btn-small").addClass("btn-large");
    });
    
    // process available mazes
    $(data).find("collection").each(function() {
        var collection = $(this);
        collection.find("link[rel='maze']").each(function() {
            // add all availabale mazes to select box
            var href = $(this).attr("href");
            $("#mazes").append(new Option(href, href));
        });
    });
    
    // create new maze
    $(data).find("item").each(function() {
        var side = $(this).attr("side");
        console.log("creating maze for 'item' of %sx%s", side, side);
        
        // clean up old maze
        $("#plan").empty();
        
        // create maze as html table
        var newContent = "";
        for (i = 0; i < side; i++) {
            newContent += "<tr class='row'>";
            for (k = 0; k < side; k++) {
                var index = (k * side) + i;
                newContent += "<td id='";
                newContent += index;
                if (i === (side - 1) && k === (side - 1)) {
                    newContent += "'><span class='glyphicon glyphicon-home'></span></td>";
                } else {
                    newContent += "'><span></span></td>";
                }
            }
            newContent += "</tr>";
        }
        $("#plan").html(newContent);
    });
    // update current url
    $("#url").val($(data).find("cell[rel='current']").first().attr("href"));
}
/**
 * step forward
 * @returns {undefined}
 */
function move() {
    // what to do next
    var urlStr = $("#url").val();
    console.log("#### moving to %s ####", urlStr);
    
    // disable all buttons
    $(".mazebtn").removeClass("btn-large").addClass("disabled").addClass("btn-small");
    
    // call server and process xml response
    $.get(urlStr, processLinks, "xml");
    
    // styling current cell
    var cell = $("#" + updatePlan());
    currentCellStyling(cell);

}
/**
 * cell styling
 * @param {type} cell current cell in maze
 * @returns {undefined}
 */
function currentCellStyling(cell) {
    if (cell) {
        // remove former current cell styling
        $("td.current").each(function() {
            $(this).children("span").first().removeClass('glyphicon-user');
            $(this).removeClass("current");
        });
        // make current cell the current one
        cell.addClass("success");
        cell.addClass("current");
        cell.children("span").first().addClass('glyphicon-user');
        cell.children("span").first().addClass('glyphicon');
    }
}
/**
 * get URL for relation key
 * @param {type} key link relation
 * @returns {String} url or empty String
 */
function getLinkHref(key) {
    var i, x, rtn;
    for (i = 0, x = links.length; i < x; i++) {
        if (links[i].rel === key) {
            rtn = links[i].href;
            break;
        }
    }
    if (!rtn) {        
        rtn = '';
    }
    console.log("returning %s", rtn);
    return rtn;
}
/**
 * find id for current URL
 * @returns {updatePlan.matches} id as number
 */
function updatePlan() {
    // find id by parsing current url
    var urlRegex = /(https?:\/\/)?([\da-z\.-])+(\.[a-z\.]{2,6})*(:\d{2,60})?\/maze\/([\/\w \.-]*)*\/(\d+)(:(.*))?\/?$/;
    var url = $("#url").val();
    var matches = url.match(urlRegex);
    if (matches) {
        return matches[6];
    }
}