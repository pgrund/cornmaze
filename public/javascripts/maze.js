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
});
function select(direction) {
    if ($("#" + direction).hasClass("disabled")) {
        alert("button is disabled !!");
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
    console.log("select for %s (%s)", direction, href);
    if (href !== '') {
        $("#url").text(href);
        move();
    }
}
function processLinks(data) {
    // reset links array
    links = [];
    
    var cell = $("#"+updatePlan());
     
    $(data).find("link").each(function() {
        var rel = $(this).attr("rel");
        var link = {'rel': rel, 'href': $(this).attr("href")};
        links[links.length] = link;
        if(cell){
            cell.addClass(rel);
        }
        console.log("%s found", rel);
        $("#" + rel).removeClass("disabled").removeClass("btn-small").addClass("btn-large");
    });
    //});
    $(data).find("collection").each(function() {
        var collection = $(this);
        collection.find("link[rel='maze']").each(function() {
            var href = $(this).attr("href");
            $("#mazes").append(new Option(href, href));
        });
    });
    $(data).find("item").each(function() {

    });
    // update current url
    $("#url").text($(data).find("cell[rel='current']").first().attr("href"));
    //console.log("processLinks: %s", links);
}

function move() {
    var urlStr = $("#url").text();
    console.log("#### %s ####", urlStr);
    $(".mazebtn").removeClass("btn-large").addClass("disabled").addClass("btn-small");
    $.get(urlStr, processLinks, "xml");
    var cell = $("#"+updatePlan());
    if(cell) {
        $("td.current").each(function(){
           $(this).children("span").first().removeClass('glyphicon-user'); 
           $(this).removeClass("current");
        });
        cell.addClass("visited");  
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
    return rtn;
}
function updatePlan() {
    var urlRegex = /(https?:\/\/)?([\da-z\.-])+(\.[a-z\.]{2,6})*(:\d{2,60})?\/maze\/([\/\w \.-]*)*\/(\d+)(:(.*))?\/?$/;
    var url = $("#url").text();
    // $("#test").val();
    var matches = url.match(urlRegex);
    if (matches) {
        return matches[6];
    }

}
function viewMaze(element) {
    
}