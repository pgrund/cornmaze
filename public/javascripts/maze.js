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
    if($("#"+direction).attr("disabled")) {
        alert("button %s is disabled !!", direction);
    }
    var href = getLinkHref(direction);
    console.log("select for %s (%s)", direction, href); 
    if(href !== '') {
        $("#url").text(href);    
        move();
    }
}
function processLinks(data) {
    // reset links array
    links = [];
    
    // process all links
    /*$(data).find("cell").each(function(){
        var cell = $(this);
        
        cell.*/
    $(data).find("link").each(function() {
            var rel = $(this).attr("rel");
            var link = {'rel': rel, 'href': $(this).attr("href") };
            links[links.length] = link;
            console.log("%s found", rel);
            $("#"+rel).removeAttr("disabled").addClass("enabled");        
        });
    //});
    $(data).find("collection").each(function(){
        var collection = $(this);        
        collection.find("link[rel='maze']").each(function(){
            var href = $(this).attr("href");
            $("#mazes").append(new Option(href, href));            
        });
    });

    // update current url
    $("#url").text($(data).find("cell[rel='current']").first().attr("href"));
    //console.log("processLinks: %s", links);
}

function move() {
    var urlStr = $("#url").text();
    console.log("#### %s ####",  urlStr);
    $(".mazebtn").attr("disabled","disabled").removeClass("enabled");
    $.get(urlStr, processLinks, "xml");
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

