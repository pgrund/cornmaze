/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// global storage of link elements
links = [];
$(document).keydown(function(e) {
    if (e.keyCode === 37) {
        select("west");
        return false;
    }
    if (e.keyCode === 38) {
        select("north");
        return false;
    }
    if (e.keyCode === 39) {
        select("east");
        return false;
    }
    if (e.keyCode === 40) {
        select("south");
        return false;
    }
    if (e.keyCode === 27) {
        select("maze");
        return false;
    }
});
function select(direction) {
    console.log("select for %s", direction);
    if ($("#" + direction).hasClass("disabled")) {
        var cell = $("#" + updatePlan());
        if(cell){
            currentCellStyling(cell);
            cell.addClass("danger");
        }
        $("#errorModal").modal();
        console.log("button %s is disabled !!", direction);      
    } 
    if (direction === "start") {
        $("#navigation").show();
        $("#plan td").removeClass("north").removeClass("east")
                .removeClass("south").removeClass("west").removeClass("visited");
    }
    if (direction === "maze") {
        $("#navigation").hide();
    }
    var href = getLinkHref(direction);    
    if (href !== '') {
        $("#url").val(href);
        move();
    }
}
function processLinks(data) {
    // reset links array
    links = [];

    var cell = $("#" + updatePlan());

    $(data).find("link").each(function() {
        var rel = $(this).attr("rel");
        var link = {'rel': rel, 'href': $(this).attr("href")};
        links[links.length] = link;
        if (cell) {
            if(["north", "east", "south", "west", "exit"].indexOf(rel)>=0){
                cell.addClass(rel);
                //console.log("borders found for %s", rel);
           }
        }
        $("#" + rel).removeClass("disabled").removeClass("btn-small").addClass("btn-large");
    });
    $(data).find("collection").each(function() {
        var collection = $(this);
        collection.find("link[rel='maze']").each(function() {
            var href = $(this).attr("href");
            $("#mazes").append(new Option(href, href));
        });
    });
    $(data).find("item").each(function() {
        var side = $(this).attr("side");
        console.log("creating maze for 'item' of %sx%s", side, side);
        $("#plan").empty();
        var newContent = "";
        for (i = 0; i < side; i++) {
            newContent +="<tr class='row'>";
            for (k = 0; k < side; k++) {
                var index = (k * side) + i;
                newContent+="<td id='";
                newContent+=index;
                if(i === (side-1) && k === (side-1)){
                    newContent+="'><span class='glyphicon glyphicon-home'></span></td>";
                }else {
                    newContent+="'><span></span></td>";
                }
            }
            newContent +="</tr>";
        }
        $("#plan").html(newContent);
    });
    // update current url
    $("#url").val($(data).find("cell[rel='current']").first().attr("href"));
}

function move() {
    var urlStr = $("#url").val();
    console.log("#### moving to %s ####", urlStr);
    $(".mazebtn").removeClass("btn-large").addClass("disabled").addClass("btn-small");
    $.get(urlStr, processLinks, "xml");
    var cell = $("#" + updatePlan());
    currentCellStyling(cell);
    
}
function currentCellStyling(cell){
    if (cell) {
        $("td.current").each(function() {
            $(this).children("span").first().removeClass('glyphicon-user');
            $(this).removeClass("current");
        });
        cell.addClass("success");
        cell.addClass("current");
        cell.children("span").first().addClass('glyphicon-user');
        cell.children("span").first().addClass('glyphicon');
    } 
}
function getLinkHref(key) {
    var i, x, rtn;
    //console.log(links);
    for (i = 0, x = links.length; i < x; i++) {
        if (links[i].rel === key) {
            rtn = links[i].href;
            break;
        }
    }
    if(rtn){
        console.log("returning %s", rtn);
    } else {
        return '';
    }
    return rtn;
}
function updatePlan() {
    var urlRegex = /(https?:\/\/)?([\da-z\.-])+(\.[a-z\.]{2,6})*(:\d{2,60})?\/maze\/([\/\w \.-]*)*\/(\d+)(:(.*))?\/?$/;
    var url = $("#url").val();
    var matches = url.match(urlRegex);
    if (matches) {
        return matches[6];
    }

}