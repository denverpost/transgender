var pathRoot = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':'+window.location.port : '') + window.location.pathname;
var href = location.href.split('/');
href.pop();
var adPathRoot = href.join('/') + '/';
var titleRoot = document.title;
var body = document.body, html = document.documentElement;
var docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
var current = '';
var swapped = false;
var galleriesLoaded = [];
var adsloaded = [];
/* THIS IS CONFIG DATA SPECIFIC TO SITE */
var showAds = true; //show slide-up leaderboards at bottom
var slideAds = 3; //number of times to slide up a leaderboard
var vidBack = true;
var titleFade = true; //whether to fade the Denver Post logo in the top-bar to show the "DP" and a text title
//var pages = ['#titlepage','#part1','#photos','#part2']; //div/section IDs that should trigger a page view and title change
var pages = [];
$('.omnitrig').each(function(i,e) { pages.push('#'+$(e).attr('id')) });
var galleries = [];
var currentPlayer = false;
$('.centergallery').each(function(i,e) { galleries.push('#'+$(e).attr('id')) }); //div/section IDs of galleries to instantiate (must be a div like #photos and have a child, the gallery itself, with the same ID plus 'gallery' -- i.e. #photosgallery)

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

function formSuccessMessage() {
    if (QueryString.source == 'form') {
        $('#email p.blurbsmallform').html('');
        $('#email div.email-form').html('<div data-alert class="alert-box success radius">Thanks for signing up!</div>');
        history.replaceState({}, '', pathRoot);
    }
}

function revealSocial(type,link,title,image,desc,twvia,twrel) {
    title = typeof title !== 'undefined' ? title : false;
    image = typeof image !== 'undefined' ? image : false;
    desc = typeof desc !== 'undefined' ? desc : false;
    twvia = typeof twvia !== 'undefined' ? twvia.toString().replace('@','') : false;
    twrel = typeof twrel !== 'undefined' ? twrel.toString().replace('@','') : false;
    //type can be twitter, facebook or gplus
    var srcurl = '';
    if (type == 'twitter') {
        srcurl = 'http://twitter.com/intent/tweet?text=' + encodeURIComponent(title).replace('|','%7c') + '&url=' + link + '&via=' + twvia + '&related=' + twrel;
    } else if (type == 'facebook') {
        srcurl = 'http://www.facebook.com/sharer/sharer.php?s=100&p[url]=' + link + '&p[images][0]=' + image + '&p[title]=' + encodeURIComponent(title).replace('|','%7c') + '&p[summary]=' + encodeURIComponent(desc).replace('|','%7c');
    } else if (type == 'gplus') {
        srcurl = 'https://plus.google.com/share?url=' + link;
    }
    console.log(srcurl);
    if (srcurl.length > 1) {
        window.open(srcurl, type, 'left=60,top=60,width=500,height=500,toolbar=1,resizable=1').focus();
    }
    return false;
}

function load_omniture() {
        var omni = $('#omniture').html();
        $('#omniture').after('<div id="new_omni">' + omni + '</div>');
}
function build_url(path) {
        var url = pathRoot + path;
        return url;
}
function rewrite_url(path, new_title) {
        var url = build_url(path);
        current = path;
        document.title = (typeof new_title == 'undefined' || new_title.length < 1 ) ? titleRoot : new_title + ' - ' + titleRoot;
        window.history.replaceState('', new_title, url);
}

$(document).foundation('reveal', {
    animation: 'fade',
    animationspeed: 200
});
function revealCredits() {
    $('#credits').foundation('reveal', 'open');
}
function revealSlides(galleries) {
    for (key in galleries) {
        if (galleriesLoaded.indexOf(galleries[key]) == -1) {
            $(galleries[key]).find('img').unveil();
            $(galleries[key]).slick({
                centerMode: true,
                centerPadding: '15%',
                slidesToShow: 1,
                prevArrow: '<button type="button" class="slick-prev"></button>',
                nextArrow: '<button type="button" class="slick-next"></button>',
                responsive: [{
                    breakpoint: 800,
                    settings: {
                        arrows: true,
                        centerMode: true,
                        centerPadding: '8%',
                        slidesToShow: 1
                    }
                }]
            });
            galleriesLoaded.push(galleries[key]);
        }
    }
}
function checkHash() {
    if (window.location.hash) {
        revealSlides(galleries);
        var hash = window.location.hash;
        if ($(hash).hasClass('hide')) {
            toggleSidebar(hash,hash + 'link');
        } else {
            scrollDownTo(hash);
        }
    }
}

function scrollDownTo(whereToScroll, scrollOffset) {
    scrollOffset = typeof scrollOffset !== 'undefined' ? scrollOffset : 60;
    if ($(whereToScroll).length) {
        $('html,body').animate({
            scrollTop: ($(whereToScroll).offset().top - scrollOffset)
        }, 300);
    } else {
        var new_url = window.location.href.split('#')[0];
        window.history.replaceState('', document.title, new_url);
    }
}

function toggleSidebar(toShow,toHide) {
    $(toShow).removeClass('hide');
    $(toHide).addClass('hide');
    rewrite_url(toShow);
    scrollDownTo(toShow);
}

function playerCreator(embedId, playerId, divId, doDarkBack) {
    doDarkBack = typeof doDarkBack !== 'undefined' ? doDarkBack : false;
    divId = typeof divId !== 'undefined' ? divId : false;
    if (divId) {
        $(divId).animate({backgroundColor:'rgba(0,70,70,0.3)',paddingLeft:'.5em',paddingRight:'.5em'}, 350).delay(2000).animate({backgroundColor:'transparent',paddingLeft:'0',paddingRight:'0'},1000);
    }
    if (embedId == 'video1') {
        darkBackground('#overviewvid',false);
        scrollDownTo('#overviewvid');
        vidBack = false;
    }
    $('#' + embedId).html('<iframe src="http://launch.newsinc.com/?type=VideoPlayer/Single&widgetId=1&trackingGroup=90115&siteSection=denverpost_spl_fea_sty&videoId=' + playerId + '" class="informvideo" noscroll style="width:100%; height:100%;" frameborder="no" scrolling="no" noresize></iframe>');
    /*
    OO.Player.create(embedId, playerId, {
        'autoplay':true,
        onCreate: function(player) {
            currentPlayer = player;
        }
    });
    */
}

function checkPlayerState() {
    if ( ( currentPlayer.elementId != 'video1' || (currentPlayer.getState !== 'played' || currentPlayer.getState !== 'playing' ) ) && isVisible('#overviewvid') ) {
        return false;
    }
    return true;
}

function playerScroller(embedId, playerId, divId) {
    scrollDownTo(('#' + embedId),100);
    playerCreator(embedId, playerId, divId);
}
function getNodePosition(node) {
    var eTop = $(node).offset().top;
    return Math.abs(eTop - $(window).scrollTop());
}
function isVisible(element) {
    var vidTop = $(element).offset().top;
    var vidBot = $(element).offset().top + $(element).height();
    var fromTop = $(window).scrollTop() + $(element).height() / 2;
    if ( fromTop > vidTop && fromTop < vidBot ) {
        return true;
    } else {
        return false;
    }
}

function isElementInViewport(el) {
    el = el.toString().replace('#','');
    if (document.getElementById(el) != null) {
        var rect = document.getElementById(el).getBoundingClientRect();
        var half = window.innerHeight / 2;
        var whole = window.innerHeight;
        return ( (rect.top > 0 && rect.top < half) || (rect.bottom < whole && rect.bottom > half) || (rect.top < 0 && rect.bottom > whole) );
    } else {
        return;
    }
}

$('.top-top').click(function(evt) {
    $('.toggle-topbar').click();
});

$('.vid-embed').on("mouseenter", function() {
    $(this).find('.playicon').fadeTo(300, 0);
    $(this).find('.playtext').fadeTo(300, 1);
});
$('.vid-embed').on("mouseleave", function() {
    $(this).find('.playicon').fadeTo(300, 1);
    $(this).find('.playtext').fadeTo(300, 0);
});

function fadeNavBar(reverse) {
    if (reverse) {
        $('#name1').animate({opacity:1},500);
        $('#name2').animate({opacity:0},500);
        titleFade = true;
    } else {
        $('#name1').animate({opacity:0},500);
        $('#name2').animate({opacity:1},500);
        titleFade = false;
    }
}

function checkFade() {
    if ( !($(window).scrollTop() < window.innerHeight) && titleFade ) {
        fadeNavBar(false);
    } else if ( ($(window).scrollTop() < window.innerHeight) && !titleFade) {
        fadeNavBar(true);
    }
}

function hideAdManual() {
    $('#adwrapper').fadeOut(300);
    $('#adwrapper a.boxclose').css('display', 'none');
    $('#footer-bar').delay(150).animate({marginBottom:'0'},300);
    $('#adframewrapper').html('');
    swapped = false;
}

$(document).keyup(function(e) {
    if (swapped && e.keyCode == 27) {
        hideAdManual();
    }    
});

function getAdSize() {
    if ( $(window).width() >= 740 ) {
        var adSizes = ['ad=medium','728','90'];
        return adSizes;
    } else {
        return false;
    }
    /* else if ( $(window).width() >= 300 && $(window).width() < 740 ) {
        var adSizes = ['ad=small','300','50'];
        return adSizes;
    }*/
}

function showAd() {
    var adSize = getAdSize();
    if (adSize) {
        $('#adframewrapper').html('<iframe src="' + adPathRoot + 'ad.html?' + adSize[0] + '" seamless height="' + adSize[2] + '" width="' + adSize[1] + '" frameborder="0"></iframe>');
        $('#adwrapper').fadeIn(400);
        $('a.boxclose').fadeIn(400);
        var adH = $('#adwrapper').height();
        $('#footer-bar').css('margin-bottom',adH);
        swapped = true;
    }
}

function swapAd() {
    if (swapped) {
        hideAdManual();
    }
    if (!swapped) {
        showAd();
    }
}

function getAdTimes(numAds) {
    var adReturns = [];
    var chunkHeight = docHeight / numAds;
    var chunkHalf = chunkHeight / 2;
    for (i=0;i<numAds;i++) {
        adReturns.push( Math.round( chunkHalf + (chunkHeight * i) ) );
    }
    return adReturns;
}

function checkAdPos() {
    if (showAds) {
        var topNow = $(window).scrollTop();
        if (!swapped) {
            var adTimes = getAdTimes(slideAds);
            for (var i = 0; i < adTimes.length; i++) {
                if (!adsloaded[i] && topNow > adTimes[i] && topNow < (typeof adTimes[(i+1)] !== 'undefined' ? adTimes[(i+1)] : docHeight)) {
                    swapAd();
                    adsloaded[i] = true;
                    break;
                }
            }
        }
    }
}

function darkBackground(element, reverse) {
    if (!(/(iPad|iPhone|iPod)/g.test(navigator.userAgent))) {
        if (!reverse) {
            $(element).animate({backgroundColor:'#222'}, 500);
            $(element + ' p.caption').animate({color:'rgba(255,255,255,0.6)'}, 500);
            $(element + ' .lowertitle h1').animate({color:'rgba(255,255,255,0.6)'}, 500);
            $(element).find('.columns').removeClass('large-10');
            $(element).find('.columns').removeClass('medium-11');
            $(element).find('.columns').addClass('large-12');
            $(element).find('.columns').addClass('medium-12');
        } else {
            $(element).animate({backgroundColor:'#fff'}, 500);
            $(element + ' p.caption').animate({color:'rgba(0,0,0,0.6)'}, 500);
            $(element).find('.columns').removeClass('large-12');
            $(element).find('.columns').removeClass('medium-12');
            $(element).find('.columns').addClass('large-10');
            $(element).find('.columns').addClass('medium-11');
        }
    }
}

function checkPageState(pages) {
    for (key in pages) {
        if ($(window).scrollTop() < 100) {
            rewrite_url('','');
            break;
        }
        var currentpage = pages[key];
        var next = (pages[parseInt(key) + 1]) ? pages[parseInt(key) + 1] : currentpage;
        var prev = (pages[parseInt(key) - 1]) ? pages[parseInt(key) - 1] : currentpage;
        if (isElementInViewport(currentpage) && currentpage != current) {
            var triggerDiv = $(currentpage);
            rewrite_url(currentpage.toString(),$(triggerDiv).data('omniTitle'));
            if ($(triggerDiv).hasClass('omnitrig')) {
                load_omniture();
                $(triggerDiv).removeClass('omnitrig');
            }
        }
    }
    if ( $('#overviewvid').length && checkPlayerState() && !vidBack ) {
        darkBackground('#overviewvid',true);
        vidBack = true;
    }
}

$('.chart-late').find('img').unveil(300);

$(document).ready(function() {
    checkHash();
    checkAdPos();
    formSuccessMessage();
});

var didScroll = false;
$(window).scroll(function() {
    didScroll = true;    
});
setInterval(function() {
    if (didScroll) {
        checkFade();
        checkPageState(pages);
        revealSlides(galleries);
        checkAdPos();
    }
},250);
