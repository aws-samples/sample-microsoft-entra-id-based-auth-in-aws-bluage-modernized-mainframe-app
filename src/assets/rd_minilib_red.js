// rd_minilib
/* rd_minilib*/
// DO NOT EDIT PAST THIS POINT


// rd_cookie 1.0.1 110810
// Cookie library. rd_setcookie (c_name and c_value are mandatory. path is global by default.
// Inspired from http://techpatterns.com/downloads/javascript_cookies.php
function rd_setcookie(c_name,c_value,expire_days,path,domain,secure){var today=new Date();today.setTime(today.getTime());if(expire_days){expire_days=expire_days*86400000;} var expire_date=new Date(today.getTime()+(expire_days));document.cookie=c_name+'='+escape(c_value)+((typeof expire_days=='undefined')?'':'; expires='+expire_date.toUTCString())+((typeof path=='undefined')?'; path=/':'; path='+path)+((typeof domain=='undefined')?'':'; domain='+domain)+((typeof secure=='undefined')?'':'; secure');}
function rd_getcookie(c_name){var cd_full=document.cookie.split(';');var cd_split;var cd_name;var cd_value;var c_found=false;for(var i=0;i<cd_full.length;i++){cd_split=cd_full[i].split('=');cd_name=cd_split[0].replace(/^\s+|\s+$/g,'');if(cd_name==c_name){c_found=true;if(cd_split.length>1){cd_value=unescape(cd_split[1].replace(/^\s+|\s+$/g,''));}
return cd_value;break;}cd_split=null;cd_name='';}if(!c_found){return null;}}
function rd_delcookie(c_name){rd_setcookie(c_name,null,-1,'/');}
function rd_chkcookie(){rd_setcookie('rd_chkcookie','checked');if( rd_getcookie('rd_chkcookie') ){rd_delcookie('rd_chkcookie'); return true} else return false;}
// end rd_cookie

// doc ready
$(document).ready(function(){

/* mini collapse logic with cookie */
if(rd_getcookie('c_collapse')) {$('#rd_col00').addClass('hidden'); 
$('#rd_title_bis').removeClass('visible-xs-inline'); $('#rd_fxcol00').toggleClass('active');
$('#rd_col01').removeClass('col-sm-9 col-sm-push-3 col-lg-10 col-lg-push-2 ').addClass('col-sm-12'); }

/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.8
 *
 */
(function(e){e.fn.extend({slimScroll:function(f){var a=e.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},f);this.each(function(){function v(d){if(r){d=d||window.event;
var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);e(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&n(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}}function n(d,e,f){k=!1;var g=d,h=b.outerHeight()-c.outerHeight();e&&(g=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),g=Math.min(Math.max(g,0),h),g=0<d?Math.ceil(g):Math.floor(g),c.css({top:g+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());
g=l*(b[0].scrollHeight-b.outerHeight());f&&(g=d,d=g/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),h),c.css({top:d+"px"}));b.scrollTop(g);b.trigger("slimscrolling",~~g);w();q()}function x(){u=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),30);c.css({height:u+"px"});var a=u==b.outerHeight()?"none":"block";c.css({display:a})}function w(){x();clearTimeout(B);l==~~l?(k=a.allowPageScroll,C!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;C=l;u>=b.outerHeight()?k=!0:(c.stop(!0,
!0).fadeIn("fast"),a.railVisible&&m.stop(!0,!0).fadeIn("fast"))}function q(){a.alwaysVisible||(B=setTimeout(function(){a.disableFadeOut&&r||y||z||(c.fadeOut("slow"),m.fadeOut("slow"))},1E3))}var r,y,z,B,A,u,l,C,k=!1,b=e(this);if(b.parent().hasClass(a.wrapperClass)){var p=b.scrollTop(),c=b.siblings("."+a.barClass),m=b.siblings("."+a.railClass);x();if(e.isPlainObject(f)){if("height"in f&&"auto"==f.height){b.parent().css("height","auto");b.css("height","auto");var h=b.parent().parent().height();b.parent().css("height",
h);b.css("height",h)}else"height"in f&&(h=f.height,b.parent().css("height",h),b.css("height",h));if("scrollTo"in f)p=parseInt(a.scrollTo);else if("scrollBy"in f)p+=parseInt(a.scrollBy);else if("destroy"in f){c.remove();m.remove();b.unwrap();return}n(p,!1,!0)}}else if(!(e.isPlainObject(f)&&"destroy"in f)){a.height="auto"==a.height?b.parent().height():a.height;p=e("<div></div>").addClass(a.wrapperClass).css({position:"relative",overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",
width:a.width,height:a.height});var m=e("<div></div>").addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,zIndex:90}),c=e("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,
WebkitBorderRadius:a.borderRadius,zIndex:99}),h="right"==a.position?{right:a.distance}:{left:a.distance};m.css(h);c.css(h);b.wrap(p);b.parent().append(c);b.parent().append(m);a.railDraggable&&c.bind("mousedown",function(a){var b=e(document);z=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);n(0,c.position().top,!1)});b.bind("mouseup.slimscroll",function(a){z=!1;q();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",
function(a){a.stopPropagation();a.preventDefault();return!1});m.hover(function(){w()},function(){q()});c.hover(function(){y=!0},function(){y=!1});b.hover(function(){r=!0;w();q()},function(){r=!1;q()});b.bind("touchstart",function(a,b){a.originalEvent.touches.length&&(A=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&(n((A-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),A=b.originalEvent.touches[0].pageY)});
x();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),n(0,!0)):"top"!==a.start&&(n(e(a.start).position().top,null,!0),a.alwaysVisible||c.hide());window.addEventListener?(this.addEventListener("DOMMouseScroll",v,!1),this.addEventListener("mousewheel",v,!1)):document.attachEvent("onmousewheel",v)}});return this}});e.fn.extend({slimscroll:e.fn.slimScroll})})(jQuery);

var rd_ssmargin = 125;
var rd_ssminspace = 200;
var rd_height_px=($(window).height()-rd_ssmargin);
if (rd_height_px < rd_ssminspace) rd_height_px = rd_ssminspace;
$('.rd_slimscroll').slimScroll({ height: rd_height_px, railVisible: true, alwaysVisible: false });
$(window).resize(function(){
var rd_height=$(window).height()-rd_ssmargin;
if (rd_height > rd_ssminspace ) {
$('.rd_slimscroll').height(rd_height);
$('.slimScrollDiv').height(rd_height);}
});

$('#rd_fxcol00').click(function() { 
if ($('#rd_col00').hasClass('hidden')) { rd_delcookie('c_collapse'); $('#rd_col00').removeClass('hidden');
$('#rd_title_bis').addClass('visible-xs-inline'); $('#rd_fxcol00').toggleClass('active');
$('#rd_col01').removeClass('col-sm-12').addClass('col-sm-9 col-sm-push-3 col-lg-10 col-lg-push-2');
}
else {rd_setcookie('c_collapse','cookie collapse menu',30); $('#rd_col00').addClass('hidden'); 
$('#rd_title_bis').removeClass('visible-xs-inline'); $('#rd_fxcol00').toggleClass('active');
$('#rd_col01').removeClass('col-sm-9 col-sm-push-3 col-lg-10 col-lg-push-2 ').addClass('col-sm-12');	
}});
});
// end doc ready